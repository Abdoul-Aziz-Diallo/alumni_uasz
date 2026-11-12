<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'statut' => $this->statut,
            'is_demo' => (bool) $this->is_demo,
            'alumni' => $this->whenLoaded('alumni', fn () => $this->alumni),
            'filieres' => $this->whenLoaded('filieres', fn () => $this->filieres->map(fn ($filiere) => ['id' => $filiere->id, 'nom' => $filiere->nom])),
        ];
    }
}
