<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    protected $fillable = ['type', 'date_generation', 'metadata', 'genere_par', 'is_demo'];
    protected function casts(): array { return ['date_generation' => 'datetime', 'metadata' => 'array', 'is_demo' => 'boolean']; }
    public function auteur() { return $this->belongsTo(User::class, 'genere_par'); }
    public function exportePar() { return $this->belongsToMany(ResponsableFiliere::class, 'exportes', 'rapport_id', 'responsable_filiere_id')->withPivot('date_export'); }
}
