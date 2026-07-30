"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Upload,
  UserPlus,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import { KcsBrand } from "@/components/branding/kcs-brand";

const eligibilityRules = [
  "Applicant must be a KCS graduate or approved partner-school candidate.",
  "Applicant must have a valid identity document and accurate civil information.",
  "Applicant must provide education history, guardian contacts, and reachable phone numbers.",
  "Application fees are reviewed only after payment evidence is matched by finance.",
  "Final eligibility criteria will be replaced with the official company policy."
];

const paymentMethods = [
  { name: "M-Pesa", status: "API-ready", detail: "Provider credentials and webhook URL required before activation." },
  { name: "Airtel Money", status: "API-ready", detail: "Can be integrated through the official merchant API or aggregator." },
  { name: "Orange Money", status: "API-ready", detail: "Requires merchant account, callback secret, and reconciliation exports." },
  { name: "Secure manual payment", status: "Available now", detail: "Unique reference, proof upload, finance review, and audit trail." }
];

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const reference = useMemo(() => `KCS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`, []);

  return (
    <main className="min-h-screen bg-[#020814] text-kcs-text">
      <section className="mx-auto grid min-h-screen max-w-[1500px] gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative flex min-h-[520px] flex-col justify-between overflow-hidden border-b border-white/10 bg-[#061426] px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 opacity-80">
            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(245,184,46,0.18),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(39,196,244,0.2),transparent_28%),linear-gradient(180deg,rgba(3,16,36,0.2),rgba(2,8,20,0.96))]" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
            <KcsBrand />
            <span className="rounded-md border border-kcs-gold/30 bg-kcs-gold/10 px-3 py-1 text-xs font-semibold text-kcs-goldLight">
              Applicant Portal
            </span>
          </div>

          <div className="relative z-10 max-w-2xl py-10 lg:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-kcs-goldLight">Opportunity Program</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Apply, verify, and track your DV-style opportunity file.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-kcs-muted">
              Create an applicant account, complete a structured registration form, review provisional eligibility, and submit payment evidence through a controlled verification workflow.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            <TrustItem icon={LockKeyhole} label="Account access" />
            <TrustItem icon={FileCheck2} label="Document review" />
            <TrustItem icon={ShieldCheck} label="Payment control" />
          </div>
        </aside>

        <section className="bg-[#071527] px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.035] p-1">
              <button
                className={`h-11 rounded-md text-sm font-semibold transition ${mode === "register" ? "bg-kcs-gold text-[#08111f]" : "text-kcs-muted hover:text-white"}`}
                onClick={() => setMode("register")}
              >
                Create account
              </button>
              <button
                className={`h-11 rounded-md text-sm font-semibold transition ${mode === "login" ? "bg-kcs-gold text-[#08111f]" : "text-kcs-muted hover:text-white"}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </div>

            {mode === "login" ? <LoginPanel /> : <RegistrationPanel reference={reference} />}
          </div>
        </section>
      </section>
    </main>
  );
}

function LoginPanel() {
  return (
    <div className="premium-panel rounded-xl p-5 sm:p-6">
      <h2 className="text-2xl font-bold">Welcome back</h2>
      <p className="mt-1 text-sm text-kcs-muted">Access your application status, payment review, and correction requests.</p>
      <div className="mt-6 grid gap-4">
        <Field label="Email address" placeholder="candidate@example.com" type="email" />
        <Field label="Password" placeholder="Enter your password" type="password" />
        <button className="mt-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-kcs-gold px-5 text-sm font-bold text-[#08111f]">
          <LockKeyhole className="h-4 w-4" />
          Login securely
        </button>
      </div>
    </div>
  );
}

function RegistrationPanel({ reference }: { reference: string }) {
  return (
    <div className="grid gap-5">
      <div className="premium-panel rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-kcs-gold/15 text-kcs-goldLight">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">New applicant registration</h2>
            <p className="mt-1 text-sm leading-6 text-kcs-muted">Use legal names exactly as they appear on official documents.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="First name" placeholder="Grace" />
          <Field label="Last name" placeholder="Mbuyi" />
          <Field label="Date of birth" type="date" />
          <Field label="Country of birth" placeholder="DR Congo" />
          <Field label="Email address" type="email" placeholder="candidate@example.com" />
          <Field label="Phone number" placeholder="+243..." />
          <Field label="Education level" placeholder="High school diploma" />
          <Field label="Passport or ID number" placeholder="ID reference" />
          <Field label="Guardian full name" placeholder="Parent or guardian" />
          <Field label="Guardian phone" placeholder="+243..." />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-kcs-text">Residential address</span>
            <textarea className="min-h-[92px] w-full rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3 text-sm outline-none transition placeholder:text-kcs-muted/60 focus:border-kcs-gold/60" placeholder="City, commune, avenue, number" />
          </label>
        </div>
      </div>

      <InfoPanel title="Provisional eligibility conditions" icon={BadgeCheck}>
        <div className="grid gap-3">
          {eligibilityRules.map((rule) => (
            <div key={rule} className="flex gap-3 text-sm leading-6 text-kcs-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kcs-success" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </InfoPanel>

      <InfoPanel title="Payment verification" icon={CreditCard}>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <div key={method.name} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{method.name}</p>
                <span className="rounded-md bg-kcs-cyan/10 px-2.5 py-1 text-xs font-bold text-kcs-cyan">{method.status}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-kcs-muted">{method.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-kcs-gold/25 bg-kcs-gold/10 p-4">
          <div className="flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-kcs-goldLight" />
            <p className="font-semibold">Manual payment reference: {reference}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-kcs-muted">
            The application remains pending until finance confirms the sender name, amount, transaction ID, screenshot or receipt, and bank/mobile statement match this reference.
          </p>
        </div>
      </InfoPanel>

      <div className="premium-panel rounded-xl p-5 sm:p-6">
        <h3 className="text-lg font-bold">Secure submission checklist</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Payment transaction ID" placeholder="Operator or bank reference" />
          <Field label="Amount paid" placeholder="USD or local currency" />
          <button className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-kcs-text">
            <Upload className="h-4 w-4" />
            Upload proof
          </button>
          <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-kcs-gold px-4 text-sm font-bold text-[#08111f]">
            Submit application
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex gap-3 rounded-lg border border-kcs-warning/25 bg-kcs-warning/10 p-4 text-sm leading-6 text-kcs-muted">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-kcs-warning" />
          <span>No applicant should be marked as paid from the browser alone. Production validation must come from verified webhooks or authorized finance reconciliation.</span>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="premium-panel rounded-xl p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.055] text-kcs-goldLight">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-kcs-text">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.045] px-3 text-sm outline-none transition placeholder:text-kcs-muted/60 focus:border-kcs-gold/60"
      />
    </label>
  );
}

function TrustItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <Icon className="h-5 w-5 text-kcs-goldLight" />
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </div>
  );
}
