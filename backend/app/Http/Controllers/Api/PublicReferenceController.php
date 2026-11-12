<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use App\Models\Promotion;

class PublicReferenceController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'filieres' => Filiere::query()->where('active', true)->where('is_demo', false)->orderBy('nom')->get(['id', 'code', 'nom']),
            'promotions' => Promotion::query()->where('is_demo', false)->with('filiere:id,nom')->orderByDesc('annee')->get(['id', 'code', 'annee', 'filiere_id']),
        ]);
    }
}
