# Programme d'opportunité KCS

Plateforme privée d'opportunité académique pour les anciens élèves de Kinshasa Christian School.

Avis légal : ce programme privé est organisé par Kinshasa Christian School. Il n'est pas affilié au gouvernement des États-Unis, au Département d'État américain, à l'ambassade des États-Unis, à l'USCIS ou au programme officiel Diversity Visa.

## Lancement local

Commande recommandée pour tester l'application comme elle sera livrée :

```bash
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:4173
```

Cette commande construit l'application, vérifie que le CSS est présent, puis sert le dossier `out/` en local. Si le port `4173` est déjà utilisé, le serveur indique simplement que le site est déjà lancé.

Autre méthode Windows :

```bash
start-local.cmd
```

## Développement Next.js

Pour travailler avec le rechargement à chaud du framework :

```bash
npm run dev:next
```

Ouvrir ensuite :

```text
http://localhost:3000
```

Pour les tests de livraison, utiliser toujours `npm run dev`.

## Environnement

Copier `.env.example` vers `.env.local`, puis renseigner les valeurs Supabase. Ne jamais publier les clés privées.

## Supabase

Exécuter d'abord :

```text
supabase/setup.sql
```

Pour confirmer les comptes de test créés dans Supabase Auth :

```text
supabase/confirm-test-users.sql
```

## Sécurité

- Les paiements doivent être validés par webhook serveur ou par revue finance autorisée.
- La sélection ne doit jamais être exécutée avec une logique aléatoire côté navigateur.
- Les documents privés doivent rester dans des buckets privés avec liens signés.
- Les droits étudiant et administrateur doivent être appliqués par le serveur et les règles RLS.
