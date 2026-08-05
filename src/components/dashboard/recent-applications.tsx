const rows = [
  { name: "Grace M.", email: "grace.muteba@example.com", status: "En attente", date: "26 juil. 2026", tone: "gold" },
  { name: "Peter K.", email: "peter.kabeya@example.com", status: "En revue", date: "26 juil. 2026", tone: "cyan" },
  { name: "Amina T.", email: "amina.tshibola@example.com", status: "Vérifié", date: "25 juil. 2026", tone: "green" },
  { name: "David L.", email: "david.lubaki@example.com", status: "Correction", date: "25 juil. 2026", tone: "red" },
  { name: "John S.", email: "john.samba@example.com", status: "Éligible", date: "24 juil. 2026", tone: "green" }
];

const tones: Record<string, string> = {
  gold: "bg-kcs-gold/18 text-kcs-goldLight",
  cyan: "bg-kcs-cyan/18 text-kcs-cyan",
  green: "bg-kcs-success/18 text-kcs-success",
  red: "bg-kcs-danger/18 text-kcs-danger"
};

export function RecentApplications() {
  return (
    <section className="premium-panel rounded-xl p-5">
      <h2 className="text-lg font-bold">Candidatures récentes</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.email} className="border-t border-white/[0.07]">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-kcs-gold/40 to-kcs-cyan/20 text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-semibold">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-kcs-muted">{row.email}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tones[row.tone]}`}>{row.status}</span>
                </td>
                <td className="py-3 text-right text-kcs-text/90">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mx-auto mt-4 block text-sm font-semibold text-kcs-gold">Tout voir</button>
    </section>
  );
}
