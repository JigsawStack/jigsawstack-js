export const respToFileChoice = (resp: Response): {
  blob: () => Promise<Blob>;
  buffer: () => Promise<Buffer>;
  file: (filename: string, options?: FilePropertyBag) => Promise<File>;
} => {
  if (!(resp instanceof Response)) {
    return resp;
  }

  return {
    blob: () => resp.blob(),
    buffer: async () => {
      const arr = await resp.arrayBuffer();
      return Buffer.from(arr);
    },
    file: async (filename: string, options?: FilePropertyBag) => {
      const arr = await resp.arrayBuffer();
      return new File([Buffer.from(arr)], filename, options);
    },
  };
};

export const removeUndefinedProperties = (currentOBJ: any) => {
  const obj = { ...currentOBJ };
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
  return obj;
};
