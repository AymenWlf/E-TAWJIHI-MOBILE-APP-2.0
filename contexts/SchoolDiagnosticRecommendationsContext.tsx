import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { InteractionManager } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  fetchSchoolRecommendationDiagnosticByPublicCode,
  type SchoolDiagnosticRecommendationItem,
} from '@/services/schoolRecommendationDiagnostic';
import { fetchBacUserGrades } from '@/services/bacUserGrades';
import type { DiagnosticBacComparisonSummary } from '@/utils/diagnosticBacComparisonNote';
import {
  resolveSeuilBacComparisonNote,
  type SeuilComparisonSource,
} from '@/utils/seuilBacComparisonNote';
import {
  getSeuilCompatibilityForRow,
  type SeuilCompatibilityInfo,
} from '@/utils/schoolDiagnosticSeuilCompatibility';
import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import { subscribeSchoolDiagnosticRecommendationsRefresh } from '@/utils/schoolDiagnosticRecommendationsNotify';
import {
  applyDiagnosticHardBlocksToView,
  forcedZeroMilitaryCompatibilityView,
} from '@/utils/schoolDiagnosticHardBlocks';

export type DiagnosticRecommendationView = {
  establishmentId: number;
  combinedScore: number;
  bacFiliereCompatible?: boolean;
  seuilCompatibility: SeuilCompatibilityInfo;
};

export type SchoolDiagnosticRecommendationsLookup = {
  loading: boolean;
  ready: boolean;
  /** Diagnostic écoles finalisé (code public valide + chargement API réussi). */
  hasCompletedDiagnostic: boolean;
  bacComparison: DiagnosticBacComparisonSummary | null;
  /** Bulletin bac prioritaire sur le diagnostic pour les seuils, si notes enregistrées. */
  seuilComparisonSource: SeuilComparisonSource | null;
  /** Payload du dernier diagnostic (pour blocages affichage, ex. taille militaire). */
  diagnosticPayload: Record<string, unknown> | null;
  getByEstablishmentId: (establishmentId: number) => DiagnosticRecommendationView | null;
  getByAnnouncementId: (announcementId: number) => DiagnosticRecommendationView | null;
  /**
   * Reco API + blocage taille militaire « non » (0 %), y compris hors liste reco.
   */
  getCompatibilityForEstablishment: (args: {
    establishmentId: number;
    announcementId?: number;
    establishmentType?: string | null;
  }) => DiagnosticRecommendationView | null;
  refresh: () => void;
};

const Ctx = createContext<SchoolDiagnosticRecommendationsLookup | null>(null);

function toView(
  row: SchoolDiagnosticRecommendationItem,
  summary: DiagnosticBacComparisonSummary | null,
  payload: Record<string, unknown> | null,
): DiagnosticRecommendationView {
  const seuilCompatibility = getSeuilCompatibilityForRow(summary, row);
  const seuilBlock =
    row.seuilCompatible === false || seuilCompatibility.kind === 'not';
  const hardBlock =
    row.bacFiliereCompatible === false ||
    row.militaryCriteriaCompatible === false ||
    seuilBlock;
  const base: DiagnosticRecommendationView = {
    establishmentId: row.establishmentId,
    combinedScore: hardBlock ? 0 : row.combinedScore,
    bacFiliereCompatible:
      row.bacFiliereCompatible === false || row.militaryCriteriaCompatible === false
        ? false
        : row.bacFiliereCompatible,
    seuilCompatibility,
  };

  return applyDiagnosticHardBlocksToView(base, payload, row.typeEcole);
}

