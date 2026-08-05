# Envoi des resultats par e-mail

Le fichier `setup.sql` met chaque decision administrative dans `result_email_queue`.

Pour envoyer les e-mails, deployer la fonction:

```bash
supabase functions deploy send-result-emails
```

Puis definir les secrets:

```bash
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESULT_FROM_EMAIL="KCS <noreply@votre-domaine.com>"
```

La fonction traite les lignes `pending`, envoie l'e-mail avec Resend, puis marque la ligne comme `sent` ou `failed`.
