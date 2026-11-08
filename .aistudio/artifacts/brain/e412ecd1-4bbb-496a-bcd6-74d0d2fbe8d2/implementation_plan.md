# Implementation Plan - sonnetmdp Branding & Monetization

This plan outlines the rebranding of "Sonnet Player" to **sonnetmdp** and the integration of **Google AdSense** (for Web) and **Google AdMob** (for Android) to enable monetization with minimal visual intrusion.

### User Review & Critical Decisions

> [!IMPORTANT]
> AdSense and AdMob require valid Publisher IDs (e.g., `ca-pub-xxxxxxxxxxxxxxxx`) and site/app approval to display real ads and generate revenue. We will implement placeholder integration and provide instructions for you to add your real IDs later.

- **Confirmed Decision 1**: Rename application from "Sonnet Player" to "sonnetmdp" across all metadata and UI surfaces.
- **Confirmed Decision 2**: Implement AdSense for the Web version and AdMob for the Android version.
- **Confirmed Decision 3**: Place ads in subtle locations (e.g., bottom of lists, settings footer) to generate revenue without distracting the user.

---

### 1. Overview & Core Concept
- **What It Does**: Renames the app to a more unique identifier and sets up the technical foundation for ad-based revenue.
- **Target Audience**: Users who want a free, high-fidelity music streaming experience with non-intrusive "native" style advertisements.
- **Key Value**: Provides a path for the developer to earn revenue while maintaining the premium, frosted-glass aesthetic.

---

### 2. User Experience & Visual Design
- **Key User Flows**: 
    - The user opens the app and sees "sonnetmdp" in the header.
    - While scrolling through the "Library" or "Explore" views, a subtle "Sponsored" card or banner appears at the very bottom, blending with the existing UI patterns.
- **Visual Identity**:
    - *Branding*: Update all text references, window titles, and PWA manifests to "sonnetmdp".
    - *Ad Placement*:
        - **Web**: A standard AdSense responsive banner unit placed in the footer of the `Sidebar` (Desktop) or at the end of the `LibraryView` list (Mobile).
        - **Android**: A native-style AdMob banner anchored to the bottom of the `Settings` screen or within the `Explore` feed.
- **Interactive Feedback**: Ads will load asynchronously and will not block the main media playback or navigation logic.

---

### 3. Key Product Decisions & Trade-Offs
- **Decision 1: AdSense vs AdMob**
    - *Chosen Approach*: Implement both (AdSense for Web, AdMob for Native Android).
    - *Why*: AdSense is the standard for web monetization, while AdMob is optimized for mobile app performance and revenue.
- **Decision 2: Subtle Placement**
    - *Chosen Approach*: "Footer-first" placement.
    - *Why*: Placing ads where the user doesn't "easily see" them (e.g., at the end of a long list or in secondary views) reduces friction but still generates impressions. 
    - *Note*: AdSense requires ads to be somewhat visible for approval; we will use "Responsive" units that adapt to the container.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────┐
│                     sonnetmdp (App)                       │
├─────────────────────────────┬─────────────────────────────┤
│           Web (React)       │       Android (Kotlin)      │
├─────────────────────────────┼─────────────────────────────┤
│  - AdSense Script (index.html)│  - AdMob SDK (build.gradle) │
│  - <GoogleAdSense /> Comp   │  - AdMobBannerView (Compose)│
│  - Branding: metadata.json  │  - Branding: strings.xml    │
└─────────────────────────────┴─────────────────────────────┘
```

- **Branding Update**:
    - Update `/metadata.json`, `index.html`, and `App.tsx`.
    - Update Android manifest and `strings.xml`.
- **AdSense Implementation (Web)**:
    - Add the global `adsbygoogle.js` script to `index.html`.
    - Create a reusable `AdBanner` component that wraps the `<ins class="adsbygoogle">` tag.
- **AdMob Implementation (Android)**:
    - Add `com.google.android.gms:play-services-ads` dependency.
    - Create a Compose wrapper for `AdView`.
- **Instructions for User**:
    - Create a `MONETIZATION.md` file in the root with step-by-step instructions on how to sign up for AdSense/AdMob and where to paste the Publisher IDs.

---

### 5. Verification Plan
1. **Rename Check**: Search codebase for "Sonnet Player" and ensure all user-facing instances are replaced with "sonnetmdp".
2. **Build Check**: Run `npm run build` to ensure the PWA manifest and HTML tags are correct.
3. **Ad Placeholder Check**: Verify that the ad components render an empty container (or placeholder) in the dev environment without crashing.
