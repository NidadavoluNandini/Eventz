import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/carousel1.jpg",
    title: "Your Next Event Awaits",
    subtitle: "Discover conferences, workshops & networking events",
  },
  {
    image: "/images/carousel2.jpg",
    title: "Host Events with Ease",
    subtitle: "Complete event management from creation to ticketing",
  },
  {
    image: "/images/carousel3.webp",
    title: "Book Tickets Instantly",
    subtitle: "Secure registration with instant confirmation",
  },
  {
    image: "/images/carousel4.jpg",
    title: "Connect & Network",
    subtitle: "Meet professionals and enthusiasts in your field",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white">
      {/* COMPACT HERO CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="relative h-[280px] sm:h-[320px] overflow-hidden rounded-2xl shadow-2xl group">
          {/* Slides */}
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>
          ))}

          {/* Content - Centered Text Only */}
          <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-12">
            <div className="max-w-3xl text-center">
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
                {slides[index].title}
              </h1>

              <p className="text-white/95 text-lg sm:text-xl">
                {slides[index].subtitle}
              </p>
            </div>
          </div>

          {/* Arrows - Hidden on mobile */}
          <button
            onClick={() =>
              setIndex(index === 0 ? slides.length - 1 : index - 1)
            }
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white w-12 h-12 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => setIndex((index + 1) % slides.length)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white w-12 h-12 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all ${
                  i === index
                    ? "w-8 h-2.5 bg-white rounded-full"
                    : "w-2.5 h-2.5 bg-white/60 hover:bg-white/80 rounded-full"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
