import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export function formatScreenDateHeading(d = new Date()): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type Props = {
  showDate?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Less space under the date line (e.g. before a full-width hero). */
  tightBottom?: boolean;
};

export function ScreenBrandHeader({
  showDate = true,
  style,
  tightBottom = false,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel="FitTrack logo"
        />
        <Text style={styles.screenTitle}>FitTrack</Text>
      </View>
      {showDate ? (
        <Text
          style={[styles.dateLine, tightBottom && styles.dateLineTight]}
        >
          {formatScreenDateHeading()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    flexShrink: 1,
  },
  dateLine: {
    fontSize: 15,
    color: colors.sage,
    marginTop: 8,
    marginBottom: 24,
  },
  dateLineTight: {
    marginBottom: 12,
  },
});
