<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChefDepartement extends Model
{
    protected $table = 'chefs_departements';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $fillable = ['user_id', 'date_debut_mandat', 'date_fin_mandat', 'niveau_droits_admin'];
    protected function casts(): array { return ['date_debut_mandat' => 'date', 'date_fin_mandat' => 'date']; }
    public function user() { return $this->belongsTo(User::class); }
}
