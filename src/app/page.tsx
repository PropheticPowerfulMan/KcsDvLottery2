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
  MapPinned,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  type LucideIcon
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FormEvent, useEffect, useState } from "react";
import { KcsBrand } from "@/components/branding/kcs-brand";
import { deleteApplication, getAdminApplicationMetrics, getOwnApplications, insertApplication, isSupabaseConfigured, signInWithPassword, signUpWithPassword, updateApplicationDecision, uploadPaymentProof } from "@/lib/supabase-rest";

const paymentReferencePrefix = "KCS-2026";

const eligibilityRules = [
  "Le candidat doit être un ancien élève de KCS ou être approuvé par une école partenaire.",
  "Le candidat doit présenter une pièce d'identité valide et des informations civiles exactes.",
  "Le candidat doit fournir son parcours scolaire, les contacts du responsable et un numéro joignable.",
  "Les frais de dossier sont validés uniquement après rapprochement de la preuve de paiement par la finance.",
  "L'éligibilité finale est confirmée par l'administration après vérification des documents."
];

const paymentMethods = [
  { name: "M-Pesa", status: "Vérification manuelle", detail: "Le candidat paie depuis son téléphone, saisit l'ID de transaction et ajoute la capture ou le reçu." },
  { name: "Airtel Money", status: "Vérification manuelle", detail: "La finance compare l'ID de transaction avec le relevé du compte marchand." },
  { name: "Orange Money", status: "Vérification manuelle", detail: "La preuve est conservée dans Supabase Storage avant validation administrative." },
  { name: "Autre dépôt mobile", status: "Disponible", detail: "Utiliser uniquement si le reçu contient un numéro de transaction vérifiable." }
];

const birthYears = Array.from({ length: 90 }, (_, index) => String(new Date().getFullYear() - 10 - index));
const birthMonths = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" }
];

const rdcProvinces = [
  "Bas-Uele",
  "Équateur",
  "Haut-Katanga",
  "Haut-Lomami",
  "Haut-Uele",
  "Ituri",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Lomami",
  "Lualaba",
  "Mai-Ndombe",
  "Maniema",
  "Mongala",
  "Nord-Kivu",
  "Nord-Ubangi",
  "Sankuru",
  "Sud-Kivu",
  "Sud-Ubangi",
  "Tanganyika",
  "Tshopo",
  "Tshuapa"
];

const chartColors = ["#f2c94c", "#31d0aa", "#38bdf8", "#fb7185", "#a78bfa", "#f97316", "#22c55e", "#e879f9"];

type View = "register" | "login" | "student" | "admin";
type Notice = { tone: "success" | "error" | "info"; text: string } | null;
type DialogState = { tone: "success" | "error" | "info"; title: string; message: string } | null;
type StudentSession = { accessToken: string; email: string } | null;
type AdminSession = { accessToken: string; email: string } | null;
type LoginTarget = "student" | "admin";
type AdminTab = "resume" | "recherche" | "graphiques" | "candidatures" | "controle";
type AdminMetric = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  country_of_birth?: string;
  education_level?: string;
  identity_number?: string;
  guardian_name?: string;
  guardian_phone?: string;
  province?: string;
  residential_address?: string;
  motivation?: string;
  status: string;
  payment_operator?: string;
  transaction_id?: string;
  payment_proof_path?: string;
  payment_reference?: string;
  result_message?: string;
  admin_message?: string;
  created_at: string;
  updated_at?: string;
};

const demoAdminMetrics: AdminMetric[] = [
  ["Grace", "Mbuyi", "Kinshasa", "approved", "M-Pesa"],
  ["Daniel", "Kabongo", "Haut-Katanga", "under_review", "Airtel Money"],
  ["Sarah", "Ilunga", "Kongo-Central", "payment_under_review", "Orange Money"],
  ["Moise", "Kanku", "Nord-Kivu", "submitted", "M-Pesa"],
  ["Aline", "Bisimwa", "Sud-Kivu", "eligible", "Airtel Money"],
  ["Patrick", "Tshibangu", "Kasaï-Central", "documents_required", "Orange Money"],
  ["Merveille", "Lutete", "Kwilu", "rejected", "M-Pesa"],
  ["Jonathan", "Moke", "Tshopo", "approved", "Airtel Money"],
  ["Rebecca", "Nsimba", "Lualaba", "ineligible", "Orange Money"],
  ["Emmanuel", "Wemba", "Ituri", "submitted", "M-Pesa"]
].map(([firstName, lastName, province, status, operator], index) => ({
  id: `demo-${String(index + 1).padStart(2, "0")}`,
  first_name: firstName,
  last_name: lastName,
  email: `test.${firstName.toLowerCase()}.${lastName.toLowerCase()}@kcs.app`,
  phone: `+2438100000${String(index + 1).padStart(2, "0")}`,
  date_of_birth: `200${index % 5}-0${(index % 8) + 1}-1${index % 9}`,
  country_of_birth: "RD Congo",
  education_level: index % 3 === 0 ? "Diplôme d'État" : "Licence",
  identity_number: `KCS-ID-${String(index + 1).padStart(3, "0")}`,
  guardian_name: "Responsable Test",
  guardian_phone: `+2438200000${String(index + 1).padStart(2, "0")}`,
  province,
  residential_address: `${province}, centre-ville`,
  motivation: "Candidature de démonstration utilisée pour tester les statistiques et la revue administrative.",
  status,
  payment_operator: operator,
  transaction_id: `${operator.slice(0, 2).toUpperCase()}2500${String(index + 1).padStart(2, "0")}`,
  payment_proof_path: index === 3 || index === 5 ? undefined : `demo/${String(index + 1).padStart(2, "0")}.pdf`,
  payment_reference: `KCS-2026-91${String(index + 1).padStart(3, "0")}`,
  result_message: ["approved", "eligible", "rejected", "ineligible"].includes(status) ? "Résultat de démonstration disponible." : undefined,
  created_at: `2026-08-0${Math.min(index + 1, 5)}T${String(8 + index).padStart(2, "0")}:15:00Z`
}));

