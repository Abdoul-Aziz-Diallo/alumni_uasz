<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveFiliereRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isRole('chef_departement') ?? false; }
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:30', Rule::unique('filieres', 'code')->ignore($this->route('filiere'))],
            'nom' => ['required', 'string', 'max:120', Rule::unique('filieres', 'nom')->ignore($this->route('filiere'))],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
