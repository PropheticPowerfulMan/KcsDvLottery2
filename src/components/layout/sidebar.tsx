"use client";

import {
  Activity,
  ArchiveRestore,
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  FileArchive,
  FileCheck2,
  FileText,
  Gauge,
  GraduationCap,
  Landmark,
  LockKeyhole,
  Mail,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound
} from "lucide-react";
import { KcsBrand } from "@/components/branding/kcs-brand";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", icon: Gauge, active: true },
      { label: "Applications", icon: ClipboardCheck },
      { label: "Payments", icon: Landmark },
      { label: "Documents", icon: FileCheck2 },
      { label: "Messages", icon: Mail }
    ]
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Students", icon: GraduationCap },
      { label: "Guardians", icon: UsersRound },
      { label: "Reviewers", icon: BookOpenCheck },
      { label: "Administrators", icon: UserCog },
      { label: "Roles & Permissions", icon: ShieldCheck }
    ]
  },
  {
    label: "PROGRAM",
    items: [
      { label: "Campaigns", icon: BriefcaseBusiness },
      { label: "Eligibility Rules", icon: ScrollText },
      { label: "Selection", icon: Activity },
      { label: "Results", icon: FileText },
      { label: "Announcements", icon: Megaphone }
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Security", icon: LockKeyhole },
      { label: "Audit Logs", icon: FileArchive },
      { label: "Backup & Recovery", icon: ArchiveRestore }
    ]
  },
  {
    label: "REPORTS",
    items: [
      { label: "Analytics", icon: BarChart3 },
      { label: "Reports", icon: Bell }
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[282px] shrink-0 border-r border-white/10 bg-kcs-sidebar/95 px-5 py-6 shadow-premium lg:flex lg:flex-col">
      <div className="mb-8 flex justify-center">
        <KcsBrand />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 px-2 text-[11px] font-semibold tracking-wide text-kcs-muted/75">{group.label}</p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "group flex h-12 w-full items-center gap-3 rounded-lg border px-3 text-sm font-medium transition",
                    item.active
                      ? "border-kcs-gold/40 bg-gradient-to-r from-kcs-gold/45 to-kcs-gold2/20 text-white shadow-glow"
                      : "border-transparent text-kcs-muted hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.active ? "text-kcs-goldLight" : "text-kcs-muted")} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-kcs-cyan/15 text-sm font-bold text-kcs-cyan">KA</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">KCS Admin</p>
            <p className="truncate text-xs text-kcs-muted">Super Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
