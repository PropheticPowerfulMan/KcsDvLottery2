-- KCS - 10 candidatures de test pour le dashboard statistique
-- A executer apres supabase/setup.sql.

insert into public.applications (
  first_name,
  last_name,
  date_of_birth,
  country_of_birth,
  email,
  phone,
  education_level,
  identity_number,
  guardian_name,
  guardian_phone,
  province,
  residential_address,
  motivation,
  payment_reference,
  payment_operator,
  transaction_id,
  payment_proof_path,
  status,
  result_message,
  created_at
)
values
  ('Grace', 'Mbuyi', '2002-03-14', 'RD Congo', 'test.grace.mbuyi@kcs.app', '+243810000001', 'Diplome d''Etat', 'KCS-ID-001', 'Jeanne Mbuyi', '+243820000001', 'Kinshasa', 'Kinshasa, Gombe', 'Je veux poursuivre une formation solide et contribuer a ma communaute.', 'KCS-2026-91001', 'M-Pesa', 'MP250001', 'demo/01.pdf', 'approved', 'Candidature approuvee.', now() - interval '5 days'),
  ('Daniel', 'Kabongo', '2001-07-22', 'RD Congo', 'test.daniel.kabongo@kcs.app', '+243810000002', 'Diplome d''Etat', 'KCS-ID-002', 'Paul Kabongo', '+243820000002', 'Haut-Katanga', 'Lubumbashi, Kenya', 'Je souhaite obtenir une opportunite qui valorise mon parcours scolaire.', 'KCS-2026-91002', 'Airtel Money', 'AM250002', 'demo/02.jpg', 'under_review', null, now() - interval '5 days'),
  ('Sarah', 'Ilunga', '2003-01-09', 'RD Congo', 'test.sarah.ilunga@kcs.app', '+243810000003', 'Licence 1', 'KCS-ID-003', 'Chantal Ilunga', '+243820000003', 'Kongo-Central', 'Matadi, Ville basse', 'Ma candidature est motivee par le besoin de progresser professionnellement.', 'KCS-2026-91003', 'Orange Money', 'OM250003', 'demo/03.png', 'payment_under_review', null, now() - interval '4 days'),
  ('Moise', 'Kanku', '2000-11-30', 'RD Congo', 'test.moise.kanku@kcs.app', '+243810000004', 'Diplome d''Etat', 'KCS-ID-004', 'Andre Kanku', '+243820000004', 'Nord-Kivu', 'Goma, Himbi', 'Je veux integrer ce programme pour developper mes competences.', 'KCS-2026-91004', 'M-Pesa', 'MP250004', null, 'submitted', null, now() - interval '4 days'),
  ('Aline', 'Bisimwa', '2002-05-17', 'RD Congo', 'test.aline.bisimwa@kcs.app', '+243810000005', 'Licence 2', 'KCS-ID-005', 'Rachel Bisimwa', '+243820000005', 'Sud-Kivu', 'Bukavu, Ibanda', 'Je veux utiliser cette opportunite pour soutenir mon projet d''avenir.', 'KCS-2026-91005', 'Airtel Money', 'AM250005', 'demo/05.pdf', 'eligible', 'Eligible pour l''etape suivante.', now() - interval '3 days'),
  ('Patrick', 'Tshibangu', '1999-09-04', 'RD Congo', 'test.patrick.tshibangu@kcs.app', '+243810000006', 'Graduat', 'KCS-ID-006', 'Joseph Tshibangu', '+243820000006', 'Kasai-Central', 'Kananga, Nganza', 'Je souhaite rejoindre le programme pour ameliorer mes perspectives.', 'KCS-2026-91006', 'Orange Money', 'OM250006', null, 'documents_required', null, now() - interval '3 days'),
  ('Merveille', 'Lutete', '2004-02-26', 'RD Congo', 'test.merveille.lutete@kcs.app', '+243810000007', 'Diplome d''Etat', 'KCS-ID-007', 'Marthe Lutete', '+243820000007', 'Kwilu', 'Kikwit, Lukemi', 'Je veux beneficier de cette chance pour financer mes etudes.', 'KCS-2026-91007', 'M-Pesa', 'MP250007', 'demo/07.jpg', 'rejected', 'Dossier rejete apres verification.', now() - interval '2 days'),
  ('Jonathan', 'Moke', '2001-12-11', 'RD Congo', 'test.jonathan.moke@kcs.app', '+243810000008', 'Licence 1', 'KCS-ID-008', 'Daniel Moke', '+243820000008', 'Tshopo', 'Kisangani, Makiso', 'Je postule pour acceder a une meilleure formation et servir mon pays.', 'KCS-2026-91008', 'Airtel Money', 'AM250008', 'demo/08.pdf', 'approved', 'Candidature approuvee.', now() - interval '2 days'),
  ('Rebecca', 'Nsimba', '2003-10-20', 'RD Congo', 'test.rebecca.nsimba@kcs.app', '+243810000009', 'Diplome d''Etat', 'KCS-ID-009', 'Therese Nsimba', '+243820000009', 'Lualaba', 'Kolwezi, Dilala', 'Je veux candidater pour transformer mes ambitions en resultats concrets.', 'KCS-2026-91009', 'Orange Money', 'OM250009', 'demo/09.png', 'ineligible', 'Non eligible.', now() - interval '1 day'),
  ('Emmanuel', 'Wemba', '2000-06-08', 'RD Congo', 'test.emmanuel.wemba@kcs.app', '+243810000010', 'Graduat', 'KCS-ID-010', 'Elie Wemba', '+243820000010', 'Ituri', 'Bunia, Nyakasanza', 'Je souhaite etre selectionne pour construire un parcours stable.', 'KCS-2026-91010', 'M-Pesa', 'MP250010', 'demo/10.jpg', 'submitted', null, now())
on conflict (payment_reference) do update
set
  province = excluded.province,
  payment_operator = excluded.payment_operator,
  transaction_id = excluded.transaction_id,
  payment_proof_path = excluded.payment_proof_path,
  status = excluded.status,
  result_message = excluded.result_message,
  updated_at = now();
