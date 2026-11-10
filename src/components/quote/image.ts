const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.8;

/**
 * Poids total maximal des photos (octets, avant base64). La base64 ajoute 33 % et
 * le corps JSON d'une fonction Vercel est limité à 4,5 Mo : 2,7 Mo → ~3,6 Mo
 * de base64, soit un corps total < ~3,8 Mo.
 */
export const PHOTO_BUDGET_BYTES = 2_700_000;

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Repli sur <img> ci-dessous.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => undefined };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Redimensionne (côté long ≤ 1600 px) et recompresse en JPEG via canvas natif.
 * Si le fichier d'origine est déjà un JPEG dans ces dimensions et plus léger que
 * le résultat, on le garde tel quel (jamais de recompression qui alourdit).
 * Lève une erreur si l'image ne peut pas être décodée (ex. HEIC hors Safari).
 */
export async function compressImage(file: File, maxSide = MAX_SIDE, quality = JPEG_QUALITY): Promise<File> {
  const decoded = await decode(file);
  try {
    const { width, height } = decoded;
    if (!width || !height) throw new Error("empty image");
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no 2d context");
    context.fillStyle = "#fff"; // PNG transparents → fond blanc plutôt que noir
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    const blob = await toBlob(canvas, quality);
    if (!blob) throw new Error("encode failed");
    if (scale === 1 && file.type === "image/jpeg" && file.size <= blob.size) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    decoded.release();
  }
}

/** Paliers de réduction successifs (côté long max, qualité JPEG). */
const LADDER: ReadonlyArray<readonly [number, number]> = [
  [1400, 0.72],
  [1200, 0.65],
  [1000, 0.58],
  [800, 0.5],
  [640, 0.42],
];

/**
 * Garantit que le poids cumulé des photos tient dans `budget` : chaque photo trop
 * lourde est recompressée par paliers (dimensions et qualité réduites) jusqu'à
 * tenir dans sa part du budget. Les photos déjà légères ne sont pas touchées.
 * Si une photo ne tient toujours pas au dernier palier, elle est renvoyée telle
 * quelle (le serveur la refusera et le repli sans photos prendra le relais).
 */
export async function fitPhotosToBudget(files: File[], budget = PHOTO_BUDGET_BYTES): Promise<File[]> {
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (files.length === 0 || total <= budget) return files;
  const share = budget / files.length;
  return Promise.all(
    files.map(async (file) => {
      let current = file;
      for (const [side, quality] of LADDER) {
        if (current.size <= share) break;
        try {
          const next = await compressImage(current, side, quality);
          if (next.size < current.size) current = next;
        } catch {
          break;
        }
      }
      return current;
    }),
  );
}
