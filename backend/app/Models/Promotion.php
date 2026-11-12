<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = ['code', 'annee', 'filiere_id', 'is_demo'];
    protected function casts(): array { return ['is_demo' => 'boolean']; }
    public function filiere() { return $this->belongsTo(Filiere::class); }
    public function alumni() { return $this->hasMany(Alumni::class); }
}
