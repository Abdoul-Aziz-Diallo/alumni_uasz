<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $table = 'enseignants';
    protected $fillable = ['user_id', 'identifiant_professionnel', 'grade_academique', 'domaine_enseignement', 'filiere_id', 'coordonnees', 'date_prise_fonction', 'is_demo'];
    protected function casts(): array { return ['is_demo' => 'boolean']; }
    protected function casts(): array { return ['date_prise_fonction' => 'date']; }
    public function user() { return $this->belongsTo(User::class); }
    public function filiere() { return $this->belongsTo(Filiere::class); }
}
