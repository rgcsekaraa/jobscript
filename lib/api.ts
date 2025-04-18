// lib/api.ts
export async function fetchWithApiKey(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = localStorage.getItem('openai_api_key') || '';
  const headers = new Headers(options.headers);
  if (apiKey) {
    headers.set('X-OpenAI-Api-Key', apiKey);
  }
  return fetch(url, {
    ...options,
    headers,
  });
}