export function SchoolDiagnosticRecommendationsProvider({ children }: { children: ReactNode }) {
  const { user, getValidAccessToken } = useAuth();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [byEstablishment, setByEstablishment] = useState<Map<number, DiagnosticRecommendationView>>(
    () => new Map(),
  );
  const [byAnnouncement, setByAnnouncement] = useState<Map<number, DiagnosticRecommendationView>>(
    () => new Map(),
  );
  const [bacComparison, setBacComparison] = useState<DiagnosticBacComparisonSummary | null>(null);
  const [seuilComparisonSource, setSeuilComparisonSource] = useState<SeuilComparisonSource | null>(null);
  const [diagnosticPayload, setDiagnosticPayload] = useState<Record<string, unknown> | null>(null);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const code =
        (await resolveUserDiagnosticPublicCode(
          getValidAccessToken,
          user?.id ?? null,
          { uiLocale: locale === 'ar' ? 'ar' : 'fr' },
        )) ?? '';
      if (!/^[a-f0-9]{32}$/.test(code)) {
        setByEstablishment(new Map());
        setByAnnouncement(new Map());
        setBacComparison(null);
        setSeuilComparisonSource(null);
        setDiagnosticPayload(null);
        setHasCompletedDiagnostic(false);
        setReady(true);
        return;
      }

      const token = await getValidAccessToken();
      const [data, bacGrades] = await Promise.all([
        fetchSchoolRecommendationDiagnosticByPublicCode(code, token),
        fetchBacUserGrades(),
      ]);
      const pl = (data.payload ?? {}) as Record<string, unknown>;
      const { summary, source } = resolveSeuilBacComparisonNote(pl, bacGrades);
      const estMap = new Map<number, DiagnosticRecommendationView>();
      const annMap = new Map<number, DiagnosticRecommendationView>();

      setDiagnosticPayload(pl);

      for (const row of data.recommendations ?? []) {
        const view = toView(row, summary, pl);
        estMap.set(row.establishmentId, view);
        const aid = row.inscriptionConcours?.announcementId;
        if (typeof aid === 'number' && aid > 0) {
          annMap.set(aid, view);
        }
      }

      setByEstablishment(estMap);
      setByAnnouncement(annMap);
      setBacComparison(summary);
      setSeuilComparisonSource(source);
      setHasCompletedDiagnostic(true);
      setReady(true);
    } catch {
      setByEstablishment(new Map());
      setByAnnouncement(new Map());
      setBacComparison(null);
      setSeuilComparisonSource(null);
      setDiagnosticPayload(null);
      setHasCompletedDiagnostic(false);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, [getValidAccessToken, locale, user?.id]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void load();
    });
    return () => task.cancel();
  }, [load]);

  useEffect(() => subscribeSchoolDiagnosticRecommendationsRefresh(() => void load()), [load]);

  const getCompatibilityForEstablishment = useCallback(
    (args: {
      establishmentId: number;
      announcementId?: number;
      establishmentType?: string | null;
    }): DiagnosticRecommendationView | null => {
      const { establishmentId, announcementId, establishmentType } = args;
      let rec: DiagnosticRecommendationView | null = null;
      if (typeof announcementId === 'number' && announcementId > 0) {
        rec = byAnnouncement.get(announcementId) ?? null;
        if (!rec && establishmentId > 0) {
          rec = byEstablishment.get(establishmentId) ?? null;
        }
      } else if (establishmentId > 0) {
        rec = byEstablishment.get(establishmentId) ?? null;
      }
      if (rec) {
        return applyDiagnosticHardBlocksToView(rec, diagnosticPayload, establishmentType);
      }
      return forcedZeroMilitaryCompatibilityView(
        establishmentId,
        diagnosticPayload,
        establishmentType,
      );
    },
    [diagnosticPayload, byEstablishment, byAnnouncement],
  );

  const value = useMemo<SchoolDiagnosticRecommendationsLookup>(
    () => ({
      loading,
      ready,
      hasCompletedDiagnostic,
      bacComparison,
      seuilComparisonSource,
      diagnosticPayload,
      getByEstablishmentId: (establishmentId: number) =>
        byEstablishment.get(establishmentId) ?? null,
      getByAnnouncementId: (announcementId: number) =>
        byAnnouncement.get(announcementId) ?? null,
      getCompatibilityForEstablishment,
      refresh: () => void load(),
    }),
    [
      loading,
      ready,
      hasCompletedDiagnostic,
      bacComparison,
      seuilComparisonSource,
      diagnosticPayload,
      byEstablishment,
      byAnnouncement,
      getCompatibilityForEstablishment,
      load,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSchoolDiagnosticRecommendations(): SchoolDiagnosticRecommendationsLookup {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      'useSchoolDiagnosticRecommendations must be used within SchoolDiagnosticRecommendationsProvider',
    );
  }
  return ctx;
}

export function resolveDiagnosticRecommendationForAnnouncement(
  lookup: SchoolDiagnosticRecommendationsLookup,
  announcementId: number,
  establishmentId?: number | null,
): DiagnosticRecommendationView | null {
  const byAnn = lookup.getByAnnouncementId(announcementId);
  if (byAnn) return byAnn;
  if (typeof establishmentId === 'number' && establishmentId > 0) {
    return lookup.getByEstablishmentId(establishmentId);
  }
  return null;
}
