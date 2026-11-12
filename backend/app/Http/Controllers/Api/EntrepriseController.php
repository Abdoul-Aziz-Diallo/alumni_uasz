<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveEntrepriseRequest;
use App\Models\Entreprise;
use Illuminate\Http\Request;

class EntrepriseController extends Controller
{
    public function index(Request $request)
    {
        $query = Entreprise::query()->where('is_demo', $request->user()->is_demo)->withCount(['stages', 'emplois']);
        if ($request->filled('q')) $query->where('nom', 'like', '%'.$request->string('q')->trim().'%');
        return $query->orderBy('nom')->paginate(min($request->integer('per_page', 15), 100));
    }

    public function show(Entreprise $entreprise) { return $entreprise->loadCount(['stages', 'emplois']); }
    public function store(SaveEntrepriseRequest $request) { return response()->json(Entreprise::create([...$request->validated(), 'is_demo' => $request->user()->is_demo]), 201); }
    public function update(SaveEntrepriseRequest $request, Entreprise $entreprise) { $entreprise->update($request->validated()); return $entreprise->fresh(); }
    public function destroy(Entreprise $entreprise)
    {
        abort_unless(request()->user()?->isRole('chef_departement'), 403);
        if ($entreprise->stages()->exists() || $entreprise->emplois()->exists()) {
            return response()->json(['message' => 'Cette entreprise est référencée par des stages ou emplois.'], 409);
        }
        $entreprise->delete();
        return response()->noContent();
    }
}
