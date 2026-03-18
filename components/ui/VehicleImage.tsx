"use client";
import { useState, useEffect } from "react";
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

// Images from denengelsen.eu (works) — denengelsentopused.eu blocks hotlinking
const SAMPLE_IMAGES: Record<string, string> = {
  "MAN TGX": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN TGE": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "MAN TGM": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "MAN TGL": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN TGS": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "MAN TG": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "MAN": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "VW Crafter": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "VW Transporter": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "VW Caddy": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "VW Multivan": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "VW": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Mercedes": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "Mercedes-Benz": "https://www.denengelsen.eu/transforms/_stockThumb/3195323/50389020_1.webp",
  "Renault Master": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Renault Trafic": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Renault": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Citroën Berlingo": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Citroën": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Citroen": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Peugeot Boxer": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Peugeot": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Ford Transit": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Ford": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Toyota Proace": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Toyota": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Opel Movano": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Opel": "https://www.denengelsen.eu/transforms/_stockThumb/3199178/46825346_1.webp",
  "Škoda": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
  "Skoda": "https://www.denengelsen.eu/transforms/_stockThumb/3199280/46824866_1.webp",
};

const BRAND_LOGOS: Record<string, string> = {
  "MAN": "https://www.denengelsen.eu/uploads/MAN/logo-man.svg",
  "VW": "https://www.denengelsen.eu/uploads/Logos-other/VW_Bedrijfswagens_logo-cropped.svg",
  "Renault": "https://logospng.org/download/renault/logo-renault-4096.png",
  "Citroen": "https://1000logos.net/wp-content/uploads/2019/12/Citroen-Logo-2016.png",
  "Citroën": "https://1000logos.net/wp-content/uploads/2019/12/Citroen-Logo-2016.png",
  "Peugeot": "https://cdn.freelogovectors.net/wp-content/uploads/2023/05/peugeot_logo-freelogovectors.net_-640x360.png",
  "Opel": "https://logos-world.net/wp-content/uploads/2021/05/Opel-Logo.png",
  "Toyota": "https://pngset.com/images/download-toyota-logo-toyota-logo-symbol-trademark-emblem-badge-transparent-png-2838667.png",
  "Skoda": "https://1000logos.net/wp-content/uploads/2022/02/Logo-Skoda-1536x864.png",
  "Škoda": "https://1000logos.net/wp-content/uploads/2022/02/Logo-Skoda-1536x864.png",
  "Ford": "https://www.pngmart.com/files/4/Ford-Logo-PNG-Transparent-Image.png",
  "Mercedes": "https://www.philshawvehicles.im/wp-content/uploads/2025/01/mercedes.jpg",
  "Mercedes-Benz": "https://www.philshawvehicles.im/wp-content/uploads/2025/01/mercedes.jpg",
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
    return "https://www.denengelsen.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  if (upperBrand === "MERCEDES-BENZ" || upperBrand === "MERCEDES") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3189191/50515646_1.webp";
  }
  if (upperBrand === "RENAULT") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "CITROËN" || upperBrand === "CITROEN") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3178947/50260781_1.webp";
  }
  if (upperBrand === "PEUGEOT") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3201341/51749966_1.webp";
  }
  if (upperBrand === "FORD") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "TOYOTA") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  if (upperBrand === "OPEL") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3194213/51971422_1.webp";
  }
  if (upperBrand === "ŠKODA" || upperBrand === "SKODA") {
    return "https://www.denengelsen.eu/transforms/_stockThumb/3205709/52013469_1.webp";
  }
  
  return null;
}

function getBrandLogo(brand: string): string | null {
  const upperBrand = brand.toUpperCase();
  
  if (upperBrand === "MAN") return BRAND_LOGOS["MAN"];
  if (upperBrand === "VW" || upperBrand === "VOLKSWAGEN") return BRAND_LOGOS["VW"];
  if (upperBrand === "RENAULT") return BRAND_LOGOS["Renault"];
  if (upperBrand === "PEUGEOT") return BRAND_LOGOS["Peugeot"];
  if (upperBrand === "CITROËN" || upperBrand === "CITROEN") return BRAND_LOGOS["Citroen"];
  if (upperBrand === "TOYOTA") return BRAND_LOGOS["Toyota"];
  if (upperBrand === "OPEL") return BRAND_LOGOS["Opel"];
  if (upperBrand === "ŠKODA" || upperBrand === "SKODA") return BRAND_LOGOS["Skoda"];
  if (upperBrand === "FORD") return BRAND_LOGOS["Ford"];
  if (upperBrand === "MERCEDES-BENZ" || upperBrand === "MERCEDES" || upperBrand === "MERC") return BRAND_LOGOS["Mercedes"];
  
  return null;
}

export function VehicleImage({ src, alt, brand, type, className, aspectRatio = "video" }: VehicleImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(src || null);
  const [logoError, setLogoError] = useState(false);

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

  const getBrandDisplayName = (b: string): string => {
    if (b === "Mercedes-Benz") return "Merc";
    if (b === "Citroën") return "Cit";
    if (b === "Škoda") return "Skod";
    if (b.length > 4) return b.substring(0, 4);
    return b;
  };

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-secondary group", className, aspectRatio === "video" ? "aspect-[16/10]" : "aspect-square")}
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
        </>
      )}
      {brandLogo && !showPlaceholder && (
        <div className={cn(
          "absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1",
          brandBg, brandBorder
        )}>
          {logoError ? (
            <span className={brandColor}>{getBrandDisplayName(brand)}</span>
          ) : (
            <img
              src={brandLogo}
              alt={brand}
              className="w-6 h-6 object-contain"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