export default function Home() {
  const [view, setView] = useState<View>("register");
  const [studentSession, setStudentSession] = useState<StudentSession>(null);
  const [adminSession, setAdminSession] = useState<AdminSession>(null);
  const [loginTarget, setLoginTarget] = useState<LoginTarget>("student");

  function openProtectedView(target: LoginTarget) {
    setLoginTarget(target);

    if (target === "student" && studentSession) {
      setView("student");
      return;
    }

    if (target === "admin" && adminSession) {
      setView("admin");
      return;
    }

    setView("login");
  }

  return (
    <main className="min-h-screen bg-[#020814] text-[#f7f9fc]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071426]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <KcsBrand />
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <NavButton label="Postuler" active={view === "register"} onClick={() => setView("register")} />
            <NavButton label="Connexion" active={view === "login"} onClick={() => setView("login")} />
            <NavButton label="Étudiant" active={view === "student"} onClick={() => openProtectedView("student")} />
            <NavButton label="Administration" active={view === "admin"} onClick={() => openProtectedView("admin")} />
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
        {view === "login" && (
          <LoginPanel
            target={loginTarget}
            onStudent={(session) => { setStudentSession(session); setView("student"); }}
            onAdmin={(session) => { setAdminSession(session); setView("admin"); }}
          />
        )}
        {view === "student" && <StudentDashboard session={studentSession} />}
        {view === "admin" && (adminSession ? <AdminDashboard session={adminSession} /> : <LoginRequiredPanel target="admin" onLogin={() => openProtectedView("admin")} />)}
      </section>
    </main>
  );
}

