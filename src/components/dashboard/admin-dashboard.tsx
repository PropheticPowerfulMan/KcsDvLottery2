import { Award, ClipboardList, FileWarning, GraduationCap, Landmark, Timer, UserCheck, Users } from "lucide-react";
import type { ElementType } from "react";
import { DateFilter, Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ApplicationsChart, ProvincePanel, PaymentDonut } from "@/components/dashboard/charts";
import { RecentApplications } from "@/components/dashboard/recent-applications";

const stats = [
  { label: "Total Applications", value: "24,589", meta: "12.5% from last month", icon: Users, tone: "text-white", trend: "up" },
  { label: "Pending Review", value: "4,752", meta: "Waiting for verification", icon: Timer, tone: "text-kcs-gold", trend: "warn" },
  { label: "Total Payments", value: "$1,248,750", meta: "18.3% from last month", icon: Landmark, tone: "text-kcs-gold", trend: "up" },
  { label: "Eligible Applicants", value: "8,420", meta: "Ready for selection pool", icon: UserCheck, tone: "text-kcs-success", trend: "info" },
  { label: "Selected Students", value: "125", meta: "This campaign finalists", icon: GraduationCap, tone: "text-kcs-cyan", trend: "info" },
  { label: "Failed Payments", value: "318", meta: "Needs finance follow-up", icon: FileWarning, tone: "text-kcs-danger", trend: "warn" },
  { label: "Documents Awaiting Verification", value: "1,904", meta: "Assigned review queue", icon: ClipboardList, tone: "text-kcs-goldLight", trend: "warn" },
  { label: "Applications Requiring Correction", value: "642", meta: "Applicant action needed", icon: Award, tone: "text-kcs-warning", trend: "warn" }
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-[1800px] rounded-[28px] border border-white/10 bg-[#061426]/80 shadow-premium">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar />
          <section className="px-4 pb-8 pt-6 sm:px-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
                <p className="mt-1 text-sm text-kcs-muted">Welcome back, KCS Administration Team</p>
              </div>
              <DateFilter />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.slice(0, 4).map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
              <ApplicationsChart />
              <ProvincePanel />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
              <RecentApplications />
              <PaymentDonut />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.slice(4).map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone,
  trend
}: {
  label: string;
  value: string;
  meta: string;
  icon: ElementType;
  tone: string;
  trend: "up" | "warn" | "info";
}) {
  const metaTone = trend === "up" ? "text-kcs-success" : trend === "warn" ? "text-kcs-goldLight" : "text-kcs-cyan";

  return (
    <article className="premium-panel min-h-[128px] rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.045]">
          <Icon className={`h-6 w-6 ${tone}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-kcs-text/90">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-wide">{value}</p>
          <p className={`mt-2 text-xs font-medium ${metaTone}`}>{meta}</p>
        </div>
      </div>
    </article>
  );
}
