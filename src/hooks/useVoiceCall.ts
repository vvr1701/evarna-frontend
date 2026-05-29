import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CallError,
  CallPhase,
  OrbState,
} from '../lib/voiceCall';

// ⚠️ EXPO GO COMPATIBILITY STUB
// The real implementation lives in useVoiceCall.dev-client.ts.disabled (see below)
// and requires @livekit/react-native, which needs native code unavailable in Expo Go.
// In Expo Go we run a friendly UI-only state cycle so the screen still renders.
// To restore voice for dev-client builds: see Phase-2 wiring notes in the repo.

interface UseVoiceCallParams {
  userId?: string;
  characterId?: string;
  enabled: boolean;
  onEnded?: () => void;
}

interface UseVoiceCallReturn {
  phase: CallPhase;
  orbState: OrbState;
  muted: boolean;
  error: CallError | null;
  toggleMute: () => void;
  hangUp: () => Promise<void>;
  retry: () => void;
}

export function useVoiceCall(_params: UseVoiceCallParams): UseVoiceCallReturn {
  const [phase, setPhase] = useState<CallPhase>('connecting');
  const [orbState, setOrbState] = useState<OrbState>('thinking');
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('connected'), 800);
    return () => clearTimeout(t);
  }, []);

  // Simulated orb state cycle so the screen doesn't feel dead in Expo Go.
  useEffect(() => {
    if (phase !== 'connected') return;
    const sequence: OrbState[] = ['thinking', 'listening', 'thinking', 'speaking', 'speaking', 'listening'];
    let i = 0;
    const tick = setInterval(() => {
      setOrbState(sequence[i % sequence.length]);
      i++;
    }, 2000);
    return () => clearInterval(tick);
  }, [phase]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const hangUp = useCallback(async () => { setPhase('ended'); }, []);
  const retry = useCallback(() => { setPhase('connecting'); }, []);

  return useMemo(
    () => ({ phase, orbState, muted, error: null, toggleMute, hangUp, retry }),
    [phase, orbState, muted, toggleMute, hangUp, retry],
  );
}
