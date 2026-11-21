<?php

namespace Database\Seeders;

use App\Models\Filiere;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('FiliereSeeder is only allowed in local or testing environments.');
        }

        $filieres = [
            ['code' => 'LIC-INFO', 'nom' => 'Licence Informatique', 'description' => 'Formation de licence en informatique.'],
            ['code' => 'LIC-ING-INFO', 'nom' => 'Licence Ingénierie Informatique', 'description' => 'Formation de licence en ingénierie informatique.'],
            ['code' => 'MST-INFO-RES-SYS', 'nom' => 'Master Informatique — Réseaux et Systèmes', 'description' => 'Formation de master spécialisée en réseaux et systèmes.'],
            ['code' => 'MST-INFO-GEN-LOG', 'nom' => 'Master Informatique — Génie Logiciel', 'description' => 'Formation de master spécialisée en génie logiciel.'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::updateOrCreate(
                ['code' => $filiere['code'], 'is_demo' => false],
                [...$filiere, 'active' => true, 'is_demo' => false],
            );
        }
    }
}
