import { useState } from "react";

interface BannerImageProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function BannerImage({
  src,
  alt = "Banner",
  className = "",
  fallbackClassName = "bg-amber-200 flex items-center justify-center text-amber-600",
}: BannerImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`${className} ${fallbackClassName}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-2xl">🖼️</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
