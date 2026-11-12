<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    protected $fillable = ['alumni_id', 'entreprise_id', 'date_debut', 'date_fin', 'poste', 'description', 'is_demo'];
    protected function casts(): array { return ['date_debut' => 'date', 'date_fin' => 'date', 'is_demo' => 'boolean']; }
    public function alumni() { return $this->belongsTo(Alumni::class); }
    public function entreprise() { return $this->belongsTo(Entreprise::class); }
}
