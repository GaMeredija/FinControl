import type { ApiEnvelope } from '../types/api';

type ApiRequest = RequestInit & {
  token?: string | null;
  jsonBody?: unknown;
};

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init: ApiRequest = {},
): Promise<T> {
  const url = new URL(path, ensureBaseUrl(baseUrl));
  const headers = new Headers(init.headers);

  if (init.jsonBody !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      ...init,
      headers,
      body: init.jsonBody !== undefined ? JSON.stringify(init.jsonBody) : init.body,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique a URL configurada.');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : { message: await response.text() };

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: string }).message)
        : 'Falha na requisição.';

    throw new Error(message);
  }

  return payload as T;
}

export async function healthFetch(baseUrl: string) {
  return apiFetch<ApiEnvelope<{ status?: string; dataProvider?: string; timestamp?: string }>>(
    baseUrl,
    '/health',
    { method: 'GET' },
  );
}

function ensureBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim();

  if (!trimmed) {
    throw new Error('Informe uma URL de API válida.');
  }

  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}
