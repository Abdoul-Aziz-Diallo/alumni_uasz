import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/api.js';
import { Button, Empty, Field, Loading, Notice, PageTitle, Panel, SelectField } from '../components/PageUI.jsx';

const blank = { entreprise_id: '', date_debut: '', date_fin: '', title: '', type_contrat: '', description: '' };

export default function ExperiencePage({ kind }) {
  const { user } = useAuth();
  const isStage = kind === 'stages';
  const resource = isStage ? 'stages' : 'emplois';
  const titleField = isStage ? 'poste' : 'fonction';
  const [items, setItems] = useState([]); const [companies, setCompanies] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(null); const [filter, setFilter] = useState('');
  const [form, setForm] = useState(null); const [editing, setEditing] = useState(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setError(''); api(`/api/${resource}?per_page=100${filter ? `&q=${encodeURIComponent(filter)}` : ''}`).then((r) => { setPage(r); setItems(r.data || []); }).catch((e) => setError(e.message)); }, [resource, filter]);
  useEffect(() => { load(); api('/api/entreprises?per_page=100').then((r) => setCompanies(r.data || [])).catch(() => {}); if (user.role !== 'alumni') api('/api/alumni?per_page=100').then((r) => setAlumni(r.data || [])).catch(() => {}); }, [load, user.role]);
  function start(item = null) { setEditing(item?.id || null); setForm(item ? { ...blank, entreprise_id: item.entreprise_id, date_debut: item.date_debut?.slice(0, 10), date_fin: item.date_fin?.slice(0, 10) || '', title: item[titleField], type_contrat: item.type_contrat || '', description: item.description || '' } : { ...blank }); setError(''); }
  async function save(event) {
    event.preventDefault(); if (!form) return; setBusy(true); setError('');
    const body = { entreprise_id: Number(form.entreprise_id), date_debut: form.date_debut, date_fin: form.date_fin || null, [titleField]: form.title, description: form.description || null };
    if (!editing && user.role !== 'alumni') body.alumni_id = Number(form.alumni_id);
    if (!isStage) body.type_contrat = form.type_contrat || null;
    try { await api(`/api/${resource}${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', body }); setForm(null); setEditing(null); load(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(item) { if (!window.confirm('Supprimer cette expérience ?')) return; try { await api(`/api/${resource}/${item.id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); } }
  return <>
    <PageTitle eyebrow="Parcours professionnel" title={isStage ? 'Stages' : 'Emplois'} description={user.role === 'alumni' ? 'Gérez les expériences rattachées à votre profil.' : 'Consultez et gérez les expériences dans votre périmètre.'} action={<Button onClick={() => start()}>+ Ajouter</Button>} />
    {error && <div className="mb-4"><Notice>{error}</Notice></div>}
    {form && <Panel className="mb-5 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-uasz-950">{editing ? 'Modifier' : 'Nouvelle expérience'}</h2><button className="text-sm text-slate-500" type="button" onClick={() => setForm(null)}>Fermer</button></div><form onSubmit={save} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {user.role !== 'alumni' && !editing && <SelectField label="Profil alumni" required value={form.alumni_id || ''} onChange={(e) => setForm({ ...form, alumni_id: e.target.value })}><option value="">Sélectionner un alumni</option>{alumni.map((person) => <option key={person.id} value={person.id}>{person.user?.prenom} {person.user?.nom} · {person.filiere?.nom || 'Sans filière'}</option>)}</SelectField>}
      <SelectField label="Entreprise" required value={form.entreprise_id} onChange={(e) => setForm({ ...form, entreprise_id: e.target.value })}><option value="">Sélectionner une entreprise</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.nom}</option>)}</SelectField>
      <Field label={isStage ? 'Poste' : 'Fonction'} required maxLength="150" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      {!isStage && <Field label="Type de contrat" maxLength="60" value={form.type_contrat} onChange={(e) => setForm({ ...form, type_contrat: e.target.value })} />}
      <Field label="Date de début" type="date" required value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} />
      <Field label="Date de fin" type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
      <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">Description<textarea className="rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-uasz-700 focus:ring-2 focus:ring-uasz-700/15" rows="3" maxLength="10000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="sm:col-span-2 lg:col-span-3"><Button disabled={busy}>{busy ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Créer l’expérience'}</Button></div>
    </form></Panel>}
    <Panel><div className="border-b border-slate-100 p-4"><Field label="Filtrer par fonction ou poste" placeholder="Recherche sur les expériences disponibles" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>{!page ? <Loading /> : !items.length ? <Empty>Aucune expérience enregistrée.</Empty> : <div className="divide-y divide-slate-100">{items.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-800">{item[titleField]}</h2><p className="mt-1 text-sm text-slate-600">{item.entreprise?.nom || 'Entreprise'} · {item.date_debut}{item.date_fin ? ` — ${item.date_fin}` : ' — en cours'}</p>{user.role !== 'alumni' && <p className="mt-1 text-xs text-slate-500">{item.alumni?.user?.prenom} {item.alumni?.user?.nom}</p>}</div><div className="flex gap-2"><Button variant="secondary" onClick={() => start(item)}>Modifier</Button><Button variant="danger" onClick={() => remove(item)}>Supprimer</Button></div></article>)}</div>}{page?.total > 100 && <p className="border-t border-slate-100 p-3 text-center text-xs text-slate-500">Affichage limité aux 100 premières entrées.</p>}</Panel>
  </>;
}
