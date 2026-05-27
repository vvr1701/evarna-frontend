// BottomNav.tsx — bottom tab bar, ported from system.jsx BottomNav().

import React from 'react';
import { View, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Txt } from './Txt';
import { NavIcon, IconName } from './NavIcon';
import { W } from '../theme/theme';

export type TabId = 'home' | 'studio' | 'sandbox' | 'settings';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  sandboxComingSoon?: boolean;
}

export function BottomNav({ active, onChange, sandboxComingSoon = true }: BottomNavProps) {
  const tabs: { id: TabId; label: string; icon: IconName; badge?: string | null }[] = [
    { id: 'home', label: 'Home', icon: 'chat' },
    { id: 'studio', label: 'Studio', icon: 'grid' },
    { id: 'sandbox', label: 'Sandbox', icon: 'mask', badge: sandboxComingSoon ? 'Soon' : null },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];
  return (
    <View
      style={{
        height: 64,
        borderTopWidth: 1, borderTopColor: 'rgba(124,114,255,0.10)',
        flexDirection: 'row', alignItems: 'stretch',
        backgroundColor: 'rgba(15,17,26,0.6)', overflow: 'hidden', zIndex: 2,
      }}
    >
      <BlurView intensity={36} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      {tabs.map(t => {
        const isActive = t.id === active;
        const c = isActive ? W.primary : W.text2;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <NavIcon name={t.icon} color={c} />
            <Txt font="user" weight={500} style={{ fontSize: 11, color: c }}>{t.label}</Txt>
            {t.badge && (
              <View style={{ position: 'absolute', top: 8, right: '50%', marginRight: -22, backgroundColor: 'rgba(37,40,54,0.8)', paddingVertical: 1, paddingHorizontal: 5, borderRadius: 6 }}>
                <Txt font="user" weight={600} style={{ fontSize: 8, color: W.text2 }}>{t.badge}</Txt>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
