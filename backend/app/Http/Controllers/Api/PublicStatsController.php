<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activite;
use App\Models\Alumni;
use App\Models\Emploi;
use App\Models\Filiere;

class PublicStatsController extends Controller
{
    public function __invoke()
    {
        $base = Alumni::query()->where('is_demo', false);
        $total = (clone $base)->count();
        $inserted = (clone $base)->whereHas('emplois', fn ($query) => $query->where('is_demo', false)->whereNull('date_fin'))->count();

        return response()->json([
            'alumni' => $total,
            'filieres' => Filiere::where('active', true)->where('is_demo', false)->count(),
            'activites' => Activite::where('is_demo', false)->where('statut', 'publiee')->whereDate('date', '>=', today())->count(),
            'insertion' => $total === 0 ? null : round(100 * $inserted / $total, 1),
            'demonstration' => false,
        ]);
    }
}
