export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#020814] px-4 text-[#f7f9fc]">
      <section className="max-w-md rounded-lg border border-white/10 bg-[#081b30] p-6 text-center shadow-premium">
        <p className="text-sm font-semibold text-kcs-goldLight">Erreur 404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page introuvable</h1>
        <p className="mt-3 text-sm leading-6 text-kcs-muted">
          La page demandée n'existe pas ou n'est plus disponible.
        </p>
        <a className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-kcs-gold px-5 text-sm font-bold text-[#08111f]" href="./">
          Retour à l'accueil
        </a>
      </section>
    </main>
  );
}
