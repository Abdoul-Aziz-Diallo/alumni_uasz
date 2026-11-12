<?php

namespace App\Http\Controllers\Api;

use App\Models\Emploi;

class EmploiController extends ExperienceController
{
    protected function modelClass(): string { return Emploi::class; }
    protected function titleField(): string { return 'fonction'; }
}
