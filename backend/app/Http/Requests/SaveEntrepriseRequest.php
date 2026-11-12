<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveEntrepriseRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isRole('chef_departement') ?? false; }
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:160', Rule::unique('entreprises', 'nom')->ignore($this->route('entreprise'))],
            'secteur_activite' => ['sometimes', 'nullable', 'string', 'max:120'],
            'adresse' => ['sometimes', 'nullable', 'string', 'max:200'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'email' => ['sometimes', 'nullable', 'email', 'max:160'],
            'site_web' => ['sometimes', 'nullable', 'url', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}