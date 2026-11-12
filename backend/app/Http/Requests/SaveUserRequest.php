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
        ];
    }
}
