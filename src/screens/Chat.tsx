// Chat.tsx — S09 First Conversation, S12 Voice Call, S13 Voice Note, S14 Chat.
// Ported from home.jsx (S09) + chat.jsx (S12–S14). UI kept identical to the
// prototype; web CSS (radial-gradients, backdrop blur, keyframes) is expressed
// with RadialGlow / BlurView / Animated equivalents.

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { Screen, TopBar } from '../components/Chrome';
import { AmbientBg } from '../components/AmbientBg';
import { RadialGlow } from '../components/RadialGlow';
import { Orb, OrbState } from '../components/Orb';
import { NavIcon, IconName } from '../components/NavIcon';
import { Txt } from '../components/Txt';
import { GlassPill, PrimaryButton, MemoryBadge, MinuteWarningBanner } from '../components/Atoms';
import { Bubble, BubbleMem, ChatInput, TypingDots, VoiceNoteBubble, CapHitCard, Coachmark } from '../components/ChatBits';
import { W, alpha } from '../theme/theme';
import { ARCHETYPE_LABEL, Companion, MinutesRemaining } from '../data/config';
import { Go } from '../navigation/types';

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

type Msg = {
  from: string;
  text?: string;
  memoryRefs?: string[];
  duration?: number;
  t?: string;
};

// ─── S09 FIRST CONVERSATION ──────────────────────────────────────────────
export function S09_FirstChat({ go, companion }: { go: Go; companion: Companion }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'comp', text: `Hey, this is ${companion.name}. Thanks for choosing me. I'd love to get to know you — what's been on your mind today?` },
  ]);
  const [draft, setDraft] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs]);

  const send = () => {
    if (!draft.trim()) return;
    const userMsg = draft.trim();
    const prevLen = msgs.length;
    setMsgs(m => [...m, { from: 'user', text: userMsg }]);
    setDraft('');
    setTimeout(() => {
      const next = prevLen >= 2
        ? `I really enjoyed this. I'll remember everything we talked about. Come back tomorrow?`
        : `That means a lot. Tell me more — I'm listening.`;
      setMsgs(m => [...m, { from: 'comp', text: next }]);
      setShowBadge(true);
      setTimeout(() => setShowBadge(false), 3000);
      if (prevLen >= 2) setTimeout(() => setShowContinue(true), 600);
    }, 1200);
  };

  return (
    <Screen>
      <TopBar
        center={
          <View style={{ alignItems: 'center' }}>
            <Txt font="comp" weight={600} style={{ fontSize: 15, color: W.text }}>{companion.name}</Txt>
            <Txt font="user" style={{ fontSize: 11, color: W.text2 }}>Guided first chat</Txt>
          </View>
        }
        bg="rgba(15,17,26,0.55)"
        border
      />
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 8 }}
      >
        {msgs.map((m, i) => <Bubble key={i} from={m.from} text={m.text || ''} memoryRefs={m.memoryRefs} />)}
        <View style={{ alignSelf: 'center', marginTop: 6 }}>
          <MemoryBadge show={showBadge} />
        </View>
      </ScrollView>
      {showContinue ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: W.surface1, borderTopWidth: 1, borderTopColor: W.surface2 }}>
          <PrimaryButton onPress={() => go('home')}>Continue to home</PrimaryButton>
        </View>
      ) : (
        <ChatInput draft={draft} setDraft={setDraft} onSend={send} companionName={companion.name} />
      )}
    </Screen>
  );
}

// ─── S12 VOICE CALL ──────────────────────────────────────────────────────
interface VoiceCallProps {
  go: Go;
  companion: Companion;
  accent?: string;
  orbIntensity?: number;
  minutesRemaining?: MinutesRemaining | 'critical';
}

type Step = { st: OrbState; cap: string | null; ms: number; pill: string; memHint?: boolean };

