# Product Requirements Document (PRD)

## App Name: The Nothing App

**Version:** 1.0 (MVP)  
**Platforms:** iOS & Android  
**Tech Stack:** React Native  
**Date:** September 14, 2025

---

## 1.0 Introduction

The Nothing App is a hybrid mobile application designed to provide a deliberate space for digital downtime. It serves two distinct audiences—adults seeking focus and digital detox, and parents needing a safe, contained environment for their children to interact with their phone without risk. The app is a single download with a seamless onboarding flow that adapts to the user's primary purpose.

## 2.0 Vision & Goals

**Vision:** To become the go-to tool for intentional digital disengagement, offering a unified brand of "peace of mind" for individuals and families.

### Goals

- Successfully build a cross-platform application using React Native.
- Deliver a bug-free, intuitive user experience for both adult and parent users.
- Validate the freemium business model and achieve strong user retention.

**Target Audience:**

- **Adults:** Professionals, students, and mindfulness seekers aged 18-45 who are focused on productivity, stress reduction, and digital wellness.
- **Parents:** Caregivers, especially mothers, who require a simple, safe solution for short-term child engagement on a mobile device without the risk of accidental app usage.

## 3.0 Core Features & Functionality

The application must implement a two-mode structure, selected during a hybrid onboarding flow.

### 3.1 Mode A: Adult (Personal Mode)

This mode focuses on productivity, stress relief, and mindful engagement.

#### 3.1.1 Nothing Block (Focus Timer)

- **Functionality:** A full-screen blackout mode. The user can select a duration from presets (5, 15, 30, 60 minutes) or input a custom time.
- **UI/UX:** The screen turns completely black upon activation. A single, faint, minimalist digital timer (e.g., 14:59) is displayed at the bottom. Tapping the screen brings the timer to full visibility.
- **Lockdown:** The app must lock the phone, preventing accidental exits.
- **Escape Hatch:** A specific, hidden gesture (e.g., a swipe-up + PIN) is required to exit the session early.
- **Notifications:** The app will utilize OS-level APIs to silence or block all incoming notifications for the duration of the session.

#### 3.1.2 Adult Doodle Pad

- **Free Tier:** A simple, ephemeral white or black canvas. Provides a single pen tool and a "Clear Canvas" button. The doodles are not saved.
- **Premium Tier:** Unlocks a full-color palette, multiple brush styles (e.g., zen, watercolor), and the ability to save doodles to a local gallery or export them as images.

#### 3.1.3 Nothing Scheduler (Premium)

- **Functionality:** Allows users to set recurring "Nothing Block" sessions (e.g., daily at 9 PM or every weekday from 2 PM to 3 PM).
- **UI/UX:** A simple interface for setting time, duration, and days of the week.
- **Notifications:** Sends a gentle push notification 5 minutes before a scheduled session begins.

#### 3.1.4 Wellness Insights (Premium)

- **Functionality:** A dashboard that tracks the total time spent in "Nothing Mode" per day, week, and month.
- **UI/UX:** Displays a clean graph or chart. Includes a "streak" tracker to motivate consistent usage.

#### 3.1.5 Ambient Audio (Premium)

- **Functionality:** Provides a library of calming audio loops (e.g., rain, white noise, gentle chimes) to be played in the background during a "Nothing Block."

### 3.2 Mode B: Baby (Parental Mode)

This mode is designed for safety and calm engagement within a contained environment.

#### 3.2.1 Baby Lock & Safe Sandbox

- **Functionality:** Locks the phone into a full-screen mode, disabling all device navigation buttons (Home, Back, Recent Apps).
- **Parental Unlock:** The only way to exit this mode is via a specific, customizable parental gesture (e.g., a triple-tap on a specific corner of the screen) followed by a pre-set PIN.

#### 3.2.2 Baby Doodle Pad

- **Functionality:** A simplified, finger-friendly canvas. Provides large, soft-colored "brushes" for drawing.
- **UI/UX:** The tools are hidden from the child, and the doodles are ephemeral (not saved).

#### 3.2.3 Interactive Shapes Mode (Premium)

- **Functionality:** A black screen that responds to touch. Tapping triggers a simple, calming animation (e.g., a star, bubble, or a splash of color) accompanied by a gentle chime sound.

#### 3.2.4 Calming Sounds (Premium)

- **Functionality:** A pre-selected library of lullabies and white noise designed to help soothe a child. The sounds can be set to loop or to play for a set duration.

#### 3.2.5 Parental Dashboard

- **Functionality:** A password-protected screen for the parent to view session reports (e.g., how long Baby Mode was used) and set a maximum session duration.

## 4.0 User Experience (UX) & Design

### 4.1 Hybrid Onboarding

The very first screen will present a choice: "For Me (Adult Mode)" or "For My Child (Baby Mode)." This selection dictates the app's default UI theme and features. The user can switch modes later in the settings.

### 4.2 Unified Aesthetic

The app will use a single brand identity that adapts visually.

- **Adult Mode UI:** Minimalist, sleek, and dark. The color palette is black, white, and a single accent color (e.g., a calm teal).
- **Baby Mode UI:** Bright, playful, and soft. The background and elements will use pastels or high-contrast, rounded shapes.

### 4.3 Micro-interactions

Implement subtle animations and gentle haptic feedback on button taps to create a satisfying and calming user experience.

### 4.4 Navigation

- Adult mode will have a simple bottom navigation bar.
- Baby mode will have no visible navigation.

## 5.0 Technical Specifications

- **Platform:** React Native for efficient cross-platform development.
- **Backend:** A cloud-based, serverless solution (e.g., Firebase or Supabase) to handle user authentication, profile data, and subscription management.
- **Payments:** In-app purchases will be handled via Stripe.
- **APIs:** Reliance on OS-level APIs for screen locking, managing notifications, and ensuring the app stays in the foreground in Baby Mode.

## 6.0 Monetization Strategy

The application will operate on a freemium model with a single subscription to unlock all premium features.

- **Free Tier:** Includes the basic "Nothing Block" (timer only) and the basic, ephemeral "Doodle Pad" in both modes.
- **Premium Tier:** A single monthly subscription that unlocks all premium features in both Adult and Baby modes.

## 7.0 Roadmap (Lean Startup Style)

### Phase 1 (MVP, Q4 2025):

- Initial Onboarding with mode choice.
- Adult Mode: Basic "Nothing Block" and basic "Doodle Pad."
- Baby Mode: "Baby Lock" and basic "Doodle Pad."

### Phase 2 (Feature Expansion, Q1 2026):

- Add premium features to both modes: "Scheduler," "Insights," "Interactive Shapes," and "Calming Sounds."
- Implement the premium subscription model.

### Phase 3 (Long-Term, Q2 2026+):

- Implement a shared doodle gallery (parent/child crossover).
- Explore social features ("Nothing Challenges") and paid theme packs.

## 8.0 Success Metrics

- **Daily/Monthly Active Users (DAU/MAU):**
- **Average Session Duration:** Track "Nothing Time" per user.
- **Conversion Rate:** % of users converting from free to premium.
- **Retention Rate:** User retention after 7, 30, and 90 days.
- **Crash-Free Rate:** A high crash-free rate on both platforms.
