import { Redirect } from 'expo-router';

/**
 * Alignement web (`/etablissements` → listing) : le mur « Groupe BAC 2026 »
 * attache ce chemin ; l’app liste les établissements sur `/(tabs)/ecoles`.
 */
export default function EtablissementsListingRedirect() {
  return <Redirect href="/(tabs)/ecoles" />;
}
