<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveFiliereRequest;
use App\Models\Filiere;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Filiere::query()->where('is_demo', $user->is_demo)->withCount(['alumni', 'promotions'])->orderBy('nom');
        if (! $user->isRole('chef_departement')) {
            $ids = $user->filieres()->select('filieres.id');
            if ($user->role === 'alumni' && $user->alumni?->filiere_id) $ids->union(Filiere::query()->select('id')->whereKey($user->alumni->filiere_id));
            $query->whereIn('id', $ids);
        }
        return $query->get();
    }

    public function store(SaveFiliereRequest $request)
    {
        return response()->json(Filiere::create([...$request->validated(), 'is_demo' => $request->user()->is_demo]), 201);
    }

    public function update(SaveFiliereRequest $request, Filiere $filiere)
    {
        abort_unless($filiere->is_demo === $request->user()->is_demo, 404);
        $filiere->update($request->validated());
        return $filiere->fresh()->loadCount(['alumni', 'promotions']);
    }
}
