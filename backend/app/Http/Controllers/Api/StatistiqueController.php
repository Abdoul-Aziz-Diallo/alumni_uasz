<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\Emploi;
use App\Models\Filiere;
use App\Models\Stage;
use Illuminate\Http\Request;

class StatistiqueController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isRole('coordinateur_master', 'responsable_filiere', 'chef_departement'), 403);
        $filieres = $user->isRole('chef_departement') ? Filiere::query() : $user->filieres();
        $filieres->where('filieres.is_demo', $user->is_demo);
        $filiereIds = $filieres->pluck('filieres.id');
        $alumniQuery = Alumni::query()->where('is_demo', $user->is_demo);
        if (! $user->isRole('chef_departement')) $alumniQuery->whereIn('filiere_id', $filiereIds);
        $alumniIds = (clone $alumniQuery)->pluck('id');

        return response()->json([
            'alumni' => $alumniIds->count(),
            'filieres' => $filiereIds->count(),
            'stages' => Stage::where('is_demo', $user->is_demo)->whereIn('alumni_id', $alumniIds)->count(),
            'emplois' => Emploi::where('is_demo', $user->is_demo)->whereIn('alumni_id', $alumniIds)->count(),
            'insertion' => $alumniIds->isEmpty() ? null : round(100 * $alumniQuery->whereHas('emplois', fn ($q) => $q->whereNull('date_fin'))->count() / $alumniIds->count(), 1),
            'par_filiere' => Alumni::query()->where('is_demo', $user->is_demo)->selectRaw('filiere_id, COUNT(*) as total')->when(! $user->isRole('chef_departement'), fn ($q) => $q->whereIn('filiere_id', $filiereIds))->groupBy('filiere_id')->with('filiere:id,nom')->get(),
        ]);
    }
}
