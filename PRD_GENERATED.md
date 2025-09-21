# The Nothing App — Product Requirements Document (Generated)

Date: 21 September 2025
Version: 1.0 (Generated from codebase + screen list)

---

## Executive Summary

The Nothing App is a mobile application (iOS & Android) that provides intentional digital downtime via two primary modes: Personal (Adult) Mode for focused sessions and Baby (Parental) Mode for a safe, contained sandbox for children. The existing codebase is an Expo-managed React Native app (using `expo-router`) that implements core MVP flows: onboarding, a focus timer, doodle canvases for both modes, a baby lock screen, scheduling, and premium-gated features (insights, sounds, dashboard). This PRD synthesizes the PRD excerpt, a supplied list of screens and features, and a code-level review to provide a complete product specification, user stories, functional and technical requirements, assumptions, roadmap, and open questions.

## Problem Statement

Mobile devices constantly draw attention via notifications and easy access to apps, making deliberate focus difficult for many adults. Parents also need a safe, quick way to hand a device to a child without risk of accidental calls, purchases, or exposure to unsuitable content. The Nothing App solves these problems by creating easily-activated, distraction-free sessions and an identical-but-guarded baby sandbox.

## Goals and Success Metrics

Goals

- Deliver an intuitive, low-friction two-mode app (Personal and Baby) for focused downtime and safe child engagement.
- Launch an MVP (Q4 2025) that supports core flows: onboarding, focus timer, baby lock, adult & baby doodle pads.
- Validate a freemium subscription to unlock premium experiences (scheduler, insights, sounds, interactive shapes, parental dashboard).

Success Metrics (examples)

- DAU/MAU ratio > 10% within 30 days
- Average session duration: median >= 15 minutes
- Conversion Rate (free → premium) target: 3–7% in first 90 days
- Retention: 7-day retention >= 30%
- Crash-free rate: 99.5%+

## User Personas & User Stories

Personas

- Mindful Professional (Adult): Age 25–45, uses phone for work and wants distraction-free blocks to increase productivity.
- Caring Parent (Parent): Age 28–45, needs a simple, safe environment to hand a device to a young child.
- Exploratory User: Early adopter interested in wellness features and willing to pay for premium audio, insights, or scheduling.

Representative User Stories (selected, mapped to screens)

- As an adult, I want to start a focused session with a preset duration so that I can block distractions for a set time. (Focus Timer / Active Focus Session)
- As an adult, I want the screen to go fully black with a minimal timer so I am not tempted by visual stimuli. (Active Focus Session)
- As an adult, I want a quick doodle canvas to relax and sketch without saving so I can unwind. (Adult Doodle Pad — free)
- As an adult/premium user, I want to save/export doodles to my gallery so I can keep them. (Doodle Save/Export Options)
- As a parent, I want to lock the phone into Baby Mode so my child can play without navigating away. (Baby Lock & Safe Sandbox)
- As a parent, I want to unlock Baby Mode with a secure gesture + PIN so only I can exit. (Parental PIN Setup / Baby Exit Unlock)
- As a user, I want to schedule recurring focus sessions so my phone will remind me. (Nothing Scheduler / Calendar Integration)
- As a premium user, I want to see my streak and weekly minutes so I can measure progress. (Wellness Insights Dashboard)
- As a user, I want calming sounds I can play during a session. (Ambient Audio / Soothing Sounds)
- As a user, I want to be guided to grant notification/media permissions when required. (Permissions Modal / Calendar Permissions)
- As a user, I want accessible premium upsell messaging when I try to use locked features. (Premium Upsell Screen)

Acceptance Criteria (examples)

- Starting a Focus session sets a visible timer, silences notifications (when possible), and prevents accidental exits until session ends or correct PIN+gesture is provided.
- Baby Lock disables navigation and presents a clear unlock hint; parental unlock flow requires PIN and restores navigation.
- Doodle canvas supports drawing, undo, clear; premium users may save/export (writes to gallery, shows permission modal if denied).

## Functional Requirements

Each requirement is numbered for traceability.

1. Onboarding / Mode Selection

   - 1.1 Present two choices at first launch: Personal (Adult) and Baby (Parental). Persist selection locally.
   - 1.2 Redirect returning users to the correct mode + default tab.

2. Focus (Nothing Block)

   - 2.1 Provide presets: 5, 15, 30, 60 minutes and facility for custom durations (UI placeholder in code).
   - 2.2 Full-screen blackout when session active with faint timer and tap-to-reveal behavior.
   - 2.3 Escape hatch: hidden gesture (swipe up) reveals PIN entry; correct PIN exits early and records session as interrupted if chosen.
   - 2.4 Silences notifications for session duration by setting expo-notifications handler.
   - 2.5 Record session metadata to local storage for history and insights.

