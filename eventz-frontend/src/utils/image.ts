export const resolveImageSrc = (src?: string) => {
  if (!src) return "";

  // Base64 image → use directly
  if (src.startsWith("data:image")) {
    return src;
  }

  // Normal URL → add cache buster
  return `${src}?t=${Date.now()}`;
};
