<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('alumni:create-chef', function () {
    if (User::where('role', 'chef_departement')->where('is_demo', false)->exists()) {
        $this->error('Un compte réel chef de département existe déjà.');
        return self::FAILURE;
    }

    $prenom = trim($this->ask('Prénom du chef de département'));
    $nom = trim($this->ask('Nom du chef de département'));
    $email = trim($this->ask('Adresse e-mail'));
    $password = $this->secret('Mot de passe (12 caractères minimum)');
    $confirmation = $this->secret('Confirmer le mot de passe');
    $validator = Validator::make([
        'prenom' => $prenom,
        'nom' => $nom,
        'email' => $email,
        'password' => $password,
        'password_confirmation' => $confirmation,
    ], [
        'prenom' => ['required', 'string', 'max:80'],
        'nom' => ['required', 'string', 'max:80'],
        'email' => ['required', 'email', 'max:160', 'unique:users,email'],
        'password' => ['required', 'string', 'min:12', 'confirmed'],
    ]);
    if ($validator->fails()) {
        foreach ($validator->errors()->all() as $error) $this->error($error);
        return self::FAILURE;
    }

    User::create([
        'name' => "$prenom $nom",
        'prenom' => $prenom,
        'nom' => $nom,
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'chef_departement',
        'statut' => 'actif',
        'is_demo' => false,
    ]);

    $this->info('Compte réel chef de département créé. Il peut maintenant créer les filières et promotions réelles.');
    return self::SUCCESS;
})->purpose('Créer le premier compte réel chef de département de façon interactive');
