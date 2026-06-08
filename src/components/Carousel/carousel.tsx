import { useState } from "react";

type CarouselProps = {
  slides: string[];
};

export default function Carousel({ slides }: CarouselProps) {
  const [i, setI] = useState(0);

  const prev = () => {
    setI((s) => (s - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setI((s) => (s + 1) % slides.length);
  };

  return (
    <div className="relative w-full max-w-6xl h-[320px] sm:h-[420px] lg:h-[600px] mx-auto overflow-hidden rounded-xl">

      {/* TRACK */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((src, idx) => (
          <div
            key={idx}
            className="relative min-w-full h-full"
          >
            {/* IMAGE */}
            <img
              src={src}
              className="w-full h-full object-cover object-center"
            />

            {/* OVERLAY (important for cinematic look) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

            {/* CONTENT */}
            <div className="absolute bottom-6 left-4 right-4 text-white max-w-2xl sm:bottom-10 sm:left-8 sm:right-auto lg:bottom-16 lg:left-16">

              {/* TAGS */}
              <div className="mb-4 flex flex-wrap gap-2 sm:mb-6 sm:gap-3">
                <span className="bg-yellow-700 px-3 py-1.5 text-[0.7rem] uppercase sm:px-4 sm:py-2 sm:text-sm">
                  Flamenco
                </span>

                <span className="bg-yellow-700 px-3 py-1.5 text-[0.7rem] uppercase sm:px-4 sm:py-2 sm:text-sm">
                  Andalucía
                </span>
              </div>

              {/* TITLE */}
              <h1 className="mb-4 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl sm:mb-6">
                Noche Flamenca en El CiD
              </h1>

              {/* DESCRIPTION */}
              <p className="mb-5 text-sm text-gray-200 sm:mb-8 sm:text-base md:text-xl">
                Una velada junto al Mediterráneo con artistas nacionales.
              </p>

              {/* INFO */}
              <div className="flex flex-wrap gap-3 text-sm text-yellow-500 sm:gap-6 md:gap-8 md:text-base">
                <span>4 Julio 2026</span>
                <span>21:30h</span>
                <span>8 €</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LEFT BUTTON */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
        h-8 w-8 flex items-center justify-center text-white sm:left-4 sm:h-10 sm:w-10"
      >
        ‹
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
        h-8 w-8 flex items-center justify-center text-white sm:right-4 sm:h-10 sm:w-10"
      >
        ›
      </button>

      {/* DOTS */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-3 w-3 rounded-full transition sm:h-4 sm:w-4 ${
              i === idx ? "bg-yellow-600 scale-110" : "bg-white/30"
            }`}
            style={{borderRadius: "50%"}}
          />
        ))}
      </div>
    </div>
  );
}