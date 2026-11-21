<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResponsableFiliere extends Model
{
    protected $table = 'responsables_filieres';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $fillable = ['user_id', 'perimetre_supervision', 'date_debut_mandat', 'date_fin_mandat'];
    protected function casts(): array { return ['date_debut_mandat' => 'date', 'date_fin_mandat' => 'date']; }
    public function user() { return $this->belongsTo(User::class); }
    public function rapportsExportes() { return $this->belongsToMany(Rapport::class, 'exportes', 'responsable_filiere_id', 'rapport_id')->withPivot('date_export'); }
}
