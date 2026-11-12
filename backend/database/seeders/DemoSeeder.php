<?php

namespace Database\Seeders;

use App\Models\Activite;
use App\Models\Alumni;
use App\Models\Diplome;
use App\Models\Emploi;
use App\Models\Entreprise;
use App\Models\Enseignant;
use App\Models\Filiere;
use App\Models\Participation;
use App\Models\Promotion;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('DemoSeeder is only allowed in local or testing environments.');
        }

        $password = env('DEMO_USER_PASSWORD');
        if (! $password || strlen($password) < 12) {
            throw new RuntimeException('Set a local DEMO_USER_PASSWORD of at least 12 characters in backend/.env before seeding.');
        }

        $licence = Filiere::firstOrCreate(['code' => 'LIC-INFO'], ['nom' => 'Licence Informatique', 'active' => true, 'is_demo' => true]);
        $master = Filiere::firstOrCreate(['code' => 'MST-INFO'], ['nom' => 'Master Informatique', 'active' => true, 'is_demo' => true]);
        $promoLicence = Promotion::firstOrCreate(['code' => 'LIC-INFO-2022'], ['annee' => 2022, 'filiere_id' => $licence->id, 'is_demo' => true]);
        $promoMaster = Promotion::firstOrCreate(['code' => 'MST-INFO-2024'], ['annee' => 2024, 'filiere_id' => $master->id, 'is_demo' => true]);
        $diplomeLicence = Diplome::firstOrCreate(['intitule' => 'Licence en Informatique', 'annee_obtention' => 2022], ['is_demo' => true]);
        $diplomeMaster = Diplome::firstOrCreate(['intitule' => 'Master en Informatique', 'annee_obtention' => 2024], ['is_demo' => true]);

        $accounts = [
            'chef@alumni.local' => ['Awa', 'Ndiaye', 'chef_departement'],
            'responsable@alumni.local' => ['Moussa', 'Sow', 'responsable_filiere'],
            'coordinateur@alumni.local' => ['Fatou', 'Diop', 'coordinateur_master'],
            'alumni@alumni.local' => ['Aminata', 'Diallo', 'alumni'],
        ];
        $users = [];
        foreach ($accounts as $email => [$prenom, $nom, $role]) {
            $users[$email] = User::updateOrCreate(['email' => $email], [
                'name' => "$prenom $nom", 'prenom' => $prenom, 'nom' => $nom,
                'password' => Hash::make($password), 'role' => $role, 'statut' => 'actif', 'is_demo' => true,
            ]);
        }

        $responsable = $users['responsable@alumni.local'];
        $responsable->filieres()->syncWithoutDetaching([$licence->id, $master->id]);
        $coordinateur = $users['coordinateur@alumni.local'];
        $coordinateur->filieres()->syncWithoutDetaching([$master->id]);
        Enseignant::updateOrCreate(['user_id' => $coordinateur->id], ['filiere_id' => $master->id, 'domaine_enseignement' => 'Développement logiciel', 'is_demo' => true]);

        $alumniUser = $users['alumni@alumni.local'];
        $alumni = Alumni::updateOrCreate(['user_id' => $alumniUser->id], [
            'telephone' => '+221 77 000 00 01', 'adresse' => 'Ziguinchor', 'annee_entree' => 2019,
            'annee_sortie' => 2022, 'filiere_id' => $licence->id, 'promotion_id' => $promoLicence->id,
            'diplome_id' => $diplomeLicence->id, 'is_demo' => true,
        ]);
        $company = Entreprise::firstOrCreate(['nom' => 'Sunu Tech Démo'], ['secteur_activite' => 'Services numériques', 'adresse' => 'Ziguinchor', 'is_demo' => true]);
        Stage::firstOrCreate(['alumni_id' => $alumni->id, 'entreprise_id' => $company->id, 'poste' => 'Stagiaire développeuse'], [
            'date_debut' => '2021-06-01', 'date_fin' => '2021-09-30', 'description' => 'Participation à un projet web de démonstration.', 'is_demo' => true,
        ]);
        Emploi::firstOrCreate(['alumni_id' => $alumni->id, 'entreprise_id' => $company->id, 'fonction' => 'Développeuse junior'], [
            'type_contrat' => 'CDI', 'date_debut' => '2023-01-01', 'date_fin' => null, 'is_demo' => true,
        ]);
        $activity = Activite::firstOrCreate(['titre' => 'Rencontre des alumni UASZ (démo)'], [
            'description' => 'Rencontre de démonstration pour tester les inscriptions.', 'type' => 'Rencontre',
            'date' => now()->addMonth()->toDateString(), 'heure' => '10:00', 'lieu' => 'Campus UASZ',
            'capacite' => 100, 'statut' => 'publiee', 'createur_id' => $users['chef@alumni.local']->id, 'is_demo' => true,
        ]);
        Participation::firstOrCreate(['alumni_id' => $alumni->id, 'activite_id' => $activity->id], ['is_demo' => true]);
    }
}
