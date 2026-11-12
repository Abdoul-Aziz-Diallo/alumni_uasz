<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\UpdateAlumniRequest;
use App\Http\Resources\AlumniResource;
use App\Models\Alumni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AlumniController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Alumni::class);
        $user = $request->user();
        $query = Alumni::query()->with(['user', 'filiere', 'promotion', 'diplome'])->withCount(['stages', 'emplois']);
        $query->where('is_demo', $user->is_demo);

        if (! $user->isRole('chef_departement')) {
            $query->whereIn('filiere_id', $user->filieres()->select('filieres.id'));
        }
        if ($request->filled('filiere_id')) $query->where('filiere_id', $request->integer('filiere_id'));
        if ($request->filled('promotion_id')) $query->where('promotion_id', $request->integer('promotion_id'));
        if ($request->filled('q')) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $request->string('q')->trim()).'%';
            $query->whereHas('user', fn ($q) => $q->where('nom', 'like', $term)->orWhere('prenom', 'like', $term)->orWhere('email', 'like', $term));
        }

        return AlumniResource::collection($query->orderBy('id')->paginate(min($request->integer('per_page', 15), 100)));
    }

    public function show(Alumni $alumni): AlumniResource
    {
        Gate::authorize('view', $alumni);
        return new AlumniResource($alumni->load(['user', 'filiere', 'promotion', 'diplome'])->loadCount(['stages', 'emplois']));
    }

    public function update(UpdateAlumniRequest $request, Alumni $alumni): AlumniResource
    {
        $data = $request->validated();
        if (isset($data['promotion_id']) && isset($data['filiere_id'])) {
            abort_unless($alumni->filiere_id === (int) $data['filiere_id'], 422, 'La promotion doit correspondre à la filière de l’alumni.');
        }
        $alumni->fill($data)->save();
        return new AlumniResource($alumni->fresh()->load(['user', 'filiere', 'promotion', 'diplome']));
    }
}