3. Adult Doodle Pad

   - 3.1 Free tier: single color brush, clear canvas, ephemeral (no save).
   - 3.2 Premium: palette, multiple stroke widths/brush styles, ability to save/export to gallery or share.
   - 3.3 Save flow: attempt PNG canvas capture; if not possible, rasterize SVG via WebView fallback, write file, save to gallery, generate thumbnail, persist metadata.
   - 3.4 Permissions handling: prompt and fallbacks for media library permissions.

4. Nothing Scheduler

   - 4.1 Create recurring or one-time sessions; support daily, weekdays, custom days.
   - 4.2 Schedule two notifications per session: pre-notification (5 minutes before) and session start notification.
   - 4.3 Persist scheduled sessions in AsyncStorage.

5. Wellness Insights

   - 5.1 Compute streaks and weekly totals from local session history.
   - 5.2 Display summary UI (streak and minutes this week); expandability to charts.

6. Ambient Audio / Calming Sounds

   - 6.1 Provide a horizontal list of sounds with Play/Stop.
   - 6.2 Premium gating for some sounds; loop and stop functionality.

7. Baby Mode — Baby Lock & Safe Sandbox

   - 7.1 Lock device into full-screen Baby Mode and (on Android) hide navigation bar via `expo-navigation-bar`.
   - 7.2 Show large lock icon, timer, unlock hint; triple-tap sequence in specific corner increments unlock attempts, final step requires PIN.
   - 7.3 Record baby session durations into `babySessionHistory` in AsyncStorage.

8. Baby Doodle Pad

   - 8.1 Provide thick, large stroke widths and a simplified palette; ephemeral storage only.

9. Interactive Shapes Mode

   - 9.1 Animated shapes respond to touch; premium gating may hide feature behind subscription.

10. Parental Dashboard

- 10.1 Premium-only modal showing total screen time, average session time, and recent sessions. Persists and reads from `babySessionHistory`.

11. Settings & Permissions

- 11.1 Mode switching, Premium information, About, Privacy & Safety information.
- 11.2 Permissions screen for Notifications and Media Library with request actions.

12. Doodle Gallery & Export

- 12.1 Modal listing saved doodles (thumbnails), share and delete actions, preview overlay.
- 12.2 Thumbnail generation and local metadata store (`utils/doodleGallery`).

13. Notifications & Connection Status

- 13.1 Expose notification permission status and request flow.
- 13.2 Surface a connection status indicator when network operations or cloud sync are present (placeholder in PRD list; code has no cloud sync yet).

14. Profile & Subscription

- 14.1 Simple Premium modal; subscription flow abstracted (not implemented in code). Profile screen placeholder mentioned in list (not implemented in codebase).

15. Misc

- 15.1 Not Found route
- 15.2 SVG → PNG converter WebView overlay used by `DoodleScreen` during save path.

## Technical Specifications & Constraints

Core Technologies (from codebase)

- Platform: Expo (SDK 53) + `expo-router`
- Language: TypeScript + React
- UI stack: React Native (0.79.x), `react-native-gesture-handler`, `react-native-reanimated`, `react-native-webview`
- Native & Expo Modules: `expo-file-system`, `expo-media-library`, `expo-notifications`, `expo-navigation-bar`, `expo-haptics`, `expo-linear-gradient`, `expo-sharing`
- Storage & State: `@react-native-async-storage/async-storage`, local AsyncStorage-based persistence for sessions, doodles, scheduled sessions
- Testing & Tooling: Jest (`jest-expo`), ESLint, TypeScript

Architecture Overview

- Client-only, single mobile app (no backend in repo). Local-first architecture: all session state, scheduled sessions, doodles are persisted in AsyncStorage and local file system.
- Navigation: `expo-router` + Tabs layout switching between Personal and Baby modes. Modal overlays (DoodleGallery, ParentalDashboard) act as focused micro-screens.
- Save/export pipeline: drawing canvas → attempt native canvas capture (utility `doodleRaster`) → fallback SVG rasterize via WebView (`SVGToPNGWebView`) → write file (expo-file-system) → save to gallery (expo-media-library) → persist metadata (doodleGallery utils).

Data Model (high level)

- FocusSession (stored in local storage): { id: string, startTime: ISOString, duration: number (minutes), completed: boolean }
- BabySession / `babySessionHistory`: { date: ISOString, duration: number, mode: 'baby' }
- ScheduledSession: { id: string, time: 'HH:mm', duration: number, repeat: 'once'|'daily'|'weekdays'|'custom', days?: number[], enabled: boolean, notificationId?: string, preNotificationId?: string }
- DoodleEntry: { id: string, pngUri: string, thumbnailUri?: string, createdAt: ISOString }
- Local settings: { mode: 'personal' | 'baby', parentalPin?: string }

Technical Constraints & Dependencies

- Expo SDK & Managed Workflow constraints: relies on expo modules and their platform behaviors; certain OS-level locks (full device lock) are approximated — a real fully enforced device lock may require platform-specific APIs or enterprise features not available in Expo-managed apps.
- Notifications behavior depends on `expo-notifications` handlers; complete silencing of all notifications may be limited by OS capabilities.
- `expo-navigation-bar` is Android-only; hiding navigation on iOS is not applicable.
- No backend: all user data is local; scaling to cloud-sync or user accounts requires adding a server or cloud provider (Firebase/Supabase).
- Permissions: saving/reading from gallery requires Media Library permissions; save/export flows include graceful fallbacks if permissions are denied.

