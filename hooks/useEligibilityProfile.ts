/**
 * Hook : profil étudiant pour le calcul d'éligibilité.
 *
 * Charge le profil utilisateur (`/api/user/profile`) une seule fois par session
 * et le met en cache en mémoire. Toutes les pages qui ont besoin d'évaluer
 * l'éligibilité (détail annonce, listings, cards) peuvent simplement appeler
 * `useEligibilityProfile()` sans déclencher de requêtes redondantes.
 *
 * Le cache est invalidé au logout (au prochain `useAuth().user` qui passe à
 * `null`, le hook réinitialise son état).
 */
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/services/userProfile';
import type { EligibilityProfile } from '@/utils/eligibility';

let cached: { userId: number; profile: UserProfile | null } | null = null;
let inflight: Promise<UserProfile | null> | null = null;

export function invalidateEligibilityProfileCache() {
  cached = null;
  inflight = null;
}

export function useEligibilityProfile(): {
  profile: EligibilityProfile | null;
  loading: boolean;
} {
  const { user, getValidAccessToken } = useAuth();
  const [profile, setProfile] = useState<EligibilityProfile | null>(() => {
    if (!user?.id) return null;
    if (cached && cached.userId === user.id && cached.profile) {
      return toEligibility(cached.profile);
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const lastUserIdRef = useRef<number | null>(user?.id ?? null);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      lastUserIdRef.current = null;
      setProfile(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (lastUserIdRef.current !== user.id) {
      // Changement d'utilisateur ⇒ on invalide le cache local de ce hook.
      cached = null;
      lastUserIdRef.current = user.id;
    }

    if (cached && cached.userId === user.id && cached.profile) {
      setProfile(toEligibility(cached.profile));
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    const fetchOnce = async () => {
      try {
        if (!inflight) {
          inflight = (async () => {
            const token = await getValidAccessToken();
            if (!token) return null;
            return await getUserProfile(token);
          })();
        }
        const result = await inflight;
        inflight = null;
        if (cancelled) return;
        if (result) {
          cached = { userId: user.id!, profile: result };
          setProfile(toEligibility(result));
        } else {
          setProfile(null);
        }
      } catch {
        inflight = null;
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchOnce();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getValidAccessToken]);

  return { profile, loading };
}

function toEligibility(p: UserProfile): EligibilityProfile {
  return {
    bacType: p.bacType ?? null,
    filiere: p.filiere ?? null,
    specialite1: p.specialite1 ?? null,
    specialite2: p.specialite2 ?? null,
    specialite3: p.specialite3 ?? null,
    bacAnnee: p.bacAnnee ?? null,
  };
}
