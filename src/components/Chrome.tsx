// Chrome.tsx — StatusBar, HomeIndicator, Screen wrapper, TopBar.
// Ported from system.jsx. The simulated iOS status bar (9:41) and home
// indicator are kept exactly as designed, sitting inside the device safe area.

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path } from 'react-native-svg';
import { Txt } from './Txt';
import { AmbientBg } from './AmbientBg';
import { W } from '../theme/theme';

export function StatusBar({ light = true }: { light?: boolean }) {
  const insets = useSafeAreaInsets();
  const fg = light ? W.text : W.bg;
  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 14),
        height: Math.max(insets.top, 14) + 33,
        paddingHorizontal: 28,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 5,
      }}
    >
      <Txt font="user" weight={600} style={{ fontSize: 15, color: fg, letterSpacing: -0.3 }}>9:41</Txt>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        {/* signal */}
        <Svg width={17} height={11} viewBox="0 0 17 11">
          {[2, 5, 8, 11].map((h, i) => (
            <Rect key={i} x={i * 4} y={11 - h} width={3} height={h} rx={0.5} fill={fg} />
          ))}
        </Svg>
        {/* wifi */}
        <Svg width={15} height={11} viewBox="0 0 15 11">
          <Path d="M7.5 10.5l-1.5-2c-.4 0-1.6 0-1.6 0L7.5 10.5z M1 4 C 3 1.5, 12 1.5, 14 4 M3 6 C 4.5 4, 10.5 4, 12 6 M5 8 C 6 7, 9 7, 10 8" stroke={fg} strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </Svg>
        {/* battery */}
        <Svg width={27} height={12} viewBox="0 0 27 12">
          <Rect x={0.5} y={0.5} width={22} height={11} rx={2.5} stroke={fg} opacity={0.5} fill="none" />
          <Rect x={24} y={4} width={1.5} height={4} rx={0.5} fill={fg} opacity={0.5} />
          <Rect x={2} y={2} width={18} height={8} rx={1.5} fill={fg} />
        </Svg>
      </View>
    </View>
  );
}

export function HomeIndicator({ color = W.text }: { color?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height: 34 - Math.min(insets.bottom, 20) + Math.min(insets.bottom, 20), alignItems: 'center', justifyContent: 'flex-end', paddingBottom: Math.max(8, insets.bottom > 0 ? 8 : 8) }}>
      <View style={{ width: 134, height: 5, backgroundColor: color, opacity: 0.85, borderRadius: 3 }} />
    </View>
  );
}

interface ScreenProps {
  children: React.ReactNode;
  /** Optional debug label mirroring the prototype's data-screen-label. Not rendered. */
  label?: string;
  bg?: string;
  statusBarLight?: boolean;
  hideHomeIndicator?: boolean;
  homeIndicatorColor?: string;
  ambient?: boolean;
  ambientIntensity?: number;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  bg = W.bg,
  statusBarLight = true,
  hideHomeIndicator = false,
  homeIndicatorColor,
  ambient = true,
  ambientIntensity = 1,
  style,
}: ScreenProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: bg, overflow: 'hidden' }, style]}>
      {ambient && <AmbientBg intensity={ambientIntensity} />}
      <StatusBar light={statusBarLight} />
      <View style={{ flex: 1, minHeight: 0, zIndex: 1 }}>{children}</View>
      {!hideHomeIndicator && <HomeIndicator color={homeIndicatorColor || W.text} />}
    </View>
  );
}

interface TopBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  height?: number;
  bg?: string;
  border?: boolean;
}

export function TopBar({ left, center, right, height = 56, bg = 'transparent', border = false }: TopBarProps) {
  return (
    <View
      style={{
        height,
        paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: bg,
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(124,114,255,0.10)',
        zIndex: 2,
      }}
    >
      <View style={{ minWidth: 32, flexDirection: 'row', alignItems: 'center' }}>{left}</View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>{center}</View>
      <View style={{ minWidth: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>{right}</View>
    </View>
  );
}
