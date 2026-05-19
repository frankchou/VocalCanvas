'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
// rendering state 由 LangContext 統一管理，overlay 渲染在 AppShell .main 層
import Steps from '@/components/ui/Steps';
import Slider from '@/components/ui/Slider';
import GenderSelector from '@/components/ui/GenderSelector';
import VoicePresets, { PRESETS } from '@/components/ui/VoicePresets';
import ScenarioSelector, { SCENARIOS } from '@/components/app/ScenarioSelector';
import BGMPicker, { BGM_TRACKS } from '@/components/app/BGMPicker';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlay,
  IconPause,
  IconPlus,
  IconSparkles,
  IconSkipBack,
  IconSkipForward,
  IconHeart,
  IconHeartFill,
  IconLibrary,
  IconDownload,
  IconCheck,
} from '@/components/ui/Icons';

// ---- Types ----
type Step = 0 | 1 | 2;
type Gender = 'male' | 'female';

interface VoiceState {
  gender: Gender;
  age: number;
  pitch: number;
  timbre: number;
  preset: string | null;
}

type ScriptNode = { type: 'text'; value: string } | { type: 'delay'; seconds: number };

interface AppState {
  voice: VoiceState;
  script: ScriptNode[];
}

// ---- Constants ----
const PRESET_TUNING: Record<string, { age: number; pitch: number; timbre: number }> = {
  dawn:  { age: 32, pitch: 70, timbre: 24 },
  mist:  { age: 58, pitch: 28, timbre: 38 },
  ember: { age: 42, pitch: 64, timbre: 72 },
  glass: { age: 30, pitch: 56, timbre: 18 },
};

const INITIAL_STATE: AppState = {
  voice: { gender: 'female', age: 50, pitch: 50, timbre: 30, preset: null },
  script: [
    { type: 'text', value: '歡迎來到 VocalCanvas。' },
    { type: 'delay', seconds: 0.8 },
    { type: 'text', value: '在這裡，每段文字都能擁有自己的聲音。' },
    { type: 'delay', seconds: 1.2 },
    { type: 'text', value: '試著挑一個聲音，調整你想要的音色 — ' },
    { type: 'delay', seconds: 0.5 },
    { type: 'text', value: '然後讓 AI 為你朗讀。' },
  ],
};

const PREVIEW_WAVE_HEIGHTS = [
  8, 14, 20, 26, 22, 16, 12, 18, 24, 20, 14, 10, 16, 22, 18, 12, 8, 14, 20, 26, 18, 12, 8, 14,
];

// ---- Step 0: Voice Setup ----
interface VoiceSetupScreenProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  scenarioId: string;
  setScenarioId: React.Dispatch<React.SetStateAction<string>>;
  bgmTrack: string;
  setBgmTrack: React.Dispatch<React.SetStateAction<string>>;
  bgmVolume: number;
  setBgmVolume: React.Dispatch<React.SetStateAction<number>>;
  bgmExpanded: boolean;
  setBgmExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
  onBack: () => void;
}

