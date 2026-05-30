import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { homeSectionHeaderStyles as header } from '@/components/home/homeSectionHeaderStyles';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  width: number;
  title: string;
  subtitle: string;
  accessibilityLabel: string;
  onSeeMore?: () => void;
  seeMoreLabel?: string;
  children: ReactNode;
};

export function HomeFeedSection({
  width,
  title,
  subtitle,
  accessibilityLabel,
  onSeeMore,
  seeMoreLabel,
  children,
}: Props) {
  const { t, isRTL } = useLocale();
  const seeMore = seeMoreLabel ?? t('homeSeeMore');

  return (
    <View
      style={[header.sectionWrap, { width }, isRTL && header.sectionWrapRtl]}
      accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          header.titleRow,
          header.titleRowWithTrailing,
          isRTL && header.titleRowRtl,
        ]}>
        <View style={[header.titleLeft, isRTL && header.titleLeftRtl]}>
          <View style={header.titleAccent} />
          <View style={[header.titleTextCol, isRTL && header.titleTextColRtl]}>
            <Text style={[header.title, isRTL && header.titleRtl]} numberOfLines={2}>
              {title}
            </Text>
          </View>
        </View>
        {onSeeMore ? (
          <Pressable
            onPress={onSeeMore}
            hitSlop={8}
            style={({ pressed }) => [styles.seeMorePill, pressed && styles.seeMorePressed]}
            accessibilityRole="button"
            accessibilityLabel={seeMore}>
            <Text style={[styles.seeMoreTxt, isRTL && styles.seeMoreTxtRtl]} numberOfLines={1}>
              {seeMore}
            </Text>
            <FontAwesome
              name={isRTL ? 'angle-left' : 'angle-right'}
              size={12}
              color={homeShell.blue}
            />
          </Pressable>
        ) : null}
      </View>
      <Text style={[header.subtitle, isRTL && header.subtitleRtl]}>{subtitle}</Text>
      {children}
    </View>
  );
}

export const homeFeedCardShadow =
  Platform.OS === 'android'
    ? { elevation: 6 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      };

/** Ombre renforcée — cartes blanches sur fond blanc (liens pratiques). */
export const practicalLinkCardShadow =
  Platform.OS === 'android'
    ? { elevation: 12 }
    : {
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      };

const styles = StyleSheet.create({
  seeMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.16)',
    flexShrink: 0,
    maxWidth: '42%',
  },
  seeMorePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  seeMoreTxt: {
    color: homeShell.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.05,
  },
  seeMoreTxtRtl: {
    writingDirection: 'rtl',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
