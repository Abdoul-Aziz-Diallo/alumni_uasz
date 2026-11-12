<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activite;
use App\Models\Participation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ParticipationController extends Controller
{
    public function mine(Request $request)
    {
        abort_unless($request->user()->role === 'alumni' && $request->user()->alumni, 403);
        return Participation::with('activite')->where('is_demo', $request->user()->is_demo)->where('alumni_id', $request->user()->alumni->id)->latest('date_inscription')->paginate(15);
    }

    public function register(Request $request, Activite $activite)
    {
        abort_unless($request->user()->role === 'alumni' && $request->user()->alumni, 403);
        abort_unless($activite->is_demo === $request->user()->is_demo, 404);
        if ($activite->filiere_id && (int) $activite->filiere_id !== (int) $request->user()->alumni->filiere_id) abort(403);
        $participation = DB::transaction(function () use ($request, $activite) {
            $event = Activite::whereKey($activite->id)->lockForUpdate()->firstOrFail();
            if ($event->statut !== 'publiee' || $event->date->lt(today())) {
                throw ValidationException::withMessages(['activite' => ['Les inscriptions pour cette activité ne sont pas ouvertes.']]);
            }
            if ($event->date_limite_inscription && $event->date_limite_inscription->isPast()) {
                throw ValidationException::withMessages(['activite' => ['La date limite d’inscription est passée.']]);
            }
            $alumniId = $request->user()->alumni->id;
            if (Participation::where('activite_id', $event->id)->where('alumni_id', $alumniId)->exists()) {
                return null;
            }
            if ($event->capacite && Participation::where('activite_id', $event->id)->count() >= $event->capacite) {
                throw ValidationException::withMessages(['activite' => ['Cette activité a atteint sa capacité maximale.']]);
            }
            return Participation::create(['alumni_id' => $alumniId, 'activite_id' => $event->id, 'is_demo' => $request->user()->is_demo]);
        });
        if (! $participation) return response()->json(['message' => 'Vous êtes déjà inscrit à cette activité.'], 409);
        return response()->json($participation->load('activite'), 201);
    }

    public function cancel(Request $request, Participation $participation)
    {
        abort_unless($request->user()->role === 'alumni' && $request->user()->alumni?->is($participation->alumni), 403);
        abort_if($participation->activite()->whereDate('date', '<=', today())->exists(), 409, 'L’inscription ne peut plus être annulée.');
        $participation->delete();
        return response()->noContent();
    }

    public function attendees(Activite $activite)
    {
        Gate::authorize('viewParticipants', $activite);
        return $activite->participations()->where('is_demo', request()->user()->is_demo)->with('alumni.user')->orderBy('date_inscription')->paginate(50);
    }

    public function attendance(Request $request, Participation $participation)
    {
        Gate::authorize('markAttendance', $participation);
        $data = $request->validate(['presence' => ['required', 'boolean']]);
        $participation->update($data);
        return response()->json($participation->fresh());
    }
}
