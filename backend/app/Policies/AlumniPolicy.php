<?php

namespace App\Policies;

use App\Models\Alumni;
use App\Models\User;

class AlumniPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isRole('coordinateur_master', 'responsable_filiere', 'chef_departement');
    }

    public function view(User $user, Alumni $alumni): bool
    {
        if ($user->is_demo !== $alumni->is_demo) return false;
        if ($user->isRole('chef_departement')) return true;
        if ($user->role === 'alumni') return $user->alumni?->is($alumni) ?? false;
        if (! $user->isRole('coordinateur_master', 'responsable_filiere')) return false;

        return $alumni->filiere_id !== null
            && $user->filieres()->whereKey($alumni->filiere_id)->exists();
    }

    public function update(User $user, Alumni $alumni): bool
    {
        return $this->view($user, $alumni)
            && ($user->isRole('chef_departement', 'coordinateur_master', 'responsable_filiere')
                || ($user->role === 'alumni' && $user->alumni?->is($alumni)));
    }

    public function create(User $user): bool { return $user->isRole('chef_departement'); }
}
