// Settings.tsx — S21 Settings, S22 Memories, S23 Paywall, S24 Voice Top-up.
// Ported from settings.jsx. Paywall/top-up are modal bottom sheets rendered
// over the home screen by the router (they navigate via `go`, not tap-to-close,
// matching the prototype).

import React, { useEffect, useRef, useState } from 'react';
import {
  View, ScrollView, Pressable, Animated, Easing,
  LayoutChangeEvent, PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { Screen, TopBar } from '../components/Chrome';
import { NavIcon } from '../components/NavIcon';
import { Txt } from '../components/Txt';
import { Card, Toggle } from '../components/Atoms';
import { W, alpha } from '../theme/theme';
import { ARCHETYPE_LABEL, MEM_TYPES, SAMPLE_MEMORIES, Companion, Tier } from '../data/config';
import { Go } from '../navigation/types';

export interface AppSettings {
  dailyCheckin: boolean;
  weeklyReflection: boolean;
  autoPlay: boolean;
  liveCaptions: boolean;
}

// ─── S21 SETTINGS ────────────────────────────────────────────────────────
interface SettingsProps {
  go: Go;
  tier: Tier;
  companions: Companion[];
  userName: string;
  userEmail: string;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export function S21_Settings({ go, tier, companions, userName, userEmail, settings, setSettings }: SettingsProps) {
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [bgSound] = useState('Off');

  return (
    <Screen>
      <TopBar left={<Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>Settings</Txt>} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
        {/* User card */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: W.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Txt font="user" weight={600} style={{ fontSize: 18, color: W.text }}>{userName[0]}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt font="user" weight={500} style={{ fontSize: 15, color: W.text }}>{userName}</Txt>
            <Txt font="user" style={{ fontSize: 12, color: W.text2 }} numberOfLines={1}>{userEmail}</Txt>
          </View>
          <Txt font="user" style={{ fontSize: 12, color: W.secondary }}>Edit</Txt>
        </Card>

        <Section title="My companions">
          {companions.map(c => (
            <Row
              key={c.id}
              label={
                <View>
                  <Txt font="user" style={{ fontSize: 14, color: W.text }}>{c.name}</Txt>
                  <Txt font="user" style={{ fontSize: 11, color: W.text2 }}>{ARCHETYPE_LABEL[c.archetype]}</Txt>
                </View>
              }
              right={<NavIcon name="right" color={W.text2} size={18} />}
            />
          ))}
        </Section>

        <Section title="Communication">
          <Row label="Daily check-in" right={<Toggle value={settings.dailyCheckin} onChange={v => setSettings({ ...settings, dailyCheckin: v })} />} />
          <Row label="Notification time" right={<Txt font="user" style={{ fontSize: 13, color: W.text2 }}>9:00 PM</Txt>} />
          <Row label="Weekly reflection" right={<Toggle value={settings.weeklyReflection} onChange={v => setSettings({ ...settings, weeklyReflection: v })} />} />
        </Section>

        <Section title="Voice">
          <Row
            label="Voice speed"
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 80 }}>
                  <MiniSlider value={(voiceSpeed - 0.8) / 0.7} onChange={(t) => setVoiceSpeed(Math.round((0.8 + t * 0.7) * 10) / 10)} />
                </View>
                <Txt font="user" style={{ fontSize: 12, color: W.text2, minWidth: 30 }}>{voiceSpeed.toFixed(1)}×</Txt>
              </View>
            }
          />
          <Row label="Background sounds" right={<Txt font="user" style={{ fontSize: 13, color: W.text2 }}>{bgSound}</Txt>} />
          <Row label="Auto-play voice notes" right={<Toggle value={settings.autoPlay} onChange={v => setSettings({ ...settings, autoPlay: v })} />} />
          <Row label="Show live text during calls" right={<Toggle value={settings.liveCaptions} onChange={v => setSettings({ ...settings, liveCaptions: v })} />} />
        </Section>

        <Section title="Memories">
          <Row
            onPress={() => go('memories')}
            label="View all memories"
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt font="user" style={{ fontSize: 12, color: W.text2 }}>47</Txt>
                <NavIcon name="right" color={W.text2} size={18} />
              </View>
            }
          />
        </Section>

        <Section title="Subscription">
          <Row
            label={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Txt font="user" style={{ fontSize: 14, color: W.text }}>Current plan</Txt>
                <View style={{ paddingVertical: 2, paddingHorizontal: 10, borderRadius: 8, backgroundColor: tier === 'free' ? W.surface2 : tier === 'plus' ? W.primary : W.accent }}>
                  <Txt font="user" weight={600} style={{ fontSize: 11, color: tier === 'plus' ? '#fff' : tier === 'premium' ? W.bg : W.text2, textTransform: 'capitalize' }}>{tier}</Txt>
                </View>
              </View>
            }
            right={<NavIcon name="right" color={W.text2} size={18} />}
          />
          <Row
            label={
              <View>
                <Txt font="user" style={{ fontSize: 14, color: W.text }}>Voice minutes</Txt>
                <View style={{ marginTop: 6 }}>
                  <View style={{ width: 180, height: 4, backgroundColor: W.surface2, borderRadius: 2 }}>
                    <View style={{ width: '72%', height: 4, backgroundColor: W.primary, borderRadius: 2 }} />
                  </View>
                  <Txt font="user" style={{ marginTop: 4, fontSize: 11, color: W.text2 }}>87 of 120 minutes</Txt>
                </View>
              </View>
            }
          />
          <Row onPress={() => go('topup')} label="Buy voice minutes" right={<NavIcon name="right" color={W.text2} size={18} />} />
        </Section>

        <Section title="Privacy & safety">
          <Row label="Export my data" right={<NavIcon name="right" color={W.text2} size={18} />} />
          <Row label="Crisis resources" right={<NavIcon name="right" color={W.text2} size={18} />} />
          <Row label={<Txt font="user" style={{ fontSize: 14, color: W.danger }}>Delete my account</Txt>} right={<NavIcon name="right" color={W.danger} size={18} />} />
        </Section>

        <Section title="About">
          <Row label="How Whisper works" right={<NavIcon name="right" color={W.text2} size={18} />} />
          <Row label="Privacy policy" right={<NavIcon name="right" color={W.text2} size={18} />} />
          <Row label="Terms of service" right={<NavIcon name="right" color={W.text2} size={18} />} />
          <Row label="App version" right={<Txt font="user" style={{ fontSize: 12, color: W.text2 }}>1.0.0 (42)</Txt>} />
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <View>
      <Txt font="user" weight={600} style={{ fontSize: 11, color: W.text2, textTransform: 'uppercase', letterSpacing: 0.9, paddingHorizontal: 4, paddingBottom: 8 }}>{title}</Txt>
      <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,114,255,0.08)', backgroundColor: 'rgba(26,29,46,0.55)' }}>
        <BlurView intensity={20} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
        {items.map((child, i) => (
          <View key={i} style={{ borderTopWidth: i > 0 ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.04)' }}>{child}</View>
        ))}
      </View>
    </View>
  );
}

