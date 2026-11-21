<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class SaveUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRole('chef_departement') ?? false;
    }

    public function rules(): array
    {
        $user = $this->route('utilisateur');
        return [
            'nom' => ['required', 'string', 'max:80'],
            'prenom' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user)],
            'password' => [$this->isMethod('post') ? 'required' : 'sometimes', 'nullable', 'string', Password::min(12)],
            'role' => ['required', Rule::in(User::ROLES)],
            'statut' => ['sometimes', Rule::in(['actif', 'desactive'])],
            'filiere_id' => ['sometimes', 'nullable', 'integer', 'exists:filieres,id'],
            'identifiant_professionnel' => ['sometimes', 'nullable', 'string', 'max:80', Rule::unique('enseignants', 'identifiant_professionnel')->ignore($user?->enseignant?->id)],
            'grade_academique' => ['sometimes', 'nullable', 'string', 'max:80'],
            'domaine_enseignement' => ['sometimes', 'nullable', 'string', 'max:150'],
            'coordonnees' => ['sometimes', 'nullable', 'string', 'max:180'],
            'date_prise_fonction' => ['sometimes', 'nullable', 'date'],
            'filiere_master_rattachee' => ['sometimes', 'nullable', 'integer', 'exists:filieres,id'],
            'date_debut_mandat' => ['sometimes', 'nullable', 'date'],
            'date_fin_mandat' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_debut_mandat'],
            'perimetre_supervision' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'niveau_droits_admin' => ['sometimes', 'nullable', 'string', 'max:80'],
        ];
    }
}
