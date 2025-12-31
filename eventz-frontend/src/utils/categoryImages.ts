// src/utils/categoryImages.ts

const categoryImages: Record<string, string[]> = {
  technology: [
    "/images/technology/technology.webp",
    "/images/technology/technology2.jpg",
    "/images/technology/technology3.jpg",
    "/images/technology/technology4.avif",
    "/images/technology/technology5.webp",
  ],
  science: [
    "/images/science/science.jpg",
    "/images/science/science2.webp",
    "/images/science/science3.webp",
    "/images/science/science4.webp",
    "/images/science/science5.webp",
  ],
  arts: [
    "/images/arts/arts.jpg",
    "/images/arts/arts2.webp",
    "/images/arts/arts3.avif",
    "/images/arts/arts4.webp",
    "/images/arts/arts5.webp",
  ],
  business: [
    "/images/business/business.png",
    "/images/business/business2.webp",
    "/images/business/business3.webp",
    "/images/business/business4.jpg",
    "/images/business/business5.jpg",
  ],
  entertainment: [
    "/images/entertainment/entertainment.jpg",
    "/images/entertainment/entertainment2.jpg",
    "/images/entertainment/entertainment3.jpg",
    "/images/entertainment/entertainment4.jpg",
    "/images/entertainment/entertainment5.jpg",
  ],
  industry: [
    "/images/industry/industry.jpg",
    "/images/industry/industry2.webp",
    "/images/industry/industry3.jpg",
    "/images/industry/industry4.webp",
    "/images/industry/industry5.webp",
  ],
  sports: [
    "/images/sports/marathon.jpg",
    "/images/sports/sports.webp",
    "/images/sports/sports2.jpg",
    "/images/sports/sports3.webp",
    "/images/sports/sports4.webp",
    "/images/sports/sports5.jpg",
  ],
};

export function getCategoryImage(
  category: string,
  uniqueKey: string,
) {
  const key = category.toLowerCase();
  const images =
    categoryImages[key] || ["/images/default.jpg"];

  // Stable hash → same event always gets same image
  let hash = 0;
  for (let i = 0; i < uniqueKey.length; i++) {
    hash =
      uniqueKey.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return images[Math.abs(hash) % images.length];
}
