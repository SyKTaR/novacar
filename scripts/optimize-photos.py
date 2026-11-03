#!/usr/bin/env python3
"""Génère les variantes WebP + JPEG (240 / 800 / 1600 px, plafonnées à la taille native)
des photos client dans src/assets/photos/ et le manifeste manifest.json.

Usage : python3 scripts/optimize-photos.py <dossier-des-sources>
Les sources sont déclarées dans SOURCES (chemin relatif au dossier -> nom de sortie).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageOps

SOURCES = {
    "avant-apres/01-jante-avant.jpg": "01-jante-avant",
    "avant-apres/01-jante-apres.jpg": "01-jante-apres",
    "avant-apres/02-bouclier-rouge-avant.jpg": "02-bouclier-rouge-avant",
    "avant-apres/02-bouclier-rouge-apres.jpg": "02-bouclier-rouge-apres",
    "avant-apres/03-bouclier-blanc-avant.jpg": "03-bouclier-blanc-avant",
    "avant-apres/03-bouclier-blanc-apres.jpg": "03-bouclier-blanc-apres",
    "avant-apres/04-jante-anthracite-avant.jpg": "04-jante-anthracite-avant",
    "avant-apres/04-jante-anthracite-apres.jpg": "04-jante-anthracite-apres",
    "prestations/jante-argent.jpg": "jante-argent",
    "prestations/jante-polie-biton.jpg": "jante-polie-biton",
    "prestations/jante-noire.jpg": "jante-noire",
    "prestations/jante-anthracite-etrier-jaune.jpg": "jante-anthracite-etrier-jaune",
    # visuels déjà en place, conservés (pas de nouvelle photo fournie)
    "legacy/janteschromes.jpg": "jante-chrome",
    "legacy/lustrage_avant.jpg": "lustrage-avant",
    "legacy/lustrage_apres.jpg": "lustrage-apres",
    "legacy/carrosserie-apres.jpg": "carrosserie-apres",
}

def main(src_dir: str) -> None:
    src = Path(src_dir)
    out = Path(__file__).resolve().parent.parent / "src" / "assets" / "photos"
    out.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for rel, name in SOURCES.items():
        im = ImageOps.exif_transpose(Image.open(src / rel)).convert("RGB")
        w, h = im.size
        widths = [240, 800]
        top = min(1600, w)
        if top > 800:
            widths.append(top)
        widths = [x for x in widths if x <= w]
        for tw in widths:
            th = round(h * tw / w)
            r = im if tw == w else im.resize((tw, th), Image.LANCZOS)
            r.save(out / f"{name}-{tw}.webp", "WEBP", quality=80, method=6)
            r.save(out / f"{name}-{tw}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
        manifest[name] = {"width": w, "height": h, "widths": widths}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{len(manifest)} photos -> {out}")

if __name__ == "__main__":
    main(sys.argv[1])
