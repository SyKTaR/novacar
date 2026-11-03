import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import { MAX_PHOTOS, photoCount } from "./data";
import { CameraIcon, CloseIcon } from "./icons";

export interface QuotePhoto {
  id: string;
  file: File;
  url: string;
  leaving: boolean;
}

interface Props {
  photos: QuotePhoto[];
  busy: boolean;
  message: string;
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function PhotoDropzone({ photos, busy, message, onFiles, onRemove }: Props) {
  const inputId = useId();
  const messageId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const active = photos.filter((photo) => !photo.leaving);
  const full = active.length >= MAX_PHOTOS;

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (full) return;
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="quote-photos">
      <label
        htmlFor={inputId}
        className={`quote-drop${dragging ? " is-dragging" : ""}${full ? " is-full" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); if (!full) setDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); if (!full) setDragging(true); }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="quote-drop-input"
          type="file"
          accept="image/*"
          multiple
          disabled={full}
          aria-describedby={message ? messageId : undefined}
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <CameraIcon />
        <span className="quote-drop-title">
          {full ? `${MAX_PHOTOS} photos maximum` : "Ajoutez une photo du dommage"}
        </span>
        <span className="quote-drop-hint">
          {full ? "Retirez une photo pour en ajouter une autre." : "Glissez vos photos ici ou parcourez votre téléphone"}
        </span>
      </label>

      <p id={messageId} className="quote-photo-message" role="status" aria-live="polite">
        {message}
      </p>

      <div className="quote-thumbs-row">
        <ul className="quote-thumbs">
          {photos.map((photo, index) => (
            <li key={photo.id} className="quote-thumb" data-photo-id={photo.id}>
              <img src={photo.url} alt={`Photo ${index + 1}`} width={64} height={64} />
              <button
                type="button"
                className="quote-thumb-remove"
                aria-label={`Retirer la photo ${index + 1}`}
                onClick={() => onRemove(photo.id)}
                disabled={photo.leaving}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
        <p className="quote-photo-count" aria-live="polite">
          {busy ? "Préparation des photos…" : active.length > 0 ? `${photoCount(active.length)} ${active.length > 1 ? "ajoutées" : "ajoutée"}` : ""}
        </p>
      </div>
    </div>
  );
}
