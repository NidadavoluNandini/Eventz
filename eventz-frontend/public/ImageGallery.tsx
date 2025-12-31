const images = [
  { name: "Technology", src: "/images/technology.webp" },
  { name: "Entertainment", src: "/images/entertainment.jpg" },
  { name: "Sports", src: "/images/sports.webp" },
  { name: "Business", src: "/images/business.png" },
  { name: "Science", src: "/images/science.jpg" },
  { name: "Arts", src: "/images/arts.jpg" },
  { name: "Industry", src: "/images/industry.jpg" },
  { name: "Marathon", src: "/images/marathon.jpg" },
  { name: "Default", src: "/images/default.jpg" },
];

export default function ImageGallery() {
  return (
    <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((img) => (
        <div key={img.name} className="rounded shadow overflow-hidden">
          <img
            src={img.src}
            alt={img.name}
            className="h-40 w-full object-cover"
          />
          <p className="text-center p-2 font-semibold">
            {img.name}
          </p>
        </div>
      ))}
    </div>
  );
}
