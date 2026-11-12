<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavePromotionRequest;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::query()->where('is_demo', $request->user()->is_demo)->with('filiere:id,nom')->orderByDesc('annee');
        if (! $request->user()->isRole('chef_departement')) {
            $ids = $request->user()->filieres()->select('filieres.id');
            if ($request->user()->role === 'alumni' && $request->user()->alumni?->filiere_id) {
                $ids->union(\App\Models\Filiere::query()->select('id')->whereKey($request->user()->alumni->filiere_id));
            }
            $query->whereIn('filiere_id', $ids);
        }
        return $query->get();
    }

    public function store(SavePromotionRequest $request)
    {
        return response()->json(Promotion::create([...$request->validated(), 'is_demo' => $request->user()->is_demo])->load('filiere:id,nom'), 201);
    }

    public function update(SavePromotionRequest $request, Promotion $promotion)
    {
        abort_unless($promotion->is_demo === $request->user()->is_demo, 404);
        $promotion->update($request->validated());
        return $promotion->fresh()->load('filiere:id,nom');
    }
}
