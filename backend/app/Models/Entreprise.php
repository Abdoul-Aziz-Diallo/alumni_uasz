<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    protected $fillable = ['nom', 'secteur_activite', 'adresse', 'telephone', 'email', 'site_web', 'description', 'is_demo'];
    protected function casts(): array { return ['is_demo' => 'boolean']; }
    public function stages() { return $this->hasMany(Stage::class); }
    public function emplois() { return $this->hasMany(Emploi::class); }
}