export function S12_VoiceCall({ go, companion, accent = W.primary, orbIntensity = 1, minutesRemaining = 'normal' }: VoiceCallProps) {
  const [state, setState] = useState<OrbState>('idle');
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [caption, setCaption] = useState<string | null>(null);
  const [pillText, setPillText] = useState('Reflecting on last session…');

  const minutesLeft = minutesRemaining === 'low' ? 5 : minutesRemaining === 'critical' ? 1 : null;

  // session timer
  useEffect(() => {
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // simulated state cycle: reflecting → listening → thinking → speaking → memory → loop
  useEffect(() => {
    const sequence: Step[] = [
      { st: 'thinking', cap: null, ms: 1800, pill: 'Reflecting on last session…' },
      { st: 'listening', cap: null, ms: 2200, pill: 'Listening…' },
      { st: 'thinking', cap: null, ms: 1200, pill: 'Thinking…' },
      { st: 'speaking', cap: 'I remember you mentioned your interview…', ms: 3000, pill: companion.name, memHint: true },
      { st: 'speaking', cap: 'How are you feeling about it now?', ms: 2500, pill: companion.name },
      { st: 'listening', cap: null, ms: 2200, pill: 'Listening…' },
    ];
    let i = 0;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (!alive) return;
      const step = sequence[i % sequence.length];
      setState(step.st);
      setCaption(step.cap);
      setPillText(step.pill);
      if (step.memHint) {
        setState('memory');
        setTimeout(() => { if (alive) setState('speaking'); }, 500);
      }
      i++;
      timer = setTimeout(tick, step.ms);
    };
    tick();
    return () => { alive = false; clearTimeout(timer); };
  }, [companion.name]);

  return (
    <Screen ambient={false}>
      <AmbientBg intensity={2.2} includePulse />
      {/* extra accent halo behind orb */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '20%', left: '50%', marginLeft: -300, width: 600, height: 600 }}>
        <RadialGlow
          width={600}
          height={600}
          stops={[
            { offset: 0, color: accent, opacity: 0.3 },
            { offset: 0.55, color: W.bg, opacity: 0 },
          ]}
        />
      </View>
      <TopBar
        left={
          <Pressable onPress={() => go('home')}>
            <NavIcon name="down" color={W.text2} />
          </Pressable>
        }
        center={
          <View style={{ height: 28, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <BlurPill>
              <NavIcon name="sparkle" color={W.secondary} size={14} />
              <Txt font="user" weight={500} style={{ fontSize: 12, color: W.text2 }}>{pillText}</Txt>
            </BlurPill>
          </View>
        }
        right={<Txt font="user" style={{ fontSize: 11, color: W.text2, opacity: 0.5 }}>{fmt(time)}</Txt>}
      />
      {minutesLeft != null && <MinuteWarningBanner minutes={minutesLeft} onTopUp={() => go('topup')} />}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Orb state={state} size={180} accent={accent} intensity={orbIntensity} />
        <View style={{ marginTop: -20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent, shadowColor: accent, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} />
          <Txt font="comp" weight={600} style={{ fontSize: 22, color: W.text }}>{companion.name}</Txt>
        </View>
        <BlurInCaption text={caption} />
      </View>
      {/* Floating glass control pill */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 80, alignItems: 'center' }}>
        <GlassPill style={{ padding: 8 }}>
          <CallBtn icon="chat" onPress={() => go('chat')} />
          <CallBtn icon="close" bg={W.danger} size={60} onPress={() => go('home')} />
          <CallBtn icon={muted ? 'mute' : 'mic'} active={muted} onPress={() => setMuted(m => !m)} />
        </GlassPill>
      </View>
    </Screen>
  );
}

function BlurPill({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(26,29,46,0.55)' }}>
      {children}
    </View>
  );
}

// Caption that blur-fades-in word by word (approximated: per-word fade + slight rise).
function BlurInCaption({ text }: { text: string | null }) {
  if (!text) return <View style={{ marginTop: 16, minHeight: 22 }} />;
  const words = text.split(' ');
  return (
    <View style={{ marginTop: 16, minHeight: 22, maxWidth: 280, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
      {words.map((w, i) => <Word key={`${text}-${i}`} word={w} index={i} />)}
    </View>
  );
}
function Word({ word, index }: { word: string; index: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 360, delay: index * 60, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.Text
      style={{
        opacity: v, color: W.text, fontFamily: 'Manrope_500Medium', fontSize: 16, lineHeight: 23,
        marginRight: 6, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }],
      }}
    >
      {word}
    </Animated.Text>
  );
}

function CallBtn({ icon, onPress, bg, active, size = 52 }: { icon: IconName; onPress?: () => void; bg?: string; active?: boolean; size?: number }) {
  const isDanger = bg === W.danger;
  const content = (
    <NavIcon name={icon} color={isDanger ? '#fff' : active ? W.danger : W.text} />
  );
  if (bg) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          width: size, height: size, borderRadius: size / 2, backgroundColor: bg,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: isDanger ? W.danger : '#000', shadowOpacity: isDanger ? 0.5 : 0, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
        }}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: active ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {content}
    </Pressable>
  );
}

