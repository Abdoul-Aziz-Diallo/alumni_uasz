<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Alumni;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UtilisateurController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isRole('chef_departement'), 403);
        $query = User::query()->whereIn('role', User::ROLES)->where('is_demo', $request->user()->is_demo)->with(['alumni', 'filieres'])->orderBy('nom')->orderBy('prenom');
        if ($request->filled('q')) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $request->string('q')->trim()).'%';
            $query->where(fn ($builder) => $builder->where('nom', 'like', $term)->orWhere('prenom', 'like', $term)->orWhere('email', 'like', $term));
        }
        if ($request->filled('role')) $query->where('role', $request->string('role'));
        return UserResource::collection($query->paginate(min($request->integer('per_page', 20), 100)));
    }

    public function store(SaveUserRequest $request)
    {
        $data = $request->validated();
        $isDemo = (bool) $request->user()->is_demo;
        $user = DB::transaction(function () use ($data, $isDemo) {
            $user = User::create([...$this->attributes($data), 'is_demo' => $isDemo]);
            $this->syncRelatedProfiles($user, $data);
            return $user;
        });
        return (new UserResource($user->load(['alumni', 'filieres'])))->response()->setStatusCode(201);
    }

    public function update(SaveUserRequest $request, User $utilisateur)
    {
        $data = $request->validated();
        DB::transaction(function () use ($utilisateur, $data) {
            $utilisateur->update($this->attributes($data, partial: true));
            $this->syncRelatedProfiles($utilisateur, $data);
        });
        return new UserResource($utilisateur->fresh()->load(['alumni', 'filieres']));
    }

    private function attributes(array $data, bool $partial = false): array
    {
        $attributes = [];
        foreach (['nom', 'prenom', 'email', 'role', 'statut', 'password'] as $key) {
            if (array_key_exists($key, $data) && ($key !== 'password' || $data[$key] !== null)) $attributes[$key] = $data[$key];
        }
        if (isset($data['nom']) || isset($data['prenom'])) {
            $attributes['name'] = ($data['prenom'] ?? '').' '.($data['nom'] ?? '');
        }
        if (! $partial && ! isset($attributes['statut'])) $attributes['statut'] = 'actif';
        return $attributes;
    }

    private function syncRelatedProfiles(User $user, array $data): void
    {
        if (isset($data['filiere_id']) && $user->isRole('coordinateur_master', 'responsable_filiere')) {
            $user->filieres()->sync([$data['filiere_id']]);
        }
        if ($user->role === 'alumni') {
            Alumni::firstOrCreate(['user_id' => $user->id], ['filiere_id' => $data['filiere_id'] ?? null, 'is_demo' => $user->is_demo]);
        }
    }
}
