"use client";

import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
  type LucideIcon
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { KcsBrand } from "@/components/branding/kcs-brand";
import { insertApplication, isSupabaseConfigured, signInWithPassword } from "@/lib/supabase-rest";

const paymentReferencePrefix = "KCS-2026";

const eligibilityRules = [
  "Applicant must be a KCS graduate or approved partner-school candidate.",
  "Applicant must have a valid identity document and accurate civil information.",
  "Applicant must provide education history, guardian contacts, and reachable phone numbers.",
  "Application fees are reviewed only after payment evidence is matched by finance.",
  "Final eligibility is confirmed by the administration after document review."
];

const paymentMethods = [
  { name: "M-Pesa", status: "Ready to connect", detail: "Merchant credentials and signed webhook are required before live collection." },
  { name: "Airtel Money", status: "Ready to connect", detail: "Use the official merchant API or a certified aggregator." },
  { name: "Orange Money", status: "Ready to connect", detail: "Requires merchant account, callback secret, and reconciliation exports." },
  { name: "Manual verification", status: "Available", detail: "Transaction reference, proof upload, finance review, and audit trail." }
];

type View = "register" | "login" | "student" | "admin";
type Notice = { tone: "success" | "error" | "info"; text: string } | null;

export default function Home() {
  const [view, setView] = useState<View>("register");

  return (
    <main className="min-h-screen bg-[#020814] text-[#f7f9fc]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071426]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <KcsBrand />
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <NavButton label="Apply" active={view === "register"} onClick={() => setView("register")} />
            <NavButton label="Login" active={view === "login"} onClick={() => setView("login")} />
            <NavButton label="Student" active={view === "student"} onClick={() => setView("student")} />
            <NavButton label="Admin" active={view === "admin"} onClick={() => setView("admin")} />
          </nav>
        </div>
      </header>

      <section className="border-b border-white/10 bg-[#061426]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:px-8">
          <div className="min-w-0 pt-2">
            <p className="text-sm font-semibold text-kcs-goldLight">Official Opportunity Program</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              Submit and track a real applicant file.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-kcs-muted">
              Applicants can create a file, submit identity and education information, attach payment evidence, and wait for a controlled administrative review.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Database" value={isSupabaseConfigured ? "Connected" : "Not configured"} />
              <Metric label="Reference format" value={`${paymentReferencePrefix}-#####`} />
              <Metric label="Access mode" value="Production" />
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <ActionButton active={view === "register"} label="Create file" icon={UserPlus} onClick={() => setView("register")} />
              <ActionButton active={view === "login"} label="Secure login" icon={LockKeyhole} onClick={() => setView("login")} />
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-base font-semibold">System status</h2>
              <div className="mt-4 grid gap-3">
                <StatusRow label="Supabase REST" value={isSupabaseConfigured ? "Configured" : "Missing environment variables"} />
                <StatusRow label="Applicant intake" value="Live form" />
                <StatusRow label="Administration" value="Protected review workflow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === "register" && <RegistrationPanel />}
        {view === "login" && <LoginPanel onStudent={() => setView("student")} onAdmin={() => setView("admin")} />}
        {view === "student" && <StudentDashboard />}
        {view === "admin" && <AdminDashboard />}
      </section>
    </main>
  );
}

