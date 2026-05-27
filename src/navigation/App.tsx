// App.tsx (navigation) — main orchestrator replicating app.jsx's string-based
// router. Keeps the exact go(screen) + tab behavior of the prototype.

import React, { useState } from 'react';
import { View } from 'react-native';
import { W } from '../theme/theme';
import { ScreenName } from './types';
import {
  CONFIG, PLUS_COMPANIONS, FREE_COMPANIONS, STUDIO_ACTIVE_CONVOS,
  SCENARIOS, SANDBOX_MODES, ARCHETYPE_COLORS, Companion, Scenario, SandboxMode,
} from '../data/config';
import { BottomNav, TabId } from '../components/BottomNav';

import {
  S01_Splash, S02_Age, S03_Disclosure, S05_Pronouns, S06_Comm, S_Handoff,
  S04_Archetype, S07_Voice, S08_Name, S_Meet,
} from '../screens/Onboarding';
import { S10_Home, S11_AddCompanion } from '../screens/Home';
import { S09_FirstChat, S12_VoiceCall, S14_Chat } from '../screens/Chat';
import {
  S15_StudioHome, S16_ScenarioSetup, S17_StudioSession, S18_CharacterCreator,
  Character,
} from '../screens/Studio';
import { S19_SandboxHome, S20_SandboxSession } from '../screens/Sandbox';
import { S21_Settings, S22_Memories, S23_Paywall, S24_TopUp } from '../screens/Settings';
import {
  S25_NotifPermission, S26_CompanionEdit, S27_StartCallDepleted,
  S28_CrisisChat, S29_Recap, S30_Login,
} from '../screens/Extras';

const t = CONFIG;

