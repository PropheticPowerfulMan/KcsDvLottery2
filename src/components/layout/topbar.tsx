import { Bell, CalendarDays, ChevronDown, Mail, Menu, UserCircle } from "lucide-react";
import type { ReactNode } from "react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 px-4 sm:px-8">
      <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-kcs-muted lg:border-transparent lg:bg-transparent">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-3">
        <IconBadge icon={<Bell className="h-5 w-5" />} value="3" />
        <IconBadge icon={<Mail className="h-5 w-5" />} value="5" />
        <UserCircle className="h-9 w-9 text-kcs-muted" />
      </div>
    </header>
  );
}

export function DateFilter() {
  return (
    <button className="flex h-12 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm text-kcs-text shadow-premium">
      <CalendarDays className="h-4 w-4 text-kcs-muted" />
      Juillet 2026
      <ChevronDown className="h-4 w-4 text-kcs-muted" />
    </button>
  );
}

function IconBadge({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <button className="relative grid h-10 w-10 place-items-center rounded-lg text-kcs-muted transition hover:bg-white/[0.04] hover:text-white">
      {icon}
      <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-kcs-danger px-1 text-[11px] font-bold text-white">
        {value}
      </span>
    </button>
  );
}
