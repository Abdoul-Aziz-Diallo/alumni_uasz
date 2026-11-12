<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLES = ['alumni', 'coordinateur_master', 'responsable_filiere', 'chef_departement'];

    protected $fillable = ['name', 'nom', 'prenom', 'email', 'password', 'role', 'statut', 'is_demo'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'is_demo' => 'boolean'];
    }

    public function alumni() { return $this->hasOne(Alumni::class); }
    public function enseignant() { return $this->hasOne(Enseignant::class); }
    public function filieres() { return $this->belongsToMany(Filiere::class)->withTimestamps(); }
    public function rapports() { return $this->hasMany(Rapport::class, 'genere_par'); }
    public function isRole(string ...$roles): bool { return in_array($this->role, $roles, true); }
}
