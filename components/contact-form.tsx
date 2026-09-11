"use client";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    if (response.ok) setSent(true); else setError("Le message n’a pas pu être envoyé.");
  }
  if (sent) return <div className="rounded-3xl bg-olive/10 p-7 font-bold text-olive">Message reçu. Nous vous répondrons sous deux jours ouvrés.</div>;
  return <form onSubmit={submit} className="grid gap-4 rounded-3xl bg-sand p-6 sm:grid-cols-2 sm:p-8"><input required name="name" placeholder="Nom" className="rounded-xl border px-4 py-3" /><input required type="email" name="email" placeholder="E-mail" className="rounded-xl border px-4 py-3" /><input required name="subject" placeholder="Objet" className="rounded-xl border px-4 py-3 sm:col-span-2" /><textarea required minLength={10} maxLength={4000} name="message" placeholder="Votre message" rows={6} className="rounded-xl border px-4 py-3 sm:col-span-2" /><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><button className="rounded-full bg-sea px-5 py-4 font-bold text-white sm:col-span-2">Envoyer le message</button>{error && <p role="alert" className="text-sm font-bold text-terracotta sm:col-span-2">{error}</p>}</form>;
}
