import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Empty, Loading, Notice, PageTitle, Panel } from '../components/PageUI.jsx';

export default function DirectoryPage() {
  const [filieres, setFilieres] = useState(null); const [promotions, setPromotions] = useState(null); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api('/api/filieres'), api('/api/promotions')]).then(([f, p]) => { setFilieres(f); setPromotions(p); }).catch((e) => setError(e.message)); }, []);
  return <>
    <PageTitle eyebrow="Offre de formation" title="Filières & promotions" description="Consultez les formations rattachées à votre périmètre d’enseignement." />
    {error && <div className="mb-4"><Notice>{error}</Notice></div>}
    <div className="grid gap-6 xl:grid-cols-2"><Panel><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-uasz-950">Filières accessibles</h2></div>{filieres === null ? <Loading /> : !filieres.length ? <Empty>Aucune filière associée à votre compte.</Empty> : <div className="divide-y divide-slate-100">{filieres.map((f) => <article key={f.id} className="px-5 py-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium text-slate-800">{f.nom}</h3><span className="rounded-full bg-sand-100 px-2.5 py-1 text-xs text-slate-600">{f.code}</span></div>{f.description && <p className="mt-2 text-sm text-slate-600">{f.description}</p>}<p className="mt-2 text-xs text-slate-500">{f.alumni_count} alumni · {f.promotions_count} promotions</p></article>)}</div>}</Panel>
      <Panel><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-uasz-950">Promotions</h2></div>{promotions === null ? <Loading /> : !promotions.length ? <Empty>Aucune promotion accessible.</Empty> : <div className="divide-y divide-slate-100">{promotions.map((p) => <article key={p.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><h3 className="font-medium text-slate-800">Promotion {p.annee}</h3><p className="mt-1 text-sm text-slate-500">{p.filiere?.nom || 'Filière'}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{p.code}</span></article>)}</div>}</Panel>
    </div>
  </>;
}
