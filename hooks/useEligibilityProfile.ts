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
 *
 * Les instances du hook s'abonnent aux mises à jour du cache : un `refetch()`
 * ou une invalidation met tout le monde au même profil (pull-to-refresh, etc.).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, type UserProfile } from '@/services/userProfile';
import type { EligibilityProfile } from '@/utils/eligibility';

let cached: { userId: number; profile: UserProfile | null } | null = null;
let inflight: Promise<UserProfile | null> | null = null;

const eligibilityListeners = new Set<() => void>();
/** Permet de relancer le fetch du hook quand le cache module est vidé sans changement d’utilisateur. */
const eligibilityInvalidateSubscribers = new Set<() => void>();

function notifyEligibilityProfileListeners(): void {
  for (const fn of eligibilityListeners) {
    try {
      fn();
    } catch {
      /* noop */
    }
  }
}

function notifyEligibilityInvalidateSubscribers(): void {
  for (const fn of eligibilityInvalidateSubscribers) {
    try {
      fn();
    } catch {
      /* noop */
    }
  }
}

export function invalidateEligibilityProfileCache() {
  cached = null;
  inflight = null;
  notifyEligibilityProfileListeners();
  notifyEligibilityInvalidateSubscribers();
}

export function useEligibilityProfile(): {
  profile: EligibilityProfile | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const { user, getValidAccessToken } = useAuth();
  const [profile, setProfile] = useState<EligibilityProfile | null>(() => {
    if (!user?.id) return null;
    if (cached && cached.userId === user.id && cached.profile) {
      return toEligibility(cached.profile);
    }
    return null;
  });
  /** `true` dès le premier rendu si un chargement réseau est nécessaire (évite un flash de valeurs « défaut »). */
  const [loading, setLoading] = useState<boolean>(() => {
    if (!user?.id) return false;
    if (cached && cached.userId === user.id && cached.profile) return false;
    return true;
  });
  const lastUserIdRef = useRef<number | null>(user?.id ?? null);
  const [invalidateEpoch, setInvalidateEpoch] = useState(0);

  useEffect(() => {
    const bump = () => setInvalidateEpoch((n) => n + 1);
    eligibilityInvalidateSubscribers.add(bump);
    return () => {
      eligibilityInvalidateSubscribers.delete(bump);
    };
  }, []);

  /** Garde le state aligné quand le cache module change (autre écran, refetch, invalidation). */
  useEffect(() => {
    const syncFromCache = () => {
      const uid = user?.id;
      if (!uid) {
        setProfile(null);
        return;
      }
      if (cached && cached.userId === uid && cached.profile) {
        setProfile(toEligibility(cached.profile));
      } else if (!cached || cached.userId !== uid || !cached.profile) {
        setProfile(null);
      }
    };
    eligibilityListeners.add(syncFromCache);
    syncFromCache();
    return () => {
      eligibilityListeners.delete(syncFromCache);
    };
  }, [user?.id]);

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
          cached = { userId: user.id!, profile: null };
          setProfile(null);
        }
        notifyEligibilityProfileListeners();
      } catch {
        inflight = null;
        if (!cancelled) {
          setProfile(null);
          notifyEligibilityProfileListeners();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchOnce();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getValidAccessToken, invalidateEpoch]);

  const refetch = useCallback(async () => {
    if (!user?.id) return;
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      const result = await getUserProfile(token);
      cached = { userId: user.id, profile: result };
      notifyEligibilityProfileListeners();
    } catch {
      /* conserve le cache existant */
    }
  }, [user?.id, getValidAccessToken]);

  return { profile, loading, refetch };
}

function toEligibility(p: UserProfile): EligibilityProfile {
  return {
    bacType: p.bacType ?? null,
    filiere: p.filiere ?? null,
    specialite1: p.specialite1 ?? null,
    specialite2: p.specialite2 ?? null,
    specialite3: p.specialite3 ?? null,
    bacAnnee: p.bacAnnee ?? null,
    niveau: p.niveau ?? null,
  };
}
