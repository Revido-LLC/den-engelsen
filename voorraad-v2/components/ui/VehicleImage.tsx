"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Truck, Package } from "lucide-react";
import Image from "next/image";

interface VehicleImageProps {
  src?: string | null;
  alt: string;
  brand: string;
  type: "truck" | "van";
  className?: string;
  aspectRatio?: "video" | "square";
}

const SAMPLE_IMAGES: Record<string, string> = {
  "MAN TGX": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN TGE": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "MAN TGM": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "MAN TGL": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN TGS": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "MAN TG": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "VW Crafter": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
  "VW Transporter": "https://www.denengelsentopused.eu/transforms/_stockThumb/3204248/50945868_1.webp",
  "VW Caddy": "https://www.denengelsentopused.eu/transforms/_stockThumb/3206931/52087636_1.webp",
  "VW Multivan": "https://www.denengelsentopused.eu/transforms/_stockThumb/3204248/50945868_1.webp",
  "VW": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
  "Mercedes": "https://www.denengelsentopused.eu/transforms/_stockThumb/3189191/50515646_1.webp",
  "Mercedes-Benz": "https://www.denengelsentopused.eu/transforms/_stockThumb/3189191/50515646_1.webp",
  "Renault Master": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Renault Trafic": "https://www.denengelsentopused.eu/transforms/_stockThumb/3193622/49792977_1.webp",
  "Renault": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Citroën Berlingo": "https://www.denengelsentopused.eu/transforms/_stockThumb/3178947/50260781_1.webp",
  "Citroën": "https://www.denengelsentopused.eu/transforms/_stockThumb/3178947/50260781_1.webp",
  "Citroen": "https://www.denengelsentopused.eu/transforms/_stockThumb/3178947/50260781_1.webp",
  "Peugeot Boxer": "https://www.denengelsentopused.eu/transforms/_stockThumb/3201341/51749966_1.webp",
  "Peugeot": "https://www.denengelsentopused.eu/transforms/_stockThumb/3201341/51749966_1.webp",
  "Ford Transit": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Ford": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Toyota Proace": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
  "Toyota": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
  "Opel Movano": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Opel": "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp",
  "Škoda": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
  "Skoda": "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp",
};

const BRAND_LOGOS: Record<string, string> = {
  "MAN": "https://www.denengelsen.eu/uploads/MAN/logo-man.svg",
  "VW": "https://www.denengelsen.eu/uploads/Logos-other/VW_Bedrijfswagens_logo-cropped.svg",
  "Mercedes-Benz": "https://www.denengelsen.eu/uploads/Logos-other/Mercedes_Benz_logo.svg",
  "Mercedes": "https://www.denengelsen.eu/uploads/Logos-other/Mercedes_Benz_logo.svg",
  "Renault": "https://www.denengelsen.eu/uploads/Logos-other/Renault_Logo.svg",
  "Citroën": "https://www.denengelsen.eu/uploads/Logos-other/Citroen_Logo.svg",
  "Citroen": "https://www.denengelsen.eu/uploads/Logos-other/Citroen_Logo.svg",
  "Peugeot": "https://www.denengelsen.eu/uploads/Logos-other/Peugeot_Logo.svg",
  "Ford": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg",
  "Toyota": "https://www.denengelsen.eu/uploads/Logos-other/Toyota_Logo.svg",
  "Opel": "https://www.denengelsen.eu/uploads/Logos-other/Opel_Logo.svg",
  "Škoda": "https://www.denengelsen.eu/uploads/Logos-other/Skoda_Logo.svg",
  "Skoda": "https://www.denengelsen.eu/uploads/Logos-other/Skoda_Logo.svg",
};

function getVehicleImageUrl(name: string, brand: string): string | null {
  const upperName = name.toUpperCase();
  const upperBrand = brand.toUpperCase();
  
  // First try to match full vehicle name
  for (const [key, url] of Object.entries(SAMPLE_IMAGES)) {
    if (upperName.includes(key.toUpperCase())) {
      return url;
    }
  }
  
  // Then try to match just the brand
  for (const [key, url] of Object.entries(SAMPLE_IMAGES)) {
    if (key.length > 2 && upperBrand.includes(key.toUpperCase())) {
      return url;
    }
  }
  
  // Fallback to generic brand image
  if (upperBrand === "MAN") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp";
  }
  if (upperBrand === "VW" || upperBrand === "VOLKSWAGEN") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  if (upperBrand === "MERCEDES-BENZ" || upperBrand === "MERCEDES") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3189191/50515646_1.webp";
  }
  if (upperBrand === "RENAULT") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "CITROËN" || upperBrand === "CITROEN") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3178947/50260781_1.webp";
  }
  if (upperBrand === "PEUGEOT") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3201341/51749966_1.webp";
  }
  if (upperBrand === "FORD") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "TOYOTA") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  if (upperBrand === "OPEL") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "ŠKODA" || upperBrand === "SKODA") {
    return "https://www.denengelsentopused.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  
  return null;
}

function getBrandLogo(brand: string): string | null {
  const upperBrand = brand.toUpperCase();
  
  if (upperBrand === "MERCEDES-BENZ" || upperBrand === "MERC") return BRAND_LOGOS["Mercedes"];
  if (upperBrand === "VW" || upperBrand === "VOLKSWAGEN") return BRAND_LOGOS["VW"];
  if (upperBrand === "MAN") return BRAND_LOGOS["MAN"];
  if (upperBrand === "RENAULT") return BRAND_LOGOS["Renault"];
  if (upperBrand === "PEUGEOT") return BRAND_LOGOS["Peugeot"];
  if (upperBrand === "CITROËN" || upperBrand === "CITROEN") return BRAND_LOGOS["Citroën"];
  if (upperBrand === "TOYOTA") return BRAND_LOGOS["Toyota"];
  if (upperBrand === "OPEL") return BRAND_LOGOS["Opel"];
  if (upperBrand === "ŠKODA" || upperBrand === "SKODA") return BRAND_LOGOS["Škoda"];
  if (upperBrand === "FORD") return BRAND_LOGOS["Ford"];
  
  return null;
}

export function VehicleImage({ src, alt, brand, type, className, aspectRatio = "video" }: VehicleImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(src || null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (!src) {
      const denEngelsenUrl = getVehicleImageUrl(alt, brand);
      if (denEngelsenUrl) {
        setImageUrl(denEngelsenUrl);
      }
    } else {
      setImageUrl(src);
    }
  }, [src, alt, brand]);

  const brandLogo = getBrandLogo(brand);
  const isMan = brand === "MAN";
  const brandColor = isMan ? "text-brand" : "text-blue-700";
  const brandBg = isMan ? "bg-red-50" : "bg-blue-50";
  const brandBorder = isMan ? "border-red-100" : "border-blue-100";

  const showPlaceholder = !imageUrl || error;

  return (
    <>
      <div 
        className={cn("relative overflow-hidden rounded-lg bg-secondary cursor-pointer group", className, aspectRatio === "video" ? "aspect-[16/10]" : "aspect-square")}
        onClick={() => imageUrl && !showPlaceholder && setShowLightbox(true)}
      >
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
              src={imageUrl}
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 rounded-full p-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </>
        )}
        {brandLogo && !showPlaceholder && (
          <div className="absolute top-1.5 left-1.5 w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center p-1">
            <img src={brandLogo} alt={brand} className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {showLightbox && imageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
            onClick={() => setShowLightbox(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={imageUrl} 
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
