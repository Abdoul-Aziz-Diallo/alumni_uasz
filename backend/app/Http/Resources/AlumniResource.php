<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlumniResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_demo' => (bool) $this->is_demo,
            'telephone' => $this->telephone,
            'adresse' => $this->adresse,
            'annee_entree' => $this->annee_entree,
            'annee_sortie' => $this->annee_sortie,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'nom' => $this->user->nom,
                'prenom' => $this->user->prenom,
                'email' => $this->user->email,
                'statut' => $this->user->statut,
            ]),
            'filiere' => $this->whenLoaded('filiere'),
            'promotion' => $this->whenLoaded('promotion'),
            'diplome' => $this->whenLoaded('diplome'),
            'stages_count' => $this->whenCounted('stages'),
            'emplois_count' => $this->whenCounted('emplois'),
        ];
    }
}
