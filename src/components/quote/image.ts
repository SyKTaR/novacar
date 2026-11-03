const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.8;

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

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

/**
 * Redimensionne (côté long ≤ 1600 px) et recompresse en JPEG via canvas natif.
 * Si le fichier d'origine est déjà un JPEG dans ces dimensions et plus léger que
 * le résultat, on le garde tel quel (jamais de recompression qui alourdit).
 * Lève une erreur si l'image ne peut pas être décodée (ex. HEIC hors Safari).
 */
export async function compressImage(file: File): Promise<File> {
  const decoded = await decode(file);
  try {
    const { width, height } = decoded;
    if (!width || !height) throw new Error("empty image");
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no 2d context");
    context.fillStyle = "#fff"; // PNG transparents → fond blanc plutôt que noir
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    const blob = await toBlob(canvas);
    if (!blob) throw new Error("encode failed");
    if (scale === 1 && file.type === "image/jpeg" && file.size <= blob.size) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    decoded.release();
  }
}
