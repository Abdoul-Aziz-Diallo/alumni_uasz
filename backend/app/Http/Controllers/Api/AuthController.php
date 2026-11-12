<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterAlumniRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(RegisterAlumniRequest $request): UserResource
    {
        $data = $request->validated();
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['prenom'].' '.$data['nom'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'alumni',
                'statut' => 'actif',
                'is_demo' => false,
            ]);
            $user->alumni()->create([
                'telephone' => $data['telephone'] ?? null,
                'adresse' => $data['adresse'] ?? null,
                'annee_entree' => $data['annee_entree'] ?? null,
                'annee_sortie' => $data['annee_sortie'] ?? null,
                'filiere_id' => $data['filiere_id'],
                'promotion_id' => $data['promotion_id'] ?? null,
                'is_demo' => false,
            ]);
            return $user;
        });

        return new UserResource($user->load('alumni'));
    }

    public function login(LoginRequest $request): UserResource
    {
        $credentials = $request->validated();
        if (! Auth::attempt($credentials, false)) {
            throw ValidationException::withMessages(['email' => ['Les identifiants fournis sont incorrects.']]);
        }

        $request->session()->regenerate();
        $user = $request->user();
        if (! in_array($user->role, User::ROLES, true)) {
            Auth::logout();
            $request->session()->invalidate();
            throw ValidationException::withMessages(['email' => ['Ce profil n’est plus autorisé. Contactez le département.']]);
        }
        if ($user->statut !== 'actif') {
            Auth::logout();
            $request->session()->invalidate();
            throw ValidationException::withMessages(['email' => ['Ce compte est désactivé.']]);
        }

        return new UserResource($user->load('alumni'));
    }

    public function me(Request $request): UserResource
    {
        abort_unless(in_array($request->user()->role, User::ROLES, true) && $request->user()->statut === 'actif', 403);
        return new UserResource($request->user()->load('alumni'));
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
