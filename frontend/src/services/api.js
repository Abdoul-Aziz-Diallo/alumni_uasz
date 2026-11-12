const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function readCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

export async function csrfCookie() {
  const response = await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: 'include' });
  if (!response.ok) throw new Error('Impossible d’initialiser la session sécurisée.');
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = readCookie('XSRF-TOKEN');
    if (token) headers.set('X-XSRF-TOKEN', token);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method,
      headers,
      credentials: 'include',
      body: options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
    });
  } catch {
    throw new Error('Le serveur est injoignable. Vérifiez que Laravel est lancé.');
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 422 && payload?.errors) {
      throw new Error(Object.values(payload.errors).flat().join(' '));
    }
    if (response.status === 401 || response.status === 419) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    if (response.status === 403) throw new Error('Vous n’avez pas les droits pour cette action.');
    throw new Error(payload?.message || 'Une erreur est survenue. Réessayez.');
  }
  return payload;
}

export async function apiDownload(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = readCookie('XSRF-TOKEN');
    if (token) headers.set('X-XSRF-TOKEN', token);
  }
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, method, headers, credentials: 'include', body: options.body ? JSON.stringify(options.body) : undefined });
  } catch {
    throw new Error('Le serveur est injoignable. Vérifiez que Laravel est lancé.');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    if (response.status === 401 || response.status === 419) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    if (response.status === 403) throw new Error('Vous n’avez pas les droits pour cette action.');
    if (response.status === 422 && payload?.errors) throw new Error(Object.values(payload.errors).flat().join(' '));
    throw new Error(payload?.message || 'Le téléchargement a échoué. Réessayez.');
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || 'rapport_alumni';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export { API_BASE };
