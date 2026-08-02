"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.ok) {
    return (
      <p className="frame-label text-brass">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="frame-label mb-2 block">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full border border-moss/60 bg-ink px-4 py-3 text-paper placeholder:text-paper/40 focus:border-brass focus:outline-none"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="frame-label mb-2 block">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-moss/60 bg-ink px-4 py-3 text-paper placeholder:text-paper/40 focus:border-brass focus:outline-none"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="message" className="frame-label mb-2 block">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="w-full resize-y border border-moss/60 bg-ink px-4 py-3 text-paper placeholder:text-paper/40 focus:border-brass focus:outline-none"
          placeholder="Tell us about your project..."
        />
      </div>
      {state.message && !state.ok && (
        <p className="text-sm text-rust">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="frame-label border border-brass px-8 py-3 text-brass transition-colors hover:bg-brass hover:text-ink disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
