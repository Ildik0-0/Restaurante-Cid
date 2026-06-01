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
    <div className="relative w-full max-w-6xl h-[600px] mx-auto overflow-hidden rounded-xl">

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
              className="w-full h-full object-cover"
            />

            {/* OVERLAY (important for cinematic look) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* CONTENT */}
            <div className="absolute bottom-16 left-16 text-white max-w-2xl">

              {/* TAGS */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <span className="bg-yellow-700 px-4 py-2 text-sm uppercase">
                  Flamenco
                </span>

                <span className="bg-yellow-700 px-4 py-2 text-sm uppercase">
                  Andalucía
                </span>
              </div>

              {/* TITLE */}
              <h1 className="text-5xl md:text-6xl font-serif mb-6">
                Noche Flamenca en El CiD
              </h1>

              {/* DESCRIPTION */}
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                Una velada junto al Mediterráneo con artistas nacionales.
              </p>

              {/* INFO */}
              <div className="flex gap-8 text-yellow-500 text-sm md:text-base">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
        w-10 h-10 flex items-center justify-center text-white"
      >
        ‹
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 
        bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
        w-10 h-10 flex items-center justify-center text-white"
      >
        ›
      </button>

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`w-4 h-4 rounded-full transition ${
              i === idx ? "bg-yellow-600 scale-110" : "bg-white/30"
            }`}
            style={{borderRadius: "50%"}}
          />
        ))}
      </div>
    </div>
  );
}