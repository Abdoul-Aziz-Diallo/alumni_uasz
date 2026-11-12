import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { PageTitle, Panel, Loading, Empty, Notice } from '../components/PageUI.jsx';
import { roleName } from '../components/AppShell.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const isAlumni = user.role === 'alumni';
    const requests = isAlumni
      ? Promise.all([api('/api/stages?per_page=1'), api('/api/emplois?per_page=1'), api('/api/participations/moi?per_page=1'), api('/api/activites?per_page=3')])
          .then(([stages, jobs, events, activities]) => ({ cards: [['Mes stages', stages.total], ['Mes emplois', jobs.total], ['Mes participations', events.total]], activities: activities.data || [] }))
      : Promise.all([api('/api/statistiques'), api('/api/activites?per_page=3')])
          .then(([stats, activities]) => ({ cards: [['Alumni', stats.alumni], ['Filières', stats.filieres], ['Stages', stats.stages], ['Emplois', stats.emplois], ['Insertion', stats.insertion == null ? '—' : `${stats.insertion}%`]], activities: activities.data || [] }));
    requests.then((result) => { if (active) setData(result); }).catch((reason) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [user.role]);

  const role = user.role;
  const quickLinks = role === 'alumni'
    ? [['Mon profil', '/espace/profil'], ['Ajouter un stage', '/espace/stages'], ['Voir les activités', '/espace/activites']]
    : [['Annuaire alumni', '/espace/alumni'], ['Filières et promotions', '/espace/formations'], ['Gérer les activités', '/espace/activites'], ['Consulter les rapports', '/espace/rapports']];
  return <>
    <PageTitle eyebrow={roleName(role)} title={`Bonjour${user.prenom ? `, ${user.prenom}` : ''}`} description="Retrouvez les informations et raccourcis associés à votre espace." />
    {error && <Notice>{error}</Notice>}
    {!data && !error ? <Loading /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(data?.cards || []).map(([label, value]) => <Panel key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-uasz-950">{value ?? '—'}</p><p className="mt-2 text-xs text-slate-400">Donnée issue de la plateforme</p></Panel>)}</div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-uasz-950">Activités à venir</h2><p className="mt-1 text-xs text-slate-500">Activités publiées par le département</p></div><Link className="text-sm font-semibold text-uasz-700 hover:underline" to="/espace/activites">Tout voir</Link></div>{!data?.activities?.length ? <Empty>Aucune activité publiée pour le moment.</Empty> : <div className="divide-y divide-slate-100">{data.activities.map((event) => <div key={event.id} className="flex flex-col justify-between gap-2 px-5 py-4 sm:flex-row sm:items-center"><div><p className="font-medium text-slate-800">{event.titre}</p><p className="mt-1 text-sm text-slate-500">{event.lieu} · {event.date}</p></div><span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{event.type || 'Rencontre'}</span></div>)}</div>}</Panel>
        <Panel className="p-5"><h2 className="font-semibold text-uasz-950">Accès rapides</h2><div className="mt-4 grid gap-2">{quickLinks.map(([label, href]) => <Link key={href} to={href} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-uasz-700/40 hover:bg-sand-50"><span>{label}</span><span className="text-uasz-700">→</span></Link>)}</div></Panel>
      </div>
    </>}
  </>;
}