// ─── S13 VOICE NOTE — recording sheet ────────────────────────────────────
function S13_VoiceNote({ onClose, onSend }: { onClose: () => void; onSend: (t: number) => void }) {
  const [time, setTime] = useState(0);
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setInterval(() => setTime(s => s + 1), 1000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    return () => clearInterval(t);
  }, []);
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });
  return (
    <View
      style={{
        position: 'absolute', bottom: 64, left: 0, right: 0, zIndex: 20,
        backgroundColor: W.surface1, borderTopWidth: 1, borderTopColor: W.surface2,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        paddingVertical: 16, paddingHorizontal: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Pressable onPress={onClose} style={{ padding: 6 }}>
        <NavIcon name="close" color={W.text2} />
      </Pressable>
      <Pressable onPress={() => onSend(time)}>
        <Animated.View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: W.primary, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
          <NavIcon name="mic" color="#fff" />
        </Animated.View>
      </Pressable>
      <Txt font="user" style={{ fontSize: 14, color: W.text }}>{fmt(time)}</Txt>
    </View>
  );
}

// ─── S14 CHAT ────────────────────────────────────────────────────────────
interface ChatProps {
  go: Go;
  companion: Companion;
  accent?: string;
  openMemorySheet?: (ref: string) => void;
  capHit?: boolean;
  userName?: string;
  firstRun?: boolean;
}

export function S14_Chat({ go, companion, accent = W.primary, openMemorySheet, capHit = false, userName = 'Aria', firstRun = false }: ChatProps) {
  const [msgs, setMsgs] = useState<Msg[]>(
    firstRun
      ? [{ from: 'comp', text: `So — what's been on your mind lately?`, t: 'today' }]
      : [
        { from: 'comp', text: `Hey ${userName}, how are you doing today?`, t: 'today' },
        { from: 'user', text: "honestly, kinda nervous about tomorrow's interview" },
        { from: 'comp', text: 'I remember you mentioning your interview is tomorrow. What part is making you most nervous?', memoryRefs: ['I remember you mentioning your interview is tomorrow'] },
        { from: 'user', text: "the technical round. I haven't done one in years" },
        { from: 'voiceUser', duration: 14 },
        { from: 'comp', text: "That's totally understandable. Want to do a quick mock round right now? We can keep it light." },
      ],
  );
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showPhoneTip, setShowPhoneTip] = useState(firstRun);
  const [showMemoryTip, setShowMemoryTip] = useState(false);
  const [seenFirstMemory, setSeenFirstMemory] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!showPhoneTip) return;
    const t = setTimeout(() => setShowPhoneTip(false), 5000);
    return () => clearTimeout(t);
  }, [showPhoneTip]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    const userMsgCount = msgs.filter(m => m.from === 'user').length;
    setMsgs(m => [...m, { from: 'user', text }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const isFirstReply = firstRun && userMsgCount === 0;
      const reply: Msg = isFirstReply
        ? { from: 'comp', text: `Thanks for telling me. I'll remember that — it matters to me to know what you're carrying.`, memoryRefs: ["I'll remember that"] }
        : { from: 'comp', text: `Tell me more about that — I'm here.` };
      setMsgs(m => [...m, reply]);
      setTyping(false);
      setShowBadge(true);
      if (firstRun && !seenFirstMemory) {
        setSeenFirstMemory(true);
        setShowMemoryTip(true);
        setTimeout(() => setShowMemoryTip(false), 6000);
      }
      setTimeout(() => setShowBadge(false), 3000);
    }, 1500);
  };

  return (
    <Screen>
      <TopBar
        left={
          <Pressable onPress={() => go('home')}>
            <NavIcon name="back" color={W.text2} />
          </Pressable>
        }
        center={
          <View style={{ alignItems: 'center' }}>
            <Txt font="comp" weight={600} style={{ fontSize: 15, color: W.text }}>{companion.name}</Txt>
            <Txt font="user" style={{ fontSize: 11, color: W.text2 }}>{ARCHETYPE_LABEL[companion.archetype]}</Txt>
          </View>
        }
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View>
              <Pressable onPress={() => { setShowPhoneTip(false); go('call'); }} style={{ padding: 4 }}>
                <NavIcon name="phone" color={W.primary} />
                {showPhoneTip && <PhoneHalo />}
              </Pressable>
              {showPhoneTip && (
                <Coachmark
                  text={`Tap to talk to ${companion.name} with your voice`}
                  onDismiss={() => setShowPhoneTip(false)}
                  style={{ top: '100%', right: 0, marginTop: 12 }}
                />
              )}
            </View>
            <Pressable onPress={() => go('profile')} style={{ padding: 4 }}>
              <NavIcon name="kebab" color={W.text2} />
            </Pressable>
          </View>
        }
        bg="rgba(15,17,26,0.6)"
        border
      />
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }}
      >
        <Txt font="user" style={{ alignSelf: 'center', fontSize: 11, color: W.text3, paddingVertical: 4 }}>Today, 11:23 PM</Txt>
        {msgs.map((m, i) =>
          m.from === 'voiceUser' || m.from === 'voiceComp'
            ? <VoiceNoteBubble key={i} from={m.from === 'voiceUser' ? 'user' : 'comp'} duration={m.duration} />
            : <BubbleMem key={i} from={m.from} text={m.text || ''} memoryRefs={m.memoryRefs} accent={accent} onMemoryClick={openMemorySheet} />,
        )}
        {typing && <TypingDots />}
        <View style={{ alignSelf: 'center', marginTop: 6 }}>
          <MemoryBadge show={showBadge} />
          {showMemoryTip && (
            <View
              style={{
                marginTop: 10, width: 240, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
                backgroundColor: 'rgba(26,29,46,0.85)', borderWidth: 1, borderColor: 'rgba(94,234,212,0.22)',
              }}
            >
              <Txt font="user" style={{ fontSize: 12, color: W.text, lineHeight: 18 }}>
                This is how {companion.name} remembers you. Tap any <Txt font="user" weight={500} style={{ color: W.accent }}>teal phrase</Txt> to see what they recall.
              </Txt>
            </View>
          )}
        </View>
        {capHit && <CapHitCard onUpgrade={() => go('paywall')} />}
      </ScrollView>
      {recording && (
        <S13_VoiceNote
          onClose={() => setRecording(false)}
          onSend={(d) => { setMsgs(m => [...m, { from: 'voiceUser', duration: d || 8 }]); setRecording(false); }}
        />
      )}
      <ChatInput draft={draft} setDraft={setDraft} onSend={send} onMic={() => setRecording(true)} companionName={companion.name} />
    </Screen>
  );
}

// Pulsing ring halo around the phone icon (CSS ctaHalo keyframe).
function PhoneHalo() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.out(Easing.ease), useNativeDriver: true })).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 12,
        borderWidth: 2, borderColor: W.primary,
        opacity: v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.45, 0, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
      }}
    />
  );
}
