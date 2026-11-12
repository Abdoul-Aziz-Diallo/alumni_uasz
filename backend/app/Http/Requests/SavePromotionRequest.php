<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePromotionRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isRole('chef_departement') ?? false; }
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:30', Rule::unique('promotions', 'code')->ignore($this->route('promotion'))],
            'annee' => ['required', 'integer', 'between:1980,'.(now()->year + 2)],
            'filiere_id' => ['required', 'integer', 'exists:filieres,id', Rule::unique('promotions', 'annee')->where('filiere_id', $this->input('filiere_id'))->ignore($this->route('promotion'))],
        ];
    }
}