function VoiceSetupScreen({
  state,
  setState,
  scenarioId,
  setScenarioId,
  bgmTrack,
  setBgmTrack,
  bgmVolume,
  setBgmVolume,
  bgmExpanded,
  setBgmExpanded,
  onNext,
  onBack,
}: VoiceSetupScreenProps): React.JSX.Element {
  const { lang } = useLang();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;
  const { gender, age, pitch, timbre, preset } = state.voice;

  const setVoice = (patch: Partial<VoiceState>): void =>
    setState((s) => ({ ...s, voice: { ...s.voice, ...patch } }));

  return (
    <div className="screen">
      <Steps active={0} />

      <div className="screen-header">
        <div>
          <h1>{t('挑一個聲音', 'Pick a voice')}</h1>
          <div className="sub">
            {lang === 'zh' ? '先選一個情境快速開始，或從零自訂。' : 'Pick a scenario to start fast, or build from scratch.'}
          </div>
        </div>
      </div>

      {/* 情境快選 */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="section-label">
          <span>✦</span>
          <span>{lang === 'zh' ? '快速情境' : 'Quick Scenario'}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginTop: 4, marginBottom: 14 }}>
          {lang === 'zh' ? '選一個情境，聲音、音色與背景音樂會自動配好。' : 'Pick a scenario and the voice, timbre, and BGM are set automatically.'}
        </div>
        <ScenarioSelector
          value={scenarioId}
          onChange={(s) => {
            setScenarioId(s.id);
            if (s.voice) {
              setVoice({ gender: s.voice.gender, preset: s.voice.preset, age: s.voice.age, pitch: s.voice.pitch, timbre: s.voice.timbre });
            }
            if (s.bgmDefault !== undefined) setBgmTrack(s.bgmDefault);
            if (s.bgmVolume !== undefined) setBgmVolume(s.bgmVolume);
            setBgmExpanded(false);
          }}
          lang={lang}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <div className="section-label">{t('聲音性別', 'Voice gender')}</div>
          <GenderSelector
            value={gender}
            onChange={(v) => setVoice({ gender: v, preset: null })}
          />

          <div style={{ height: 24 }}></div>
          <div className="section-label">{t('聲音調整', 'Voice tuning')}</div>
          <Slider
            label={t('年齡 Age', 'Age')}
            leftEnd={t('年輕', 'young')}
            rightEnd={t('成熟', 'mature')}
            value={age}
            onChange={(v) => setVoice({ age: v, preset: null })}
            suffix=""
          />
          <Slider
            label={t('音高 Pitch', 'Pitch')}
            leftEnd={t('低沉 deep', 'deep')}
            rightEnd={t('高亢 bright', 'bright')}
            value={pitch}
            onChange={(v) => setVoice({ pitch: v, preset: null })}
          />
          <Slider
            label={t('音色 Timbre', 'Timbre')}
            leftEnd={t('溫柔 gentle', 'gentle')}
            rightEnd={t('粗獷 rough', 'rough')}
            value={timbre}
            onChange={(v) => setVoice({ timbre: v, preset: null })}
          />
        </div>

        <div className="card">
          <div className="section-label">{t('預設聲音', 'Voice presets')}</div>
          <VoicePresets
            value={preset}
            genderFilter={gender}
            onChange={(id) => {
              const tuning = PRESET_TUNING[id];
              setVoice({ preset: id, ...tuning });
            }}
          />
          <div style={{ marginTop: 20, padding: 16, background: 'var(--cream-100)', borderRadius: 12 }}>
            <div className="section-label" style={{ marginBottom: 4 }}>{t('試聽片段', 'Sample preview')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="iconbtn" style={{ background: 'var(--coral-500)', color: '#fff' }}>
                <IconPlay size={18} />
              </button>
              <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', height: 32 }}>
                {PREVIEW_WAVE_HEIGHTS.map((h, i) => (
                  <span key={i} style={{ width: 3, height: h + 'px', borderRadius: 2, background: 'var(--coral-400)' }}></span>
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>0:08</span>
            </div>
          </div>
        </div>
      </div>

      {/* 背景音樂 */}
      <div className="card" style={{ marginTop: 24, background: 'linear-gradient(180deg, #E6FBF4 0%, #FFFFFF 60%)', borderColor: '#7AE5C0' }}>
        <BGMPicker
          value={bgmTrack}
          onChange={setBgmTrack}
          volume={bgmVolume}
          onVolumeChange={setBgmVolume}
          recommended={SCENARIOS.find((s) => s.id === scenarioId)?.bgmRecommended}
          lang={lang}
          expanded={bgmExpanded}
          onToggleExpanded={() => setBgmExpanded((v) => !v)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <IconChevronLeft size={16} />
          {t('回到作品', 'Back to library')}
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          {t('下一步：編輯文字', 'Continue to script')}
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ---- Step 1: Script Editor ----
interface ScriptEditorScreenProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
  onBack: () => void;
}

function ScriptEditorScreen({ state, setState, onNext, onBack }: ScriptEditorScreenProps): React.JSX.Element {
  const { lang, setRendering } = useLang();
  const { user } = useAuth();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;
  const script = state.script;
  const [editingTag, setEditingTag] = useState<number | null>(null);

  const setScript = (next: ScriptNode[]): void =>
    setState((s) => ({ ...s, script: next }));

  const removeNode = (idx: number): void => setScript(script.filter((_, i) => i !== idx));

  const updateDelay = (idx: number, seconds: number): void =>
    setScript(script.map((n, i) => (i === idx ? { ...n, seconds } : n)));

  const insertDelay = (): void =>
    setScript([...script, { type: 'delay', seconds: 0.8 }, { type: 'text', value: ' ' }]);

  const updateText = (idx: number, value: string): void =>
    setScript(script.map((n, i) => (i === idx ? { ...n, value } : n)));

  const totalChars = script
    .filter((n): n is { type: 'text'; value: string } => n.type === 'text')
    .reduce((acc, n) => acc + n.value.length, 0);

  const totalDelay = script
    .filter((n): n is { type: 'delay'; seconds: number } => n.type === 'delay')
    .reduce((acc, n) => acc + n.seconds, 0);

  const estDuration = Math.max(8, Math.round(totalChars * 0.15 + totalDelay));

  const voice = state.voice;
  const presetInfo = voice.preset ? PRESETS.find((p) => p.id === voice.preset) : null;

  const startRender = async (): Promise<void> => {
    if (user && !user.emailVerified) {
      alert(lang === 'zh' ? '請先驗證 Email 才能產出音檔（到帳號管理頁重寄驗證信）' : 'Please verify your email before rendering (resend from Account page)');
      return;
    }
    setRendering(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: state.script,
          voice: state.voice,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'TTS failed');
      // Convert base64 to blob URL
      const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      // Track usage in Firestore
      if (user) {
        const estSeconds = Math.max(8, Math.round(totalChars * 0.15 + totalDelay));
        await updateDoc(doc(db, 'users', user.id), {
          'usage.rendered': increment(estSeconds),
          'usage.takes': increment(1),
        });
      }
      // Store audioUrl via custom event (picked up by NewCanvasPage)
      window.dispatchEvent(new CustomEvent('vc-audio-ready', { detail: { audioUrl: url } }));
    } catch (err) {
      console.error('[tts] render failed:', err);
      alert(lang === 'zh' ? '音檔產出失敗，請重試' : 'Audio render failed, please try again');
    } finally {
      setRendering(false);
      onNext();
    }
  };

  return (
    <div className="screen">
      <Steps active={1} />

      <div className="screen-header">
        <div>
          <h1>{t('編輯你的朗讀稿', 'Write the script')}</h1>
          <div className="sub">
            {t('在文字裡插入停頓，讓 AI 朗讀更有節奏。', 'Drop a pause anywhere — half a second, two seconds — and the voice will breathe.')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="chip ink">{t('中文 (繁體)', 'Mandarin (TW)')}</span>
          <span className={`chip ${voice.gender === 'male' ? 'violet' : 'coral'}`}>
            {presetInfo
              ? `${presetInfo.zh} · ${presetInfo.en}`
              : voice.gender === 'male' ? t('男聲', 'Male') : t('女聲', 'Female')}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="script-area">
            {script.map((node, idx) => {
              if (node.type === 'text') {
                return (
                  <span
                    key={idx}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateText(idx, e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none' }}
                  >
                    {node.value}
                  </span>
                );
              }
              const isEditing = editingTag === idx;
              return (
                <span
                  key={idx}
                  className="tag-delay"
                  onClick={() => setEditingTag(isEditing ? null : idx)}
                  onDoubleClick={(e) => { e.stopPropagation(); removeNode(idx); setEditingTag(null); }}
                  title={t('點兩下刪除', 'Double-click to remove')}
                >
                  {isEditing ? (
                    <>
                      {'<delay\u00a0'}
                      <input
                        type="number"
                        step={0.1}
                        min={0.1}
                        max={10}
                        value={node.seconds}
                        onChange={(e) => updateDelay(idx, parseFloat(e.target.value) || 0.1)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{ width: 48, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--violet-600)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--violet-300)', borderRadius: 4, padding: '0 4px', outline: 'none' }}
                      />
                      {'s>'}
                    </>
                  ) : (
                    <>{`<delay ${node.seconds.toFixed(1)}s>`}</>
                  )}
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
            <button
              onClick={insertDelay}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, padding: '8px 14px', borderRadius: 'var(--r-pill)', border: '1px dashed var(--violet-400)', color: 'var(--violet-600)', background: 'var(--info-soft)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconPlus size={14} stroke={2.5} />
              {t('插入停頓', 'Insert pause')}
            </button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
              {t('點擊任何停頓標籤即可修改秒數。雙擊刪除。', 'Click any delay tag to edit. Double-click to remove.')}
            </span>
          </div>
        </div>

        <div className="card">
          <h3>{t('輸出設定', 'Output settings')}</h3>
          <div className="section-label" style={{ marginTop: 4 }}>{t('輸出格式', 'Format')}</div>
          <select style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 14, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff', outline: 'none' }}>
            <option>mp3 · 240 kbps</option>
            <option>mp3 · 320 kbps</option>
            <option>wav · 16-bit</option>
          </select>

          <div className="section-label" style={{ marginTop: 16 }}>{t('朗讀語言', 'Reading language')}</div>
          <select style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 14, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff', outline: 'none' }}>
            <option>中文 (繁體)</option>
            <option>中文 (簡體)</option>
            <option>English (US)</option>
            <option>日本語</option>
          </select>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--cream-100)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 13 }}>
              <span style={{ color: 'var(--fg-2)' }}>{t('預估時長', 'Est. duration')}</span>
              <b style={{ fontFamily: 'var(--font-mono)' }}>{Math.floor(estDuration / 60)}:{String(estDuration % 60).padStart(2, '0')}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 13, marginTop: 6 }}>
              <span style={{ color: 'var(--fg-2)' }}>{t('字數', 'Characters')}</span>
              <b style={{ fontFamily: 'var(--font-mono)' }}>{totalChars}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 13, marginTop: 6 }}>
              <span style={{ color: 'var(--fg-2)' }}>{t('停頓總時長', 'Total pauses')}</span>
              <b style={{ fontFamily: 'var(--font-mono)' }}>{totalDelay.toFixed(1)}s</b>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <IconChevronLeft size={16} />
          {t('上一步', 'Back')}
        </button>
        <button className="btn btn-render" onClick={startRender}>
          <IconSparkles size={18} />
          {t('產出音檔', 'Render audio')}
        </button>
      </div>

    </div>
  );
}

// ---- Step 2: Preview ----
interface PreviewScreenProps {
  state: AppState;
  bgmTrack: string;
  bgmVolume: number;
  audioUrl: string;
  onBack: () => void;
  onDone: () => void;
}

function PreviewScreen({ state, bgmTrack, bgmVolume, audioUrl, onBack, onDone }: PreviewScreenProps): React.JSX.Element {
  const { lang } = useLang();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [fav, setFav] = useState(false);
  const [saved, setSaved] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const presetInfo = state.voice.preset ? PRESETS.find((p) => p.id === state.voice.preset) : null;
  const voiceName = presetInfo
    ? `${presetInfo.zh} · ${presetInfo.en}`
    : state.voice.gender === 'male' ? t('男聲', 'Male') : t('女聲', 'Female');

  // Create/update audio element when audioUrl changes
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
      }
    });
    audio.addEventListener('ended', () => {
      setPlaying(false);
      setProgress(1);
    });

    // Auto-play on mount
    audio.play().then(() => setPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // Fallback: simulated playback when no audioUrl
  useEffect(() => {
    if (audioUrl) return;
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) { setPlaying(false); return 1; }
        return p + 0.005 * speed;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [audioUrl, playing, speed]);

  // Wire play/pause to real audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [playing]);

  // Wire speed to playbackRate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Skip functions
  const skipForward = (): void => {
    const audio = audioRef.current;
    if (audio && audio.duration && isFinite(audio.duration)) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + audio.duration * 0.1);
    } else {
      setProgress((p) => Math.min(1, p + 0.1));
    }
  };
  const skipBack = (): void => {
    const audio = audioRef.current;
    if (audio && audio.duration && isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, audio.currentTime - audio.duration * 0.1);
    } else {
      setProgress((p) => Math.max(0, p - 0.1));
    }
  };

  // Time display
  const totalSec = audioUrl ? audioDuration : 68;
  const cur = audioUrl ? audioCurrentTime : Math.floor(progress * 68);
  const fmt = (s: number): string =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const waveform = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => {
      const base = 30 + Math.sin(i * 0.4) * 18 + Math.sin(i * 0.13) * 22 + Math.sin(i * 0.7) * 14;
      return Math.max(8, Math.min(80, Math.round(base)));
    }), []);

  const playedIdx = Math.floor(progress * waveform.length);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="screen">
      <Steps active={2} />

      <div className="screen-header">
        <div>
          <h1>{t('試聽你的作品', 'Preview your take')}</h1>
          <div className="sub">
            {t('調整播放速度，喜歡的話收藏或下載。', 'Adjust the playback speed, then save or download.')}
          </div>
        </div>
        <span className="chip mint">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-500)' }}></span>
          {t('音檔已就緒', 'Ready')}
        </span>
      </div>

      <div className="studio-stage">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>產品介紹 · 中文版</h2>
            <div className="stage-sub">{voiceName} · {t('中文 (繁體)', 'Mandarin (TW)')} · mp3 240 kbps</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,252,247,0.6)' }}>
            vocalcanvas_{state.voice.preset ?? 'custom'}_240519.mp3
          </span>
        </div>

        <div className="wave-display">
          {waveform.map((h, i) => (
            <span
              key={i}
              className={i < playedIdx ? 'played' : ''}
              style={{ height: h + 'px' }}
            ></span>
          ))}
        </div>

        <div className="pb-row">
          <button className="pb-btn-sm" onClick={skipBack}>
            <IconSkipBack size={18} />
          </button>
          <button className="pb-btn-big" onClick={() => setPlaying(!playing)}>
            {playing ? <IconPause size={26} /> : <IconPlay size={26} />}
          </button>
          <button className="pb-btn-sm" onClick={skipForward}>
            <IconSkipForward size={18} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (progress * 100) + '%', background: 'var(--coral-500)', borderRadius: 2 }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="pb-time">{fmt(cur)}</span>
              <span className="pb-time">−{fmt(Math.max(0, totalSec - cur))}</span>
            </div>
          </div>

          <div className="speed-pills">
            {speeds.map((s) => (
              <button key={s} className={speed === s ? 'active' : ''} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
        </div>

        {bgmTrack !== 'none' && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="chip coral">
              {lang === 'zh' ? '背景音樂' : 'BGM'}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>
              {BGM_TRACKS.find((t) => t.id === bgmTrack)?.[lang === 'zh' ? 'zh' : 'en']}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>
              {bgmVolume}%
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24 }}>
        {/* Favorite card */}
        <button
          className="card"
          style={{ cursor: 'pointer', border: fav ? '2px solid var(--coral-500)' : '1px solid var(--line-1)', textAlign: 'left' }}
          onClick={() => setFav(!fav)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: fav ? 'var(--coral-500)' : 'var(--cream-200)', color: fav ? '#fff' : 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {fav ? <IconHeartFill size={20} /> : <IconHeart size={20} />}
            </div>
            <span className="chip ink" style={{ visibility: fav ? 'visible' : 'hidden' }}>
              <IconCheck size={12} stroke={2.5} />
              {t('已收藏', 'Saved')}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t('加入收藏', 'Add to favorites')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginTop: 4 }}>{t('收藏的作品會顯示在側邊欄', 'Favorites pin to your sidebar')}</div>
        </button>

        {/* Save to library card */}
        <button
          className="card"
          style={{ cursor: 'pointer', border: saved ? '2px solid var(--mint-500)' : '1px solid var(--line-1)', textAlign: 'left' }}
          onClick={() => setSaved(true)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: saved ? 'var(--mint-500)' : 'var(--cream-200)', color: saved ? '#fff' : 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {saved ? <IconCheck size={20} stroke={2.5} /> : <IconLibrary size={20} />}
            </div>
            <span className="chip mint" style={{ visibility: saved ? 'visible' : 'hidden' }}>
              <IconCheck size={12} stroke={2.5} />
              {t('已儲存', 'Saved')}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t('儲存到作品庫', 'Save to library')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginTop: 4 }}>{t('以後可以重新聆聽、修改、下載', 'Replay, remix or download later')}</div>
        </button>

        {/* Download card */}
        <button className="card" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => {
          if (!audioUrl) return;
          const a = document.createElement('a');
          a.href = audioUrl;
          a.download = 'vocalcanvas-take.mp3';
          a.click();
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cream-200)', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconDownload size={20} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t('下載 mp3', 'Download mp3')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginTop: 4 }}>{t('240 kbps · ~1.2 MB', '240 kbps · ~1.2 MB')}</div>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <IconChevronLeft size={16} />
          {t('回到編輯', 'Back to script')}
        </button>
        <button className="btn btn-primary" onClick={onDone}>
          {t('完成 · 回到作品庫', 'Done — back to library')}
          <IconCheck size={16} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}

