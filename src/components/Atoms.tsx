// Atoms.tsx — Pill, PrimaryButton, Card, GlassPill, Toggle, ProgressDots,
// StatusPill, MemoryBadge, MemoryRef, Sparkles. Ported from system.jsx.
// backdrop-filter: blur() -> expo-blur BlurView wrappers.

import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Txt } from './Txt';
import { NavIcon } from './NavIcon';
import { W, alpha } from '../theme/theme';

// ─── Pill ───────────────────────────────────────────────────────────────
interface PillProps {
  children: React.ReactNode;
  active?: boolean;
  accent?: string;
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
export function Pill({ children, active, accent, color, onPress, style, textStyle }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          height: 44, paddingHorizontal: 18, borderRadius: 22,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: active ? accent || W.primary : W.surface1,
        },
        style,
      ]}
    >
      <Txt font="user" weight={500} style={[{ fontSize: 14, color: active ? '#fff' : color || W.text }, textStyle]}>
        {children}
      </Txt>
    </Pressable>
  );
}

// ─── PrimaryButton ──────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';
interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}
export function PrimaryButton({ children, onPress, disabled, style, variant = 'primary' }: PrimaryButtonProps) {
  const styles: Record<ButtonVariant, { bg: string; color: string; border?: string }> = {
    primary: { bg: W.primary, color: '#fff' },
    secondary: { bg: 'transparent', color: W.text, border: W.secondary },
    text: { bg: 'transparent', color: W.secondary },
    danger: { bg: W.danger, color: '#fff' },
  };
  const s = styles[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        {
          height: 48, paddingHorizontal: 24, borderRadius: 12,
          alignItems: 'center', justifyContent: 'center', width: '100%',
          backgroundColor: s.bg,
          borderWidth: s.border ? 1 : 0, borderColor: s.border,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Txt font="user" weight={500} style={{ fontSize: 15, color: s.color }}>{children}</Txt>
    </Pressable>
  );
}

// ─── Card (glassmorphic) ────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  border?: string | null;
  bg?: string;
  glass?: boolean;
  borderRadius?: number;
}
export function Card({ children, onPress, style, padding = 16, border, bg, glass = true, borderRadius = 16 }: CardProps) {
  const content = (
    <View
      style={[
        {
          borderRadius, padding,
          borderWidth: 1,
          borderColor: border || (glass ? 'rgba(124,114,255,0.10)' : 'transparent'),
          backgroundColor: glass ? bg || 'rgba(26,29,46,0.6)' : bg || W.surface1,
          overflow: 'hidden',
        },
        glass ? { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } } : undefined,
        style,
      ]}
    >
      {glass && (
        <BlurView intensity={28} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius }} />
      )}
      {children}
    </View>
  );
  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}

// ─── GlassPill ──────────────────────────────────────────────────────────
export function GlassPill({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          paddingVertical: 10, paddingHorizontal: 14,
          flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden',
          backgroundColor: 'rgba(26,29,46,0.5)',
          shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 32, shadowOffset: { width: 0, height: 8 },
        },
        style,
      ]}
    >
      <BlurView intensity={32} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      {children}
    </View>
  );
}

// ─── Toggle ─────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const v = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: value ? 1 : 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [value]);
  const left = v.interpolate({ inputRange: [0, 1], outputRange: [3, 21] });
  const bg = v.interpolate({ inputRange: [0, 1], outputRange: [W.surface2, W.primary] });
  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: bg, justifyContent: 'center' }}>
        <Animated.View style={{ position: 'absolute', top: 3, left, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
      </Animated.View>
    </Pressable>
  );
}

// ─── ProgressDots ───────────────────────────────────────────────────────
export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i < current ? W.primary : W.surface2 }} />
      ))}
    </View>
  );
}

// ─── StatusPill ─────────────────────────────────────────────────────────
export function StatusPill({ children, accent = W.text2, bg = W.surface1 }: { children: React.ReactNode; accent?: string; bg?: string }) {
  return (
    <View style={{ height: 28, paddingHorizontal: 12, backgroundColor: bg, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Txt font="user" weight={500} style={{ fontSize: 12, color: accent }}>{children}</Txt>
    </View>
  );
}

// ─── MemoryBadge ────────────────────────────────────────────────────────
export function MemoryBadge({ show, text = 'Memory saved' }: { show: boolean; text?: string }) {
  const v = useRef(new Animated.Value(show ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: show ? 1 : 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [show]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return (
    <Animated.View
      style={{
        backgroundColor: W.accentDim, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12,
        flexDirection: 'row', alignItems: 'center', gap: 6, opacity: v, transform: [{ translateY }],
      }}
    >
      <NavIcon name="check" color={W.accent} size={16} />
      <Txt font="user" weight={500} style={{ fontSize: 12, color: W.accent }}>{text}</Txt>
    </Animated.View>
  );
}

// ─── Sparkles ───────────────────────────────────────────────────────────
export function Sparkles({ count = 4 }: { count?: number }) {
  return (
    <View style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => {
        const dx = Math.cos(i * 1.4) * 18;
        const dy = Math.sin(i * 1.4) * 14 - 6;
        return <Sparkle key={i} dx={dx} dy={dy} delay={i * 70} />;
      })}
    </View>
  );
}
function Sparkle({ dx, dy, delay }: { dx: number; dy: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const opacity = v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] });
  return (
    <Animated.View
      style={{
        position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: W.accent,
        shadowColor: W.accent, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
        transform: [{ translateX }, { translateY }, { scale }], opacity,
      }}
    />
  );
}

// ─── MemoryRef ──────────────────────────────────────────────────────────
export function MemoryRef({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <Txt
      font="user" weight={500}
      onPress={onPress}
      style={{ color: W.accent, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: 'rgba(94,234,212,0.4)' }}
    >
      {children}
    </Txt>
  );
}

// ─── MinuteWarningBanner ─────────────────────────────────────────────────
// Ported from extras.jsx; used by the voice call + depleted flows. Lives here
// (shared) so both Chat and Extras screens can import without a cycle.
export function MinuteWarningBanner({ minutes, onTopUp }: { minutes: number | null; onTopUp?: () => void }) {
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  if (minutes == null) return null;

  let dotColor: string = W.accent;
  let urgency: 'low' | 'mid' | 'high' = 'low';
  if (minutes <= 5) { dotColor = W.secondary; urgency = 'mid'; }
  if (minutes <= 1) { dotColor = W.challenger; urgency = 'high'; }

  const dotScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });

  return (
    <View
      style={{
        marginHorizontal: 16, marginTop: 8,
        borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14,
        flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden',
        borderWidth: 1,
        borderColor: urgency === 'high' ? alpha(W.challenger, '26') : 'rgba(124,114,255,0.10)',
        backgroundColor: 'rgba(26,29,46,0.6)',
      }}
    >
      <BlurView intensity={20} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Animated.View
        style={{
          width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor,
          transform: [{ scale: dotScale }],
          shadowColor: dotColor, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
        }}
      />
      <Txt font="user" style={{ flex: 1, fontSize: 12, color: W.text2 }}>
        {minutes} {minutes === 1 ? 'minute' : 'minutes'} remaining{urgency === 'high' ? '. Top up to keep talking.' : ' this month'}
      </Txt>
      {urgency === 'high' && (
        <Pressable onPress={onTopUp}>
          <Txt font="user" weight={500} style={{ fontSize: 12, color: W.accent }}>Top up</Txt>
        </Pressable>
      )}
    </View>
  );
}
