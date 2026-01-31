import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "/images/carousel1.jpg",
    title: "Discover Amazing Events",
    subtitle: "Find conferences, workshops and meetups near you",
  },
  {
    image: "/images/carousel2.jpg",
    title: "Create & Host Events",
    subtitle: "Organize events and manage registrations with ease",
  },
  {
    image: "/images/carousel3.webp",
    title: "Seamless Ticketing",
    subtitle: "Register, pay, and receive tickets instantly",
  },
  {
    image: "/images/carousel4.jpg",
    title: "Join Communities",
    subtitle: "Connect with like-minded people at great events",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="w-full">
      {/* CENTERED HERO CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="relative h-[380px] overflow-hidden rounded-3xl shadow-lg group">
          {/* Slides */}
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

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30 flex items-center justify-center text-center px-4">
            <div className="max-w-3xl">
              <h1 className="text-white text-3xl md:text-4xl font-extrabold mb-3">
                {slides[index].title}
              </h1>

              <p className="text-white/90 text-base md:text-lg mb-6">
                {slides[index].subtitle}
              </p>

              <Link
                to="/"
                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
              >
                Explore Events
              </Link>
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() =>
              setIndex(index === 0 ? slides.length - 1 : index - 1)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            ❮
          </button>

          <button
            onClick={() => setIndex((index + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            ❯
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
