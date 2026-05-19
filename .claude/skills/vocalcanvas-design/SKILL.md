---
name: vocalcanvas-design
description: Use this skill to generate well-branded interfaces and assets for VocalCanvas, an AI text-to-speech app, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files. Key entrypoints:

- `README.md` — brand essence, product context, content + visual foundations, iconography.
- `colors_and_type.css` — CSS variables for color, type, radius, shadow, spacing, motion.
- `assets/` — logo mark, wordmark, mono mark, icon subset.
- `ui_kits/vocalcanvas-app/` — JSX components + clickable demo HTML for the TTS app.
- `preview/` — design-system swatches and specimens (visual reference).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. Always `@import "./colors_and_type.css"` so the variables are available, and pull components from `ui_kits/vocalcanvas-app/components/` rather than re-inventing chrome. For the AI-render moment, use the `--grad-sunset` gradient; for everything else primary, use the coral solid `--accent`.

If working on production code, copy assets and apply the rules in `README.md` to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some clarifying questions (audience, surface, language — 中文 or English or both, depth), and act as an expert designer who outputs HTML artifacts or production code, depending on the need.