## Gaps / Codebase Observations

What the code implements (confirmed)

- Onboarding (mode selection)
- Personal mode: Focus screen (timer), Doodle (canvas + save flow), Scheduler (local persisted), Settings
- Baby mode: Baby Lock, Baby Doodle, Shapes, Calming Sounds, Parental Dashboard (modal)
- Shared utilities for doodle export, thumbnail generation, telemetry, and permission handling

Missing / Not fully implemented (from provided screen list)

- Login / Signup screen — not present in code (no authentication implemented)
- Profile & Subscription screen — only a `PremiumModal` placeholder exists; no subscription integration (Stripe) in repo
- Cloud sync / account-based cross-device gallery — not implemented
- Connection status UI / cloud sync indicator — placeholder only; no network sync in code
- Calendar permissions & deep calendar integration (scheduling is local with notifications; no calendar API integration)
- Quick Notes / Journaling — not present in code
- Session Summary screen — insights exist as a small widget; a full session summary screen is not implemented (only history lists and dashboards exist)

## Out of Scope

- Server-side components (authentication, cloud storage, analytics backend) — the codebase is client-only and local-first.
- Third-party payment integration (Stripe) is planned but not implemented.
- Platform-level enforced device locks beyond best-effort navigation hiding and notification-silencing (true device lockdown may need platform-level enterprise APIs).

## Assumptions & Dependencies

Assumptions

- The app remains primarily local-first; user accounts & cloud sync are optional future steps.
- Premium gating will be implemented via in-app subscriptions managed by a platform or payments provider; for now, the app gates UI features via `useSubscription` hook.
- OS-level behavior (notification silencing, navigation hiding) will behave as expected on supported devices; behavior may vary by platform and OS version.

Dependencies

- Expo SDK (and related expo modules listed in package.json)
- `react-native-webview` for SVG → PNG conversion fallback
- `@react-native-async-storage/async-storage` for local persistence
- System permissions: notifications and media library

## Roadmap (Inferred & Prioritized)

Phase 1 — MVP (current code focus; Q4 2025)

- Solidify Onboarding, Focus Timer, Baby Lock, Adult & Baby Doodle Pads.
- Ensure robust save/export flows and permission handling.
- Add scheduler with local notifications and a basic Premium upsell experience.

Phase 2 — Productization (Q1 2026)

- Add subscription flow (Stripe / App Store / Play Store) and a Profile/Subscription screen.
- Add deeper Wellness Insights (charts, week/month views) and a Session Summary screen.
- Add quick journaling/notes feature to pair with sessions.

Phase 3 — Expansion (Q2 2026+)

- Add cloud sync and user login to enable cross-device gallery and backups.
- Expand social or sharing features and paid theme packs.
- Investigate more robust device lockdown options (native modules or enterprise APIs) if needed.

## Open Questions & Future Considerations

1. Authentication / Cloud: Will the product require accounts/cloud sync at launch or remain local-only?
2. Subscriptions: Which provider(s) (App Store / Play Store / Stripe) and how will entitlement verification be implemented? Server component required?
3. Device Locking: Is a stricter device lockdown required beyond what Expo allows, and does that justify ejecting to bare workflow or writing native modules?
4. Analytics & Telemetry: Current code includes `telemetry` utils — what data and privacy constraints exist for collection and retention?
5. Cross-platform nuances: Are there platform-specific requirements (e.g., iOS allowed notification behavior) that change feature acceptance criteria?
6. Accessibility: Ensure color contrast, larger text support, and screen reader semantics are implemented prior to wide release.

## Appendix — Screen Mapping & Acceptance Criteria (Selected)

- Onboarding Screen

  - Acceptance: Mode selection persists; first-launch shows choice; onboarding not shown after mode selected.

- Focus Timer / Active Focus Session

  - Acceptance: Starting session sets a timer and attempts to silence notifications; UI enters minimal blackout state; swipe gesture reveals PIN prompt; incorrect PIN denies exit.

- Baby Lock

  - Acceptance: Activating baby mode sets app into full-screen locked UI and (on Android) hides nav bar; triple-tap unlock flow prompts for parental PIN.

- Adult & Baby Doodle Pad

  - Acceptance: Free users draw with basic tools; premium users have multiple colors/widths and save/export options; saving requires media permission or sharing fallback.

- Scheduler
  - Acceptance: User can create a scheduled session persisted locally and it triggers pre-notification and start notification.

---

If you want, I can now:

- Commit `PRD_GENERATED.md` to the repository (I already wrote the file to the repo root),
- Generate a more compact version of this PRD suitable for executive / investor review,
- Produce per-screen, developer-ready acceptance test checklists (Gherkin-style) for QA.

Please tell me which of those you'd like next.
