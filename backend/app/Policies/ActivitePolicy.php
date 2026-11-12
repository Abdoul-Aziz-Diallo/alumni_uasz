<?php

namespace App\Policies;

use App\Models\Activite;
use App\Models\Participation;
use App\Models\User;

class ActivitePolicy
{
    public function view(User $user, Activite $activite): bool
    {
        if ($user->is_demo !== $activite->is_demo) return false;
        if ($user->isRole('chef_departement')) return true;
        if ($activite->statut !== 'publiee') return false;
        if ($user->isRole('coordinateur_master', 'responsable_filiere')) {
            return $activite->filiere_id === null || $user->filieres()->whereKey($activite->filiere_id)->exists();
        }
        return $user->role === 'alumni';
    }

    public function create(User $user): bool
    {
        return $user->isRole('coordinateur_master', 'responsable_filiere', 'chef_departement');
    }

    public function update(User $user, Activite $activite): bool
    {
        if ($user->is_demo !== $activite->is_demo) return false;
        if ($user->isRole('chef_departement')) return true;
        return $user->isRole('coordinateur_master', 'responsable_filiere')
            && $activite->filiere_id !== null
            && $user->filieres()->whereKey($activite->filiere_id)->exists();
    }

    public function delete(User $user, Activite $activite): bool
    {
        return $this->update($user, $activite);
    }

    public function viewParticipants(User $user, Activite $activite): bool
    {
        return $this->update($user, $activite);
    }

    public function markAttendance(User $user, Participation $participation): bool
    {
        return $this->viewParticipants($user, $participation->activite);
    }
}
