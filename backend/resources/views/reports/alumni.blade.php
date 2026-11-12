<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;font-size:10px;color:#17372d}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd8d1;padding:6px;text-align:left}th{background:#e7f0eb}.meta{color:#52645b}</style></head>
<body>
<h1>Rapport des alumni — UASZ</h1>
<p class="meta">Généré le {{ $generatedAt->format('d/m/Y H:i') }} · {{ $alumni->count() }} profils</p>
<table><thead><tr><th>Nom</th><th>Prénom</th><th>E-mail</th><th>Filière</th><th>Promotion</th><th>Sortie</th><th>Entreprise</th><th>Fonction</th></tr></thead><tbody>
@foreach($alumni as $item) @php($job = $item->emplois->sortByDesc('date_debut')->first())
<tr><td>{{ $item->user?->nom }}</td><td>{{ $item->user?->prenom }}</td><td>{{ $item->user?->email }}</td><td>{{ $item->filiere?->nom }}</td><td>{{ $item->promotion?->code }}</td><td>{{ $item->annee_sortie }}</td><td>{{ $job?->entreprise?->nom }}</td><td>{{ $job?->fonction }}</td></tr>
@endforeach
</tbody></table>
</body></html>