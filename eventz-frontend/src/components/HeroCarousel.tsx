import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/carousel1.jpg",
    title: "Discover Amazing Events ✨",
    subtitle: "Find conferences, workshops and meetups near you",
  },
  {
    image: "/images/carousel2.jpg",
    title: "Create & Host Events 🎤",
    subtitle: "Organize events and manage registrations with ease",
  },
  {
    image: "/images/carousel3.webp",
    title: "Seamless Ticketing 🎟️",
    subtitle: "Register, pay, and receive tickets instantly",
  },
  {
    image: "/images/carousel4.jpg",
    title: "Join Communities 🤝",
    subtitle: "Connect with like-minded people at great events",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl mb-10 group">
      {/* Images */}
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.image}
          alt={slide.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay + TOP Text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent flex items-start justify-center px-4 pt-10 md:pt-16 text-center">
        <div className="max-w-3xl">
          <h1 className="text-white text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
            {slides[index].title}
          </h1>
          <p className="text-white/90 text-base md:text-xl drop-shadow-md">
            {slides[index].subtitle}
          </p>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition"
      >
        ❮
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