function RegistrationPanel() {
  const [notice, setNotice] = useState<Notice>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState(`${paymentReferencePrefix}-00000`);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    setReference(`${paymentReferencePrefix}-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice({ tone: "info", text: "Création du compte candidat..." });

    const formData = new FormData(event.currentTarget);
    const birthDay = String(formData.get("birth_day") ?? "").padStart(2, "0");
    const birthMonth = String(formData.get("birth_month") ?? "").padStart(2, "0");
    const birthYear = String(formData.get("birth_year") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const firstName = String(formData.get("first_name") ?? "");
    const lastName = String(formData.get("last_name") ?? "");
    const proof = formData.get("payment_proof");
    const proofFile = proof instanceof File && proof.size > 0 ? proof : null;
    const ignoredFields = new Set(["password", "payment_proof", "birth_day", "birth_month", "birth_year"]);
    const payload = Object.fromEntries(Array.from(formData.entries()).filter(([key]) => !ignoredFields.has(key)).map(([key, value]) => [key, String(value)])) as Record<string, string>;
    const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
    const parsedDate = new Date(`${dateOfBirth}T00:00:00`);

    if (
      Number.isNaN(parsedDate.getTime())
      || parsedDate.getFullYear() !== Number(birthYear)
      || parsedDate.getMonth() + 1 !== Number(birthMonth)
      || parsedDate.getDate() !== Number(birthDay)
    ) {
      setIsSubmitting(false);
      setNotice(null);
      setDialog({ tone: "error", title: "Date invalide", message: "La date de naissance choisie n'est pas valide." });
      return;
    }

    const signupResult = await signUpWithPassword(email, password, `${firstName} ${lastName}`.trim());

    const signupError = signupResult.ok ? "" : signupResult.error.toLowerCase();

    if (!signupResult.ok && !signupError.includes("already") && !signupError.includes("existe déjà")) {
      setIsSubmitting(false);
      setNotice(null);
      setDialog({ tone: "error", title: "Compte non créé", message: `Le compte candidat n'a pas pu être créé. ${signupResult.error}` });
      return;
    }

    let paymentProofPath = "";

    if (proofFile) {
      setNotice({ tone: "info", text: "Envoi de la preuve de paiement..." });
      const uploadResult = await uploadPaymentProof(reference, proofFile);

      if (!uploadResult.ok) {
        setIsSubmitting(false);
        setNotice(null);
        setDialog({ tone: "error", title: "Preuve non envoyée", message: `La preuve de paiement n'a pas pu être envoyée. ${uploadResult.error}` });
        return;
      }

      paymentProofPath = uploadResult.data.path;
    }

    setNotice({ tone: "info", text: "Envoi du dossier en cours..." });
    const applicationPayload = {
      ...payload,
      date_of_birth: dateOfBirth,
      payment_reference: reference,
      status: "submitted"
    };
    const result = await insertApplication(paymentProofPath ? { ...applicationPayload, payment_proof_path: paymentProofPath } : applicationPayload);

    setIsSubmitting(false);
    if (result.ok) {
      setNotice(null);
      setDialog({ tone: "success", title: "Candidature déposée", message: `Votre compte candidat et votre dossier ont été créés avec succès. Référence de paiement : ${reference}` });
      event.currentTarget.reset();
      setReference(`${paymentReferencePrefix}-${Math.floor(10000 + Math.random() * 90000)}`);
      return;
    }

    setNotice(null);
    setDialog({ tone: "error", title: "Candidature refusée", message: `Supabase a refusé l'envoi. ${result.error}` });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form id="application-form" onSubmit={handleSubmit} className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={UserPlus} title="Nouvelle candidature" caption="Utiliser les noms légaux exactement comme ils apparaissent sur les documents officiels." />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field name="first_name" label="Prénom" required autoComplete="off" />
          <Field name="last_name" label="Nom" required autoComplete="off" />
          <BirthDateFields />
          <Field name="country_of_birth" label="Pays de naissance" required autoComplete="off" />
          <Field name="email" label="Adresse e-mail" type="email" required autoComplete="off" />
          <PasswordField
            label="Mot de passe du compte"
            autoComplete="new-password"
            isVisible={isPasswordVisible}
            onToggle={() => setIsPasswordVisible((value) => !value)}
          />
          <Field name="phone" label="Numéro de téléphone" required autoComplete="off" />
          <Field name="education_level" label="Niveau d'études" required autoComplete="off" />
          <Field name="identity_number" label="Numéro passeport ou carte d'identité" required autoComplete="off" />
          <Field name="guardian_name" label="Nom complet du responsable" autoComplete="off" />
          <Field name="guardian_phone" label="Téléphone du responsable" autoComplete="off" />
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-medium">Province de résidence</span>
            <select
              name="province"
              required
              defaultValue=""
              className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
            >
              <option value="" disabled>Choisir la province</option>
              {rdcProvinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-medium">Adresse de résidence</span>
            <input name="residential_address" required autoComplete="off" className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20" />
          </label>
          <label className="min-w-0 sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Motivation</span>
            <textarea name="motivation" required className="min-h-[88px] w-full rounded-md border border-white/10 bg-[#061426] px-3 py-2 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20" placeholder="Expliquez brièvement la raison de votre candidature" />
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
      {dialog ? <FeedbackDialog dialog={dialog} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function LoginPanel({ target, onStudent, onAdmin }: { target: LoginTarget; onStudent: (session: { accessToken: string; email: string }) => void; onAdmin: (session: { accessToken: string; email: string }) => void }) {
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
    if (!result.ok) {
      setNotice({ tone: "error", text: `Connexion refusée : ${result.error}` });
      return;
    }

    const session = result.data as { access_token?: string; user?: { email?: string; user_metadata?: { role?: string } } };
    setNotice({ tone: "success", text: "Connexion acceptée par Supabase Auth." });

    if (session.access_token) {
      const authenticatedSession = { accessToken: session.access_token, email: session.user?.email ?? email };
      const role = session.user?.user_metadata?.role;

      if (role === "admin") {
        onAdmin(authenticatedSession);
        return;
      }

      if (target === "admin") {
        setNotice({ tone: "error", text: "Ce compte n'a pas le rôle administrateur." });
        return;
      }

      onStudent(authenticatedSession);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <SectionTitle icon={LockKeyhole} title="Connexion sécurisée" caption={target === "admin" ? "Connectez-vous avec un compte administrateur Supabase." : "Connectez-vous avec le compte candidat créé lors de la candidature."} />
        {notice ? <NoticeBox notice={notice} /> : null}
        <div className="mt-6 grid gap-4">
          <Field name="email" label="Adresse e-mail" placeholder="candidat@example.com" type="email" required />
          <PasswordField autoComplete="current-password" isVisible={isPasswordVisible} onToggle={() => setIsPasswordVisible((value) => !value)} />
          <button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-kcs-success px-4 text-sm font-semibold text-[#061426] disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
      <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
        <h3 className="font-semibold">Espaces protégés</h3>
        <div className="mt-4 grid gap-3">
          <button type="button" onClick={() => setNotice({ tone: "info", text: "Connectez-vous avec l'adresse e-mail et le mot de passe du candidat pour ouvrir l'espace étudiant." })} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Espace étudiant <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setNotice({ tone: "info", text: "Connectez-vous avec un compte administrateur. L'accès direct sans identifiants est désactivé." })} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-[#061426] px-4 text-left text-sm font-semibold hover:bg-white/[0.06]">
            Espace administration <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function StudentDashboard({ session }: { session: StudentSession }) {
  const [notice, setNotice] = useState<Notice>(session ? { tone: "info", text: "Chargement du dossier candidat..." } : null);
  const [applications, setApplications] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    if (!session) {
      return;
    }

    getOwnApplications(session.accessToken).then((result) => {
      if (!result.ok) {
        setNotice({ tone: "error", text: `Impossible de charger le dossier : ${result.error}` });
        return;
      }

      const rows = Array.isArray(result.data) ? (result.data as Record<string, string>[]) : [];
      setApplications(rows);
      setNotice(rows.length ? null : { tone: "info", text: "Aucun dossier n'est encore lié à ce compte." });
    });
  }, [session]);

  const latestApplication = applications[0];
  const resultMessage = latestApplication?.result_message || latestApplication?.admin_message || "Le résultat sera affiché ici dès que l'administration aura terminé la revue.";
  const progress = getStudentProgress(latestApplication?.status);

  return (
    <div className="grid gap-6">
      <DashboardHeader title="Espace étudiant" subtitle="Suivi du dossier candidat" tone="En attente des données vérifiées" />
      {notice ? <NoticeBox notice={notice} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardCheck} label="Candidature" value={latestApplication?.status || "Connexion requise"} />
        <Stat icon={CreditCard} label="Paiement" value={latestApplication?.transaction_id ? "Transaction reçue" : "Non vérifié"} />
        <Stat icon={FileCheck2} label="Documents" value="Requis" />
        <Stat icon={BadgeCheck} label="Éligibilité" value="En revue" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">Avancement du dossier</h3>
              <p className="mt-1 text-sm text-kcs-muted">{latestApplication?.payment_reference || "Connectez-vous pour voir votre référence."}</p>
            </div>
            <StatusBadge label={latestApplication ? formatStatus(latestApplication.status) : "Connexion requise"} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-kcs-muted">Progression</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-kcs-success" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniInfo label="Province" value={latestApplication?.province || "À compléter"} />
            <MiniInfo label="Paiement mobile" value={latestApplication?.payment_operator || "En attente"} />
            <MiniInfo label="ID transaction" value={latestApplication?.transaction_id || "Non reçu"} />
            <MiniInfo label="Preuve" value={latestApplication?.payment_proof_path ? "Ajoutée" : "Non ajoutée"} />
          </div>
          <div className="mt-5 rounded-md border border-kcs-gold/25 bg-kcs-gold/10 p-4">
            <h3 className="font-semibold text-white">Message du résultat</h3>
            <p className="mt-2 text-sm leading-6 text-kcs-muted">{resultMessage}</p>
          </div>
        </section>
        <PaymentPanel reference={latestApplication?.payment_reference || `${paymentReferencePrefix}-#####`} />
      </div>
    </div>
  );
}

function LoginRequiredPanel({ target, onLogin }: { target: LoginTarget; onLogin: () => void }) {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-white/10 bg-[#081b30] p-5 text-center shadow-premium">
      <LockKeyhole className="mx-auto h-8 w-8 text-kcs-goldLight" />
      <h2 className="mt-4 text-xl font-semibold">Connexion requise</h2>
      <p className="mt-2 text-sm leading-6 text-kcs-muted">
        {target === "admin" ? "L'espace administration est réservé aux comptes administrateurs." : "L'espace étudiant est réservé aux candidats connectés."}
      </p>
      <button type="button" onClick={onLogin} className="mt-5 h-10 rounded-md bg-kcs-gold px-4 text-sm font-bold text-[#08111f]">
        Se connecter
      </button>
    </section>
  );
}

function AdminDashboard({ session }: { session: NonNullable<AdminSession> }) {
  const [notice, setNotice] = useState<Notice>({ tone: "info", text: "Chargement des statistiques Supabase..." });
  const [metrics, setMetrics] = useState<AdminMetric[]>(demoAdminMetrics);
  const [source, setSource] = useState("Données de démonstration");
  const [selectedApplication, setSelectedApplication] = useState<AdminMetric | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("resume");
  const [isMutating, setIsMutating] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    province: "",
    payment: "",
    status: "",
    proof: "",
    decision: "",
    sort: "recent"
  });

  useEffect(() => {
    getAdminApplicationMetrics(session.accessToken).then((result) => {
      if (!result.ok) {
        setNotice({ tone: "info", text: "La vue Supabase des statistiques n'est pas encore disponible. Le dashboard affiche les 10 candidatures de test." });
        return;
      }

      const rows = Array.isArray(result.data) ? (result.data as AdminMetric[]) : [];

      if (!rows.length) {
        setNotice({ tone: "info", text: "Aucune candidature Supabase trouvée. Le dashboard affiche les 10 candidatures de test." });
        return;
      }

      setMetrics(rows);
      setSource("Supabase en direct");
      setNotice(null);
    });
  }, [session.accessToken]);

  const filteredMetrics = filterAdminMetrics(metrics, filters);
  const stats = buildAdminStats(filteredMetrics);
  const provinceOptions = uniqueValues(metrics.map((row) => row.province));
  const paymentOptions = uniqueValues(metrics.map((row) => row.payment_operator));
  const statusOptions = uniqueValues(metrics.map((row) => row.status));

  async function refreshMetrics() {
    const result = await getAdminApplicationMetrics(session.accessToken);

    if (!result.ok) {
      setNotice({ tone: "error", text: `Actualisation impossible : ${result.error}` });
      return;
    }

    const rows = Array.isArray(result.data) ? (result.data as AdminMetric[]) : [];
    setMetrics(rows.length ? rows : demoAdminMetrics);
    setSource(rows.length ? "Supabase en direct" : "Données de démonstration");
  }

  async function handleDecision(application: AdminMetric, status: "approved" | "rejected") {
    const label = status === "approved" ? "approuvée" : "refusée";
    setIsMutating(true);
    const result = await updateApplicationDecision(
      application.id,
      session.accessToken,
      status,
      status === "approved" ? "Votre candidature a été approuvée par l'administration." : "Votre candidature a été refusée après vérification administrative."
    );
    setIsMutating(false);

    if (!result.ok) {
      setNotice({ tone: "error", text: `Action impossible : ${result.error}` });
      return;
    }

    setNotice({ tone: "success", text: `Candidature ${label}.` });
    setSelectedApplication(null);
    await refreshMetrics();
  }

  async function handleDelete(application: AdminMetric) {
    const confirmed = window.confirm(`Supprimer définitivement la candidature de ${application.first_name ?? "ce candidat"} ${application.last_name ?? ""} ?`);

    if (!confirmed) {
      return;
    }

    setIsMutating(true);
    const result = await deleteApplication(application.id, session.accessToken);
    setIsMutating(false);

    if (!result.ok) {
      setNotice({ tone: "error", text: `Suppression impossible : ${result.error}` });
      return;
    }

    setNotice({ tone: "success", text: "Candidature supprimée de la base." });
    setSelectedApplication(null);
    await refreshMetrics();
  }

  return (
    <div className="grid gap-6">
      <DashboardHeader title="Espace administration" subtitle="Pilotage statistique des candidatures KCS" tone={source} />
      {notice ? <NoticeBox notice={notice} /> : null}
      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "resume" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Users} label="Candidatures" value={String(stats.total)} />
            <Stat icon={Landmark} label="Paiements tracés" value={`${stats.paymentRate}%`} />
            <Stat icon={MapPinned} label="Provinces actives" value={String(stats.provinceCount)} />
            <Stat icon={TrendingUp} label="Taux d'acceptation" value={`${stats.approvalRate}%`} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat icon={FileCheck2} label="Complétude moyenne" value={`${stats.completionRate}%`} />
            <Stat icon={ShieldCheck} label="Indice de concentration" value={stats.concentrationIndex.toFixed(2)} />
            <Stat icon={ClipboardCheck} label="Dossiers en attente" value={`${stats.pendingRate}%`} />
            <Stat icon={CreditCard} label="Preuves jointes" value={`${stats.proofRate}%`} />
          </div>
          <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
            <SectionTitle icon={TrendingUp} title="Lecture scientifique" caption="Synthèse statistique du comportement du système." />
            <div className="mt-5 grid gap-3 text-sm leading-6 text-kcs-muted">
              <p>La province dominante représente <strong className="text-white">{stats.topProvinceShare}%</strong> du volume total.</p>
              <p>L'indice de concentration est <strong className="text-white">{stats.concentrationIndex.toFixed(2)}</strong>. Plus il est proche de 1, plus les candidatures sont réparties sur plusieurs provinces.</p>
              <p>Le ratio dossiers complets mesure la présence d'une transaction, d'une province, d'une motivation et d'un statut exploitable.</p>
            </div>
            <div className="mt-5 grid gap-3">
              <ProgressRow label="Dossiers complets" value={stats.completionRate} />
              <ProgressRow label="Paiements traçables" value={stats.paymentRate} />
              <ProgressRow label="Décisions communiquées" value={stats.resultRate} />
            </div>
          </section>
        </>
      ) : null}
      {activeTab === "recherche" ? (
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
        <SectionTitle icon={ClipboardCheck} title="Recherche minutieuse" caption="Filtrer les candidatures et recalculer automatiquement tous les indicateurs." />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="min-w-0 xl:col-span-2">
            <span className="mb-2 block text-sm font-medium">Recherche globale</span>
            <input
              value={filters.query}
              onChange={(event) => setFilters((value) => ({ ...value, query: event.target.value }))}
              placeholder="Nom, e-mail, téléphone, référence, ID transaction..."
              className="h-10 w-full rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
            />
          </label>
          <FilterSelect label="Province" value={filters.province} options={provinceOptions} onChange={(province) => setFilters((value) => ({ ...value, province }))} />
          <FilterSelect label="Paiement" value={filters.payment} options={paymentOptions} onChange={(payment) => setFilters((value) => ({ ...value, payment }))} />
          <FilterSelect label="Statut" value={filters.status} options={statusOptions} formatter={formatStatus} onChange={(status) => setFilters((value) => ({ ...value, status }))} />
          <FilterSelect label="Preuve" value={filters.proof} options={["avec_preuve", "sans_preuve"]} formatter={(value) => value === "avec_preuve" ? "Avec preuve" : "Sans preuve"} onChange={(proof) => setFilters((value) => ({ ...value, proof }))} />
          <FilterSelect label="Décision" value={filters.decision} options={["decide", "non_decide"]} formatter={(value) => value === "decide" ? "Résultat communiqué" : "Sans résultat"} onChange={(decision) => setFilters((value) => ({ ...value, decision }))} />
          <FilterSelect label="Tri" value={filters.sort} options={["recent", "ancien", "province", "statut"]} formatter={(value) => ({ recent: "Plus récents", ancien: "Plus anciens", province: "Province", statut: "Statut" }[value] ?? value)} onChange={(sort) => setFilters((value) => ({ ...value, sort }))} allowEmpty={false} />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-kcs-muted">{filteredMetrics.length} candidature(s) trouvée(s) sur {metrics.length}.</p>
          <button type="button" onClick={() => setFilters({ query: "", province: "", payment: "", status: "", proof: "", decision: "", sort: "recent" })} className="h-10 rounded-md border border-white/10 px-4 text-sm font-semibold text-kcs-muted hover:bg-white/[0.06] hover:text-white">
            Réinitialiser
          </button>
        </div>
      </section>
      ) : null}
      {activeTab === "graphiques" ? (
        <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ChartPanel title="Candidatures par province" subtitle="Répartition territoriale RDC">
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={stats.byProvince}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9aa8bd", fontSize: 11 }} interval={0} angle={-28} textAnchor="end" height={86} />
              <YAxis tick={{ fill: "#9aa8bd", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#081b30", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#f2c94c" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Statuts des dossiers" subtitle="Pipeline administratif">
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie data={stats.byStatus} dataKey="total" nameKey="name" innerRadius={64} outerRadius={108} paddingAngle={3}>
                {stats.byStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#081b30", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <LegendList rows={stats.byStatus} />
        </ChartPanel>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Évolution quotidienne" subtitle="Volume de dépôts par jour">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.byDay}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9aa8bd", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9aa8bd", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#081b30", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Area type="monotone" dataKey="total" stroke="#31d0aa" fill="#31d0aa" fillOpacity={0.18} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Paiements mobiles" subtitle="Réseaux et preuves reçues">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.byPaymentOperator}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9aa8bd", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9aa8bd", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#081b30", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Bar dataKey="total" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartPanel title="Rendement par province" subtitle="Taux d'acceptation local par volume">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.provincePerformance}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9aa8bd", fontSize: 11 }} interval={0} angle={-24} textAnchor="end" height={76} />
              <YAxis tick={{ fill: "#9aa8bd", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#081b30", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
              <Bar dataKey="taux" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
        </>
      ) : null}
      {activeTab === "controle" ? (
      <div className="grid gap-6">
        <section className="rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
          <SectionTitle icon={ShieldCheck} title="Indicateurs de contrôle" caption="Qualité des dossiers et travail restant." />
          <div className="mt-5 grid gap-3">
            <ProgressRow label="Preuves de paiement reçues" value={stats.proofRate} />
            <ProgressRow label="Résultats déjà communiqués" value={stats.resultRate} />
            <ProgressRow label="Dossiers encore à traiter" value={stats.pendingRate} />
          </div>
        </section>
      </div>
      ) : null}
      {activeTab === "candidatures" ? (
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#081b30] shadow-premium">
          <div className="border-b border-white/10 p-4 sm:p-5">
            <SectionTitle icon={Users} title="Candidatures récentes" caption="Vue de pilotage, sans exposer les mots de passe." />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-kcs-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidat</th>
                  <th className="px-4 py-3 font-medium">Province</th>
                  <th className="px-4 py-3 font-medium">Paiement</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedApplication(row)} className="cursor-pointer border-t border-white/10 hover:bg-white/[0.04]">
                    <td className="px-4 py-3 font-medium">{`${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Candidat"}</td>
                    <td className="px-4 py-3 text-kcs-muted">{row.province || "Non renseignée"}</td>
                    <td className="px-4 py-3 text-kcs-muted">{row.payment_operator || "Non renseigné"}</td>
                    <td className="px-4 py-3"><StatusBadge label={formatStatus(row.status)} /></td>
                  </tr>
                ))}
                {!filteredMetrics.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-kcs-muted">Aucune candidature ne correspond aux critères.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {selectedApplication ? (
        <ApplicationDetailDialog
          application={selectedApplication}
          isMutating={isMutating}
          onApprove={() => handleDecision(selectedApplication, "approved")}
          onReject={() => handleDecision(selectedApplication, "rejected")}
          onDelete={() => handleDelete(selectedApplication)}
          onClose={() => setSelectedApplication(null)}
        />
      ) : null}
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
        <p className="mt-2 text-sm leading-6 text-kcs-muted">
          Payez avec le réseau choisi, gardez le reçu, puis indiquez l'ID de transaction et ajoutez la preuve. La finance validera le paiement avant la revue finale.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-medium">Réseau mobile</span>
            <select
              form="application-form"
              name="payment_operator"
              required
              defaultValue=""
              className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
            >
              <option value="" disabled>Choisir</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Autre">Autre</option>
            </select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-medium">ID de transaction</span>
            <input
              form="application-form"
              name="transaction_id"
              required
              placeholder="Référence de l'opérateur"
              className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70 focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
            />
          </label>
          <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-[#061426] px-3 text-sm font-semibold hover:bg-white/[0.06] sm:col-span-2">
            <Upload className="h-4 w-4" />
            Ajouter une preuve facultative
            <input form="application-form" name="payment_proof" type="file" accept="image/*,.pdf" className="sr-only" />
          </label>
        </div>
      </div>
    </InfoPanel>
  );
}

function buildAdminStats(rows: AdminMetric[]) {
  const total = rows.length || 1;
  const paid = rows.filter((row) => Boolean(row.transaction_id)).length;
  const proofs = rows.filter((row) => Boolean(row.payment_proof_path)).length;
  const approved = rows.filter((row) => ["approved", "eligible"].includes(row.status)).length;
  const results = rows.filter((row) => Boolean(row.result_message)).length;
  const pending = rows.filter((row) => ["submitted", "payment_pending", "payment_under_review", "documents_required", "under_review"].includes(row.status)).length;
  const complete = rows.filter((row) => Boolean(row.transaction_id && row.province && row.motivation && row.status)).length;
  const byProvince = groupRows(rows, (row) => row.province || "Non renseignée");
  const topProvinceShare = percentage(byProvince[0]?.total ?? 0, total);
  const concentrationIndex = byProvince.length / Math.max(rows.length, 1);

  return {
    total: rows.length,
    provinceCount: new Set(rows.map((row) => row.province).filter(Boolean)).size,
    paymentRate: percentage(paid, total),
    approvalRate: percentage(approved, total),
    proofRate: percentage(proofs, total),
    resultRate: percentage(results, total),
    pendingRate: percentage(pending, total),
    completionRate: percentage(complete, total),
    topProvinceShare,
    concentrationIndex,
    byProvince: byProvince.slice(0, 12),
    byStatus: groupRows(rows, (row) => formatStatus(row.status)),
    byPaymentOperator: groupRows(rows, (row) => row.payment_operator || "Non renseigné"),
    byDay: groupRows(rows, (row) => new Date(row.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })).reverse(),
    provincePerformance: buildProvincePerformance(rows).slice(0, 12)
  };
}

function filterAdminMetrics(rows: AdminMetric[], filters: { query: string; province: string; payment: string; status: string; proof: string; decision: string; sort: string }) {
  const query = normalizeSearch(filters.query);

  return rows
    .filter((row) => {
      const searchable = normalizeSearch([
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.province,
        row.payment_operator,
        row.transaction_id,
        row.payment_reference,
        row.status,
        row.identity_number
      ].filter(Boolean).join(" "));

      return (
        (!query || searchable.includes(query))
        && (!filters.province || row.province === filters.province)
        && (!filters.payment || row.payment_operator === filters.payment)
        && (!filters.status || row.status === filters.status)
        && (!filters.proof || (filters.proof === "avec_preuve" ? Boolean(row.payment_proof_path) : !row.payment_proof_path))
        && (!filters.decision || (filters.decision === "decide" ? Boolean(row.result_message || row.admin_message) : !row.result_message && !row.admin_message))
      );
    })
    .sort((a, b) => {
      if (filters.sort === "ancien") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      if (filters.sort === "province") {
        return (a.province || "").localeCompare(b.province || "", "fr");
      }

      if (filters.sort === "statut") {
        return formatStatus(a.status).localeCompare(formatStatus(b.status), "fr");
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function uniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "fr"));
}

function buildProvincePerformance(rows: AdminMetric[]) {
  const map = new Map<string, { total: number; accepted: number }>();

  rows.forEach((row) => {
    const key = row.province || "Non renseignée";
    const current = map.get(key) ?? { total: 0, accepted: 0 };
    current.total += 1;
    current.accepted += ["approved", "eligible"].includes(row.status) ? 1 : 0;
    map.set(key, current);
  });

  return Array.from(map, ([name, value]) => ({
    name,
    taux: percentage(value.accepted, value.total),
    total: value.total
  })).sort((a, b) => b.taux - a.taux || b.total - a.total);
}

function groupRows(rows: AdminMetric[], getKey: (row: AdminMetric) => string) {
  const groups = new Map<string, number>();

  rows.forEach((row) => {
    const key = getKey(row);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  });

  return Array.from(groups, ([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
}

function percentage(value: number, total: number) {
  return Math.round((value / Math.max(total, 1)) * 100);
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    submitted: "Soumise",
    payment_pending: "Paiement attendu",
    payment_under_review: "Paiement en revue",
    documents_required: "Documents requis",
    under_review: "En revue",
    eligible: "Éligible",
    ineligible: "Non éligible",
    approved: "Approuvée",
    rejected: "Rejetée"
  };

  return labels[status] ?? status;
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-[#081b30] p-4 shadow-premium sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-kcs-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function FilterSelect({ label, value, options, onChange, formatter = (option) => option, allowEmpty = true }: { label: string; value: string; options: string[]; onChange: (value: string) => void; formatter?: (option: string) => string; allowEmpty?: boolean }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-3 text-sm text-white outline-none focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
      >
        {allowEmpty ? <option value="">Tous</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>{formatter(option)}</option>
        ))}
      </select>
    </label>
  );
}

function LegendList({ rows }: { rows: { name: string; total: number }[] }) {
  return (
    <div className="mt-3 grid gap-2">
      {rows.map((row, index) => (
        <div key={row.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-kcs-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[index % chartColors.length] }} />
            <span className="truncate">{row.name}</span>
          </span>
          <span className="font-semibold text-white">{row.total}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-kcs-muted">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-kcs-gold" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function AdminTabs({ activeTab, onChange }: { activeTab: AdminTab; onChange: (tab: AdminTab) => void }) {
  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: "resume", label: "Résumé" },
    { id: "recherche", label: "Recherche" },
    { id: "graphiques", label: "Graphiques" },
    { id: "candidatures", label: "Candidatures" },
    { id: "controle", label: "Contrôle" }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[#081b30] p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`h-10 shrink-0 rounded-md px-4 text-sm font-semibold ${activeTab === tab.id ? "bg-kcs-gold text-[#08111f]" : "text-kcs-muted hover:bg-white/[0.06] hover:text-white"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ApplicationDetailDialog({ application, isMutating, onApprove, onReject, onDelete, onClose }: { application: AdminMetric; isMutating: boolean; onApprove: () => void; onReject: () => void; onDelete: () => void; onClose: () => void }) {
  const fullName = `${application.first_name ?? ""} ${application.last_name ?? ""}`.trim() || "Candidat";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-[#081b30] shadow-premium">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#081b30] p-4 sm:p-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{fullName}</h2>
            <p className="mt-1 text-sm text-kcs-muted">{application.payment_reference || application.id}</p>
          </div>
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-white/10 px-3 text-sm font-semibold text-kcs-muted hover:bg-white/[0.06] hover:text-white">
            Fermer
          </button>
        </div>
        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <MiniInfo label="Statut" value={formatStatus(application.status)} />
            <MiniInfo label="Province" value={application.province || "Non renseignée"} />
            <MiniInfo label="Paiement" value={application.payment_operator || "Non renseigné"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Identité">
              <DetailRow label="Nom complet" value={fullName} />
              <DetailRow label="Date de naissance" value={application.date_of_birth || "Non renseignée"} />
              <DetailRow label="Pays de naissance" value={application.country_of_birth || "Non renseigné"} />
              <DetailRow label="Document" value={application.identity_number || "Non renseigné"} />
              <DetailRow label="Niveau d'études" value={application.education_level || "Non renseigné"} />
            </DetailSection>
            <DetailSection title="Contact">
              <DetailRow label="E-mail" value={application.email || "Masqué ou non disponible"} />
              <DetailRow label="Téléphone" value={application.phone || "Non renseigné"} />
              <DetailRow label="Responsable" value={application.guardian_name || "Non renseigné"} />
              <DetailRow label="Téléphone responsable" value={application.guardian_phone || "Non renseigné"} />
              <DetailRow label="Adresse" value={application.residential_address || "Non renseignée"} />
            </DetailSection>
          </div>
          <DetailSection title="Paiement et documents">
            <div className="grid gap-3 md:grid-cols-3">
              <MiniInfo label="Référence" value={application.payment_reference || "Non renseignée"} />
              <MiniInfo label="ID transaction" value={application.transaction_id || "Non reçu"} />
              <MiniInfo label="Preuve" value={application.payment_proof_path || "Facultative, non jointe"} />
            </div>
          </DetailSection>
          <DetailSection title="Motivation et décision">
            <p className="rounded-md border border-white/10 bg-[#061426] p-3 text-sm leading-6 text-kcs-muted">{application.motivation || "Motivation non disponible dans la vue actuelle."}</p>
            <p className="mt-3 rounded-md border border-kcs-gold/25 bg-kcs-gold/10 p-3 text-sm leading-6 text-kcs-muted">{application.result_message || application.admin_message || "Aucun résultat administratif communiqué."}</p>
          </DetailSection>
          <section className="rounded-lg border border-white/10 bg-[#061426] p-4">
            <h3 className="font-semibold text-white">Décision administrative</h3>
            <p className="mt-1 text-sm leading-6 text-kcs-muted">Ces actions mettent à jour la candidature dans Supabase avec la session administrateur connectée.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" disabled={isMutating} onClick={onApprove} className="h-10 rounded-md bg-kcs-success px-4 text-sm font-semibold text-[#061426] disabled:cursor-not-allowed disabled:opacity-60">
                Approuver
              </button>
              <button type="button" disabled={isMutating} onClick={onReject} className="h-10 rounded-md bg-kcs-danger px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                Refuser
              </button>
              <button type="button" disabled={isMutating} onClick={onDelete} className="h-10 rounded-md border border-kcs-danger/50 px-4 text-sm font-semibold text-[#ffb2ad] hover:bg-kcs-danger/10 disabled:cursor-not-allowed disabled:opacity-60">
                Supprimer
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#061426] p-4">
      <h3 className="mb-3 font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 border-b border-white/10 py-2 text-sm last:border-0">
      <span className="text-kcs-muted">{label}</span>
      <span className="max-w-[60%] break-words text-right font-medium text-white">{value}</span>
    </div>
  );
}

function getStudentProgress(status?: string) {
  const progress: Record<string, number> = {
    submitted: 20,
    payment_pending: 30,
    payment_under_review: 45,
    documents_required: 55,
    under_review: 70,
    eligible: 85,
    ineligible: 100,
    approved: 100,
    rejected: 100
  };

  return progress[status ?? ""] ?? 10;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-[#061426] p-3">
      <p className="text-xs font-medium uppercase text-kcs-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
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

function BirthDateFields() {
  const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 block text-sm font-medium">Date de naissance</legend>
      <div className="grid grid-cols-[0.7fr_1.2fr_0.9fr] gap-2">
        <SelectField name="birth_day" label="Jour" options={days.map((day) => ({ value: day, label: day }))} />
        <SelectField name="birth_month" label="Mois" options={birthMonths} />
        <SelectField name="birth_year" label="Année" options={birthYears.map((year) => ({ value: year, label: year }))} />
      </div>
    </fieldset>
  );
}

function SelectField({ name, label, options }: { name: string; label: string; options: { value: string; label: string }[] }) {
  return (
    <label className="min-w-0">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        required
        defaultValue=""
        className="h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#061426] px-2 text-sm text-white outline-none focus:border-kcs-gold/70 focus:ring-2 focus:ring-kcs-gold/20"
      >
        <option value="" disabled>{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function FeedbackDialog({ dialog, onClose }: { dialog: NonNullable<DialogState>; onClose: () => void }) {
  const toneClass = {
    success: "border-kcs-success/40 bg-kcs-success/15 text-kcs-success",
    error: "border-kcs-danger/40 bg-kcs-danger/15 text-[#ffb2ad]",
    info: "border-kcs-cyan/40 bg-kcs-cyan/15 text-kcs-cyan"
  }[dialog.tone];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
      <section className={`w-full max-w-md rounded-lg border bg-[#081b30] p-5 shadow-premium ${toneClass}`}>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">{dialog.title}</h2>
            <p className="mt-2 text-sm leading-6 text-kcs-muted">{dialog.message}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="mt-5 h-10 w-full rounded-md bg-white px-4 text-sm font-semibold text-[#061426]">
          Fermer
        </button>
      </section>
    </div>
  );
}

function PasswordField({ label = "Mot de passe", placeholder = "", autoComplete = "off", isVisible, onToggle }: { label?: string; placeholder?: string; autoComplete?: string; isVisible: boolean; onToggle: () => void }) {
  const Icon = isVisible ? EyeOff : Eye;
  const toggleLabel = isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <div className="flex h-10 min-w-0 items-center rounded-md border border-white/10 bg-[#061426] focus-within:border-kcs-gold/70 focus-within:ring-2 focus-within:ring-kcs-gold/20">
        <input
          name="password"
          type={isVisible ? "text" : "password"}
          required
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-kcs-muted/70"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={toggleLabel}
          title={toggleLabel}
          className="grid h-full w-10 shrink-0 place-items-center rounded-r-md text-kcs-muted hover:bg-white/[0.06] hover:text-white"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </label>
  );
}

function Field({ label, name, placeholder, type = "text", required = false, autoComplete }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <label className="min-w-0">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
