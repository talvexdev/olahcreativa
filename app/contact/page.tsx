import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about your next project.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-20">
      <p className="frame-label mb-4">Contact</p>
      <h1 className="mb-12 font-display text-4xl text-paper sm:text-5xl">
        Let&apos;s talk about your project.
      </h1>
      <ContactForm />
    </section>
  );
}
