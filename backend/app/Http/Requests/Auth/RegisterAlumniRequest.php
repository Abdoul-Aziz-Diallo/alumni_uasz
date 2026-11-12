<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RegisterAlumniRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:80'],
            'prenom' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'adresse' => ['nullable', 'string', 'max:200'],
            'annee_entree' => ['nullable', 'integer', 'between:1980,'.(now()->year + 2)],
            'annee_sortie' => ['nullable', 'integer', 'between:1980,'.(now()->year + 2)],
            'filiere_id' => ['required', 'integer', Rule::exists('filieres', 'id')->where(fn ($query) => $query->where('active', true)->where('is_demo', false))],
            'promotion_id' => ['nullable', 'integer', Rule::exists('promotions', 'id')->where(fn ($query) => $query->where('is_demo', false))],
            'role' => ['prohibited'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->filled('promotion_id') && $this->filled('filiere_id')
                && ! \App\Models\Promotion::whereKey($this->integer('promotion_id'))
                    ->where('filiere_id', $this->integer('filiere_id'))->where('is_demo', false)->exists()) {
                $validator->errors()->add('promotion_id', 'La promotion doit appartenir à la filière sélectionnée.');
            }
            if ($this->filled('annee_entree') && $this->filled('annee_sortie')
                && $this->integer('annee_sortie') < $this->integer('annee_entree')) {
                $validator->errors()->add('annee_sortie', 'L’année de sortie doit suivre l’année d’entrée.');
            }
        }];
    }
}
