import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { EventsListCardSkeleton } from '@/components/events/EventsListCardSkeleton';
import { spacing } from '@/theme/tokens';

type Props = {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Liste de cartes événement (onglet Agenda). */
export function EventsListSkeleton({ count = 3, isRTL = false, style }: Props) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, i) => (
        <EventsListCardSkeleton key={`ev-sk-${i}`} isRTL={isRTL} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
});
