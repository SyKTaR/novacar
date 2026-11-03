import { STEP_LABELS } from "./data";
import { CheckIcon } from "./icons";

export default function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="quote-stepper" aria-label="Progression de la demande">
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        const state = number < step ? "done" : number === step ? "active" : "todo";
        const status = state === "done" ? "terminée" : state === "active" ? "en cours" : "à venir";
        return (
          <li
            key={label}
            className={`quote-step is-${state}`}
            data-step={number}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span className="quote-step-disc" aria-hidden="true">
              <span className="quote-step-number">{number}</span>
              <CheckIcon className="quote-step-check" />
            </span>
            <span className="quote-step-label" aria-hidden="true">{label}</span>
            <span className="sr-only">{`Étape ${number} sur 3, ${label}, ${status}`}</span>
            {number < 3 && (
              <span className="quote-step-line" aria-hidden="true">
                <span className="quote-step-fill" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
