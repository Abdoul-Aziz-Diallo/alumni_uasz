<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $fillable = ['code', 'nom', 'description', 'active', 'is_demo'];
    protected function casts(): array { return ['active' => 'boolean', 'is_demo' => 'boolean']; }
    public function alumni() { return $this->hasMany(Alumni::class); }
    public function promotions() { return $this->hasMany(Promotion::class); }
    public function enseignants() { return $this->hasMany(Enseignant::class); }
    public function responsables() { return $this->belongsToMany(User::class)->withTimestamps(); }
}
