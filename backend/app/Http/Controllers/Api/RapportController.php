<?php

namespace App\Http\Controllers\Api;

use App\Exports\AlumniExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Models\Alumni;
use App\Models\Rapport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isRole('chef_departement', 'responsable_filiere', 'coordinateur_master'), 403);
        $query = Rapport::query()->where('is_demo', $request->user()->is_demo)->latest('date_generation');
        if (! $request->user()->isRole('chef_departement')) $query->where('genere_par', $request->user()->id);
        return $query->paginate(20);
    }

    public function store(ReportRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $query = Alumni::query()->where('is_demo', $user->is_demo)->with(['user', 'filiere', 'promotion', 'emplois.entreprise']);

        if (! $user->isRole('chef_departement')) {
            $query->whereIn('filiere_id', $user->filieres()->select('filieres.id'));
        }
        if (! empty($data['filiere_id'])) {
            if (! $user->isRole('chef_departement') && ! $user->filieres()->whereKey($data['filiere_id'])->exists()) {
                abort(403, 'Cette filière ne fait pas partie de votre périmètre.');
            }
            $query->where('filiere_id', $data['filiere_id']);
        }
        if (! empty($data['promotion_id'])) $query->where('promotion_id', $data['promotion_id']);
        if (! empty($data['annee'])) $query->where('annee_sortie', $data['annee']);
        $alumni = $query->orderBy('id')->get();
        abort_if($alumni->isEmpty(), 404, 'Aucune donnée ne correspond aux filtres.');

        $metadata = ['filiere_id' => $data['filiere_id'] ?? null, 'promotion_id' => $data['promotion_id'] ?? null, 'annee' => $data['annee'] ?? null, 'lignes' => $alumni->count()];
        Rapport::create(['type' => $data['format'], 'metadata' => $metadata, 'genere_par' => $user->id, 'is_demo' => $user->is_demo]);

        if ($data['format'] === 'xlsx') return Excel::download(new AlumniExport($alumni), 'rapport_alumni.xlsx');
        return Pdf::loadView('reports.alumni', ['alumni' => $alumni, 'generatedAt' => now()])->setPaper('a4', 'landscape')->download('rapport_alumni.pdf');
    }
}
