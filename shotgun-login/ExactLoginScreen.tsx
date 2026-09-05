import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

/**
 * Exact visual implementation of the leftmost reference phone.
 * The source artwork is intentionally not recreated or restyled.
 */
export default function ExactLoginScreen() {
  return (
    <ImageBackground
      accessibilityLabel="Shotgun student rideshare login"
      resizeMode="contain"
      source={require('./login-reference.png')}
      style={styles.screen}
    >
      <View pointerEvents="box-none" style={styles.targets}>
        <Pressable
          accessibilityLabel="Continue"
          accessibilityRole="button"
          onPress={() => undefined}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', aspectRatio: 492 / 909 },
  targets: { ...StyleSheet.absoluteFillObject },
  continue: { position: 'absolute', left: '9%', right: '9%', bottom: '6.3%', height: '7.4%', borderRadius: 12 },
  pressed: { opacity: 0.72 },
});
