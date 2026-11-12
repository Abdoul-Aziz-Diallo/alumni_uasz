<?php

namespace App\Http\Controllers\Api;

use App\Models\Stage;

class StageController extends ExperienceController
{
    protected function modelClass(): string { return Stage::class; }
    protected function titleField(): string { return 'poste'; }
}
