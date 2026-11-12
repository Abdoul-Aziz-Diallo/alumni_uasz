<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRole('alumni', 'coordinateur_master', 'responsable_filiere', 'chef_departement') ?? false;
    }

    public function rules(): array
    {
        $creating = $this->isMethod('post');
        $title = $this->routeIs('stages.*') ? 'poste' : 'fonction';

        return [
            'alumni_id' => [Rule::requiredIf(! $this->user()->isRole('alumni')), 'nullable', 'integer', Rule::exists('alumni', 'id')],
            'entreprise_id' => [$creating ? 'required' : 'sometimes', 'integer', Rule::exists('entreprises', 'id')],
            'date_debut' => [$creating ? 'required' : 'sometimes', 'date'],
            'date_fin' => ['sometimes', 'nullable', 'date'],
            $title => [$creating ? 'required' : 'sometimes', 'string', 'max:150'],
            'type_contrat' => ['sometimes', 'nullable', 'string', 'max:60'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }
}