// AmbientBg.tsx — slow drifting gradient orbs (lava-lamp atmosphere).
// Ported from system.jsx AmbientBg(). CSS keyframe drifts -> Animated loops.

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { RadialGlow } from './RadialGlow';
import { W } from '../theme/theme';

interface AmbientBgProps {
  intensity?: number;
  includePulse?: boolean;
}

function useDrift(
  duration: number,
  keyframes: { x: number[]; y: number[]; scale: number[] }
) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, [duration]);
  const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: keyframes.x });
  const translateY = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: keyframes.y });
  const scale = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: keyframes.scale });
  return { transform: [{ translateX }, { translateY }, { scale }] };
}

export function AmbientBg({ intensity = 1, includePulse = false }: AmbientBgProps) {
  const { width, height } = Dimensions.get('window');

  // ambientDrift1: translate(-30%,20%) <-> (20%,-20%), scale 1<->1.1
  const drift1 = useDrift(28000, {
    x: [-460 * 0.3, 460 * 0.2, -460 * 0.3],
    y: [460 * 0.2, -460 * 0.2, 460 * 0.2],
    scale: [1, 1.1, 1],
  });
  // ambientDrift2: translate(30%,-25%) <-> (-25%,25%), scale 1<->1.15
  const drift2 = useDrift(32000, {
    x: [360 * 0.3, -360 * 0.25, 360 * 0.3],
    y: [-360 * 0.25, 360 * 0.25, -360 * 0.25],
    scale: [1, 1.15, 1],
  });

  // ambientPulse: scale 0.9<->1.1, opacity 0.7<->1
  const pulseV = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!includePulse) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseV, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseV, { toValue: 0, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [includePulse]);
  const pulseScale = pulseV.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const pulseOpacity = pulseV.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* purple orb — bottom-left drift */}
      <Animated.View style={[{ position: 'absolute', left: -width * 0.15, bottom: -height * 0.15 }, drift1]}>
        <RadialGlow
          width={460} height={460}
          stops={[
            { offset: 0, color: W.primary, opacity: 0.18 * intensity },
            { offset: 0.62, color: W.primary, opacity: 0 },
          ]}
        />
      </Animated.View>

      {/* teal orb — top-right drift */}
      <Animated.View style={[{ position: 'absolute', right: -width * 0.1, top: -height * 0.15 }, drift2]}>
        <RadialGlow
          width={360} height={360}
          stops={[
            { offset: 0, color: W.accent, opacity: 0.1 * intensity },
            { offset: 0.6, color: W.accent, opacity: 0 },
          ]}
        />
      </Animated.View>

      {/* optional center pulse */}
      {includePulse && (
        <Animated.View
          style={{
            position: 'absolute', left: width / 2 - 250, top: height * 0.4 - 250,
            transform: [{ scale: pulseScale }], opacity: pulseOpacity,
          }}
        >
          <RadialGlow
            width={500} height={500}
            stops={[
              { offset: 0, color: W.secondary, opacity: 0.1 * intensity },
              { offset: 0.6, color: W.secondary, opacity: 0 },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
}
