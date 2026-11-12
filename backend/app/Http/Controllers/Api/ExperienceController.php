<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveExperienceRequest;
use App\Models\Alumni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

abstract class ExperienceController extends Controller
{
    abstract protected function modelClass(): string;
    abstract protected function titleField(): string;

    public function index(Request $request)
    {
        $class = $this->modelClass();
        Gate::authorize('viewAny', $class);
        $user = $request->user();
        $query = $class::query()->where('is_demo', $user->is_demo)->with(['entreprise', 'alumni.user']);
        if ($user->role === 'alumni') {
            abort_unless($user->alumni, 404, 'Profil alumni introuvable.');
            $query->where('alumni_id', $user->alumni->id);
        } elseif (! $user->isRole('chef_departement')) {
            $query->whereHas('alumni', fn ($q) => $q->whereIn('filiere_id', $user->filieres()->select('filieres.id')));
        }
        if ($request->filled('q')) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $request->string('q')->trim()).'%';
            $query->where(function ($builder) use ($term) {
                $builder->where($this->titleField(), 'like', $term)
                    ->orWhereHas('entreprise', fn ($company) => $company->where('nom', 'like', $term));
            });
        }
        if ($request->filled('alumni_id') && $user->isRole('chef_departement', 'coordinateur_master', 'responsable_filiere')) {
            $query->where('alumni_id', $request->integer('alumni_id'));
        }
        return $query->latest('date_debut')->paginate(min($request->integer('per_page', 15), 100));
    }

    public function store(SaveExperienceRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $alumni = $user->role === 'alumni' ? $user->alumni : Alumni::findOrFail($data['alumni_id']);
        abort_unless($alumni, 404, 'Profil alumni introuvable.');
        Gate::authorize('view', $alumni);
        $title = $this->titleField();
        if (! isset($data[$title])) throw ValidationException::withMessages([$title => ['Ce champ est obligatoire.']]);
        if (isset($data['date_fin'], $data['date_debut']) && $data['date_fin'] < $data['date_debut']) {
            throw ValidationException::withMessages(['date_fin' => ['La date de fin doit suivre la date de début.']]);
        }
        $data['alumni_id'] = $alumni->id;
        $data['is_demo'] = $user->is_demo;
        $class = $this->modelClass();
        $record = $class::create($data);
        return response()->json($record->load('entreprise'), 201);
    }

    public function show(Request $request, int $id)
    {
        $record = $this->modelClass()::with(['entreprise', 'alumni.user'])->findOrFail($id);
        Gate::authorize('view', $record);
        return response()->json($record);
    }

    public function update(SaveExperienceRequest $request, int $id)
    {
        $record = $this->modelClass()::findOrFail($id);
        Gate::authorize('update', $record);
        $data = $request->validated();
        unset($data['alumni_id']);
        $begin = $data['date_debut'] ?? $record->date_debut->toDateString();
        $end = $data['date_fin'] ?? $record->date_fin?->toDateString();
        if ($end && $end < $begin) throw ValidationException::withMessages(['date_fin' => ['La date de fin doit suivre la date de début.']]);
        $record->update($data);
        return response()->json($record->fresh()->load('entreprise'));
    }

    public function destroy(int $id)
    {
        $record = $this->modelClass()::findOrFail($id);
        Gate::authorize('delete', $record);
        $record->delete();
        return response()->noContent();
    }
}
