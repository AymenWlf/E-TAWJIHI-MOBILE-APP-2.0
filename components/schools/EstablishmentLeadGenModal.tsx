import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EstablishmentLeadGenForm,
  type LeadGenPickConfigMap,
  type LeadGenPickField,
} from '@/components/schools/EstablishmentLeadGenForm';
import { EstablishmentLeadGenSection } from '@/components/schools/EstablishmentLeadGenSection';
import { SearchablePickPanel } from '@/components/schools/SearchablePickSheet';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { useLocale } from '@/contexts/LocaleContext';
import type { EstablishmentNormalized } from '@/services/establishments';
import type { ListingPlacementInfo } from '@/services/referencingAds';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

const SHEET_SLIDE_MS = 320;

type Props = {
  visible: boolean;
  onClose: () => void;
  establishment: Pick<EstablishmentNormalized, 'id' | 'nom' | 'sigle' | 'nomArabe'>;
  placement: ListingPlacementInfo;
};

export function EstablishmentLeadGenModal({ visible, onClose, establishment, placement }: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const { isRTL, t } = useLocale();

  const [pickField, setPickField] = useState<LeadGenPickField | null>(null);
  const [pickConfig, setPickConfig] = useState<LeadGenPickConfigMap | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const pickOpen = pickField !== null;

  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(winH * 0.45);
  const keyboard = useAnimatedKeyboard();

  const scrollMaxH = Math.min(winH * 0.56, 460);

  const closeAll = useCallback(() => {
    Keyboard.dismiss();
    setPickField(null);
    onClose();
  }, [onClose]);

  const closePickOnly = useCallback(() => {
    Keyboard.dismiss();
    setPickField(null);
  }, []);

  const handlePickConfigSnapshot = useCallback((config: LeadGenPickConfigMap) => {
    setPickConfig(config);
  }, []);

  useEffect(() => {
    if (visible) {
      setLeadSubmitted(false);
      setMounted(true);
      backdropOpacity.value = withTiming(1, {
        duration: SHEET_SLIDE_MS,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(0, {
        duration: SHEET_SLIDE_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetTranslateY.value = withTiming(
      winH * 0.45,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
          runOnJS(setPickField)(null);
        }
      },
    );
  }, [visible, backdropOpacity, sheetTranslateY, winH]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value - keyboard.height.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <PlatformSheetOverlay
      visible={visible}
      keepMounted={mounted && !visible}
      onRequestClose={closeAll}
      animationType="slide"
      zIndex={12000}>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => {
            Keyboard.dismiss();
            closeAll();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('closeOverlayA11y')}
        />

        <View style={styles.sheetHost} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              pickOpen && styles.sheetBehindPick,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
            pointerEvents={pickOpen ? 'none' : 'auto'}>
            <EstablishmentLeadGenSection
              mode="sheet"
              showHandle
              showClose
              onClose={closeAll}
              establishment={establishment}
              placement={placement}
              formScrollMaxHeight={scrollMaxH}
              keyboardAware
              hideFormIntro={leadSubmitted}>
              <EstablishmentLeadGenForm
                establishment={establishment}
                placement={placement}
                variant="modal"
                externalPickField={pickField}
                onExternalPickFieldChange={setPickField}
                onPickConfigSnapshot={handlePickConfigSnapshot}
                onSubmitted={() => setLeadSubmitted(true)}
              />
            </EstablishmentLeadGenSection>
          </Animated.View>
        </View>

        {pickOpen && pickField && pickConfig ? (
          <View style={styles.pickRoot} pointerEvents="box-none">
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={closePickOnly}
              accessibilityRole="button"
              accessibilityLabel={t('closeOverlayA11y')}
            />
            <SearchablePickPanel
              isActive
              title={pickConfig[pickField].title}
              searchPlaceholder={t('schoolsSectorSearchPlaceholder')}
              emptyLabel={t('accountSelectNoResults')}
              allLabel={t('inscCandidaciesFilterAll')}
              items={pickConfig[pickField].items}
              selectedValue={pickConfig[pickField].value}
              rtl={isRTL}
              onClose={closePickOnly}
              onPick={(value: string) => {
                pickConfig[pickField].onPick(value);
                setPickField(null);
              }}
            />
          </View>
        ) : null}
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  sheetHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetBehindPick: {
    opacity: 0.35,
  },
  pickRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: 'flex-end',
  },
});
