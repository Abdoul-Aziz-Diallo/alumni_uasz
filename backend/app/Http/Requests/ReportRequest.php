<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isRole('chef_departement', 'responsable_filiere', 'coordinateur_master') ?? false; }
    public function rules(): array
    {
        return [
            'format' => ['required', 'in:pdf,xlsx'],
            'filiere_id' => ['sometimes', 'nullable', 'integer', 'exists:filieres,id'],
            'promotion_id' => ['sometimes', 'nullable', 'integer', 'exists:promotions,id'],
            'annee' => ['sometimes', 'nullable', 'integer', 'between:1980,'.(now()->year + 2)],
        ];
    }
}