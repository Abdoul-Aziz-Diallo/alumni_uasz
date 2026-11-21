<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoordinateurMaster extends Model
{
    protected $table = 'coordinateurs_master';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $fillable = ['user_id', 'filiere_master_rattachee', 'date_debut_mandat', 'date_fin_mandat'];
    protected function casts(): array { return ['date_debut_mandat' => 'date', 'date_fin_mandat' => 'date']; }
    public function user() { return $this->belongsTo(User::class); }
    public function filiereMaster() { return $this->belongsTo(Filiere::class, 'filiere_master_rattachee'); }
}
