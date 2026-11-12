<?php

namespace App\Http\Requests\Alumni;

use App\Models\Alumni;
use App\Models\Promotion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAlumniRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('update', $this->route('alumni')) ?? false; }

    public function rules(): array
    {
        return [
            'telephone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'adresse' => ['sometimes', 'nullable', 'string', 'max:200'],
            'annee_entree' => ['sometimes', 'nullable', 'integer', 'between:1980,'.(now()->year + 2)],
            'annee_sortie' => ['sometimes', 'nullable', 'integer', 'between:1980,'.(now()->year + 2)],
            'filiere_id' => ['sometimes', 'nullable', 'integer', Rule::exists('filieres', 'id')],
            'promotion_id' => ['sometimes', 'nullable', 'integer', Rule::exists('promotions', 'id')],
            'diplome_id' => ['sometimes', 'nullable', 'integer', Rule::exists('diplomes', 'id')],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $alumni = $this->route('alumni');
            if (! $alumni instanceof Alumni) return;

            $user = $this->user();
            $filiereId = $this->exists('filiere_id') ? $this->input('filiere_id') : $alumni->filiere_id;
            if ($this->exists('filiere_id') && $user->role === 'alumni' && (int) $filiereId !== (int) $alumni->filiere_id) {
                $validator->errors()->add('filiere_id', 'Un alumni ne peut pas changer sa filière de rattachement.');
            }
            if ($this->exists('filiere_id') && $user->isRole('coordinateur_master', 'responsable_filiere')
                && ! $user->filieres()->whereKey($filiereId)->exists()) {
                $validator->errors()->add('filiere_id', 'Cette filière ne fait pas partie de votre périmètre.');
            }

            $promotionId = $this->exists('promotion_id') ? $this->input('promotion_id') : $alumni->promotion_id;
            if ($promotionId && ! Promotion::whereKey($promotionId)->where('filiere_id', $filiereId)->exists()) {
                $validator->errors()->add('promotion_id', 'La promotion doit appartenir à la filière sélectionnée.');
            }
        }];
    }
}