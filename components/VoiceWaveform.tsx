import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface VoiceWaveformProps {
  isActive: boolean;
  color?: string;
}

export function VoiceWaveform({ isActive, color = '#8B5CF6' }: VoiceWaveformProps) {
  const animations = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    if (isActive) {
      const animateWave = () => {
        const randomAnimations = animations.map((anim, index) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: Math.random() * 0.8 + 0.2,
                duration: 300 + Math.random() * 400,
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: Math.random() * 0.8 + 0.2,
                duration: 300 + Math.random() * 400,
                useNativeDriver: false,
              }),
            ])
          );
        });

        Animated.parallel(randomAnimations).start();
      };

      animateWave();
    } else {
      animations.forEach((anim) => {
        anim.setValue(0.3);
      });
    }
  }, [isActive, animations]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 24],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});