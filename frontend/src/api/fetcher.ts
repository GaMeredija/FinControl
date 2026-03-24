import { demoApiFetch, isDemoApiUrl } from '@/api/demoApi';

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, '');
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init: RequestInit & { token?: string | null; jsonBody?: unknown } = {},
): Promise<T> {
  const { token, jsonBody, headers: hdrs, method = 'GET', signal } = init;
  const headers: Record<string, string> = {
    ...(hdrs as Record<string, string> | undefined),
  };

  if (isDemoApiUrl(baseUrl)) {
    return demoApiFetch<T>(normalizeBase(baseUrl), path, {
      ...init,
      method,
      token,
      jsonBody,
      signal,
      headers,
    });
  }

  if (jsonBody !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${normalizeBase(baseUrl)}${path}`, {
      method,
      headers,
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
      signal,
    });
  } catch {
    throw new Error(
      'Não foi possível conectar à API. Verifique se o backend está em execução.',
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Falha na requisição.';
    throw new Error(msg);
  }

  return data as T;
}