function Row({ label, right, onPress }: { label: React.ReactNode; right?: React.ReactNode; onPress?: () => void }) {
  const content = (
    <View style={{ minHeight: 52, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1 }}>
        {typeof label === 'string' ? <Txt font="user" style={{ fontSize: 14, color: W.text }}>{label}</Txt> : label}
      </View>
      {right != null && <View>{right}</View>}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

// ─── S22 MEMORIES LIST ───────────────────────────────────────────────────
export function S22_Memories({ go }: { go: Go }) {
  const [filter, setFilter] = useState('all');
  const filtered = SAMPLE_MEMORIES.filter(m => filter === 'all' || m.type === filter);
  const tabs: [string, string][] = [['all', 'All'], ['fact', 'Facts'], ['emotion', 'Emotions'], ['event', 'Events'], ['preference', 'Preferences']];
  return (
    <Screen>
      <TopBar
        left={<Pressable onPress={() => go('settings')}><NavIcon name="back" color={W.text2} /></Pressable>}
        center={<Txt font="comp" weight={600} style={{ fontSize: 16, color: W.text }}>Memories</Txt>}
        right={<Pressable><NavIcon name="search" color={W.text2} /></Pressable>}
        bg="rgba(15,17,26,0.55)"
        border
      />
      {/* filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}>
        {tabs.map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filter === k ? W.primary : W.surface1 }}>
            <Txt font="user" weight={500} style={{ fontSize: 12, color: filter === k ? '#fff' : W.text2 }}>{l}</Txt>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
        {filtered.map(m => {
          const mt = MEM_TYPES[m.type];
          return (
            <View key={m.id} style={{ borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,114,255,0.08)', backgroundColor: 'rgba(26,29,46,0.55)' }}>
              <BlurView intensity={20} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
              <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, backgroundColor: alpha(mt.color, '26'), borderWidth: 1, borderColor: alpha(mt.color, '40') }}>
                <Txt font="user" weight={600} style={{ fontSize: 10, color: mt.color }}>{mt.l}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt font="user" style={{ fontSize: 14, color: W.text, lineHeight: 20 }}>{m.text}</Txt>
                <Txt font="user" style={{ marginTop: 4, fontSize: 11, color: W.text2 }}>Learned {m.date} via {m.via}</Txt>
              </View>
              <Pressable style={{ padding: 2, opacity: 0.5 }}>
                <NavIcon name="trash" color={W.text2} size={18} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: W.surface2 }}>
        <Pressable style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Txt font="user" weight={500} style={{ fontSize: 13, color: W.danger }}>Delete all memories</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

// ─── S23 PAYWALL ─────────────────────────────────────────────────────────
const PAYWALL_HEADERS: Record<string, string> = {
  voice: 'Unlock your voice connection',
  cap: 'Continue the conversation',
  more: 'Add more companions',
  studio: 'Practice makes perfect',
};

export function S23_Paywall({ go, trigger = 'voice' }: { go: Go; trigger?: string; currentTier?: Tier }) {
  const [annual, setAnnual] = useState(true);
  const [picked, setPicked] = useState<'plus' | 'premium'>('premium');

  return (
    <ModalSheet zIndex={40} radius={28} maxHeightPct={0.92}>
      <View style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 18 }} />
      <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text, textAlign: 'center' }}>{PAYWALL_HEADERS[trigger] || 'Upgrade Whisper'}</Txt>
      <Txt font="user" style={{ marginTop: 8, fontSize: 14, color: W.text2, textAlign: 'center' }}>Start with a 7-day free trial. Cancel anytime.</Txt>

      {/* Monthly / Annual toggle */}
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', borderRadius: 22, padding: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <Pressable onPress={() => setAnnual(false)} style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 18, backgroundColor: !annual ? W.primary : 'transparent' }}>
            <Txt font="user" weight={500} style={{ fontSize: 12, color: !annual ? '#fff' : W.text2 }}>Monthly</Txt>
          </Pressable>
          <Pressable onPress={() => setAnnual(true)} style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 18, backgroundColor: annual ? W.primary : 'transparent' }}>
            <Txt font="user" weight={500} style={{ fontSize: 12, color: annual ? '#fff' : W.text2 }}>Annual </Txt>
            <Txt font="user" weight={500} style={{ fontSize: 12, color: W.accent }}>· save 37%</Txt>
          </Pressable>
        </View>
      </View>

      {/* Plan cards */}
      <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
        <PlanCard tier="plus" accent={W.primary} secondary={W.secondary} annual={annual} price={annual ? '$12.49' : '$19.99'} features={['120 voice min/mo', 'Unlimited text', 'All companion types', 'Up to 3 companions', 'Full Studio access']} picked={picked === 'plus'} onPick={() => setPicked('plus')} />
        <PlanCard tier="premium" accent={W.accent} secondary={W.primary} annual={annual} price={annual ? '$24.99' : '$39.99'} bestValue features={['500 voice min/mo', 'Everything in Plus', 'Up to 5 companions', 'Custom characters', 'Priority responses']} picked={picked === 'premium'} onPick={() => setPicked('premium')} />
      </View>

      <Pressable onPress={() => go('home')} style={{ marginTop: 20, width: '100%', height: 48, backgroundColor: W.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: W.primary, shadowOpacity: 0.4, shadowRadius: 28, shadowOffset: { width: 0, height: 8 } }}>
        <Txt font="user" weight={500} style={{ fontSize: 15, color: '#fff' }}>Start free trial</Txt>
      </Pressable>
      <Pressable onPress={() => go('home')} style={{ marginTop: 6, width: '100%', height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <Txt font="user" style={{ fontSize: 12, color: W.text2 }}>Restore purchase</Txt>
      </Pressable>
      <Txt font="user" style={{ marginTop: 6, fontSize: 11, color: W.text3, textAlign: 'center', lineHeight: 16 }}>
        7-day free trial, then {annual ? '$12.49' : '$19.99'}/month. Cancel anytime in App Store settings.
      </Txt>
    </ModalSheet>
  );
}

function PlanCard({ tier, accent, secondary, annual, price, features, bestValue, picked, onPick }: {
  tier: string; accent: string; secondary: string; annual: boolean; price: string; features: string[]; bestValue?: boolean; picked: boolean; onPick: () => void;
}) {
  return (
    <Pressable onPress={onPick} style={{ flex: 1, borderRadius: 18, overflow: 'hidden' }}>
      {/* gradient border emulation: outer gradient, inner fill */}
      <LinearGradient
        colors={[accent, secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 18, padding: picked ? 2 : 1, opacity: picked ? 1 : 0.35 }}
      >
        <View style={{ borderRadius: 17, padding: 14, backgroundColor: picked ? alpha(accent, '1f') : 'rgba(37,40,54,0.9)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, backgroundColor: alpha(accent, '33') }}>
              <Txt font="user" weight={600} style={{ fontSize: 10, color: accent, textTransform: 'capitalize' }}>{tier}</Txt>
            </View>
            {bestValue && <Txt font="user" weight={700} style={{ fontSize: 9, color: accent, letterSpacing: 0.4 }}>BEST VALUE</Txt>}
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'baseline' }}>
            <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>{price}</Txt>
            <Txt font="user" style={{ fontSize: 11, color: W.text2 }}>/mo</Txt>
          </View>
          {annual && <Txt font="user" style={{ fontSize: 10, color: W.text2 }}>billed annually</Txt>}
          <View style={{ marginTop: 12, gap: 6 }}>
            {features.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <View style={{ marginTop: 2 }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={3}>
                    <Path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Txt font="user" style={{ flex: 1, fontSize: 11, color: W.text, lineHeight: 15 }}>{f}</Txt>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── S24 VOICE TOP-UP ────────────────────────────────────────────────────
export function S24_TopUp({ go }: { go: Go }) {
  const [autoTopUp, setAutoTopUp] = useState(false);
  const packs: { min: number; price: string; badge: string | null; accent?: string }[] = [
    { min: 30, price: '$4.99', badge: null },
    { min: 75, price: '$9.99', badge: 'Most popular', accent: W.primary },
    { min: 150, price: '$14.99', badge: 'Best value', accent: W.accent },
  ];
  return (
    <ModalSheet zIndex={40} radius={24} maxHeightPct={0.85} solid backdrop={alpha(W.bg, 'd9')}>
      <View style={{ width: 36, height: 4, backgroundColor: W.surface2, borderRadius: 2, alignSelf: 'center', marginBottom: 18 }} />
      <Txt font="comp" weight={700} style={{ fontSize: 20, color: W.text }}>Add voice minutes</Txt>
      <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Txt font="user" style={{ fontSize: 13, color: W.challenger }}>⚠ You have 12 minutes remaining</Txt>
      </View>
      <View style={{ marginTop: 20, gap: 8 }}>
        {packs.map(p => (
          <Pressable key={p.min} style={{ backgroundColor: W.surface2, borderRadius: 12, padding: 14, borderTopWidth: 2, borderTopColor: p.accent || 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 2, alignItems: 'flex-start' }}>
              <Txt font="comp" weight={600} style={{ fontSize: 16, color: W.text }}>{p.min} minutes</Txt>
              {p.badge && <Txt font="user" weight={600} style={{ fontSize: 10, color: p.accent }}>{p.badge}</Txt>}
            </View>
            <Txt font="user" weight={600} style={{ fontSize: 16, color: W.text }}>{p.price}</Txt>
          </Pressable>
        ))}
      </View>
      <View style={{ marginTop: 20, backgroundColor: W.surface2, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Txt font="user" style={{ fontSize: 13, color: W.text }}>Auto top-up 30 min when low</Txt>
          <Txt font="user" style={{ marginTop: 2, fontSize: 11, color: W.text2 }}>Charges $4.99 when balance drops below 10 min.</Txt>
        </View>
        <Toggle value={autoTopUp} onChange={setAutoTopUp} />
      </View>
      <Pressable onPress={() => go('settings')} style={{ marginTop: 16, width: '100%', height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <Txt font="user" style={{ fontSize: 13, color: W.text2 }}>Done</Txt>
      </Pressable>
    </ModalSheet>
  );
}

// ─── Shared modal sheet (paywall / top-up) ───────────────────────────────
// Slides up from the bottom; backdrop does NOT close (matches prototype, where
// only the in-sheet buttons navigate).
function ModalSheet({ children, zIndex = 40, radius = 24, maxHeightPct = 0.9, solid = false, backdrop = 'rgba(15,17,26,0.55)' }: {
  children: React.ReactNode; zIndex?: number; radius?: number; maxHeightPct?: number; solid?: boolean; backdrop?: string;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 450, easing: Easing.bezier(0.34, 1.05, 0.64, 1), useNativeDriver: true }).start();
  }, []);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex, justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: backdrop }}>
        {!solid && <BlurView intensity={8} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />}
      </View>
      <Animated.View style={{ transform: [{ translateY }], maxHeight: `${maxHeightPct * 100}%` as any, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)' }}>
        {solid ? (
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: W.surface1 }} />
        ) : (
          <>
            <LinearGradient colors={['rgba(37,40,54,0.95)', 'rgba(15,17,26,0.95)']} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
            <BlurView intensity={36} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
          </>
        )}
        <ScrollView contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 24, paddingBottom: 32 }}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// Small inline slider (voice speed). Reused PanResponder pattern.
function MiniSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const onLayout = (e: LayoutChangeEvent) => { widthRef.current = e.nativeEvent.layout.width; setWidth(e.nativeEvent.layout.width); };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => { const w = widthRef.current; if (w > 0) onChange(Math.max(0, Math.min(1, e.nativeEvent.locationX / w))); },
      onPanResponderMove: (e) => { const w = widthRef.current; if (w > 0) onChange(Math.max(0, Math.min(1, e.nativeEvent.locationX / w))); },
    }),
  ).current;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View onLayout={onLayout} {...pan.panHandlers} style={{ height: 18, justifyContent: 'center' }}>
      <View style={{ height: 4, backgroundColor: W.surface2, borderRadius: 2 }}>
        <View style={{ position: 'absolute', left: 0, top: 0, height: 4, width: `${pct * 100}%`, backgroundColor: W.primary, borderRadius: 2 }} />
      </View>
      <View style={{ position: 'absolute', left: Math.max(0, pct * width - 7), top: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: W.primary }} />
    </View>
  );
}
