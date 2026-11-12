<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveActiviteRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can($this->isMethod('post') ? 'create' : 'update', $this->route('activite') ?? \App\Models\Activite::class) ?? false; }
    public function rules(): array
    {
        return [
            'titre' => ['required', 'string', 'max:180'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'type' => ['sometimes', 'nullable', 'string', 'max:80'],
            'date' => ['required', 'date'],
            'heure' => ['sometimes', 'nullable', 'date_format:H:i'],
            'lieu' => ['required', 'string', 'max:180'],
            'capacite' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100000'],
            'date_limite_inscription' => ['sometimes', 'nullable', 'date'],
            'statut' => ['sometimes', Rule::in(['brouillon', 'publiee', 'terminee', 'annulee'])],
            'filiere_id' => [$this->user()->isRole('chef_departement') ? 'nullable' : 'required', 'integer', Rule::exists('filieres', 'id')->where(fn ($query) => $query->where('is_demo', $this->user()->is_demo))],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $filiereId = $this->input('filiere_id', $this->route('activite')?->filiere_id);
            if ($filiereId && ! $this->user()->isRole('chef_departement')
                && ! $this->user()->filieres()->whereKey($filiereId)->exists()) {
                $validator->errors()->add('filiere_id', 'Cette filière ne fait pas partie de votre périmètre.');
            }
        }];
    }
}
