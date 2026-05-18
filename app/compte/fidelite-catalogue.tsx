import { Redirect } from 'expo-router';

/** Ancienne page catalogue points — redirige vers le parrainage. */
export default function LoyaltyCatalogueRedirect() {
  return <Redirect href="/compte/fidelite" />;
}
