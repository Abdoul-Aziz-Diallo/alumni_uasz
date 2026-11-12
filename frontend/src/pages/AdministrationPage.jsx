import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Button, Empty, Field, Loading, Notice, PageTitle, Panel, SelectField } from '../components/PageUI.jsx';

const tabs = { utilisateurs: '/api/utilisateurs?per_page=100', filieres: '/api/filieres', promotions: '/api/promotions' };
const roles = [['alumni','Alumni'],['coordinateur_master','Coordinateur de Master'],['responsable_filiere','Responsable des filières informatiques'],['chef_departement','Chef de département']];

export default function AdministrationPage() {
  const [tab, setTab] = useState('utilisateurs'); const [data, setData] = useState(null); const [filieres, setFilieres] = useState([]);
  const [form, setForm] = useState(null); const [editing, setEditing] = useState(null); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  function load() { setError(''); api(tabs[tab]).then((r) => { const rows = r.data || r; setData(rows); if (tab === 'filieres') setFilieres(rows); }).catch((e) => setError(e.message)); }
  useEffect(() => { setData(null); setForm(null); load(); api('/api/filieres').then((r) => setFilieres(r.data || r)).catch(() => {}); }, [tab]);
  function start(item = null) {
    setEditing(item?.id || null);
    if (tab === 'utilisateurs') setForm(item ? { nom: item.nom || '', prenom: item.prenom || '', email: item.email, role: item.role, statut: item.statut, filiere_id: item.filieres?.[0]?.id || '', password: '' } : { nom: '', prenom: '', email: '', role: 'alumni', statut: 'actif', filiere_id: '', password: '' });
    else if (tab === 'filieres') setForm(item ? { code: item.code, nom: item.nom, description: item.description || '', active: item.active } : { code: '', nom: '', description: '', active: true });
    else setForm(item ? { code: item.code, annee: item.annee, filiere_id: item.filiere_id } : { code: '', annee: new Date().getFullYear(), filiere_id: '' });
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    const body = { ...form }; if (!body.password) delete body.password;
    if ('active' in body) body.active = Boolean(body.active);
    if (body.filiere_id) body.filiere_id = Number(body.filiere_id); else if ('filiere_id' in body) body.filiere_id = null;
    if (body.annee) body.annee = Number(body.annee);
    try { await api(`${tabs[tab].split('?')[0]}${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', body }); setForm(null); setSuccess('Modifications enregistrées.'); load(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function toggleUser(user) { setError(''); try { await api(`/api/utilisateurs/${user.id}`, { method: 'PUT', body: { nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, statut: user.statut === 'actif' ? 'desactive' : 'actif' } }); setSuccess('Statut du compte mis à jour.'); load(); } catch (e) { setError(e.message); } }
  return <>
    <PageTitle eyebrow="Administration" title="Référentiels & comptes" description="Gérez les comptes, filières et promotions. La désactivation conserve les données et l’historique du compte." />
    {error && <div className="mb-4"><Notice>{error}</Notice></div>}{success && <div className="mb-4"><Notice tone="success">{success}</Notice></div>}
    <div className="mb-5 flex flex-wrap gap-2">{Object.keys(tabs).map((key) => <button key={key} onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === key ? 'bg-uasz-900 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-sand-50'}`}>{key}</button>)}<Button className="ml-auto" onClick={() => start()}>+ Ajouter</Button></div>
    {form && <Panel className="mb-5 p-5"><form onSubmit={save} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tab === 'utilisateurs' && <>
        <Field label="Prénom" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /><Field label="Nom" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /><Field label="E-mail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <SelectField label="Rôle" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</SelectField>
        <SelectField label="Filière associée" value={form.filiere_id} onChange={(e) => setForm({ ...form, filiere_id: e.target.value })}><option value="">Aucune</option>{filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}</SelectField>
        {!editing && <Field label="Mot de passe initial (12 caractères minimum)" type="password" minLength="12" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
        {editing && <Field label="Nouveau mot de passe (facultatif)" type="password" minLength="12" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
      </>}
      {tab === 'filieres' && <><Field label="Code" required maxLength="30" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /><Field label="Nom de la filière" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /><label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea className="rounded-lg border border-slate-300 p-3 font-normal" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Filière active</label></>}
      {tab === 'promotions' && <><Field label="Code" required maxLength="30" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /><Field label="Année" type="number" min="1980" max={new Date().getFullYear()+2} required value={form.annee} onChange={(e) => setForm({ ...form, annee: e.target.value })} /><SelectField label="Filière" required value={form.filiere_id} onChange={(e) => setForm({ ...form, filiere_id: e.target.value })}><option value="">Sélectionner</option>{filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}</SelectField></>}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><Button disabled={busy}>{busy ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer'}</Button><Button type="button" variant="secondary" onClick={() => setForm(null)}>Annuler</Button></div>
    </form></Panel>}
    <Panel>{data === null ? <Loading /> : !data.length ? <Empty>Aucun élément enregistré.</Empty> : <div className="divide-y divide-slate-100">{data.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="min-w-0">{tab === 'utilisateurs' && <><h2 className="font-semibold text-slate-800">{item.prenom} {item.nom}</h2><p className="mt-1 text-sm text-slate-500">{item.email} · {item.role}</p></>}{tab === 'filieres' && <><h2 className="font-semibold text-slate-800">{item.nom}</h2><p className="mt-1 text-sm text-slate-500">{item.code} · {item.alumni_count || 0} alumni · {item.promotions_count || 0} promotions</p></>}{tab === 'promotions' && <><h2 className="font-semibold text-slate-800">{item.code} · {item.annee}</h2><p className="mt-1 text-sm text-slate-500">{item.filiere?.nom}</p></>}</div><div className="flex items-center gap-2"><span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-slate-600">{tab === 'utilisateurs' ? item.statut : tab === 'filieres' ? item.active ? 'Active' : 'Inactive' : 'Promotion'}</span><Button variant="secondary" onClick={() => start(item)}>Modifier</Button>{tab === 'utilisateurs' && <Button variant="secondary" onClick={() => toggleUser(item)}>{item.statut === 'actif' ? 'Désactiver' : 'Réactiver'}</Button>}</div></article>)}</div>}</Panel>
  </>;
}
