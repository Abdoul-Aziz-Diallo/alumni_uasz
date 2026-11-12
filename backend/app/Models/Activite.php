<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activite extends Model
{
    protected $table = 'activites';
    protected $fillable = ['titre', 'description', 'type', 'date', 'heure', 'lieu', 'capacite', 'date_limite_inscription', 'statut', 'createur_id', 'filiere_id', 'is_demo'];
    protected function casts(): array { return ['date' => 'date', 'date_limite_inscription' => 'datetime', 'is_demo' => 'boolean']; }
    public function createur() { return $this->belongsTo(User::class, 'createur_id'); }
    public function filiere() { return $this->belongsTo(Filiere::class); }
    public function participations() { return $this->hasMany(Participation::class); }
}
