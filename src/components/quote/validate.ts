export type ContactErrors = Partial<Record<"name" | "phone" | "email" | "consent", string>>;

export function validateName(value: string) {
  return value.trim().length >= 2 ? "" : "Indiquez votre nom et prénom.";
}

export function validatePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Indiquez un numéro de téléphone.";
  const digits = trimmed.replace(/\D/g, "");
  if (!/^\+?[\d\s().-]+$/.test(trimmed) || digits.length < 10 || digits.length > 15) {
    return "Saisissez un numéro valide, d’au moins 10 chiffres.";
  }
  return "";
}

export function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Indiquez votre adresse e-mail.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) ? "" : "Saisissez une adresse e-mail valide.";
}

export function validateConsent(checked: boolean) {
  return checked ? "" : "Cochez la case pour que nous puissions traiter votre demande.";
}

export function validateContact(values: { name: string; phone: string; email: string; consent: boolean }) {
  const errors: ContactErrors = {};
  const name = validateName(values.name);
  const phone = validatePhone(values.phone);
  const email = validateEmail(values.email);
  const consent = validateConsent(values.consent);
  if (name) errors.name = name;
  if (phone) errors.phone = phone;
  if (email) errors.email = email;
  if (consent) errors.consent = consent;
  return errors;
}
