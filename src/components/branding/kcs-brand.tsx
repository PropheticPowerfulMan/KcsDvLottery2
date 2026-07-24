import Image from "next/image";

export function KcsBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white shadow-glow">
        <Image src="/branding/kcs-logo-placeholder.png" alt="Kinshasa Christian School logo" fill className="object-cover" priority />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-extrabold tracking-[0.08em] text-kcs-gold">KCS</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-kcs-muted">Opportunity Program</p>
        </div>
      )}
    </div>
  );
}
