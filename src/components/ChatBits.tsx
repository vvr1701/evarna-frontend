// ChatBits.tsx — shared chat UI: Bubble, BubbleMem (with inline memory refs),
// ChatInput, TypingDots, VoiceNoteBubble, CapHitCard, Coachmark.
// Ported from home.jsx + chat.jsx.

import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, TextInput, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Txt } from './Txt';
import { NavIcon } from './NavIcon';
import { MemoryRef } from './Atoms';
import { useDotPulse } from '../theme/animations';
import { W, alpha } from '../theme/theme';

// ─── Bubble (simple, first-chat) ─────────────────────────────────────────
export function Bubble({ from, text, memoryRefs = [] }: { from: string; text: string; memoryRefs?: string[] }) {
  const isUser = from === 'user';
  return (
    <View
      style={{
        maxWidth: '78%', alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? W.surface2 : 'rgba(124,114,255,0.12)',
        borderRadius: 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        borderTopRightRadius: isUser ? 4 : 16,
        paddingVertical: 10, paddingHorizontal: 14,
      }}
    >
      <RefText text={text} memoryRefs={memoryRefs} isUser={isUser} />
    </View>
  );
}

// Renders body text with memory-reference substrings tinted teal.
function RefText({
  text, memoryRefs, isUser, onMemoryClick, asMemoryRef = false,
}: {
  text: string; memoryRefs: string[]; isUser: boolean;
  onMemoryClick?: (ref: string) => void; asMemoryRef?: boolean;
}) {
  const font = isUser ? 'user' : 'comp';
  const weight = isUser ? 400 : 500;
  const baseStyle = { fontSize: 15, lineHeight: 21, color: W.text } as const;

  if (!memoryRefs.length) {
    return <Txt font={font} weight={weight} style={baseStyle}>{text}</Txt>;
  }

  // Split text around each ref, in order.
  let parts: (string | { ref: string })[] = [text];
  memoryRefs.forEach(ref => {
    parts = parts.flatMap(p => {
      if (typeof p !== 'string') return [p];
      const chunks = p.split(ref);
      const out: (string | { ref: string })[] = [];
      chunks.forEach((chunk, i) => {
        out.push(chunk);
        if (i < chunks.length - 1) out.push({ ref });
      });
      return out;
    });
  });

  return (
    <Txt font={font} weight={weight} style={baseStyle}>
      {parts.map((p, i) =>
        typeof p === 'string'
          ? p
          : asMemoryRef
            ? <MemoryRef key={i} onPress={() => onMemoryClick?.(p.ref)}>{p.ref}</MemoryRef>
            : <Txt key={i} font={font} weight={500} style={{ color: W.accent }}>{p.ref}</Txt>
      )}
    </Txt>
  );
}

// ─── BubbleMem (glassy, with tappable memory refs) ───────────────────────
export function BubbleMem({
  from, text, memoryRefs = [], accent = W.primary, onMemoryClick,
}: {
  from: string; text: string; memoryRefs?: string[]; accent?: string; onMemoryClick?: (ref: string) => void;
}) {
  const isUser = from === 'user';
  const bg = isUser ? 'rgba(37,40,54,0.75)' : alpha(accent, '1a');
  return (
    <View
      style={{
        maxWidth: '78%', alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: bg,
        borderWidth: 1, borderColor: isUser ? 'rgba(255,255,255,0.04)' : alpha(accent, '26'),
        borderRadius: 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        borderTopRightRadius: isUser ? 4 : 16,
        paddingVertical: 10, paddingHorizontal: 14,
        borderLeftWidth: isUser ? 1 : 1,
        borderLeftColor: isUser ? 'rgba(255,255,255,0.04)' : alpha(accent, '66'),
      }}
    >
      <RefText text={text} memoryRefs={memoryRefs} isUser={isUser} onMemoryClick={onMemoryClick} asMemoryRef />
    </View>
  );
}

