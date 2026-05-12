/**
 * Chaîne de promesses « best-effort » (analytics, tracking) : évite tout rejet
 * non géré qui ferait apparaître une erreur dans LogBox / redbox alors que
 * l’échec réseau est attendu en dev (API arrêtée, mauvaise URL, etc.).
 *
 * Double enveloppe `async` + `try/catch` : sur certaines stacks (Expo Web /
 * Hermes), un simple `.catch(() => {})` sur la promesse renvoyée par une
 * fonction `async` peut encore remonter comme « Uncaught » si la chaîne
 * interne rejette avant l’attache du handler ; ce pattern neutralise tout
 * rejet issu de `fetch` / `requestJson`.
 */
export function fireAndForget(promise: Promise<unknown>): void {
  void (async () => {
    try {
      await promise;
    } catch {
      /* noop — analytics non bloquant */
    }
  })();
}
