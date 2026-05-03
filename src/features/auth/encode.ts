// Build the Base64 payload for HTTP Basic Auth.
// btoa() only handles latin-1; encode UTF-8 first so non-ASCII passwords work.
export function buildBasicCredential(login: string, password: string): string {
  const text = `${login}:${password}`;
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
