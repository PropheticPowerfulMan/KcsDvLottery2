export function KcsBrand({ compact = false, tone = "dark" }: { compact?: boolean; tone?: "dark" | "light" }) {
  const titleColor = tone === "light" ? "text-[#1f2328]" : "text-kcs-gold";
  const captionColor = tone === "light" ? "text-[#57606a]" : "text-kcs-muted";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const assetBasePath = basePath || ".";

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#d0d7de] bg-white shadow-sm sm:h-14 sm:w-14">
        <img
          src={`${assetBasePath}/branding/kcs-logo-placeholder.png`}
          alt="Kinshasa Christian School logo"
          width="56"
          height="56"
          className="h-full w-full object-cover"
        />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className={`text-lg font-extrabold tracking-normal ${titleColor}`}>KCS</p>
          <p className={`text-[11px] font-medium uppercase tracking-[0.12em] ${captionColor}`}>Opportunity Program</p>
        </div>
      )}
    </div>
  );
}
