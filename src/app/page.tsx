"use client";

import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Eye,
  EyeOff,
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
import { FormEvent, useEffect, useState } from "react";
import { KcsBrand } from "@/components/branding/kcs-brand";
import { insertApplication, isSupabaseConfigured, signInWithPassword } from "@/lib/supabase-rest";

const paymentReferencePrefix = "KCS-2026";

const eligibilityRules = [
  "Le candidat doit être un ancien élève de KCS ou être approuvé par une école partenaire.",
  "Le candidat doit présenter une pièce d'identité valide et des informations civiles exactes.",
  "Le candidat doit fournir son parcours scolaire, les contacts du responsable et un numéro joignable.",
  "Les frais de dossier sont validés uniquement après rapprochement de la preuve de paiement par la finance.",
  "L'éligibilité finale est confirmée par l'administration après vérification des documents."
];

const paymentMethods = [
  { name: "M-Pesa", status: "Prêt à connecter", detail: "Les identifiants marchands et un webhook signé sont requis avant l'encaissement réel." },
  { name: "Airtel Money", status: "Prêt à connecter", detail: "Utiliser l'API marchande officielle ou un agrégateur certifié." },
  { name: "Orange Money", status: "Prêt à connecter", detail: "Nécessite un compte marchand, un secret de rappel et des exports de rapprochement." },
  { name: "Vérification manuelle", status: "Disponible", detail: "Référence de transaction, preuve de paiement, revue finance et journal d'audit." }
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
            <NavButton label="Postuler" active={view === "register"} onClick={() => setView("register")} />
            <NavButton label="Connexion" active={view === "login"} onClick={() => setView("login")} />
            <NavButton label="Étudiant" active={view === "student"} onClick={() => setView("student")} />
            <NavButton label="Administration" active={view === "admin"} onClick={() => setView("admin")} />
          </nav>
        </div>
      </header>

      <section className="border-b border-white/10 bg-[#061426]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:px-8">
          <div className="min-w-0 pt-2">
            <p className="text-sm font-semibold text-kcs-goldLight">Programme officiel d'opportunité</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              Soumettre et suivre un dossier de candidature réel.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-kcs-muted">
              Les candidats peuvent créer un dossier, renseigner leur identité et leur parcours scolaire, joindre une preuve de paiement et attendre une revue administrative contrôlée.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Base de données" value={isSupabaseConfigured ? "Connectée" : "Non configurée"} />
              <Metric label="Format référence" value={`${paymentReferencePrefix}-#####`} />
              <Metric label="Mode d'accès" value="Production" />
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <ActionButton active={view === "register"} label="Créer un dossier" icon={UserPlus} onClick={() => setView("register")} />
              <ActionButton active={view === "login"} label="Connexion sécurisée" icon={LockKeyhole} onClick={() => setView("login")} />
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-base font-semibold">État du système</h2>
              <div className="mt-4 grid gap-3">
                <StatusRow label="Supabase REST" value={isSupabaseConfigured ? "Configuré" : "Variables manquantes"} />
                <StatusRow label="Dépôt des candidatures" value="Formulaire actif" />
                <StatusRow label="Administration" value="Traitement protégé" />
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
  const [reference, setReference] = useState(`${paymentReferencePrefix}-00000`);

  useEffect(() => {
    setReference(`${paymentReferencePrefix}-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice({ tone: "info", text: "Envoi du dossier en cours..." });

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    const result = await insertApplication({ ...payload, payment_reference: reference, status: "submitted" });

    setIsSubmitting(false);
    setNotice(
      result.ok
        ? { tone: "success", text: `Candidature envoyée. Référence : ${reference}` }
        : { tone: "error", text: `Supabase a refusé l'envoi : ${result.error}` }
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit} className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={UserPlus} title="Nouvelle candidature" caption="Utiliser les noms légaux exactement comme ils apparaissent sur les documents officiels." />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field name="first_name" label="Prénom" placeholder="Grace" required />
          <Field name="last_name" label="Nom" placeholder="Mbuyi" required />
          <Field name="date_of_birth" label="Date de naissance" type="date" required />
          <Field name="country_of_birth" label="Pays de naissance" placeholder="RD Congo" required />
          <Field name="email" label="Adresse e-mail" type="email" placeholder="candidat@example.com" required />
          <Field name="phone" label="Numéro de téléphone" placeholder="+243..." required />
          <Field name="education_level" label="Niveau d'études" placeholder="Diplôme d'État" required />
          <Field name="identity_number" label="Numéro passeport ou carte d'identité" placeholder="Référence du document" required />
          <Field name="guardian_name" label="Nom complet du responsable" placeholder="Parent ou responsable" />
          <Field name="guardian_phone" label="Téléphone du responsable" placeholder="+243..." />
          <label className="min-w-0 sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Adresse de résidence</span>
            <textarea name="residential_address" required className="min-h-[96px] w-full rounded-md border border-white/10 bg-[#061426] px-3 py-2 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20" placeholder="Ville, commune, avenue, numéro" />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-kcs-muted">Référence de paiement générée : {reference}</p>
          <button disabled={isSubmitting} className="flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-gold px-5 text-sm font-bold text-[#08111f] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Envoi..." : "Soumettre la candidature"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <aside className="grid min-w-0 gap-4 content-start">
        <InfoPanel title="Éligibilité" icon={BadgeCheck}>
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice({ tone: "info", text: "Vérification auprès de Supabase Auth..." });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signInWithPassword(email, password);

    setIsSubmitting(false);
    setNotice(result.ok ? { tone: "success", text: "Connexion acceptée par Supabase Auth." } : { tone: "error", text: `Connexion refusée : ${result.error}` });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={LockKeyhole} title="Connexion sécurisée" caption="Utiliser le compte réel créé dans Supabase Auth." />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4">
          <Field name="email" label="Adresse e-mail" placeholder="candidat@example.com" type="email" required />
          <PasswordField isVisible={isPasswordVisible} onToggle={() => setIsPasswordVisible((value) => !value)} />
          <button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-success px-4 text-sm font-semibold text-[#061426] disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
      <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <h3 className="font-semibold">Espaces protégés</h3>
        <div className="mt-4 grid gap-3">
          <button onClick={onStudent} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Espace étudiant <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onAdmin} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Espace administration <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="grid gap-6">
      <DashboardHeader title="Espace étudiant" subtitle="Suivi du dossier candidat" tone="En attente des données vérifiées" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="Candidature" value="Synchronisation requise" />
        <Stat icon={CreditCard} label="Paiement" value="Non vérifié" />
        <Stat icon={FileCheck2} label="Documents" value="Requis" />
        <Stat icon={BadgeCheck} label="Éligibilité" value="En revue" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
          <h3 className="font-semibold">Étapes du dossier</h3>
          <div className="mt-4 grid gap-3">
            {["Compte créé dans Supabase Auth", "Formulaire de candidature envoyé", "Preuve de paiement ajoutée", "Revue finance terminée"].map((item) => (
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
      <DashboardHeader title="Espace administration" subtitle="Console de revue KCS" tone="Traitement connecté à Supabase" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Candidatures" value="Données réelles requises" />
        <Stat icon={Landmark} label="Paiements vérifiés" value="File finance" />
        <Stat icon={ShieldCheck} label="Sécurité" value="RLS requis" />
        <Stat icon={GraduationCap} label="Candidats éligibles" value="Revue uniquement" />
      </div>
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[#081b30] shadow-premium">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <SectionTitle icon={Users} title="File des candidatures" caption="Connecter ce panneau à une requête Supabase serveur protégée avant d'exposer les dossiers privés." />
        </div>
        <div className="p-4 text-sm leading-6 text-kcs-muted sm:p-5">
          Les données administratives doivent être chargées avec des politiques côté serveur, des contrôles de rôle et des règles RLS privées. La clé publique ne doit jamais recevoir un accès large aux dossiers privés des candidats.
        </div>
      </section>
    </div>
  );
}

function PaymentPanel({ reference }: { reference: string }) {
  return (
    <InfoPanel title="Vérification du paiement" icon={CreditCard}>
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
          <p className="min-w-0 break-words font-semibold">Référence manuelle : {reference}</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field name="transaction_id" label="ID de transaction" placeholder="Référence de l'opérateur" />
          <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#061426] px-3 text-sm font-semibold hover:bg-white/[0.06]" type="button">
            <Upload className="h-4 w-4" />
            Ajouter une preuve
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

function PasswordField({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) {
  const Icon = isVisible ? EyeOff : Eye;
  const label = isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">Mot de passe</span>
      <div className="flex h-10 min-w-0 items-center rounded-md border border-white/10 bg-[#061426] focus-within:border-kcs-gold/70 focus-within:ring-2 focus-within:ring-kcs-gold/20">
        <input
          name="password"
          type={isVisible ? "text" : "password"}
          required
          placeholder="Mot de passe"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          title={label}
          className="grid h-full w-10 shrink-0 place-items-center rounded-r-md text-kcs-muted hover:bg-white/[0.06] hover:text-white"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </label>
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
