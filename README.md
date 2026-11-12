# UASZ Alumni

Plateforme de suivi des diplÃ´mÃ©s du DÃ©partement Informatique de lâ€™UniversitÃ© Assane Seck de Ziguinchor. Lâ€™application utilise React/Vite et Laravel 12 avec une API REST, Sanctum, MariaDB, Form Requests et Policies. Le prototype historique reste conservÃ© dans `legacy/`.

## Ã‰tat fonctionnel

- Les quatre profils fonctionnels sont `alumni`, `coordinateur_master`, `responsable_filiere` et `chef_departement`.
- Lâ€™inscription publique crÃ©e uniquement un compte Alumni. Le rÃ´le ne peut pas Ãªtre fourni par le formulaire. Les comptes institutionnels sont provisionnÃ©s par un responsable autorisÃ©.
- Les accÃ¨s API et les pÃ©rimÃ¨tres de donnÃ©es sont contrÃ´lÃ©s par Laravel. Les comptes de dÃ©monstration et leurs donnÃ©es sont marquÃ©s `is_demo` et sÃ©parÃ©s des donnÃ©es rÃ©elles.
- Les fonctionnalitÃ©s comprennent les profils Alumni, stages et emplois, entreprises, activitÃ©s et participations, statistiques, administration des rÃ©fÃ©rences et exports PDF/Excel.
- Les opportunitÃ©s sont les expÃ©riences professionnelles enregistrÃ©es; le projet nâ€™a pas de table distincte dâ€™offres dâ€™emploi.

## Base locale et donnÃ©es

Lâ€™application Laravel utilise maintenant la base de rÃ©fÃ©rence `alumni_uasz` selon `backend/.env`. La base contient le schÃ©ma historique au singulier et le schÃ©ma applicatif Laravel normalisÃ©. Toutes les tables historiques observÃ©es Ã©taient vides. La seule collision Ã©tait lâ€™ancienne table `alumni`, dont les colonnes sont incompatibles avec le modÃ¨le Laravel; la migration rÃ©versible `2026_11_12_000000_preserve_legacy_alumni_table` lâ€™a conservÃ©e sous `alumni_legacy` et sâ€™arrÃªte sans changement si cette table contient des lignes. Les migrations applicatives ont ensuite crÃ©Ã© les tables Laravel, dont lâ€™isolation `is_demo` et le rattachement facultatif des activitÃ©s Ã  une filiÃ¨re.

Les donnÃ©es dÃ©mo dÃ©jÃ  prÃ©sentes se trouvent dans lâ€™ancienne base `alumni_uasz_laravel`; elles nâ€™ont pas Ã©tÃ© copiÃ©es dans la base de rÃ©fÃ©rence. Leurs comptes et contenus ne sont pas renvoyÃ©s par les APIs publiques de lâ€™application dÃ©sormais connectÃ©e Ã  `alumni_uasz`. Aucun compte ou rÃ©fÃ©rentiel rÃ©el nâ€™a Ã©tÃ© inventÃ©. La base de rÃ©fÃ©rence ne contient actuellement aucun utilisateur, filiÃ¨re, promotion, Alumni, entreprise, stage, emploi, activitÃ©, participation ni rapport. Lâ€™inscription publique sera possible aprÃ¨s crÃ©ation dâ€™au moins une filiÃ¨re rÃ©elle active et dâ€™une promotion si nÃ©cessaire.

Pour initialiser le premier responsable rÃ©el, dÃ©marrer MariaDB puis lancer dans `backend/`:

```powershell
php artisan alumni:create-chef
```

La commande demande le nom, lâ€™adresse e-mail et un mot de passe, puis crÃ©e un compte rÃ©el chef de dÃ©partement. Ce compte peut ensuite crÃ©er les filiÃ¨res et promotions rÃ©elles, puis les responsables institutionnels. Les secrets ne doivent pas Ãªtre ajoutÃ©s au code ni versionnÃ©s.

Le `DemoSeeder` est limitÃ© aux environnements `local` et `testing` et exige `DEMO_USER_PASSWORD` local dâ€™au moins 12 caractÃ¨res. Ne pas le lancer pour alimenter des donnÃ©es de production.

## DÃ©marrage local

DÃ©marrer MariaDB dans XAMPP. Depuis un terminal dans `backend/`:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Depuis un second terminal dans `frontend/`:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend: `http://127.0.0.1:5173`
API: `http://127.0.0.1:8000/api`

`backend/.env` et les fichiers `.env` locaux sont exclus du contrÃ´le de version. Ne pas publier leur contenu.

## VÃ©rifications exÃ©cutÃ©es

- Migrations MariaDB dans `alumni_uasz`: toutes appliquÃ©es (`migrate:status`).
- PHPUnit: 25 tests, 70 assertions rÃ©ussis. Les tests Laravel utilisent la configuration de test isolÃ©e.
- Jest: 5 tests rÃ©ussis.
- Build Vite: rÃ©ussi.
- Parcours HTTP local antÃ©rieur sur la base de dÃ©veloppement: authentification Sanctum et crÃ©ation/lecture/suppression dâ€™une activitÃ© temporaire vÃ©rifiÃ©e dans MariaDB.
- Dans `alumni_uasz`, migrations, routes et connexion MariaDB sont vÃ©rifiÃ©es. Les statistiques et rÃ©fÃ©rences publiques sont vides tant que les donnÃ©es rÃ©elles ne sont pas initialisÃ©es.
- Exports PDF et Excel: gÃ©nÃ©ration et contrÃ´le par PHPUnit.

## Dossiers

- `backend/`: application Laravel, API, migrations, modÃ¨les, policies, seeders et tests.
- `frontend/`: application React, Tailwind, navigation, session Sanctum et tests Jest.
- `images/`: photographie source du Hero; copie dâ€™affichage dans `frontend/public/`.
- `legacy/`: prototype conservÃ© comme rÃ©fÃ©rence.
- `infrastructure/` et `docker-compose.yml`: configuration Docker secondaire, non requise pour le dÃ©veloppement local.
