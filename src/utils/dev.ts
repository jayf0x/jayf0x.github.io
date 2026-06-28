export const isDev = () => {
  if (import.meta.env.MODE === "aaarch") {
    return true;
  }
  return false;
};

export const devLog = (...args: any) => {
  if (isDev()) {
    console.warn(...args);
  }
};
