// Home.tsx — S10 Home (companion list) + CompanionCard + S11 Add Companion.
// Ported from home.jsx.

import React, { useState } from 'react';
import { View, Pressable, ScrollView, Animated, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Screen, TopBar } from '../components/Chrome';
import { Txt } from '../components/Txt';
import { NavIcon } from '../components/NavIcon';
import { Card, Pill, PrimaryButton } from '../components/Atoms';
import { Avatar, Waveform } from '../components/Avatar';
import { useGreetingGlow, useFloat, useCtaHalo } from '../theme/animations';
import { W, alpha } from '../theme/theme';
import { Go } from '../navigation/types';
import { Companion, Tier, ARCHETYPE_COLORS, ARCHETYPE_LABEL, VOICES } from '../data/config';

// ─── CompanionCard ───────────────────────────────────────────────────────
function CompanionCard({ companion, onChat, onCall, hero = false }: { companion: Companion; onChat: () => void; onCall: () => void; hero?: boolean }) {
  const accent = ARCHETYPE_COLORS[companion.archetype] || W.primary;
  const float = useFloat();
  const halo = useCtaHalo();

  if (hero) {
    return (
      <Animated.View style={float}>
        <Pressable onPress={onChat}>
          <View style={{ width: 320, maxWidth: 320, padding: 28, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,114,255,0.15)', alignItems: 'center', gap: 12, shadowColor: accent, shadowOpacity: 0.25, shadowRadius: 40, shadowOffset: { width: 0, height: 16 } }}>
            <LinearGradient colors={['rgba(124,114,255,0.10)', 'rgba(26,29,46,0.55)']} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
            <BlurView intensity={28} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
            <Avatar name={companion.name} color={accent} size={80} image={companion.image} />
            <View style={{ alignItems: 'center' }}>
              <Txt font="comp" weight={600} style={{ fontSize: 22, color: W.text }}>{companion.name}</Txt>
              <Txt font="user" style={{ fontSize: 12, color: W.text2, marginTop: 2 }}>{ARCHETYPE_LABEL[companion.archetype]}</Txt>
            </View>
            {companion.memory ? (
              <Txt font="user" style={{ fontSize: 12, color: W.accent, textAlign: 'center', maxWidth: 240, lineHeight: 17 }}>
                <Txt font="user" style={{ color: W.accent, opacity: 0.7 }}>Remembers:</Txt> {companion.memory}
              </Txt>
            ) : null}
            <Pressable
              onPress={onCall}
              style={{ marginTop: 8, backgroundColor: W.primary, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: W.primary, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } }}
            >
              <NavIcon name="phone" color="#fff" size={20} />
              <Txt font="user" weight={500} style={{ fontSize: 14, color: '#fff' }}>Call {companion.name}</Txt>
              <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 24, borderWidth: 2, borderColor: W.primary }, halo]} pointerEvents="none" />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Card onPress={onChat} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Avatar name={companion.name} color={accent} size={48} image={companion.image} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Txt font="comp" weight={600} style={{ fontSize: 16, color: W.text }}>{companion.name}</Txt>
          <Txt font="user" style={{ fontSize: 12, color: W.text2 }}>· {ARCHETYPE_LABEL[companion.archetype]}</Txt>
        </View>
        {companion.memory ? (
          <Txt font="user" numberOfLines={1} style={{ marginTop: 4, fontSize: 12, color: W.accent }}>Remembers: {companion.memory}</Txt>
        ) : null}
        <Txt font="user" style={{ marginTop: 2, fontSize: 11, color: companion.pending ? W.secondary : W.text2 }}>
          {companion.pending ? 'Wants to ask you something' : companion.lastTalked}
        </Txt>
      </View>
      <View style={{ alignItems: 'center' }}>
        {companion.pending && (
          <View style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: W.primary, zIndex: 2, shadowColor: W.primary, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} />
        )}
        <Pressable
          onPress={onCall}
          style={{ backgroundColor: 'rgba(124,114,255,0.15)', borderWidth: 1, borderColor: 'rgba(124,114,255,0.20)', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }}
        >
          <NavIcon name="phone" color={W.primary} size={20} />
        </Pressable>
      </View>
    </Card>
  );
}

