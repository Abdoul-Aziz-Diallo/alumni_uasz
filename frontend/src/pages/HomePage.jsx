import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

const links = [
  ['Accueil', '#accueil'], ['À propos', '#apropos'], ['Alumni', '#communaute'],
  ['Opportunités', '#opportunites'], ['Activités', '#activites'], ['Contact', '#contact'],
];

const features = [
  {
    number: '01',
    title: 'Réseau professionnel',
    description: 'Retrouvez les diplômés et faites grandir les liens entre générations.',
    image: '/images/image_reseau.jpg',
    imageAlt: 'Équipement informatique illustrant le réseau professionnel Alumni.',
  },
  {
    number: '02',
    title: 'Expériences partagées',
    description: 'Valorisez les parcours, stages et expériences professionnelles.',
    image: '/images/image_echange.jpg',
    imageAlt: 'Des alumni réunis autour d’un repas et d’un échange convivial.',
  },
  {
    number: '03',
    title: 'Rencontres et activités',
    description: 'Suivez les événements et participez à la vie de la communauté.',
    image: '/images/image_etudiant.jpg',
    imageAlt: 'Des étudiants échangent ensemble sur le campus.',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api('/api/public/statistiques').then((data) => { if (active) setStats(data); })
      .catch(() => { if (active) setStatsError(true); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-sand-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-uasz-900/10 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8" aria-label="Navigation principale">
          <Link to="/" className="flex items-center gap-3" aria-label="Alumni UASZ, accueil">
            <img src="/uasz-logo.png" alt="Logo de l’Université Assane Seck de Ziguinchor" className="h-12 w-12 object-contain" />
            <span className="leading-tight"><span className="block text-sm font-bold tracking-[0.12em] text-uasz-950">ALUMNI</span><span className="text-xs text-slate-500">Université Assane Seck</span></span>
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {links.map(([label, href]) => <a key={label} className="text-sm font-medium text-slate-600 transition hover:text-uasz-700" href={href}>{label}</a>)}
            <Link className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-uasz-900 transition hover:bg-sand-50" to="/connexion">Connexion</Link>
            <Link className="rounded-full bg-uasz-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-uasz-700" to="/inscription">Rejoindre</Link>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-uasz-950 lg:hidden" type="button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <span className="text-xl" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          </button>
        </nav>
        {menuOpen && <div className="border-t border-slate-100 bg-white px-5 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">{links.map(([label, href]) => <a key={label} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-sand-50" href={href}>{label}</a>)}<Link onClick={() => setMenuOpen(false)} className="mt-2 rounded-lg border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-uasz-900" to="/connexion">Connexion</Link><Link onClick={() => setMenuOpen(false)} className="rounded-lg bg-uasz-900 px-3 py-3 text-center text-sm font-semibold text-white" to="/inscription">Rejoindre</Link></div>
        </div>}
      </header>

      <main>
        <section id="accueil" className="relative overflow-hidden bg-uasz-950 text-white">
          <div className="absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -bottom-56 left-1/3 h-[34rem] w-[34rem] rounded-full border border-emerald-200/10" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100"><span className="h-2 w-2 rounded-full bg-amber-300" />Département Informatique · Ziguinchor</p>
              <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">La communauté <span className="text-emerald-200">Alumni UASZ</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Restons connectés, partageons nos expériences et construisons ensemble les opportunités de demain.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/inscription" className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-300 px-7 font-bold text-uasz-950 shadow-lg shadow-black/10 transition hover:bg-amber-200">Rejoindre la communauté <span className="ml-2" aria-hidden="true">→</span></Link>
                <Link to="/connexion" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-7 font-semibold text-white transition hover:bg-white/10">Se connecter</Link>
              </div>
              <p className="mt-7 text-sm text-white/55">Un réseau pour faire vivre les liens entre formation, parcours et avenir professionnel.</p>
            </div>
            <figure className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -inset-3 rotate-2 rounded-[2rem] border border-emerald-100/20 bg-emerald-100/5" aria-hidden="true" />
              <img src="/alumni-uasz.jpeg" alt="Deux membres de la communauté Alumni UASZ" className="relative aspect-[4/3] w-full rounded-[1.6rem] object-cover object-[center_28%] shadow-2xl shadow-black/40 sm:aspect-[5/4] lg:aspect-[4/3]" />
              <figcaption className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-white/15 bg-uasz-900/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:right-5 sm:w-64">
                <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">Une communauté vivante</span>
                <span className="mt-1 block text-sm text-white/85">Des parcours différents, un même lien avec l’UASZ.</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 pt-10 sm:px-8" aria-label="Statistiques issues de la plateforme">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-uasz-950/5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Alumni', stats?.alumni], ['Filières', stats?.filieres], ['Activités à venir', stats?.activites],
              ['Insertion', stats?.insertion == null ? null : `${stats.insertion}%`],
            ].map(([label, value]) => <div key={label} className="border-b border-slate-100 px-6 py-6 text-center last:border-0 sm:[&:nth-child(2)]:border-r lg:border-b-0 lg:border-r">
              <p className="text-3xl font-bold tracking-tight text-uasz-950">{value ?? (statsError ? '—' : '…')}</p><p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>)}
          </div>
          {statsError && <p className="mt-3 text-center text-xs text-slate-500">Les statistiques sont temporairement indisponibles.</p>}
          {stats && <p className="mt-3 text-center text-xs text-slate-400">Indicateurs calculés à partir des données actuellement enregistrées.</p>}
        </section>

        <section id="apropos" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-uasz-700">Le réseau Alumni UASZ</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-uasz-950 sm:text-4xl">L’université continue de nous réunir.</h2></div>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">Alumni UASZ rapproche les diplômés et les responsables de formation. La plateforme aide à garder le contact, valoriser les expériences et partager les initiatives du Département Informatique.</p>
          </div>
          <div id="communaute" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ number, title, description, image, imageAlt }) => <article key={number} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-uasz-950/10">
              <div className="h-48 overflow-hidden bg-sand-100 sm:h-52">
                <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-6 sm:p-7">
                <span className="text-sm font-bold text-amber-600">{number}</span>
                <h3 className="mt-4 text-lg font-semibold text-uasz-950">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </div>
            </article>)}
          </div>
        </section>

        <section id="opportunites" className="bg-sand-100/70">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-20">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-uasz-700">Parcours & opportunités</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-uasz-950">Les liens ouvrent de nouvelles perspectives.</h2><p className="mt-4 leading-7 text-slate-600">Consultez les expériences répertoriées, découvrez les entreprises associées et restez informé des activités publiées par le département.</p><Link to="/connexion" className="mt-7 inline-flex rounded-full bg-uasz-900 px-6 py-3 font-semibold text-white hover:bg-uasz-700">Accéder à mon espace <span className="ml-2">→</span></Link></div>
            <div id="activites" className="grid gap-3 sm:grid-cols-2">{[['Stages', 'Parcours de stage des alumni'], ['Emplois', 'Expériences et situations professionnelles'], ['Entreprises', 'Organisations liées aux parcours'], ['Activités', 'Rencontres et initiatives de la communauté']].map(([title, desc]) => <div key={title} className="rounded-xl border border-white bg-white/80 p-5"><h3 className="font-semibold text-uasz-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-uasz-900 px-7 py-9 text-white sm:px-10 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Gardons le lien</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Votre parcours fait partie de l’histoire UASZ.</h2></div><Link to="/inscription" className="inline-flex shrink-0 rounded-full bg-white px-6 py-3 font-bold text-uasz-950 hover:bg-emerald-50">Rejoindre Alumni UASZ</Link></div>
        </section>
      </main>
      <footer id="contact" className="bg-[#0b241f] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
          <div><Link to="/" className="font-bold tracking-[0.12em]">UASZ ALUMNI</Link><p className="mt-3 max-w-xs text-sm leading-6 text-white/60">Le réseau des diplômés du Département Informatique de l’Université Assane Seck de Ziguinchor.</p></div>
          <div><h2 className="text-sm font-semibold">Navigation</h2><div className="mt-3 grid gap-2 text-sm text-white/65"><a href="#apropos" className="hover:text-white">À propos</a><a href="#communaute" className="hover:text-white">Communauté</a><a href="#opportunites" className="hover:text-white">Opportunités</a><a href="#activites" className="hover:text-white">Activités</a></div></div>
          <div><h2 className="text-sm font-semibold">Institution</h2><p className="mt-3 text-sm leading-6 text-white/65">Université Assane Seck de Ziguinchor<br />Département Informatique<br />Ziguinchor, Sénégal</p><Link to="/connexion" className="mt-3 inline-block text-sm font-semibold text-emerald-200 hover:text-white">Accéder à la plateforme →</Link></div>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/45">© {new Date().getFullYear()} Alumni UASZ · Département Informatique</div>
      </footer>
    </div>
  );
}
