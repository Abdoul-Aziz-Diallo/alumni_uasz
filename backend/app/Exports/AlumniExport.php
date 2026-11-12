<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AlumniExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(private readonly Collection $alumni) {}
    public function collection(): Collection { return $this->alumni; }
    public function headings(): array { return ['Nom', 'Prénom', 'E-mail', 'Filière', 'Promotion', 'Année de sortie', 'Entreprise actuelle', 'Fonction']; }
    public function map($alumni): array
    {
        $job = $alumni->emplois->sortByDesc('date_debut')->first();
        return [
            $alumni->user?->nom, $alumni->user?->prenom, $alumni->user?->email,
            $alumni->filiere?->nom, $alumni->promotion?->code, $alumni->annee_sortie,
            $job?->entreprise?->nom, $job?->fonction,
        ];
    }
}