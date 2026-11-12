<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumni extends Model
{
    protected $table = 'alumni';
    protected $fillable = ['user_id', 'telephone', 'adresse', 'annee_entree', 'annee_sortie', 'filiere_id', 'promotion_id', 'diplome_id', 'is_demo'];
    protected function casts(): array { return ['is_demo' => 'boolean']; }
    public function user() { return $this->belongsTo(User::class); }
    public function filiere() { return $this->belongsTo(Filiere::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }
    public function diplome() { return $this->belongsTo(Diplome::class); }
    public function stages() { return $this->hasMany(Stage::class); }
    public function emplois() { return $this->hasMany(Emploi::class); }
    public function participations() { return $this->hasMany(Participation::class); }
}
