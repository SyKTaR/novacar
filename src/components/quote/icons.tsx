import type { NeedId } from "./data";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function NeedIcon({ id }: { id: NeedId }) {
  return (
    <svg className="quote-need-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      {id === "jantes" && (
        <g {...line}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 3v7M12 14v7M3.3 9.2l6.8 2.2M13.9 12.6l6.8 2.2M6 19.2l4.2-5.8M13.8 10.6 18 4.8" />
        </g>
      )}
      {id === "carrosserie" && (
        <g {...line}>
          <path d="M4.5 17H3.8A1.3 1.3 0 0 1 2.5 15.7v-2.4c0-.8.5-1.5 1.3-1.7L6 11l1.7-3.3A2 2 0 0 1 9.5 6.6h5a2 2 0 0 1 1.8 1.1L18 11l2.2.6c.8.2 1.3.9 1.3 1.7v2.4c0 .7-.6 1.3-1.3 1.3h-.7" />
          <path d="M6 11h12" />
          <circle cx="7" cy="17" r="1.6" />
          <circle cx="17" cy="17" r="1.6" />
          <path d="M8.6 17h6.8" />
          <g stroke="var(--orange)" strokeWidth="1.5">
            <path d="M12 2.2v1.8M9.4 3l.9 1.4M14.6 3l-.9 1.4" />
          </g>
        </g>
      )}
      {id === "lustrage" && (
        <g {...line}>
          <path d="M10 3.5 11.9 9 17.5 11l-5.6 1.9L10 18.5 8.1 12.9 2.5 11 8.1 9z" />
          <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
        </g>
      )}
      {id === "inconnu" && (
        <g {...line}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.4 9.4a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.3 1-1.3 1.8" />
          <path d="M12 16.9v.1" />
        </g>
      )}
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg className="quote-drop-icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <g {...line}>
        <path d="M14.5 4h-5L7.5 6.5H4.5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3z" />
        <circle cx="12" cy="13" r="3.4" />
      </g>
    </svg>
  );
}

/** Coche tracée avec pathLength=1 : animable via stroke-dashoffset. */
export function CheckIcon({ className = "quote-check" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path className="quote-check-path" pathLength={1} d="M5.5 12.5l4.2 4.2 8.8-9.4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
