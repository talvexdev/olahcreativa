"use client";

import { useActionState, useState } from "react";
import { submitBrief, type BriefFormState } from "@/lib/actions/contact";

const initialState: BriefFormState = { ok: false, message: "" };

const FIELD =
  "w-full rounded-xl border border-line bg-transparent px-4 py-3.5 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent";

const CARD =
  "relative flex flex-col gap-4 rounded-2xl border border-line bg-card p-8";

export function BriefForm({
  formTitle,
  interests,
  submitLabel,
}: {
  formTitle?: string;
  interests?: string[];
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(submitBrief, initialState);
  const [picked, setPicked] = useState<string[]>([]);

  const options = interests ?? [];

  function toggle(label: string) {
    setPicked((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  if (state.ok) {
    return (
      <div className={`${CARD} items-start justify-center gap-3 py-16`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Enviado
        </p>
        <p className="text-xl font-semibold tracking-tight">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={CARD}>
      {/*
        Honeypot. Positioned off-screen rather than display:none — some bots
        skip hidden inputs but will happily fill a field they can "see" in the
        DOM. aria-hidden and tabIndex keep it away from screen readers and the
        keyboard, so no real person can reach it.
      */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor="brief-company-website">Do not fill this in</label>
        <input
          id="brief-company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {formTitle && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {formTitle}
        </p>
      )}

      <input name="name" required placeholder="Tu nombre" className={FIELD} />
      <input name="company" placeholder="Empresa" className={FIELD} />
      <input
        name="email"
        type="email"
        required
        placeholder="Correo"
        className={FIELD}
      />

      {options.length > 0 && (
        <>
          {/* The chips are buttons, so their state rides along in a hidden input. */}
          <input type="hidden" name="interests" value={picked.join(", ")} />
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const on = picked.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  aria-pressed={on}
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    on
                      ? "border-accent text-accent"
                      : "border-line text-muted hover:border-fg/40"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}

      <textarea
        name="message"
        rows={4}
        required
        placeholder="Cuéntanos del proyecto"
        className={`${FIELD} resize-none`}
      />

      {state.message && (
        <p role="alert" className="text-sm text-accent">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Enviando…" : submitLabel || "Enviar brief"}
      </button>
    </form>
  );
}
