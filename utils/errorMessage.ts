export function errorMessage(e: unknown): string {
  if (e instanceof Error) {
    return e.message || e.name;
  }
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

