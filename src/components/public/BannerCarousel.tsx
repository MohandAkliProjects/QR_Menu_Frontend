import { useEffect, useRef, useState } from "react";
import type { BannerResponse } from "../../types";

interface Props {
  banners: BannerResponse[];
}

export default function BannerCarousel({ banners }: Props) {
  const visible = banners.filter((b) => b.visible);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % visible.length);
    }, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible.length]);

  if (visible.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl aspect-[16/6]">
      {visible.map((banner, i) => (
        <img
          key={banner.id}
          src={banner.imageUrl}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {visible.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {visible.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-4" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}