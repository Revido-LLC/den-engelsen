"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Truck, Package } from "lucide-react";

interface VehicleImageProps {
  src?: string | null;
  alt: string;
  brand: string;
  type: "truck" | "van";
  className?: string;
  aspectRatio?: "video" | "square";
}

export function VehicleImage({ src, alt, brand, type, className, aspectRatio = "video" }: VehicleImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isMan = brand === "MAN";
  const brandColor = isMan ? "text-brand" : "text-blue-700";
  const brandBg = isMan ? "bg-red-50" : "bg-blue-50";
  const brandBorder = isMan ? "border-red-100" : "border-blue-100";

  const showPlaceholder = !src || error;

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-secondary", className, aspectRatio === "video" ? "aspect-[16/10]" : "aspect-square")}>
      {showPlaceholder ? (
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center", brandBg)}>
          {type === "truck" ? (
            <Truck className={cn("w-8 h-8", brandColor)} />
          ) : (
            <Package className={cn("w-8 h-8", brandColor)} />
          )}
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              loading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
          {loading && (
            <div className="absolute inset-0 bg-secondary animate-pulse" />
          )}
        </>
      )}
      {/* Brand badge */}
      <div className={cn(
        "absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold border",
        brandBg, brandColor, brandBorder
      )}>
        {brand === "Mercedes-Benz" ? "Merc" : brand === "Citroën" ? "Cit" : brand === "Škoda" ? "Skod" : brand}
      </div>
    </div>
  );
}
