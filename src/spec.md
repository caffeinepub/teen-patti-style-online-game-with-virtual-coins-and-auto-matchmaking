# Specification

## Summary
**Goal:** Make the existing React web app PWA-installable and add Android Trusted Web Activity (TWA) packaging artifacts to build APK/AAB for the deployed web app URL.

**Planned changes:**
- Add and serve a web app manifest (`manifest.webmanifest` or `manifest.json`) with required fields (name, short_name, start_url, standalone display, colors) and required icon sizes, and link it from `frontend/index.html` with appropriate meta tags (e.g., theme-color).
- Add a service worker and register it from a non-immutable frontend file to provide basic offline support by caching the app shell/static assets, with safe update/unregister behavior during development.
- Add an Android/TWA project (or equivalent build setup) to generate a debug APK and a release AAB targeting the correct start URL and standalone display mode.
- Add `/.well-known/assetlinks.json` to frontend static assets for Digital Asset Links verification and include in-repo English documentation describing package/applicationId setup, signing key generation, APK/AAB build steps, and asset links verification.
- Verify navigation/state behavior works within Android WebView/TWA context and ensure any new user-facing packaging/build text is English-only.

**User-visible outcome:** The web app is installable as a PWA in Chrome (including basic offline loading), and the repo can build Android TWA APK/AAB artifacts that open the deployed web app URL with asset links support.