export default function App() {
  // Routing
  const [screen, setScreen] = useState<ScreenName>(t.showFirstChat ? 'splash' : 'home');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [sandboxMode, setSandboxMode] = useState<SandboxMode | null>(null);
  const [paywallTrigger] = useState('voice');

  // Onboarding-collected
  const [, setVoicePick] = useState<string | null>(null);
  const [archetypePick, setArchetypePick] = useState<Companion['archetype']>('mentor');
  const [companionName, setCompanionName] = useState(t.companionName || 'Sage');

  // characters (Studio)
  const [characters, setCharacters] = useState<Character[]>([]);

  // settings
  const [settings, setSettings] = useState({
    dailyCheckin: true, weeklyReflection: true, autoPlay: true, liveCaptions: true,
  });

  const companions = t.tier === 'free' ? FREE_COMPANIONS : PLUS_COMPANIONS.slice(0, t.tier === 'plus' ? 3 : 5);
  const isMinor = false;
  const currentCompanion: Companion = activeCompanion || companions[0];

  // Navigation helper — mirrors prototype go()
  const go = (s: ScreenName) => {
    setScreen(s);
    if (s === 'home' || s === 'first-chat') setActiveTab('home');
    if (s === 'studio' || s === 'scenario-setup' || s === 'studio-session' || s === 'character-creator') setActiveTab('studio');
    if (s === 'sandbox' || s === 'sandbox-session') setActiveTab('sandbox');
    if (s === 'settings' || s === 'memories' || s === 'topup') setActiveTab('settings');
  };

  const onTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'studio') setScreen('studio');
    if (tab === 'sandbox') setScreen('sandbox');
    if (tab === 'settings') setScreen('settings');
  };

  // Home rendered plainly (used both as a screen and as the backdrop for sheets)
  const renderHome = (interactive: boolean) => (
    <S10_Home
      go={interactive ? go : () => {}}
      tier={t.tier}
      companions={companions}
      userName={t.userName}
      onSelectCompanion={interactive ? (c) => { setActiveCompanion(c); setScreen('chat'); } : () => {}}
      onCallCompanion={interactive ? (c) => {
        setActiveCompanion(c);
        if (t.minutesRemaining === 'zero') setScreen('callDepleted');
        else setScreen('call');
      } : () => {}}
    />
  );

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <S01_Splash go={go} />;
      case 'age': return <S02_Age go={go} />;
      case 'disclosure': return <S03_Disclosure go={go} />;
      case 'pronouns': return <S05_Pronouns go={go} />;
      case 'comm': return <S06_Comm go={go} />;
      case 'handoff': return <S_Handoff go={go} />;
      case 'archetype': return <S04_Archetype go={go} onPick={setArchetypePick} />;
      case 'voice': return <S07_Voice go={go} onPickVoice={setVoicePick} />;
      case 'name': return <S08_Name go={go} archetype={archetypePick} onPickName={setCompanionName} />;
      case 'meet': return <S_Meet go={go} companion={{ name: companionName, archetype: archetypePick }} accent={ARCHETYPE_COLORS[archetypePick] || W.primary} />;
      case 'notif': return <S25_NotifPermission go={go} companion={{ id: 'new', name: companionName, archetype: archetypePick }} />;
      case 'first-chat': return <S14_Chat go={(s) => go(s)} companion={{ id: 'new', name: companionName, archetype: archetypePick }} accent={t.orbHue} userName={t.userName} firstRun openMemorySheet={() => {}} />;
      case 'home': return renderHome(true);
      case 'callDepleted': return <S27_StartCallDepleted companion={currentCompanion} onClose={() => setScreen('home')} onTopUp={() => setScreen('topup')} onUpgrade={() => setScreen('paywall')} onText={() => setScreen('chat')} />;
      case 'add-companion': return <S11_AddCompanion go={go} tier={t.tier} onCreate={(c) => { PLUS_COMPANIONS.push({ id: String(Date.now()), ...c, memory: '', lastTalked: 'New' } as Companion); }} />;
      case 'call': return <S12_VoiceCall go={(s) => go(s)} companion={currentCompanion} accent={t.orbHue} orbIntensity={1} minutesRemaining={t.minutesRemaining} />;
      case 'chat': return <S14_Chat go={(s) => go(s)} companion={currentCompanion} accent={t.orbHue} capHit={t.capHit} userName={t.userName} openMemorySheet={() => {}} />;
      case 'crisis': return <S28_CrisisChat go={go} companion={currentCompanion} />;
      case 'profile': return <S26_CompanionEdit go={(s) => go(s)} companion={currentCompanion} onDelete={() => {}} />;
      case 'recap': return (
        <View style={{ flex: 1 }}>
          {renderHome(false)}
          <S29_Recap go={go} companion={currentCompanion} />
        </View>
      );
      case 'studio': return <S15_StudioHome go={go} tier={t.tier} characters={characters} activeConvos={STUDIO_ACTIVE_CONVOS}
        setupScenario={(s) => { setScenario(s); setScreen('scenario-setup'); }}
        resumeConvo={(c) => {
          const sc = SCENARIOS.find(x => x.id === (c as any).scenarioId) || ({ id: 'custom', icon: c.icon, name: c.name, desc: '', accent: c.accent } as Scenario);
          setScenario(sc); setScreen('studio-session');
        }}
        openCreator={() => setScreen('character-creator')} />;
      case 'scenario-setup': return <S16_ScenarioSetup go={go} scenario={scenario || SCENARIOS[0]} onStart={() => setScreen('studio-session')} />;
      case 'studio-session': return <S17_StudioSession go={go} scenario={scenario || SCENARIOS[0]} />;
      case 'character-creator': return <S18_CharacterCreator go={go} onSave={(c) => setCharacters(cs => [...cs, c])} />;
      case 'sandbox': return <S19_SandboxHome go={go} comingSoon={t.sandboxComingSoon} isMinor={isMinor} openMode={(m) => { setSandboxMode(m); setScreen('sandbox-session'); }} />;
      case 'sandbox-session': return <S20_SandboxSession go={go} mode={sandboxMode || SANDBOX_MODES[0]} />;
      case 'settings': return <S21_Settings go={go} tier={t.tier} companions={companions} userName={t.userName} userEmail={`${t.userName.toLowerCase()}@whisper.app`} settings={settings} setSettings={setSettings} />;
      case 'memories': return <S22_Memories go={go} />;
      case 'paywall': return <S23_Paywall go={go} trigger={paywallTrigger} currentTier={t.tier} />;
      case 'topup': return <S24_TopUp go={go} />;
      case 'login': return <S30_Login go={go} />;
      default: return renderHome(true);
    }
  };

  const showNav = ['home', 'studio', 'sandbox', 'settings', 'memories', 'topup', 'recap'].includes(screen);
  const isModalOverHome = screen === 'paywall' || screen === 'topup' || screen === 'callDepleted';

  return (
    <View style={{ flex: 1, backgroundColor: W.bg }}>
      {isModalOverHome ? (
        <>
          {renderHome(false)}
          {renderScreen()}
        </>
      ) : (
        <View style={{ flex: 1 }}>{renderScreen()}</View>
      )}
      {showNav ? <BottomNav active={activeTab} onChange={onTabChange} sandboxComingSoon={t.sandboxComingSoon} /> : null}
    </View>
  );
}