// ─── ChatInput ───────────────────────────────────────────────────────────
export function ChatInput({
  draft, setDraft, onSend, onMic, companionName,
}: {
  draft: string; setDraft: (v: string) => void; onSend: () => void; onMic?: () => void; companionName: string;
}) {
  return (
    <View
      style={{
        borderTopWidth: 1, borderTopColor: 'rgba(124,114,255,0.10)',
        paddingVertical: 10, paddingHorizontal: 12,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(15,17,26,0.55)', overflow: 'hidden', zIndex: 2,
      }}
    >
      <BlurView intensity={32} tint="dark" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Pressable onPress={onMic} style={{ padding: 6 }}>
        <NavIcon name="mic" color={W.text2} />
      </Pressable>
      <View
        style={{
          flex: 1, backgroundColor: 'rgba(37,40,54,0.7)',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
          height: 44, borderRadius: 22, justifyContent: 'center', paddingHorizontal: 16,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={onSend}
          placeholder={`Talk to ${companionName}…`}
          placeholderTextColor={W.text2}
          style={{ color: W.text, fontFamily: 'Outfit_400Regular', fontSize: 15, padding: 0 }}
        />
      </View>
      {draft.trim().length > 0 && (
        <Pressable
          onPress={onSend}
          style={{
            backgroundColor: W.primary, width: 36, height: 36, borderRadius: 18,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: W.primary, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
          }}
        >
          <NavIcon name="send" color="#fff" size={20} />
        </Pressable>
      )}
    </View>
  );
}

// ─── TypingDots ────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <View
      style={{
        maxWidth: 60, alignSelf: 'flex-start',
        backgroundColor: alpha(W.primary, '1f'),
        borderRadius: 16, borderTopLeftRadius: 4,
        paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 4,
      }}
    >
      {[0, 1, 2].map(i => <TypingDot key={i} delay={i * 150} />)}
    </View>
  );
}
function TypingDot({ delay }: { delay: number }) {
  const pulse = useDotPulse(delay);
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: W.primary }, pulse]} />;
}

// ─── VoiceNoteBubble ─────────────────────────────────────────────────────
export function VoiceNoteBubble({ from, duration = 12 }: { from: string; duration?: number }) {
  const isUser = from === 'user';
  const [playing, setPlaying] = useState(false);
  const color = isUser ? W.text2 : W.primary;
  const bars = [4, 6, 10, 16, 12, 8, 14, 20, 16, 10, 18, 14, 8, 12, 16, 22, 14, 10, 16, 8, 6, 4];
  return (
    <View
      style={{
        maxWidth: '70%', alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? W.surface2 : 'rgba(124,114,255,0.12)',
        borderRadius: 16, borderTopLeftRadius: isUser ? 16 : 4, borderTopRightRadius: isUser ? 4 : 16,
        paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
      }}
    >
      <Pressable
        onPress={() => setPlaying(p => !p)}
        style={{ backgroundColor: color, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
      >
        <NavIcon name={playing ? 'pause' : 'play'} color={isUser ? W.text : '#fff'} size={18} />
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 }}>
        {bars.map((h, i) => (
          <View key={i} style={{ width: 2, height: h, backgroundColor: color, opacity: 0.7, borderRadius: 1 }} />
        ))}
      </View>
      <Txt font="user" style={{ fontSize: 11, color: W.text2 }}>0:{String(duration).padStart(2, '0')}</Txt>
    </View>
  );
}

// ─── CapHitCard ──────────────────────────────────────────────────────────
export function CapHitCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View
      style={{
        alignSelf: 'center', maxWidth: '85%', marginTop: 12,
        backgroundColor: W.surface1, borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: W.surface2, gap: 10, alignItems: 'flex-start',
      }}
    >
      <Txt font="user" style={{ fontSize: 13, color: W.text, lineHeight: 18 }}>
        Want unlimited conversations? Upgrade to Plus.
      </Txt>
      <Pressable onPress={onUpgrade} style={{ backgroundColor: W.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 }}>
        <Txt font="user" weight={500} style={{ fontSize: 12, color: '#fff' }}>See plans</Txt>
      </Pressable>
    </View>
  );
}

// ─── Coachmark ─────────────────────────────────────────────────────────
export function Coachmark({ text, onDismiss, style }: { text: string; onDismiss?: () => void; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, []);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  return (
    <Animated.View style={[{ position: 'absolute', opacity: v, transform: [{ translateY }], zIndex: 20 }, style]}>
      <Pressable
        onPress={onDismiss}
        style={{
          width: 200, paddingVertical: 10, paddingHorizontal: 12,
          backgroundColor: 'rgba(26,29,46,0.92)', borderRadius: 12,
          borderWidth: 1, borderColor: 'rgba(124,114,255,0.30)',
          shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 28, shadowOffset: { width: 0, height: 10 },
        }}
      >
        <Txt font="user" style={{ fontSize: 12, color: W.text, lineHeight: 17 }}>{text}</Txt>
      </Pressable>
    </Animated.View>
  );
}