// ─── S10 HOME ──────────────────────────────────────────────────────────────
export function S10_Home({ go, tier, companions, onSelectCompanion, onCallCompanion, userName }: {
  go: Go; tier: Tier; companions: Companion[]; userName: string;
  onSelectCompanion: (c: Companion) => void; onCallCompanion: (c: Companion) => void;
}) {
  const glow = useGreetingGlow();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return `Can't sleep, ${userName}?`;
    if (h < 12) return `Good morning, ${userName}`;
    if (h < 18) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  })();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const maxCompanions = tier === 'free' ? 1 : tier === 'plus' ? 3 : 5;
  const isSingle = companions.length === 1;

  return (
    <Screen>
      <TopBar
        left={<Txt font="comp" weight={700} style={{ fontSize: 18, color: W.primary, letterSpacing: -0.36 }}>whisper</Txt>}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable style={{ padding: 4 }}><NavIcon name="bell" color={W.text2} /></Pressable>
            <Pressable onPress={() => go('settings')} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(37,40,54,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
              <Txt font="user" weight={600} style={{ fontSize: 12, color: W.text }}>{userName[0]}</Txt>
            </Pressable>
          </View>
        }
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }}>
          <Animated.View style={glow}>
            <Txt font="comp" weight={600} style={{ fontSize: 24, color: W.text, letterSpacing: -0.36 }}>{greeting}</Txt>
          </Animated.View>
          <Txt font="user" style={{ marginTop: 4, fontSize: 13, color: W.text2 }}>{dateStr}</Txt>
        </View>
        <View style={{ padding: 16, gap: 12, alignItems: isSingle ? 'center' : 'stretch', justifyContent: isSingle ? 'center' : 'flex-start', minHeight: isSingle ? 400 : undefined }}>
          {companions.map(c => (
            <CompanionCard key={String(c.id)} companion={c} hero={isSingle} onChat={() => onSelectCompanion(c)} onCall={() => onCallCompanion(c)} />
          ))}
          {tier === 'free' && companions.length === 1 && (
            <Pressable onPress={() => go('add-companion')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, marginTop: 24 }}>
              <Txt font="user" style={{ fontSize: 14, color: W.secondary }}>Explore more companions</Txt>
              <NavIcon name="right" color={W.secondary} size={20} />
            </Pressable>
          )}
          {tier !== 'free' && companions.length < maxCompanions && (
            <Pressable onPress={() => go('add-companion')} style={{ borderWidth: 1.5, borderColor: 'rgba(124,114,255,0.15)', borderStyle: 'dashed', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <NavIcon name="plus" color={W.text2} size={20} />
              <Txt font="user" style={{ fontSize: 14, color: W.text2 }}>Add companion</Txt>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

// ─── S11 ADD COMPANION ──────────────────────────────────────────────────────
export function S11_AddCompanion({ go, tier, onCreate }: { go: Go; tier: Tier; onCreate: (c: { name: string; archetype: string; voice: string | null }) => void }) {
  const [step, setStep] = useState(1);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [name, setName] = useState('');

  return (
    <Screen>
      <TopBar
        left={<Pressable onPress={() => (step === 1 ? go('home') : setStep(s => s - 1))}><NavIcon name="back" color={W.text2} /></Pressable>}
        center={<Txt font="user" style={{ fontSize: 13, color: W.text2 }}>Step {step} of 4</Txt>}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        {step === 1 && (
          <>
            <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>Choose a new companion</Txt>
            <Txt font="user" style={{ marginTop: 8, fontSize: 13, color: W.text2 }}>What kind of presence?</Txt>
            <View style={{ marginTop: 24, gap: 10 }}>
              {[
                { k: 'mentor', icon: 'compass', l: 'Mentor', d: 'Help thinking things through' },
                { k: 'friend', icon: 'two', l: 'Best Friend', d: "A friend who's always there" },
                { k: 'partner', icon: 'heart', l: 'Partner', d: 'Connection and affection' },
                { k: 'challenger', icon: 'target', l: 'Challenger', d: 'Someone to keep you honest' },
              ].map((c: any) => (
                <Pressable key={c.k} onPress={() => { setArchetype(c.k); setStep(2); }} style={{ backgroundColor: W.surface1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: ARCHETYPE_COLORS[c.k] }} />
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: W.surface2, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                    <NavIcon name={c.icon} color={ARCHETYPE_COLORS[c.k]} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt font="user" weight={500} style={{ fontSize: 15, color: W.text }}>{c.l}</Txt>
                    <Txt font="user" style={{ fontSize: 12, color: W.text2 }}>{c.d}</Txt>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>Voice gender</Txt>
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 8 }}>
              {['male', 'female', 'neutral'].map(g => (
                <Pill key={g} active={gender === g} onPress={() => { setGender(g); setTimeout(() => setStep(3), 300); }} style={{ flex: 1 }} textStyle={{ textTransform: 'capitalize' }}>{g}</Pill>
              ))}
            </View>
          </>
        )}
        {step === 3 && gender && (
          <>
            <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>Pick a voice</Txt>
            <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {VOICES[gender].map(v => (
                <Pressable key={v.n} onPress={() => { setVoice(v.n); setName(v.n); setTimeout(() => setStep(4), 300); }} style={{ width: '31.5%', minHeight: 110, backgroundColor: W.surface1, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: voice === v.n ? 2 : 0, borderColor: W.accent }}>
                  <Waveform color={W.primary} animate={voice === v.n} size={32} />
                  <Txt font="user" weight={500} style={{ fontSize: 13, color: W.text }}>{v.n}</Txt>
                  <Txt font="user" style={{ fontSize: 10, color: W.text2 }}>{v.d}</Txt>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {step === 4 && (
          <>
            <Txt font="comp" weight={700} style={{ fontSize: 22, color: W.text }}>Name your companion</Txt>
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <TextInput value={name} onChangeText={setName} style={{ backgroundColor: W.surface1, color: W.text, borderWidth: 1, borderColor: W.surface2, height: 60, borderRadius: 16, fontFamily: 'Manrope_500Medium', fontSize: 22, textAlign: 'center', width: '100%', maxWidth: 280 }} />
            </View>
          </>
        )}
      </ScrollView>
      {step === 4 && (
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
          <PrimaryButton disabled={!name.trim()} onPress={() => {
            if (tier === 'free') return go('paywall');
            onCreate({ name: name.trim(), archetype: archetype!, voice });
            go('home');
          }}>Create companion</PrimaryButton>
        </View>
      )}
    </Screen>
  );
}
