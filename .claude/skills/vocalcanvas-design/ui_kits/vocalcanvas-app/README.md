# VocalCanvas — App UI kit

A clickable, hi-fidelity recreation of the VocalCanvas TTS app. Designed to mirror the brand foundations (`../../colors_and_type.css`) — pull components straight into a production codebase as a styling reference.

## Run it

Open `index.html` in the browser. No build step.

## Click-through

1. **Library** — saved takes with favorite/play/download
2. **New canvas → Voice setup** — gender selector + 3 sliders (age / pitch / timbre) + voice presets
3. **Script editor** — write text + click "Insert pause" to drop `<delay 0.8s>` tags
4. **Render** (transient) — AI mixing overlay (~2.4s mocked)
5. **Preview** — playback with speed pills + save / favorite / download

Side nav also opens **Voices** (full preset library) and **Settings**.

## File layout

```
ui_kits/vocalcanvas-app/
├── index.html               ← entry — boots React + Babel and wires the screens
├── app.css                  ← all chrome styles (sidebar, topbar, cards, buttons, slider, playback)
└── components/
    ├── Icons.jsx            ← Lucide-style SVG icons as React components
    ├── Primitives.jsx       ← Slider, GenderSelector, VoicePresets, Steps wizard
    ├── AppShell.jsx         ← Sidebar, TopBar
    ├── LibraryScreen.jsx
    ├── VoiceSetupScreen.jsx
    ├── ScriptEditorScreen.jsx
    ├── PreviewScreen.jsx
    └── VoicesScreen.jsx
```

## Notes on fidelity

- Each component re-exports to `window` (Babel multi-file scope quirk).
- Sliders are real (pointer-drag), playback simulates with a setInterval.
- Delay tags are inline-editable: click to change seconds, double-click to remove.
- The "Render" step is a 2.4s mocked overlay — production would replace with a streaming progress channel.
- All colors, type, radii, shadows come from `colors_and_type.css` variables. No hard-coded design tokens.

## Substitutions

- Sample voice presets (晨光 / 夜霧 / 焰心 / 清玻 / 墨色 / 花瓣) are placeholder names invented for the kit. Replace with real preset names when defined.
- Avatar initial "F" / user "Frank Chou" is placeholder.
