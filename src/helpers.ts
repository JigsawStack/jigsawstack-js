export const respToFileChoice = (resp: Response) => {
  return {
    blob: () => resp.blob(),
    buffer: async () => {
      const arr = await resp.arrayBuffer();
      return Buffer.from(arr);
    },
    file: async (filename: string) => {
      const arr = await resp.arrayBuffer();
      return new File([Buffer.from(arr)], filename);
    },
  };
};
