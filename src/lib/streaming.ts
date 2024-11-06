export type Bytes = string | ArrayBuffer | Uint8Array | Buffer | null | undefined;

export class Stream<Item> implements AsyncIterable<Item> {
  private controller: AbortController;

  constructor(
    private iterator: () => AsyncIterator<Item>,
    controller?: AbortController
  ) {
    this.controller = controller ?? new AbortController();
  }

  static fromReadableStream<Item>(readableStream: ReadableStream, controller?: AbortController): Stream<Item> {
    let _controller = controller;

    if (!_controller) {
      _controller = new AbortController();
    }

    const reader = readableStream.getReader();
    const decoder = new TextDecoder();
    function tryParseData(value: any): Item {
      if (!value) return value;

      // For Uint8Array, decode first
      if (value instanceof Uint8Array) {
        const text = decoder.decode(value);
        try {
          return JSON.parse(text) as Item;
        } catch {
          return text as Item;
        }
      }

      return value as Item;
    }

    async function* iterator() {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          yield tryParseData(value) as Item;
        }
      } finally {
        reader.releaseLock();
      }
    }

    return new Stream(iterator, _controller);
  }

  [Symbol.asyncIterator](): AsyncIterator<Item> {
    const iterator = this.iterator();
    const signal = this.controller.signal;

    // Wrap the iterator to handle abortion
    return {
      async next(...args: any[]): Promise<IteratorResult<Item>> {
        if (signal.aborted) {
          return { done: true, value: undefined };
        }

        try {
          return await iterator.next(...(args as any));
        } catch (error) {
          if (signal.aborted) {
            return { done: true, value: undefined };
          }
          throw error;
        }
      },
      async return(value?: any): Promise<IteratorResult<Item>> {
        return iterator.return?.(value) ?? { done: true, value: undefined };
      },
      async throw(error?: any): Promise<IteratorResult<Item>> {
        return iterator.throw?.(error) ?? { done: true, value: undefined };
      },
    };
  }

  toReadableStream(): ReadableStream<Uint8Array> {
    const self = this;
    let iter: AsyncIterator<Item>;
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(controller) {
        try {
          const { value, done } = await iter.next();
          if (done) {
            return controller.close();
          }

          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          controller.enqueue(bytes);
        } catch (err) {
          controller.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
        self.controller.abort();
      },
    });
  }

  // Utility method to abort the stream
  abort(): void {
    this.controller.abort();
  }
}
