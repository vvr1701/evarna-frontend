// Avatar.tsx + Waveform — ported from system.jsx Avatar() and onboarding.jsx Waveform().

import React from 'react';
import { View, Image, Animated } from 'react-native';
import { RadialGlow } from './RadialGlow';
import { useRingBreathe, useWave } from '../theme/animations';
import { W, alpha } from '../theme/theme';

interface AvatarProps {
  name?: string;
  size?: number;
  color?: string;
  image?: string;
  breathe?: boolean;
}

export function Avatar({ size = 48, color = W.primary, image, breathe = true }: AvatarProps) {
  const ring = useRingBreathe();

  if (image) {
    return (
      <View style={{ width: size, height: size }}>
        {breathe && (
          <Animated.View
            style={[
              { position: 'absolute', left: -3, top: -3, right: -3, bottom: -3, borderRadius: (size + 6) / 2, borderWidth: 1.5, borderColor: color },
              ring,
            ]}
          />
        )}
        <Image source={{ uri: image }} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }} />
      </View>
    );
  }

  const bars = 5;
  const heights = [0.4, 0.7, 1, 0.7, 0.4];
  return (
    <View style={{ width: size, height: size }}>
      {breathe && (
        <Animated.View
          style={[
            { position: 'absolute', left: -3, top: -3, right: -3, bottom: -3, borderRadius: (size + 6) / 2, borderWidth: 1.5, borderColor: color },
            ring,
          ]}
        />
      )}
      <View
        style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 1.5, borderColor: alpha(color, 'aa'),
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden',
          shadowColor: color, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
        }}
      >
        <RadialGlow
          width={size} height={size} borderRadius={size / 2}
          cx={0.35} cy={0.3}
          style={{ position: 'absolute' }}
          stops={[
            { offset: 0, color, opacity: 0.31 },
            { offset: 0.75, color: W.surface1, opacity: 0.8 },
          ]}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {heights.map((h, i) => (
            <View key={i} style={{ width: 2, height: h * (size * 0.4), backgroundColor: color, borderRadius: 1, opacity: 0.85 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

interface WaveformProps {
  color: string;
  animate?: boolean;
  size?: number;
}

export function Waveform({ color, animate = false, size = 40 }: WaveformProps) {
  const heights = [0.4, 0.7, 1, 0.85, 0.5, 0.75];
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      {heights.map((h, i) => (
        <WaveBar key={i} color={color} height={size * h} animate={animate} delay={i * 100} />
      ))}
    </View>
  );
}

function WaveBar({ color, height, animate, delay }: { color: string; height: number; animate: boolean; delay: number }) {
  const wave = useWave(delay);
  return (
    <Animated.View
      style={[
        { width: 3, height, backgroundColor: color, borderRadius: 2, opacity: 0.8 },
        animate ? wave : undefined,
      ]}
    />
  );
}
