import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { EstablishmentLeadGenModal } from '@/components/schools/EstablishmentLeadGenModal';
import type { EstablishmentNormalized } from '@/services/establishments';
import type { ListingPlacementInfo } from '@/services/referencingAds';

type LeadGenSheetTarget = {
  establishment: Pick<EstablishmentNormalized, 'id' | 'nom' | 'sigle' | 'nomArabe'>;
  placement: ListingPlacementInfo;
};

type EstablishmentLeadGenSheetContextValue = {
  openLeadGenSheet: (
    establishment: LeadGenSheetTarget['establishment'],
    placement: ListingPlacementInfo,
  ) => void;
  closeLeadGenSheet: () => void;
};

const EstablishmentLeadGenSheetContext = createContext<EstablishmentLeadGenSheetContextValue | null>(
  null,
);

/**
 * Monte le formulaire « Nous contacter » au niveau écran (pas dans la carte FlatList)
 * pour un vrai bottom sheet plein écran sur iOS/Android.
 */
export function EstablishmentLeadGenSheetProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<LeadGenSheetTarget | null>(null);

  const openLeadGenSheet = useCallback(
    (establishment: LeadGenSheetTarget['establishment'], placement: ListingPlacementInfo) => {
      setTarget({ establishment, placement });
    },
    [],
  );

  const closeLeadGenSheet = useCallback(() => {
    setTarget(null);
  }, []);

  const value = useMemo(
    () => ({ openLeadGenSheet, closeLeadGenSheet }),
    [openLeadGenSheet, closeLeadGenSheet],
  );

  return (
    <EstablishmentLeadGenSheetContext.Provider value={value}>
      <View style={styles.host}>
        {children}
        {target ? (
          <EstablishmentLeadGenModal
            visible
            onClose={closeLeadGenSheet}
            establishment={target.establishment}
            placement={target.placement}
          />
        ) : null}
      </View>
    </EstablishmentLeadGenSheetContext.Provider>
  );
}

export function useEstablishmentLeadGenSheet(): EstablishmentLeadGenSheetContextValue {
  const ctx = useContext(EstablishmentLeadGenSheetContext);
  if (!ctx) {
    throw new Error('useEstablishmentLeadGenSheet must be used within EstablishmentLeadGenSheetProvider');
  }
  return ctx;
}

export function useEstablishmentLeadGenSheetOptional(): EstablishmentLeadGenSheetContextValue | null {
  return useContext(EstablishmentLeadGenSheetContext);
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
