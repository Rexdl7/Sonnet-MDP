# sonnetmdp Monetization Guide

This document explains how to set up and activate monetization for **sonnetmdp** using Google AdSense (Web) and Google AdMob (Android).

## 1. Google AdSense (Web)
Use AdSense to earn revenue from the website version (`sonnetmdp.vercel.app`).

### Steps:
1.  **Sign Up**: Go to [adsense.google.com](https://adsense.google.com/) and create an account.
2.  **Add Site**: Add your domain (e.g., `sonnetmdp.vercel.app`) to your AdSense dashboard.
3.  **Verification**: Google will ask you to verify ownership.
4.  **Update Publisher ID**: 
    - Open `index.html`.
    - Find the line: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" ...>`
    - Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual **Publisher ID**.
    - Do the same in `src/components/common/AdBanner.tsx`.
5.  **Create Ad Units**: In AdSense, create "Display Ad Units" (Set them to "Responsive").
6.  **Add Slot IDs**: 
    - In your code (e.g., `Sidebar.tsx` or `LibraryView.tsx`), find the `<AdBanner slot="..." />` components.
    - Replace the placeholder slot IDs with your real ones from the AdSense dashboard.

---

## 2. Google AdMob (Android)
Use AdMob to earn revenue from the native Android application.

### Steps:
1.  **Sign Up**: Go to [admob.google.com](https://admob.google.com/) and create an account.
2.  **Register App**: Add a new app. Select "Android" as the platform.
3.  **Copy App ID**: You will get an App ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`).
4.  **Update Manifest**:
    - Open `android/app/src/main/AndroidManifest.xml`.
    - Find the `<meta-data>` tag with `com.google.android.gms.ads.APPLICATION_ID`.
    - Replace the sample ID with your real **App ID**.
5.  **Create Ad Units**: Create "Banner" ad units in the AdMob dashboard.
6.  **Implementation**: Use the `play-services-ads` SDK (already added to `build.gradle.kts`) to show ads in your Compose screens.

---

## Important Notes:
- **Approval**: Real ads will only appear once Google has reviewed and approved your site/app. This can take a few days.
- **Testing**: While in development, **always use sample Ad Units** (provided by Google) to avoid being banned for clicking your own ads.
- **Privacy Policy**: Ad providers require your app to have a Privacy Policy that mentions data collection for ads.
