import { useEffect, useRef, useState } from "react";

import type { BannerResponse } from "../../types/api";

interface HeroCarouselProps {
  banners: BannerResponse[];
}

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

function HeroCarousel({ banners }: HeroCarouselProps) {
  const slides = banners.filter((banner) => banner.visible);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  if (slides.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      setCurrent((c) => (c + (delta > 0 ? 1 : -1) + slides.length) % slides.length);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 200 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((banner, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full bg-white transition-all duration-300"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                opacity: i === current ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;