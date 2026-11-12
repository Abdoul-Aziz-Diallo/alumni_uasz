<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diplome extends Model
{
    protected $fillable = ['intitule', 'annee_obtention', 'is_demo'];
    protected function casts(): array { return ['is_demo' => 'boolean']; }
    public function alumni() { return $this->hasOne(Alumni::class); }
}
