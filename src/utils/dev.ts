export const IS_DEV = import.meta.env.DEV;

export const devLog = (...args: any) => {
  if (IS_DEV) {
    console.warn(...args);
  }
};