function RegistrationPanel() {
  const [notice, setNotice] = useState<Notice>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reference = useMemo(() => `${paymentReferencePrefix}-${Math.floor(10000 + Math.random() * 90000)}`, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice({ tone: "info", text: "Submitting applicant file..." });

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    const result = await insertApplication({ ...payload, payment_reference: reference, status: "submitted" });

    setIsSubmitting(false);
    setNotice(
      result.ok
        ? { tone: "success", text: `Application submitted. Reference: ${reference}` }
        : { tone: "error", text: `Supabase rejected the submission: ${result.error}` }
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit} className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={UserPlus} title="New applicant registration" caption="Use legal names exactly as they appear on official documents." />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field name="first_name" label="First name" placeholder="Grace" required />
          <Field name="last_name" label="Last name" placeholder="Mbuyi" required />
          <Field name="date_of_birth" label="Date of birth" type="date" required />
          <Field name="country_of_birth" label="Country of birth" placeholder="DR Congo" required />
          <Field name="email" label="Email address" type="email" placeholder="candidate@example.com" required />
          <Field name="phone" label="Phone number" placeholder="+243..." required />
          <Field name="education_level" label="Education level" placeholder="High school diploma" required />
          <Field name="identity_number" label="Passport or ID number" placeholder="ID reference" required />
          <Field name="guardian_name" label="Guardian full name" placeholder="Parent or guardian" />
          <Field name="guardian_phone" label="Guardian phone" placeholder="+243..." />
          <label className="min-w-0 sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Residential address</span>
            <textarea name="residential_address" required className="min-h-[96px] w-full rounded-md border border-white/10 bg-[#061426] px-3 py-2 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20" placeholder="City, commune, avenue, number" />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-kcs-muted">Generated payment reference: {reference}</p>
          <button disabled={isSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-gold px-5 text-sm font-bold text-[#08111f] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Submitting..." : "Submit application"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <aside className="grid min-w-0 gap-4 content-start">
        <InfoPanel title="Eligibility" icon={BadgeCheck}>
          <div className="grid gap-3">
            {eligibilityRules.map((rule) => (
              <ChecklistItem key={rule}>{rule}</ChecklistItem>
            ))}
          </div>
        </InfoPanel>
        <PaymentPanel reference={reference} />
      </aside>
    </div>
  );
}

function LoginPanel({ onStudent, onAdmin }: { onStudent: () => void; onAdmin: () => void }) {
  const [notice, setNotice] = useState<Notice>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice({ tone: "info", text: "Checking Supabase Auth..." });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signInWithPassword(email, password);

    setIsSubmitting(false);
    setNotice(result.ok ? { tone: "success", text: "Login accepted by Supabase Auth." } : { tone: "error", text: `Login failed: ${result.error}` });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={LockKeyhole} title="Secure login" caption="Use the real account created in Supabase Auth." />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4">
          <Field name="email" label="Email address" placeholder="candidate@example.com" type="email" required />
          <Field name="password" label="Password" placeholder="Password" type="password" required />
          <button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-success px-4 text-sm font-semibold text-[#061426] disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Login securely"}
          </button>
        </div>
      </form>
      <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <h3 className="font-semibold">Protected workspaces</h3>
        <div className="mt-4 grid gap-3">
          <button onClick={onStudent} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Student dashboard <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onAdmin} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Admin dashboard <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="grid gap-6">
      <DashboardHeader title="Student dashboard" subtitle="Applicant workspace" tone="Awaiting verified account data" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="Application" value="Pending sync" />
        <Stat icon={CreditCard} label="Payment" value="Unverified" />
        <Stat icon={FileCheck2} label="Documents" value="Required" />
        <Stat icon={BadgeCheck} label="Eligibility" value="Under review" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
          <h3 className="font-semibold">Application timeline</h3>
          <div className="mt-4 grid gap-3">
            {["Account created in Supabase Auth", "Registration form submitted", "Payment proof uploaded", "Finance review completed"].map((item) => (
              <ChecklistItem key={item}>{item}</ChecklistItem>
            ))}
          </div>
        </section>
        <PaymentPanel reference={`${paymentReferencePrefix}-#####`} />
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <DashboardHeader title="Administration dashboard" subtitle="KCS review console" tone="Supabase-backed workflow" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Applications" value="Live data required" />
        <Stat icon={Landmark} label="Verified payments" value="Finance queue" />
        <Stat icon={ShieldCheck} label="Security" value="RLS required" />
        <Stat icon={GraduationCap} label="Eligible pool" value="Review only" />
      </div>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[#081b30] shadow-premium">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <SectionTitle icon={Users} title="Applicant queue" caption="Connect this panel to a protected server-side Supabase query before exposing private records." />
        </div>
        <div className="p-4 text-sm leading-6 text-kcs-muted sm:p-5">
          Administrative data should be loaded through server-side policies, role checks, and private RLS rules. The public publishable key must never receive broad access to private applicant records.
        </div>
      </section>
    </div>
  );
}

function PaymentPanel({ reference }: { reference: string }) {
  return (
    <InfoPanel title="Payment verification" icon={CreditCard}>
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <div key={method.name} className="min-w-0 rounded-md border border-white/10 bg-[#061426] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{method.name}</p>
              <StatusBadge label={method.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-kcs-muted">{method.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-kcs-gold/30 bg-kcs-gold/10 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <ReceiptText className="h-5 w-5 shrink-0 text-kcs-goldLight" />
          <p className="min-w-0 break-words font-semibold">Manual reference: {reference}</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field name="transaction_id" label="Transaction ID" placeholder="Operator reference" />
          <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#061426] px-3 text-sm font-semibold hover:bg-white/[0.06]" type="button">
            <Upload className="h-4 w-4" />
            Upload proof
          </button>
        </div>
      </div>
    </InfoPanel>
  );
}

function DashboardHeader({ title, subtitle, tone }: { title: string; subtitle: string; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-1 break-words text-sm text-kcs-muted">{subtitle}</p>
        </div>
        <StatusBadge label={tone} />
      </div>
    </div>
  );
}

function InfoPanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
      <SectionTitle icon={Icon} title={title} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionTitle({ icon: Icon, title, caption }: { icon: LucideIcon; title: string; caption?: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-[#061426] text-kcs-goldLight">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2 className="break-words text-lg font-semibold">{title}</h2>
        {caption ? <p className="mt-1 text-sm leading-6 text-kcs-muted">{caption}</p> : null}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium">
      <Icon className="h-5 w-5 text-kcs-goldLight" />
      <p className="mt-3 text-sm text-kcs-muted">{label}</p>
      <p className="mt-1 break-words text-2xl font-semibold">{value}</p>
    </article>
  );
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3 text-sm leading-6 text-kcs-muted">
      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-kcs-success" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function Field({ label, name, placeholder, type = "text", required = false }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
      />
    </label>
  );
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 shrink-0 rounded-md px-3 text-sm font-medium ${active ? "bg-kcs-gold text-[#08111f]" : "text-kcs-muted hover:bg-white/[0.06] hover:text-white"}`}
    >
      {label}
    </button>
  );
}

function ActionButton({ label, icon: Icon, active, onClick }: { label: string; icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold ${active ? "border-kcs-gold bg-kcs-gold text-[#08111f]" : "border-white/10 bg-[#061426] text-kcs-muted hover:bg-white/[0.06] hover:text-white"}`}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-kcs-muted">
      <span className="truncate">{label}</span>
    </span>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] p-3">
      <p className="text-sm font-medium">{label}</p>
      <StatusBadge label={value} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase text-kcs-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold">{value}</p>
    </div>
  );
}

function NoticeBox({ notice }: { notice: NonNullable<Notice> }) {
  const toneClass = {
    success: "border-kcs-success/40 bg-kcs-success/10 text-kcs-success",
    error: "border-kcs-danger/40 bg-kcs-danger/10 text-[#ffb2ad]",
    info: "border-kcs-cyan/40 bg-kcs-cyan/10 text-kcs-cyan"
  }[notice.tone];

  return <div className={`mt-5 rounded-md border px-3 py-2 text-sm ${toneClass}`}>{notice.text}</div>;
}
