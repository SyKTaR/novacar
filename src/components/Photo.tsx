import type { CSSProperties } from "react";
import manifest from "../assets/photos/manifest.json";
import type { PhotoName } from "../data/photos";

type Manifest = Record<string, { width: number; height: number; widths: number[] }>;
const PHOTOS = manifest as Manifest;

const URLS = import.meta.glob("../assets/photos/*.{webp,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function url(name: string, width: number, ext: "webp" | "jpg") {
  return URLS[`../assets/photos/${name}-${width}.${ext}`];
}

function srcSet(name: string, widths: number[], ext: "webp" | "jpg") {
  return widths.map((w) => `${url(name, w, ext)} ${w}w`).join(", ");
}

type PhotoProps = {
  name: PhotoName;
  alt: string;
  /** Attribut `sizes` : largeur d'affichage réelle de l'image selon le breakpoint. */
  sizes: string;
  eager?: boolean;
  className?: string;
  /** Recadrage `object-position` (jantes en portrait dans un cadre paysage : `center 55%`). */
  position?: string;
  /** Plus petite variante utile (ex. 240 pour une vignette de 72 px). */
  minWidth?: number;
};

/**
 * Photo optimisée : <picture> WebP + repli JPEG, srcset 240/800/1600 (plafonné à la taille
 * native), dimensions intrinsèques renseignées (pas de décalage de mise en page).
 * Variantes générées par scripts/optimize-photos.py.
 */
export default function Photo({ name, alt, sizes, eager = false, className, position, minWidth }: PhotoProps) {
  const meta = PHOTOS[name];
  const widths = meta.widths.filter((w) => !minWidth || w >= minWidth);
  const fallbackWidth = widths.includes(800) ? 800 : widths[widths.length - 1];
  const style: CSSProperties | undefined = position ? { objectPosition: position } : undefined;
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(name, widths, "webp")} sizes={sizes} />
      <img
        className={className}
        src={url(name, fallbackWidth, "jpg")}
        srcSet={srcSet(name, widths, "jpg")}
        sizes={sizes}
        alt={alt}
        width={meta.width}
        height={meta.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={style}
      />
    </picture>
  );
}
