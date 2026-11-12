<?php

namespace App\Policies;

use App\Models\Alumni;
use App\Models\User;

class ExperiencePolicy
{
    public function viewAny(User $user): bool { return $user->isRole('alumni', 'coordinateur_master', 'responsable_filiere', 'chef_departement'); }
    public function create(User $user): bool { return $user->isRole('alumni', 'coordinateur_master', 'responsable_filiere', 'chef_departement'); }
    public function view(User $user, object $experience): bool { return $this->canManageAlumni($user, $experience->alumni); }
    public function update(User $user, object $experience): bool { return $this->canManageAlumni($user, $experience->alumni); }
    public function delete(User $user, object $experience): bool { return $this->canManageAlumni($user, $experience->alumni); }

    private function canManageAlumni(User $user, Alumni $alumni): bool
    {
        if ($user->is_demo !== $alumni->is_demo) return false;
        if ($user->isRole('chef_departement')) return true;
        if ($user->role === 'alumni') return $user->alumni?->is($alumni) ?? false;
        return $user->isRole('coordinateur_master', 'responsable_filiere')
            && $alumni->filiere_id !== null
            && $user->filieres()->whereKey($alumni->filiere_id)->exists();
    }
}
