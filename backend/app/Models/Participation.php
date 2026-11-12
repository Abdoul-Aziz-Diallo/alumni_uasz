<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participation extends Model
{
    protected $fillable = ['alumni_id', 'activite_id', 'date_inscription', 'presence', 'is_demo'];
    protected function casts(): array { return ['date_inscription' => 'datetime', 'presence' => 'boolean', 'is_demo' => 'boolean']; }
    public function alumni() { return $this->belongsTo(Alumni::class); }
    public function activite() { return $this->belongsTo(Activite::class); }
}
