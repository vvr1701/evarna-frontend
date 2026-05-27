// Onboarding.tsx — S01 Splash → S08 Name + Handoff + Meet.
// Ported from onboarding.jsx.

import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, TextInput, ScrollView, Animated, Easing } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Screen, TopBar, HomeIndicator } from '../components/Chrome';
import { AmbientBg } from '../components/AmbientBg';
import { Txt } from '../components/Txt';
import { NavIcon } from '../components/NavIcon';
import { Pill, PrimaryButton, ProgressDots, Card } from '../components/Atoms';
import { Orb } from '../components/Orb';
import { Avatar, Waveform } from '../components/Avatar';
import { useEntrance, useBreathe, useMeetIn } from '../theme/animations';
import { W, alpha } from '../theme/theme';
import { Go, Archetype } from '../navigation/types';
import { NAME_SUGGESTIONS, VOICES, ARCHETYPE_COLORS } from '../data/config';
import type { ApiVoice } from '../api';

const BackBtn = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress}><NavIcon name="back" color={W.text2} /></Pressable>
);

// Small entrance wrapper
function FadeIn({ delay = 0, translateY = 20, duration = 600, style, children }: any) {
  const a = useEntrance({ delayMs: delay, fromTranslateY: translateY, durationMs: duration });
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

// ─── S01 SPLASH ──────────────────────────────────────────────────────────
export function S01_Splash({ go }: { go: Go }) {
  return (
    <Screen statusBarLight hideHomeIndicator ambient={false}>
      <AmbientBg intensity={2} includePulse />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: '40%', paddingBottom: 32, zIndex: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <Txt font="comp" weight={700} style={{ fontSize: 40, color: W.primary, letterSpacing: -1.2 }}>whisper</Txt>
          <View style={{ marginTop: 14, alignItems: 'center', gap: 2 }}>
            <FadeIn delay={200} translateY={0}><Txt font="user" style={{ fontSize: 16, color: W.text }}>Talk.</Txt></FadeIn>
            <FadeIn delay={500} translateY={0}><Txt font="user" style={{ fontSize: 16, color: W.text }}>Be heard.</Txt></FadeIn>
            <FadeIn delay={800} translateY={0}><Txt font="user" style={{ fontSize: 16, color: W.text }}>Feel better.</Txt></FadeIn>
          </View>
        </View>
        <FadeIn delay={1100} translateY={0} style={{ gap: 16 }}>
          <PrimaryButton onPress={() => go('age')}>Get started</PrimaryButton>
          <PrimaryButton variant="text" onPress={() => go('home')}>I already have an account</PrimaryButton>
        </FadeIn>
      </View>
      <HomeIndicator />
    </Screen>
  );
}

// ─── DateWheel ───────────────────────────────────────────────────────────
function DateWheel({ options, value, onChange, width }: { options: string[]; value: number; onChange: (v: number) => void; width: number }) {
  const ROW = 40;
  const visible = 5;
  const pad = useRef(new Animated.Value(ROW * Math.floor(visible / 2) - value * ROW)).current;
  useEffect(() => {
    Animated.timing(pad, { toValue: ROW * Math.floor(visible / 2) - value * ROW, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={{ width, height: ROW * visible, backgroundColor: W.surface1, borderRadius: 16, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: ROW, marginTop: -ROW / 2, backgroundColor: W.primaryDim, zIndex: 1 }} pointerEvents="none" />
      <Animated.View style={{ paddingTop: pad }}>
        {options.map((o, i) => (
          <Pressable key={i} onPress={() => onChange(i)} style={{ height: ROW, alignItems: 'center', justifyContent: 'center' }}>
            <Txt
              font="user"
              weight={i === value ? 600 : 400}
              style={{ fontSize: i === value ? 18 : 15, color: i === value ? W.text : W.text2, opacity: Math.max(0.3, 1 - Math.abs(i - value) * 0.3) }}
            >
              {o}
            </Txt>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── S02 AGE ─────────────────────────────────────────────────────────────
export function S02_Age({ go, onDob }: { go: Go; onDob?: (dob: string) => void }) {
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(14);
  const [year, setYear] = useState(1995);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const handleContinue = () => {
    const dobStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDob?.(dobStr);
    go('disclosure');
  };
  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('splash')} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 29 }}>When were you born?</Txt>
        <Txt font="user" style={{ marginTop: 8, fontSize: 14, color: W.text2 }}>We ask this to keep everyone safe.</Txt>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <DateWheel options={months} value={month} onChange={setMonth} width={92} />
          <DateWheel options={Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))} value={day - 1} onChange={v => setDay(v + 1)} width={64} />
          <DateWheel options={Array.from({ length: 80 }, (_, i) => String(2010 - i))} value={2010 - year} onChange={v => setYear(2010 - v)} width={84} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
        <PrimaryButton onPress={handleContinue}>Continue</PrimaryButton>
      </View>
    </Screen>
  );
}

// ─── S03 DISCLOSURE ──────────────────────────────────────────────────────
export function S03_Disclosure({ go }: { go: Go }) {
  return (
    <Screen>
      <View style={{ flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: W.primaryDim, alignItems: 'center', justifyContent: 'center' }}>
          <NavIcon name="shield" color={W.primary} />
        </View>
        <Txt font="comp" weight={700} style={{ marginTop: 24, fontSize: 22, color: W.text, textAlign: 'center' }}>Before we begin</Txt>
        <Txt font="user" style={{ marginTop: 16, fontSize: 15, color: W.text, lineHeight: 24, opacity: 0.9, maxWidth: 300, textAlign: 'center' }}>
          Everything in Whisper is AI-generated. You're talking with artificial intelligence, not a human.
        </Txt>
        <Txt font="user" style={{ marginTop: 16, fontSize: 15, color: W.text, lineHeight: 24, opacity: 0.9, maxWidth: 300, textAlign: 'center' }}>
          Your companion can make mistakes. It's not a therapist, doctor, or counselor. If you're in crisis, please reach out to the{' '}
          <Txt font="user" weight={500} style={{ color: W.accent }}>988 Suicide & Crisis Lifeline</Txt>.
        </Txt>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
        <PrimaryButton onPress={() => go('pronouns')}>I understand</PrimaryButton>
      </View>
    </Screen>
  );
}

const PRONOUN_GENDER: Record<string, string> = {
  'He / Him': 'male',
  'She / Her': 'female',
  'They / Them': 'non-binary',
};

// ─── S05 PRONOUNS ────────────────────────────────────────────────────────
export function S05_Pronouns({ go, onGender }: { go: Go; onGender?: (g: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const opts = ['He / Him', 'She / Her', 'They / Them'];
  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('disclosure')} />} center={<ProgressDots total={5} current={1} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Txt font="user" weight={600} style={{ fontSize: 11, color: W.text2, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>About you</Txt>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 31 }}>How should your companion refer to you?</Txt>
        <View style={{ marginTop: 32, flexDirection: 'row', gap: 12 }}>
          {opts.map(o => (
            <Pill
              key={o}
              active={picked === o}
              onPress={() => {
                setPicked(o);
                onGender?.(PRONOUN_GENDER[o] ?? 'non-binary');
                setTimeout(() => go('comm'), 300);
              }}
              style={{ flex: 1 }}
            >
              {o}
            </Pill>
          ))}
        </View>
        <Txt font="user" style={{ marginTop: 16, fontSize: 13, color: W.text2 }}>This helps your companion talk naturally with you.</Txt>
      </View>
    </Screen>
  );
}

const COMM_STYLE_MAP: Record<string, string> = {
  'Warm & gentle': 'warm',
  'Direct & honest': 'direct',
  'Funny & light': 'funny',
  'Calm & slow': 'calm',
};

// ─── S06 COMM STYLE ──────────────────────────────────────────────────────
export function S06_Comm({ go, onCommStyle }: { go: Go; onCommStyle?: (s: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const opts = ['Warm & gentle', 'Direct & honest', 'Funny & light', 'Calm & slow'];
  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('pronouns')} />} center={<ProgressDots total={5} current={2} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Txt font="user" weight={600} style={{ fontSize: 11, color: W.text2, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>About you</Txt>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 31 }}>How do you like conversations?</Txt>
        <View style={{ marginTop: 32, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {opts.map(o => (
            <Pill
              key={o}
              active={picked === o}
              onPress={() => {
                setPicked(o);
                onCommStyle?.(COMM_STYLE_MAP[o] ?? 'warm');
                setTimeout(() => go('handoff'), 300);
              }}
              style={{ width: '47%' }}
            >
              {o}
            </Pill>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// ─── HANDOFF ─────────────────────────────────────────────────────────────
export function S_Handoff({ go }: { go: Go }) {
  const breathe = useBreathe(2500);
  return (
    <Screen hideHomeIndicator ambient={false}>
      <AmbientBg intensity={1.6} includePulse />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: '20%', paddingBottom: 32, alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <View style={{ alignItems: 'center', gap: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: W.accent, shadowColor: W.accent, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }} />
              <Txt font="user" weight={600} style={{ fontSize: 10, color: W.text2, textTransform: 'uppercase', letterSpacing: 0.6 }}>About you</Txt>
              <Txt font="user" style={{ fontSize: 11, color: W.text3 }}>complete</Txt>
            </View>
            <Svg width={40} height={8} viewBox="0 0 40 8">
              <Line x1={2} y1={4} x2={38} y2={4} stroke={W.text3} strokeWidth={1} strokeDasharray="2 3" />
            </Svg>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Animated.View style={[{ width: 12, height: 12, borderRadius: 6, backgroundColor: W.primary, shadowColor: W.primary, shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } }, breathe]} />
              <Txt font="user" weight={600} style={{ fontSize: 10, color: W.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>Your companion</Txt>
              <Txt font="user" style={{ fontSize: 11, color: W.text3 }}>up next</Txt>
            </View>
          </View>
          <View style={{ alignItems: 'center', maxWidth: 300 }}>
            <FadeIn delay={200}><Txt font="comp" weight={700} style={{ fontSize: 28, color: W.text, letterSpacing: -0.6, lineHeight: 34, textAlign: 'center' }}>Now let's build your companion.</Txt></FadeIn>
            <FadeIn delay={500}><Txt font="user" style={{ marginTop: 14, fontSize: 14, color: W.text2, lineHeight: 21, textAlign: 'center' }}>Three choices — what they're like, how they sound, what to call them.</Txt></FadeIn>
          </View>
        </View>
        <FadeIn delay={800} style={{ width: '100%' }}>
          <PrimaryButton onPress={() => go('archetype')}>Continue</PrimaryButton>
        </FadeIn>
      </View>
      <HomeIndicator />
    </Screen>
  );
}

// ─── S04 ARCHETYPE ───────────────────────────────────────────────────────
export function S04_Archetype({ go, onPick }: { go: Go; onPick: (a: Archetype) => void }) {
  const cards: { id: Archetype; icon: any; title: string; sub: string }[] = [
    { id: 'friend', icon: 'two', title: 'Friend', sub: "A presence who's always there" },
    { id: 'mentor', icon: 'compass', title: 'Mentor', sub: 'Help thinking things through' },
    { id: 'partner', icon: 'heart', title: 'Partner', sub: 'Connection and affection' },
    { id: 'challenger', icon: 'target', title: 'Challenger', sub: 'Someone to keep you honest' },
  ];
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('handoff')} />} center={<ProgressDots total={5} current={3} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Txt font="user" weight={600} style={{ fontSize: 11, color: W.primary, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Your companion · 1 of 3</Txt>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 29 }}>What kind of presence?</Txt>
        <Txt font="user" style={{ marginTop: 6, fontSize: 14, color: W.text2 }}>Pick one — you can build more later.</Txt>
        <View style={{ marginTop: 24, gap: 12 }}>
          {cards.map(c => {
            const accent = ARCHETYPE_COLORS[c.id] || W.primary;
            const isSel = picked === c.id;
            return (
              <Card
                key={c.id}
                onPress={() => { setPicked(c.id); onPick(c.id); setTimeout(() => go('voice'), 300); }}
                border={isSel ? alpha(accent, '66') : undefined}
                bg={isSel ? alpha(accent, '1f') : undefined}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, transform: [{ translateY: isSel ? -4 : 0 }] }}
              >
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: accent, opacity: isSel ? 1 : 0.6 }} />
                <View style={{ width: 40, height: 40, borderRadius: 10, marginLeft: 6, backgroundColor: alpha(accent, '1f'), borderWidth: 1, borderColor: alpha(accent, '40'), alignItems: 'center', justifyContent: 'center' }}>
                  <NavIcon name={c.icon} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt font="comp" weight={600} style={{ fontSize: 16, color: W.text }}>{c.title}</Txt>
                  <Txt font="user" style={{ fontSize: 13, color: W.text2, marginTop: 2 }}>{c.sub}</Txt>
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

// ─── S07 VOICE ───────────────────────────────────────────────────────────
// Displays backend voices when apiVoices is provided; falls back to config VOICES.
// onPickVoice receives the voice UUID when using backend voices, or name otherwise.
export function S07_Voice({
  go,
  onPickVoice,
  apiVoices,
}: {
  go: Go;
  onPickVoice: (v: string) => void;
  apiVoices?: ApiVoice[];
}) {
  const [gender, setGender] = useState('female');
  const [voice, setVoice] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const playPreview = (id: string) => { setPlaying(id); setTimeout(() => setPlaying(null), 1800); };

  const usingApi = (apiVoices?.length ?? 0) > 0;

  // Unified display item: id = UUID (backend) or name (config fallback)
  const displayVoices = usingApi
    ? (apiVoices ?? [])
        .filter(v => v.gender === gender)
        .map(v => ({ id: v.id, name: v.name, desc: v.personality ?? '' }))
    : (VOICES[gender] ?? []).map(v => ({ id: v.n, name: v.n, desc: v.d }));

  const genderTabs = usingApi
    ? [{ k: 'male', l: 'Male' }, { k: 'female', l: 'Female' }]
    : [{ k: 'male', l: 'Male' }, { k: 'female', l: 'Female' }, { k: 'neutral', l: 'Neutral' }];

  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('archetype')} />} center={<ProgressDots total={5} current={4} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Txt font="user" weight={600} style={{ fontSize: 11, color: W.primary, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Your companion · 2 of 3</Txt>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 30 }}>How should they sound?</Txt>
        <Txt font="user" style={{ marginTop: 6, fontSize: 13, color: W.text2 }}>Tap any voice to hear a preview.</Txt>
        <View style={{ marginTop: 20, flexDirection: 'row', gap: 8 }}>
          {genderTabs.map(g => (
            <Pill key={g.k} active={gender === g.k} onPress={() => { setGender(g.k); setVoice(null); }} style={{ flex: 1, height: 38 }} textStyle={{ fontSize: 13 }}>{g.l} Voice</Pill>
          ))}
        </View>
        <ScrollView style={{ marginTop: 20 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {displayVoices.map(v => {
            const isSel = voice === v.id;
            const isPlay = playing === v.id;
            return (
              <Pressable
                key={v.id}
                onPress={() => { setVoice(v.id); playPreview(v.id); }}
                style={{
                  width: '31.5%', height: 110, borderRadius: 16, padding: 12,
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  backgroundColor: isSel ? 'rgba(94,234,212,0.10)' : 'rgba(26,29,46,0.6)',
                  borderWidth: isSel ? 2 : 1, borderColor: isSel ? W.accent : 'rgba(124,114,255,0.10)',
                  transform: [{ translateY: isSel ? -4 : 0 }],
                }}
              >
                <Waveform color={isPlay ? W.accent : W.primary} animate={isPlay} size={36} />
                <Txt font="user" weight={500} style={{ fontSize: 13, color: W.text }}>{v.name}</Txt>
                <Txt font="user" style={{ fontSize: 10, color: W.text2 }} numberOfLines={2}>{v.desc}</Txt>
                {isSel && !isPlay && (
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: W.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <NavIcon name="check" color={W.bg} size={10} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
        <PrimaryButton disabled={!voice} onPress={() => { if (voice) { onPickVoice(voice); go('name'); } }}>Continue</PrimaryButton>
      </View>
    </Screen>
  );
}

// ─── S08 NAME ────────────────────────────────────────────────────────────
export function S08_Name({ go, archetype, onPickName }: { go: Go; archetype: Archetype; onPickName: (n: string) => void }) {
  const suggestions = NAME_SUGGESTIONS[archetype] || NAME_SUGGESTIONS.mentor;
  const [name, setName] = useState(suggestions[0]);
  return (
    <Screen>
      <TopBar left={<BackBtn onPress={() => go('voice')} />} center={<ProgressDots total={5} current={5} />} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Txt font="user" weight={600} style={{ fontSize: 11, color: W.primary, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Your companion · 3 of 3</Txt>
        <Txt font="comp" weight={700} style={{ fontSize: 24, color: W.text, lineHeight: 30 }}>Give them a name.</Txt>
        <Txt font="user" style={{ marginTop: 6, fontSize: 13, color: W.text2 }}>Pick from below or write your own.</Txt>
        <View style={{ marginTop: 28, alignItems: 'center' }}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              backgroundColor: 'rgba(26,29,46,0.6)', color: W.text,
              borderWidth: 1, borderColor: 'rgba(124,114,255,0.25)',
              height: 64, borderRadius: 16, fontFamily: 'Manrope_600SemiBold', fontSize: 24,
              textAlign: 'center', width: '100%', maxWidth: 280,
            }}
          />
        </View>
        <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {suggestions.map(s => {
            const isSel = name === s;
            return (
              <Pressable
                key={s}
                onPress={() => setName(s)}
                style={{
                  backgroundColor: isSel ? alpha(W.primary, '1f') : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: isSel ? alpha(W.primary, '66') : 'rgba(255,255,255,0.06)',
                  paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999,
                }}
              >
                <Txt font="comp" weight={500} style={{ fontSize: 13, color: isSel ? W.primary : W.text2 }}>{s}</Txt>
              </Pressable>
            );
          })}
        </View>
        <Txt font="user" style={{ marginTop: 16, fontSize: 12, color: W.text3, textAlign: 'center' }}>You can always change this later.</Txt>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
        <PrimaryButton disabled={!name.trim()} onPress={() => { onPickName(name.trim()); go('meet'); }}>Meet {name.trim() || '…'}</PrimaryButton>
      </View>
    </Screen>
  );
}

// ─── MEET ─────────────────────────────────────────────────────────────────
function MeetWord({ word, index }: { word: string; index: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }, 300 + index * 90);
    return () => clearTimeout(t);
  }, []);
  return <Animated.View style={{ opacity: v }}><Txt font="comp" weight={500} style={{ fontSize: 17, color: W.text, lineHeight: 25 }}>{word}</Txt></Animated.View>;
}

export function S_Meet({ go, companion, accent = W.primary }: { go: Go; companion: { name: string; archetype: Archetype }; accent?: string }) {
  const [step, setStep] = useState<'arriving' | 'speaking' | 'ready'>('arriving');
  const meetIn = useMeetIn();
  const nameEntrance = useEntrance({ fromTranslateY: 8, durationMs: 600 });
  useEffect(() => {
    const t1 = setTimeout(() => setStep('speaking'), 1200);
    const t2 = setTimeout(() => setStep('ready'), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const greeting = `Hi — I'm ${companion.name}. I've been hoping to meet you.`;
  const words = greeting.split(' ');
  const showCompanion = step !== 'arriving';
  return (
    <Screen hideHomeIndicator ambient={false}>
      <AmbientBg intensity={2.4} includePulse />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, zIndex: 1 }}>
        <Animated.View style={meetIn}>
          <Orb state={step === 'speaking' ? 'speaking' : 'idle'} size={180} accent={accent} />
        </Animated.View>
        <View style={{ alignItems: 'center', opacity: showCompanion ? 1 : 0 }}>
          {showCompanion && (
            <Animated.View style={[{ marginTop: -20, flexDirection: 'row', alignItems: 'center', gap: 10 }, nameEntrance]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent, shadowColor: accent, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }} />
              <Txt font="comp" weight={600} style={{ fontSize: 28, color: W.text, letterSpacing: -0.3 }}>{companion.name}</Txt>
            </Animated.View>
          )}
          {showCompanion && (
            <View style={{ marginTop: 18, maxWidth: 300, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
              {words.map((w, i) => <MeetWord key={i} word={w} index={i} />)}
            </View>
          )}
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, minHeight: 80, justifyContent: 'flex-end' }}>
        {step === 'ready' && (
          <FadeIn translateY={0} style={{ width: '100%' }}>
            <PrimaryButton onPress={() => go('first-chat')}>Say hi</PrimaryButton>
          </FadeIn>
        )}
      </View>
      <HomeIndicator />
    </Screen>
  );
}
