"use client";

import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
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
import { useState } from "react";
import { KcsBrand } from "@/components/branding/kcs-brand";

const paymentReference = "KCS-2026-104782";

const eligibilityRules = [
  "Applicant must be a KCS graduate or approved partner-school candidate.",
  "Applicant must have a valid identity document and accurate civil information.",
  "Applicant must provide education history, guardian contacts, and reachable phone numbers.",
  "Application fees are reviewed only after payment evidence is matched by finance.",
  "Final eligibility criteria will be replaced with the official company policy."
];

const paymentMethods = [
  { name: "M-Pesa", status: "API-ready", detail: "Official merchant credentials and signed webhook are required before activation." },
  { name: "Airtel Money", status: "API-ready", detail: "Can be connected through the official merchant API or a certified aggregator." },
  { name: "Orange Money", status: "API-ready", detail: "Requires merchant account, callback secret, and finance reconciliation exports." },
  { name: "Secure manual payment", status: "Available now", detail: "Unique reference, proof upload, double review, and audit trail." }
];

const demoCredentials = [
  { role: "Student", email: "student.demo@kcs.app", password: "Student@2026" },
  { role: "Administrator", email: "admin.demo@kcs.app", password: "Admin@2026" }
];

type View = "register" | "login" | "student" | "admin";

export default function Home() {
  const [view, setView] = useState<View>("register");

  return (
    <main className="min-h-screen bg-[#020814] text-[#f7f9fc]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071426]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <KcsBrand />
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <NavButton label="Login" active={view === "login"} onClick={() => setView("login")} />
            <NavButton label="Student demo" active={view === "student"} onClick={() => setView("student")} />
            <NavButton label="Admin demo" active={view === "admin"} onClick={() => setView("admin")} />
          </nav>
        </div>
      </header>

      <section className="border-b border-white/10 bg-[#061426]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:px-8">
          <div className="min-w-0 pt-2">
            <p className="text-sm font-semibold text-kcs-goldLight">Opportunity Program</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              Apply, verify, and track your DV-style opportunity file.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-kcs-muted">
              Create an applicant account, complete a structured registration form, review provisional eligibility, and submit payment evidence through a controlled verification workflow.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Payment reference" value={paymentReference} />
              <Metric label="Student demo" value="Ready" />
              <Metric label="Admin demo" value="Ready" />
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <ActionButton active={view === "register"} label="Create account" icon={UserPlus} onClick={() => setView("register")} />
              <ActionButton active={view === "login"} label="Login" icon={LockKeyhole} onClick={() => setView("login")} />
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-base font-semibold">Demo access</h2>
              <p className="mt-1 text-sm leading-6 text-kcs-muted">Use these accounts to preview the applicant and administration dashboards.</p>
              <div className="mt-4 grid gap-3">
                {demoCredentials.map((account) => (
                  <div key={account.role} className="min-w-0 rounded-md border border-white/10 bg-[#061426] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{account.role}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-kcs-muted">demo</span>
                    </div>
                    <p className="mt-2 break-all text-sm text-kcs-muted">{account.email}</p>
                    <p className="mt-1 break-all font-mono text-sm">{account.password}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === "register" && <RegistrationPanel />}
        {view === "login" && <LoginPanel onStudent={() => setView("student")} onAdmin={() => setView("admin")} />}
        {view === "student" && <StudentDashboard />}
        {view === "admin" && <AdminDemoDashboard />}
      </section>
    </main>
  );
}

function RegistrationPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={UserPlus} title="New applicant registration" caption="Use legal names exactly as they appear on official documents." />
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
          <label className="min-w-0 sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Residential address</span>
            <textarea className="min-h-[96px] w-full rounded-md border border-white/10 bg-[#061426] px-3 py-2 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20" placeholder="City, commune, avenue, number" />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-kcs-muted">Your application stays pending until payment and document verification are completed.</p>
          <button className="flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-gold px-5 text-sm font-bold text-[#08111f]">
            Apply now
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <aside className="grid min-w-0 gap-4 content-start">
        <InfoPanel title="Eligibility" icon={BadgeCheck}>
          <div className="grid gap-3">
            {eligibilityRules.map((rule) => (
              <ChecklistItem key={rule}>{rule}</ChecklistItem>
            ))}
          </div>
        </InfoPanel>
        <PaymentPanel />
      </aside>
    </div>
  );
}

function LoginPanel({ onStudent, onAdmin }: { onStudent: () => void; onAdmin: () => void }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
      <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={LockKeyhole} title="Secure login" caption="Preview the dashboards using the demo identities shown above." />
        <div className="mt-6 grid gap-4">
          <Field label="Email address" placeholder="student.demo@kcs.app" type="email" />
          <Field label="Password" placeholder="Student@2026" type="password" />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-success px-4 text-sm font-semibold text-[#061426]">
            <LockKeyhole className="h-4 w-4" />
            Login securely
          </button>
        </div>
      </section>
      <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <h3 className="font-semibold">Open a demo dashboard</h3>
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
      <DashboardHeader title="Student dashboard" subtitle="Grace Mbuyi · Application KCS-2026-104782" tone="Payment pending finance review" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="Application" value="Submitted" />
        <Stat icon={CreditCard} label="Payment" value="Pending" />
        <Stat icon={FileCheck2} label="Documents" value="3 / 4" />
        <Stat icon={BadgeCheck} label="Eligibility" value="Provisional" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
          <h3 className="font-semibold">Application timeline</h3>
          <div className="mt-4 grid gap-3">
            {["Account created", "Registration form submitted", "Payment proof uploaded", "Finance review in progress"].map((item) => (
              <ChecklistItem key={item}>{item}</ChecklistItem>
            ))}
          </div>
        </section>
        <PaymentPanel />
      </div>
    </div>
  );
}

function AdminDemoDashboard() {
  return (
    <div className="grid gap-6">
      <DashboardHeader title="Administration dashboard" subtitle="KCS review console · Demo administrator" tone="admin.demo@kcs.app" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Applications" value="24,589" />
        <Stat icon={Landmark} label="Verified payments" value="18,440" />
        <Stat icon={AlertTriangle} label="Needs review" value="642" />
        <Stat icon={GraduationCap} label="Eligible pool" value="8,420" />
      </div>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[#081b30] shadow-premium">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <SectionTitle icon={BarChart3} title="Recent applicant queue" caption="Finance and document controls use server-side verification in production." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="bg-[#061426] text-left text-kcs-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {["Grace Mbuyi", "Daniel Kanku", "Sarah Ilunga"].map((name, index) => (
                <tr key={name} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{name}</td>
                  <td className="px-4 py-3 font-mono text-kcs-muted">KCS-2026-10478{index + 2}</td>
                  <td className="px-4 py-3"><StatusBadge label={index === 0 ? "Pending finance" : "Needs correction"} /></td>
                  <td className="px-4 py-3"><button className="rounded-md border border-white/10 px-3 py-1.5 font-semibold hover:bg-white/[0.06]">Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PaymentPanel() {
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
          <p className="min-w-0 break-words font-semibold">Manual reference: {paymentReference}</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Transaction ID" placeholder="Operator reference" />
          <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#061426] px-3 text-sm font-semibold hover:bg-white/[0.06]">
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

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        type={type}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase text-kcs-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold">{value}</p>
    </div>
  );
}
