<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveActiviteRequest;
use App\Models\Activite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ActiviteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Activite::query()->where('is_demo', $user?->is_demo ?? false)->withCount('participations');
        if ($user && ! $user->isRole('chef_departement')) {
            $filiereIds = $user->filieres()->select('filieres.id');
            if ($user->role === 'alumni' && $user->alumni?->filiere_id) {
                $filiereIds->union(\App\Models\Filiere::query()->select('id')->whereKey($user->alumni->filiere_id));
            }
            $query->where(function ($builder) use ($filiereIds) {
                $builder->whereNull('filiere_id')->orWhereIn('filiere_id', $filiereIds);
            });
        }
        $manager = $user?->isRole('coordinateur_master', 'responsable_filiere', 'chef_departement') ?? false;
        if (! $manager || ! $request->boolean('inclure_non_publiees')) {
            $query->where('statut', 'publiee')->whereDate('date', '>=', today());
        }
        return $query->orderBy('date')->paginate(min($request->integer('per_page', 15), 100));
    }

    public function show(Request $request, Activite $activite)
    {
        if ($request->user()) Gate::authorize('view', $activite);
        else abort_unless(! $activite->is_demo && $activite->statut === 'publiee', 404);
        return $activite->loadCount('participations');
    }

    public function store(SaveActiviteRequest $request)
    {
        $data = $request->validated();
        $data['createur_id'] = $request->user()->id;
        $data['is_demo'] = $request->user()->is_demo;
        return response()->json(Activite::create($data), 201);
    }

    public function update(SaveActiviteRequest $request, Activite $activite)
    {
        Gate::authorize('update', $activite);
        $activite->update($request->validated());
        return $activite->fresh()->loadCount('participations');
    }

    public function destroy(Activite $activite)
    {
        Gate::authorize('delete', $activite);
        $activite->delete();
        return response()->noContent();
    }
}
