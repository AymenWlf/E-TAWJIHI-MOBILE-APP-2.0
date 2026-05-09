import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { PaginationDots } from '@/components/home/PaginationDots';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  title: string;
  updatedAt: string;
  metricLabel: string;
  metricValue: string;
  balanceLabel: string;
  balanceValue: string;
  onPrimary?: () => void;
  onSecondary1?: () => void;
  onSecondary2?: () => void;
};

export function MainDashboardCard({
  title,
  updatedAt,
  metricLabel,
  metricValue,
  balanceLabel,
  balanceValue,
  onPrimary,
  onSecondary1,
  onSecondary2,
}: Props) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.updated}>{updatedAt}</Text>

        <View style={styles.metricBox}>
          <View style={styles.metricLeft}>
            <Text style={styles.metricLbl}>{metricLabel}</Text>
            <Text style={styles.metricVal}>{metricValue}</Text>
          </View>
          <View style={styles.metricRight}>
            <FontAwesome name="university" size={18} color={homeShell.textMuted} />
            <Text style={styles.balVal}>{balanceValue}</Text>
            <Text style={styles.balLbl}>{balanceLabel}</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable
            onPress={onPrimary}
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.92 }]}>
            <Text style={styles.btnPrimaryTxt}>Continuer</Text>
          </Pressable>
          <Pressable
            onPress={onSecondary1}
            style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.9 }]}>
            <Text style={styles.btnGhostTxt}>Dossier</Text>
          </Pressable>
          <Pressable
            onPress={onSecondary2}
            style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.9 }]}>
            <Text style={styles.btnGhostTxt}>Aide</Text>
          </Pressable>
        </View>
      </View>
      <PaginationDots total={3} activeIndex={1} onDark={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    color: homeShell.cardText,
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  updated: {
    marginTop: 4,
    color: homeShell.cardMuted,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  metricBox: {
    marginTop: spacing.lg,
    backgroundColor: homeShell.blueDeep,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLeft: {
    flex: 1,
  },
  metricLbl: {
    color: homeShell.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  metricVal: {
    marginTop: 4,
    color: homeShell.green,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  metricRight: {
    alignItems: 'flex-end',
    paddingLeft: spacing.md,
  },
  balVal: {
    color: homeShell.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginTop: 4,
  },
  balLbl: {
    color: homeShell.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  btnRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: homeShell.blue,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  btnPrimaryTxt: {
    color: homeShell.text,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  btnGhost: {
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: homeShell.card,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  btnGhostTxt: {
    color: homeShell.blueDeep,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});