// ---- Main wizard page ----
export default function NewCanvasPage(): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [scenarioId, setScenarioId] = useState<string>('custom');
  const [bgmTrack, setBgmTrack] = useState<string>('none');
  const [bgmVolume, setBgmVolume] = useState<number>(0);
  const [bgmExpanded, setBgmExpanded] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Listen for audio ready event from ScriptEditorScreen
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.audioUrl) setAudioUrl(detail.audioUrl);
    };
    window.addEventListener('vc-audio-ready', handler);
    return () => window.removeEventListener('vc-audio-ready', handler);
  }, []);

  const goNext = (): void => setStep((s) => Math.min(2, s + 1) as Step);
  const goBack = (): void => setStep((s) => Math.max(0, s - 1) as Step);

  if (step === 0) {
    return (
      <VoiceSetupScreen
        state={appState}
        setState={setAppState}
        scenarioId={scenarioId}
        setScenarioId={setScenarioId}
        bgmTrack={bgmTrack}
        setBgmTrack={setBgmTrack}
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolume}
        bgmExpanded={bgmExpanded}
        setBgmExpanded={setBgmExpanded}
        onNext={goNext}
        onBack={() => router.push('/library')}
      />
    );
  }

  if (step === 1) {
    return (
      <ScriptEditorScreen
        state={appState}
        setState={setAppState}
        onNext={goNext}
        onBack={goBack}
      />
    );
  }

  return (
    <PreviewScreen
      state={appState}
      bgmTrack={bgmTrack}
      bgmVolume={bgmVolume}
      audioUrl={audioUrl}
      onBack={goBack}
      onDone={() => router.push('/library')}
    />
  );
}
