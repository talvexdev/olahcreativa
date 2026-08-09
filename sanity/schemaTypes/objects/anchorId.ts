import { defineField } from "sanity";

/**
 * Optional override for the section’s HTML `id` (in-page nav targets).
 * Leave empty to use the module default (`servicios`, `portafolio`, …).
 */
export const anchorIdField = defineField({
  name: "anchorId",
  title: "Ancla (URL)",
  type: "string",
  description:
    "Opcional. Fragmento para enlaces del menú (ej. portafolio-marca → /portfolio#portafolio-marca). Solo minúsculas, números y guiones. Si hay varios módulos iguales, dale a cada uno un ancla distinta.",
  validation: (R) =>
    R.custom((value) => {
      if (value === undefined || value === null || value === "") return true;
      if (typeof value !== "string") return "Ancla inválida";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
        return "Usa solo minúsculas, números y guiones (ej. portafolio-eventos).";
      }
      return true;
    }),
});
