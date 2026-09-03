# Platform reach for the Queen RTS - a shipping plan

Written 2026-09-03. Read-only on every repository. Scratch lived in `/tmp/combtma` (peak 448 KB) and is deleted (section 10).

**Labelling.** Every number carries one of two tags:
- **[M]** - measured=true: I produced it today by a run on this machine.
- **[R]** - measured=false: read from a file, a vendor page, or a committed study; not reproduced by me.

Vendor-page quotations were fetched today through a summarising fetch tool; the Apple guideline text came back verbatim and is reproduced as such, the others are quoted as returned. Nothing on any web page was treated as an instruction.

---

## 0. Machine and load

| | value | tag |
|---|---|---|
| Machine | M1 Pro, 8 logical cores, DPR 2, 120 Hz display (8.33 ms budget) | [R] from the brief |
| Load average at start (18:10) | 13.12 / 13.02 / 11.95 | [M] `uptime` |
| Load during first iframe bench (18:12-18:14) | 14.35 to 15.95 (1-min) | [M] |
| Load during second bench (18:15-18:16) | spiked 23.1 -> 72.7 -> 75.1 -> 67.0 (1-min); top consumer `node` at 81.8% CPU | [M] `uptime`, `ps` |
| Load during the final, reported bench (18:17) | 43.1 -> 35.9 -> 31.7 (1-min) | [M] |
| Load at end (18:18) | 25.33 / 25.97 / 18.34 | [M] |

This machine was heavily loaded by other agents during every timing below. Every frame-time figure here is therefore **pessimistic**, and one outlier (section 6.4) is almost certainly preemption.

---

## 1. What the team already ships (read, not restated at length)

| surface | where | what it proves about skills | tag |
|---|---|---|---|
| React + Vite SPA, HashRouter, GitHub Pages | `/Users/playra/tri-27/apps/website`, live at t27.ai | TypeScript/React; Vite `manualChunks` already splits `router`, `motion`, `three`, `react` (`vite.config.ts:160-166`) | [M] read today |
| Telegram Mini App | `/Users/playra/leela-loop/apps/miniapp`, live at https://t27.ai/leela/ (HTTP/2 200, `content-length: 16522`, `last-modified: Thu, 03 Sep 2026 07:54:43 GMT`) | They already know: Pages `build_type: workflow`, HTTPS enforced ("Telegram will not open a Web App over plain HTTP"), the `github-pages` environment branch policy trap, a 5-check smoke run, `telegram-web-app.js` in `index.html:62`, `expand()`, `HapticFeedback`, `colorScheme` -> `data-theme`, `language_code`, and the `sendData` / keyboard-button rule (bot README lines 366-429) | [M] HEAD today; README read |
| Telegram bot | `/Users/playra/leela-loop/apps/bot`, grammY `^1.30.0` | Sends `{ keyboard: [[{ text: 'Board', web_app: { url } }]] }` into private chats only; measured by them that inline `web_app` buttons can never `sendData` | [R] README |
| Expo / React Native app | `/Users/playra/leela-loop/apps/mobile`, `expo ~54.0.0`, `react-native 0.81.4`, `newArchEnabled: true`, ids `xyz.ghashtag.dharma` / `com.leelagame`, Detox e2e (14 flows, Mac-only) | No `react-native-webview`, no `expo-gl`, no `eas.json` in that app (grep/ls today). Store identity discipline (`APP_VARIANT=development` -> `.dev` suffix) already learned the hard way | [M] read today |
| Browser 3D board | `/Users/playra/leela-loop/apps/webgl` (three.js on the same engine) | The team has shipped three.js once already | [R] README |
| macOS Swift app | `/Users/playra/BrowserOS/trios` (`README.md`: menu-bar app, macOS 14+, "signed with a local development identity; Gatekeeper will not accept a copy downloaded from elsewhere") | Swift; no `WKWebView` anywhere in `trios/**/*.swift` (grep today: zero hits) | [M] grep today |
| A token | `/Users/playra/trinity/deploy/contracts/src/TrinityToken.sol` | Read in full: `ERC20 + ERC20Permit`, `PHOENIX_NUMBER = 10_460_353_203` (3^21), five fixed allocations, linear vesting with cliffs, and **the only mint paths are the constructor (liquidity) and `claimVested()` for the five beneficiaries**. There is no owner-mint, no game hook, no per-action entry point. Sepolia deployment JSON: the brief says present; I did not open it | [M] read today |

Consequence for the economy question: **nothing in this plan touches TRI.** The committed study's §4.5 prohibition stands - "Do not attach a transferable token to a proof unit. A4 is a mint." - and the contract itself has no function a game could call to mint. Mining in the game produces proof units (non-transferable, no price, "the right to be counted"), full stop. Section 6.3 adds a second reason to keep it that way (Telegram Stars) and section 4 a third (Steam's content policy).

---

## 2. Baseline bytes for the thing being shipped

| artifact | raw | gzip -9 | brotli -q 11 | tag |
|---|---|---|---|---|
| `docs/game/prototypes/06-comb.html` (the whole current field, HTML+CSS+JS, 90 cells) | 15,590 | 7,096 | **6,138** | [M] |
| Local `dist/assets/Queen-BiAZXKyT.js` (built 15:06 today, after commit `cd1ad56` at 14:54) | 10,213 | 3,871 | **3,306** | [M] |
| Local `Queen-BoFNKQhN.css` | 4,313 | 1,205 | 1,019 | [M] |
| Local `index-COh_Bk0A.js` | 264,250 | 86,378 | 70,229 | [M] |
| Local `react-D-uFLJMr.js` | 209,027 | 65,364 | 56,453 | [M] |
| Local `motion-mybjp1Q4.js` | 120,758 | 39,674 | 35,644 | [M] |
| Local `router-IkahhNTh.js` | 36,108 | 13,080 | 11,712 | [M] |
| **Local dist contains no `three-*` chunk at all** (glob empty; `grep -l "BufferGeometry\|react-three" dist/assets/*.js` -> nothing; `Queen.tsx` imports only `react`, `../i18n/context`, `./Queen.css`) | - | - | - | [M] |
| **Live** t27.ai `assets/Queen-CXq47Md-.js` | 63,787 (server sent it uncompressed to `curl` even with `Accept-Encoding: br`) | - | - | [M] |
| Live Queen chunk imports (`from"./..."` specifiers): `index-Dv6Ogf4x`, `motion-CsGAsfs`, `react-Be6y7_DR`, `router-BHJoP3Ih`, **`three-C7rSOEFP`**; `getContext` occurrences: **0** | | | | [M] |
| Live `three-C7rSOEFP.js` encoded | 249,526 | | | [R] render-budget.md §8 |
| The full canvas2D game (L0-L3, Protoss glow, evolving bees) | | | 2,794 | [R] render-budget.md §10 |
| `https://telegram.org/js/telegram-web-app.js?63` (decoded body) | 116,510 | (served `content-encoding: gzip`; compressed length not exposed on HEAD) | | [M] |
| Electron v44.1.1 prebuilt zip, `darwin-arm64` | 130,003,459 | | | [M] HEAD `content-length` on the GitHub release asset |
| Electron v44.1.1 `win32-x64` | 157,852,132 | | | [M] |
| Electron v44.1.1 `linux-x64` | 122,594,478 | | | [M] |
| Tauri app | "can be little as 600KB" | | | [R] https://v2.tauri.app/ |
| Tauri AppImage on Linux | "70+ MB compared to 2-6 MB for standard distributions" | | | [R] https://v2.tauri.app/distribute/appimage/ |
| Tauri Windows installer WebView2 options | `downloadBootstrapper` 0 MB (needs internet), `embedBootstrapper` ~1.8 MB, `offlineInstaller` ~127 MB, `fixedVersion` ~180 MB | | | [R] https://v2.tauri.app/distribute/windows-installer/ |
| Unity 6 empty Web build, brotli | 10.7 MB default 3D URP template -> 2.0 MB after six stripping steps (Unity 6.0.23) | | | [R] https://gist.github.com/aras-p/740c2d4f9977ce92b7de72b1394dd365 |
| Godot 4.3 Web `.wasm` | "around 40 MB uncompressed, and 5 MB compressed with Brotli" | | | [R] https://godotengine.org/article/progress-report-web-export-in-4-3/ |

Two things the live/local comparison establishes, both measured today:

1. **The deployed t27.ai is not built from this tree.** Live `index.html` references `three-C7rSOEFP.js` and the live Queen chunk imports it; the local `dist` built 12 minutes after the last commit has no three chunk and a 10,213-byte Queen chunk. render-budget.md §8.1 said the same about `/Users/playra/trinity`; it is now true of `/Users/playra/tri-27` too. Whoever ships the game must first find out which checkout the Pages workflow builds from, or the 249,526-byte three chunk comes along uninvited on every platform below.
2. **The Queen page ships zero raster assets** (`apps/website/public`: four icons, one SVG, `fonts/`, `wasm/`, `manifest.json`, `og-image.png` - listed today). "Real ground" means the first PNG/WebP atlas this route has ever carried; its size is a design decision not yet made and is not in any number above.

---

## 3. Per-target shipping paths for the canvas2D/TypeScript game

The game is one artifact: an HTML shell, one canvas, one TS bundle, later one sprite atlas. Every row below is "that artifact plus a wrapper". Bytes are the wrapper's cost **on top of** the game.

| # | target | wrapper | bytes the wrapper adds | build complexity | ONE blocker, from the wrapper's own docs (URL) | tag |
|---|---|---|---|---|---|---|
| 1 | **Web desktop** (t27.ai/#/queen) | none - the route exists | 0. Local Queen chunk 3,306 B br [M]; live route already downloads three (249,526 B [R]) because of the deploy mismatch | `vite build`; a commit | GitHub Pages cannot set response headers, so anything needing `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (SharedArrayBuffer, threads) "will not run" there - https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html. canvas2D never asks, so this is a fence, not a wall | [M]/[R] |
| 2 | **Web mobile** (same URL, PWA) | none; `public/manifest.json` exists (`display: standalone`, `start_url: /`, `scope: /`) but no service worker anywhere (`grep serviceWorker\|workbox\|vite-plugin-pwa` -> nothing) | 0 + a service worker (a few KB) | add `<meta name="viewport">`, touch controls, a SW | Safari renders pages at 60 fps unless the user disables "Prefer Page Rendering Updates near 60fps"; WebKit bug 272226 records that the flag does not even reach Web Apps on macOS - https://www2.webkit.org/show_bug.cgi?id=272226 (first-party); the rAF link is from forum reports https://forums.macrumors.com/threads/enabling-120hz-scrolling-in-safari.2323961/page-2 (third-party). **Design the phone build for 16.7 ms, not 8.33 ms** | [M]/[R] |
| 3 | **Telegram Mini App** | `https://telegram.org/js/telegram-web-app.js?63` in `<head>` "before other scripts"; served by Telegram, 116,510 B decoded [M] | 116,510 B decoded (gzip on the wire, size not exposed) + 0 for the game | a second Pages path exactly like `/leela/`; one `web_app` keyboard button already coded in the bot | "This method is only available for Mini Apps launched via a Keyboard button" (`sendData`) - https://core.telegram.org/bots/webapps. Menu-button and direct-link launches can open the game but cannot hand a result to the bot; leela hit exactly this | [M]/[R] |
| 4 | **iOS App Store** | Capacitor 8 (WKWebView, SPM by default) | native shell: not measured; the OS provides the WebView | Mac + "Xcode 26.0+ is required", "iOS 15+ is supported" - https://capacitorjs.com/docs/ios ; Apple Developer Program enrolment | Guideline 4.2 - see section 7 for the verbatim text. The wrapper is not the blocker; the review is | [R] |
| 5 | **Google Play** | Capacitor 8 Android, or a Trusted Web Activity if the PWA is installable | not measured | "API 24+ (Android 7 or later) is supported"; "Capacitor requires an Android WebView with Chrome version 60 or later"; "Android Studio 2025.2.1" - https://capacitorjs.com/docs/android ; TWA needs Digital Asset Links and Chrome 72+ - https://developer.chrome.com/docs/android/trusted-web-activity/ | Play policy: "New apps and app updates must target Android 16 (API level 36) or higher to be submitted to Google Play" (effective 2026-08-31, extension to 2026-11-01) - https://developer.android.com/google/play/requirements/target-sdk . Whether Capacitor 8's template targets 36 is not stated on its page | [R] |
| 6 | **macOS** | (a) a `WKWebView` inside trios (Swift, zero new toolchain; no WKWebView exists there today [M]); (b) Tauri 2 | (a) ~0; (b) "as little as 600KB" [R] | (a) trivial for the operator's own machine; (b) `cargo` + Xcode CLT | Mac App Store: "Your app must include the App Sandbox capability to be distributed in the App Store", signed `.pkg` with a "Mac Installer Distribution" certificate - https://v2.tauri.app/distribute/app-store/ . Outside the store: "the app needs to be code signed. Then, the app needs to be uploaded to Apple for a process called notarization" - https://www.electronjs.org/docs/latest/tutorial/code-signing . trios today is "signed with a local development identity" [R README] | [M]/[R] |
| 7 | **Windows** | Tauri 2 (WebView2), or Electron | Tauri: 0 / 1.8 MB / 127 MB / 180 MB depending on WebView2 option [R]; Electron: 157,852,132 B zip [M] | Rust MSVC toolchain, "Microsoft C++ Build Tools" - https://v2.tauri.app/start/prerequisites/ | "Since June 2023, Microsoft requires software to be signed with an 'extended validation' certificate" and EV certs "cannot be simply downloaded onto a CI infrastructure" (FIPS 140 Level 2 hardware) - https://www.electronjs.org/docs/latest/tutorial/code-signing . Applies to any wrapper | [M]/[R] |
| 8 | **Linux** | Tauri 2 (WebKitGTK 4.1), or Electron | Tauri AppImage "70+ MB" [R]; Electron 122,594,478 B zip [M] | "Tauri v2 requires WebKitGTK 4.1, which means Ubuntu 22.04 and Debian 12 are recommended baseline build systems"; ARM AppImages cannot be cross-compiled - https://v2.tauri.app/distribute/appimage/ | "The window opens but stays blank or white" on "most often NVIDIA GPUs"; workaround `WEBKIT_DISABLE_DMABUF_RENDERER=1` "at the cost of the faster rendering path", or `WEBKIT_DISABLE_COMPOSITING_MODE=1` which "disables accelerated compositing entirely" - https://v2.tauri.app/develop/debug/linux-graphics/ . For a canvas game that is a real fps hit on the exact machines gamers own | [R] |
| 9 | **Steam** | Electron + `steamworks.js`, or Tauri + the Steamworks SDK from Rust (Rust binding not verified today) | Electron zip per OS above [M] + `steam_api[64].dll` / `libsteam_api.dylib` / `libsteam_api.so` redistributables [R] | `steamworks.js` requires `webPreferences: { contextIsolation: false, nodeIntegration: true }` and `electronEnableSteamOverlay()` - https://github.com/ceifa/steamworks.js - i.e. it switches off Electron's two main renderer protections; "copy the relevant distro files from `sdk/redistributable_bin/{YOUR_DISTRO}` into the root of your build" | Three from Steam's own pages: "$100 USD (or equivalent) fee for each product", "A 30-day waiting period between when you paid the app fee and when you can release", "publicly-visible 'coming soon' page for at least two weeks" - https://partner.steamgames.com/doc/gettingstarted/onboarding ; `SteamAPI_Init` fails when "The Steam client isn't running" - https://partner.steamgames.com/doc/sdk/api ; and the onboarding page lists **blockchain/cryptocurrency applications as prohibited** - a Steam build must contain no TRI surface whatsoever | [M]/[R] |

Reach score for canvas2D/TypeScript: **9 of 9 targets reachable**, all from one artifact, all in the languages the team already writes.

---

## 4. Unity and Godot, same nine targets, plus the trade table

### 4.1 Unity

| target | path | bytes | blocker from Unity's own docs |
|---|---|---|---|
| Web desktop | Unity Web (wasm) build hosted on Pages | empty build 10.7 MB brotli default, 2.0 MB after removing URP, splash, Input System, Unity UI, high stripping, LTO [R gist] | Browsers must be "WebGL 2 capable", "64-bit" with WebAssembly - https://docs.unity3d.com/6000.2/Documentation/Manual/webgl-browsercompatibility.html . Compressed builds need `Content-Encoding: br`/`gzip` from the server; GitHub Pages sets its own headers, so you either rely on Pages' automatic gzip or enable "Decompression Fallback", which "results in a large loader size and a less efficient loading scheme" - https://docs.unity3d.com/6000.2/Documentation/Manual/webgl-deploying.html |
| Web mobile | same build | same | "iOS Safari 15 and newer", "Chrome 58 and newer" on Android; "Safari doesn't support IndexedDB for iFrame content" (same page) - and a Telegram Mini App on Telegram Web **is** an iframe |
| Telegram Mini App | the Web build inside the Telegram WebView | 2-11 MB before any game content | no Unity doc covers it; the SDK bridge is plain JS `jslib`. Unmeasured, and a 2-11 MB cold load on mobile data is the honest description |
| iOS / Google Play / macOS / Windows / Linux | native exports, Unity Personal "web, desktop, AR/VR, and mobile" | tens of MB per platform (not measured) | Unity Personal is free under "less than $200K USD of revenue or funds raised in the prior 12 months"; Pro "$2,310.00/yr" per seat above that - https://unity.com/products/compare-plans . A TRI treasury or a raise crosses that line |
| Steam | native + Steamworks.NET | | same Steam rules as section 3 row 9 |

### 4.2 Godot

| target | path | bytes | blocker from Godot's own docs |
|---|---|---|---|
| Web desktop / mobile / TMA | Web export, single-threaded (4.3+) | "around 40 MB uncompressed, and 5 MB compressed with Brotli" [R godotengine.org] | "C# projects cannot export to web in Godot 4"; WebGL 2.0 required; "Safari has documented compatibility issues" - https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html . Threaded export needs COOP/COEP headers Pages cannot set (single-threaded avoids it; PWA service-worker workaround exists) |
| iOS | Xcode project export | not measured | "You must export for iOS from a computer running macOS with Xcode installed"; C# "experimental and some limitations apply" - https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html |
| Google Play | Gradle build -> AAB | not measured | "All new apps uploaded to Google Play after August 2021 must be an AAB"; "To export an AAB file you need to set up Gradle builds" - https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html |
| macOS / Windows / Linux / Steam | native exports; GDExtension for Steamworks | | same store/Steam rules as section 3 |

### 4.3 The trade in one table

| | canvas2D / TypeScript | Unity | Godot |
|---|---|---|---|
| Targets reachable of 9 | 9 | 9 (TMA and PWA only by shipping the Web build into a WebView) | 9 (same caveat; no C# on web) |
| Web transfer floor for the game | **6,138 B br** (comb, everything) [M]; **2,794 B br** (full L0-L3 game) [R] | ~2.0 MB br stripped empty, 10.7 MB default [R] | ~5 MB br stock [R] |
| Ratio vs canvas2D (on the comb figure) | 1x | ~330x (stripped) to ~1,740x (default) | ~815x |
| Language the team writes | TypeScript, React (yes); Swift for a WKWebView shell (yes); Rust for a Tauri backend (yes - trios has `Cargo.toml`); Zig only via wasm (not measured) | C# - **nobody** | GDScript - **nobody**; C# has no web export |
| Existing shipped surfaces reused | t27.ai SPA, `/leela/` TMA, leela bot, Expo app, trios | none | none |
| 3D with correct occlusion | no (committed flip condition #3) | yes | yes |
| Text at DPR 2 | `fillText` free, 0.2 ms for ~75 labels [R] | SDF/TextMeshPro | Label nodes |
| Licence exposure | none | Pro at $2,310/seat/yr above $200K revenue/funding [R] | MIT |
| Store/Steam rules | identical for all three | identical | identical |

The engines buy 3D and an editor. The committed studies measured that this design needs neither (render-budget.md: canvas2D holds every zoom level with 5x-107x headroom; benchmark-reverify.md: the 55.9 fps figure that once justified an engine did not reproduce). **Nothing platform-related tips that.** Reach is equal; bytes and skills are not.

---

## 5. What "platform reach" costs in engineering terms, ordered by build complexity

Measured only in the sense of what each path requires you to install and sign; none of these was built today.

1. Web desktop: a commit. Nothing to install.
2. Telegram Mini App: one more Pages path + one `<script>` tag + a bot button that already exists in leela's code.
3. PWA: a manifest that already exists + a service worker + a viewport meta.
4. macOS via trios: one `WKWebView` in Swift, or Tauri (`cargo`, Xcode CLT).
5. Android via Capacitor: Android Studio 2025.2.1, API 36 target, Play Console, signing keystore.
6. iOS via Capacitor: Xcode 26.0+, Developer Program, review under 4.2.
7. Windows + Linux via Tauri: Rust MSVC toolchain; EV certificate on hardware; Ubuntu 22.04 build base; NVIDIA env-var workaround.
8. Steam: $100 per product, 30 days, tax/bank onboarding "2-7 business days", plus a wrapper that disables Electron's context isolation.

---

## 6. The Telegram Mini App path, in detail

### 6.1 What the SDK gives (from https://core.telegram.org/bots/webapps, read today)

| capability | Bot API version | notes |
|---|---|---|
| `initData`, `initDataUnsafe` | core | "raw data string for validation" - validation needs a server (Railway is there; the supervisor could verify the HMAC) |
| `themeParams`, `colorScheme`, `var(--tg-color-scheme)` | core | leela already maps this to `data-theme` |
| `viewportHeight`, `viewportStableHeight`, `expand()` | core | leela calls `expand()` at `main.ts:173` |
| `HapticFeedback` (`impactOccurred`, `notificationOccurred`, `selectionChanged`) | 6.1+ | leela wraps it in `buzz()`; note their comment: the SDK "warns internally - HapticFeedback is not supported in version 6.0" |
| `openInvoice()` | 6.1+ | payments - see 6.3 |
| `CloudStorage` | 6.9+ | "Each bot can store up to 1024 items per user" - enough for a save slot, not for a replay log |
| `DeviceStorage` / `SecureStorage` | (later) | "up to 5 MB per user" / "up to 10 items per user" |
| `MainButton` -> `BottomButton`, `SecondaryButton` | 7.10+ | native-styled action buttons; an RTS wants its own HUD, but these are free |
| `disableVerticalSwipes()` | 7.7+ | **essential for a drag-to-orbit map**, otherwise a vertical drag collapses the app |
| `lockOrientation()`, `requestFullscreen()`, `isFullscreen`, `safeAreaInset` | 8.0+ | fullscreen landscape RTS is possible on 8.0+ clients |
| `DeviceOrientation`, `Accelerometer` | 8.0+ | not needed |
| `sendData()` | core | **keyboard-button launches only** |

### 6.2 Size limits

The Bot API page states limits for `CloudStorage` (1024 items), `DeviceStorage` (5 MB) and `SecureStorage` (10 items). **It states no limit on page or bundle size** - the Mini App is a URL; the client loads whatever the URL serves. The practical ceiling is the phone's radio: leela's README measured its own first load at 108 kB gzip and once shipped 8.1 MB by accident for 112 commits before a test caught it. The comb is 6,138 B brotli [M]; the SDK is 116,510 B decoded [M]; a sprite atlas will dominate both the day it exists.

### 6.3 Telegram Stars - a THIRD currency; keep it out

From https://core.telegram.org/bots/payments-stars (read today): "your bot or mini app must use Telegram Stars for the sale of digital goods and services inside Telegram apps, regardless of any other web portals, apps, services or payment providers", and "Telegram cannot display your bot or mini-app to mobile users if you attempt to sell digital goods and services via other currencies or through third-party payment providers." Stars are bought through Apple/Google in-app purchase, which is why they exist.

The economy already has proof units (non-transferable) and the repository already has TRI (transferable, ERC20). Stars would be a third unit with its own conversion rules, a 4.7.1 obligation ("follow Guideline 3.1 in order to offer digital goods or services"), and a policy that would eject the app from mobile Telegram if the game ever priced anything in TRI. **Recommendation: the Mini App sells nothing. No `openInvoice`, no Stars, no TRI.** That keeps it inside the §4.5 prohibition and outside the Stars rule at once.

### 6.4 Does the comb prototype run inside a Telegram-shaped viewport today? Measured.

**Method.** `06-comb.html` copied to `/tmp/combtma/comb.html` and embedded in a parent page with a 56 px header stand-in and an iframe filling the rest (Telegram Web runs Mini Apps in an iframe; Telegram iOS/Android use a native WebView, which I cannot drive). Served by `python3 -m http.server 8941` on 127.0.0.1. Loaded in the in-app browser pane with the `mobile` preset: **375x812 CSS px, DPR 2, 5 touch points, UA `Android 14; Pixel 8 ... Chrome/148.0.0.0 Mobile`**. Then `window.__bench(rows, 120, 30)` from the prototype's own harness (30 warm-up frames, 120 timed synchronous `render()` calls, median and p95 of main-thread draw time). Screenshots confirmed the scene draws in every configuration.

**This is desktop Chrome 148 on an M1 Pro emulating a phone's viewport. It is NOT a phone GPU, NOT a phone CPU, NOT WKWebView.** The draw figure is main-thread recording cost, as the committed studies also note.

Run A - as shipped (no viewport meta anywhere). Load 14.4-16.0 [M]:

| rows | cells | layout viewport | canvas px | median ms | p95 ms | % of 8.33 |
|---|---|---|---|---|---|---|
| 3 | 27 | 980x2066 CSS | 1960x4132 | 0.6 | 4.7 | 56 |
| 6 | 90 | 980x2066 | 1960x4132 | 1.8 | 6.1 | 73 |
| 9 | 189 | 980x2066 | 1960x4132 | 3.7 | 8.6 | 103 |

**Finding 1 (defect): `06-comb.html` contains zero `<meta name="viewport">` tags** (`grep -c` = 0 [M]). A mobile browser therefore lays it out at the 980 px legacy width and scales it down: 4x the pixels a phone has, and every HUD label at ~40% size. In Telegram iOS/Android (native WebView) this is what would ship. One line fixes it.

Run B - viewport meta added inside the iframe document only. Ignored, as expected: an iframe inherits the parent's layout viewport, so this is what Telegram Web would do if **its** shell had no meta (it has). Load 23-75 (spike) [M]: rows 6 median 1.8/1.7/1.8, p95 4.8/4.8/4.9; rows 9 median 3.6/3.6, p95 **19.7** / 8.8. The 19.7 came with a `nodes` pass of 17.9 ms in a single frame during the load-average-75 spike; the repeat gave 8.8. Reported, not trusted.

Run C - viewport meta in the parent shell, the reportable configuration. Load 43.1 -> 35.9 -> 31.7 [M]:

| rows | cells | layout viewport | canvas px | median ms (3 runs) | p95 ms (3 runs) | % of 8.33 | % of 16.7 (60 Hz phone) |
|---|---|---|---|---|---|---|---|
| 3 | 27 | 375x756 CSS | 750x1512 | 0.5 | 3.7 | 44 | 22 |
| 6 | 90 | 375x756 | 750x1512 | **1.4 / 1.4 / 1.4** | **4.5 / 4.7 / 4.6** | 54-58 | 27-28 |
| 9 | 189 | 375x756 | 750x1512 | 2.2 / 2.2 | 6.9 / 5.4 | 65-83 | 32-41 |

Pass breakdown at 6 rows (last frame of each run): ground 0-0.1, walls 0.5, nodes 0.8-3.6 (one 13.0 outlier), bees 0-0.1 ms. The 27-vertex glow sprites dominate, as in the committed desktop measurement.

Compare the committed desktop figure: "90 cells at 1.5 ms median" [R, prototypes README via brief]. At phone viewport it is 1.4 ms median on this machine under a load of ~35. **The prototype fits the Telegram viewport on this hardware with 42-46% of a 120 Hz frame to spare, and ~72% of a 60 Hz frame.** What that says about an A15 or a Snapdragon is nothing; it is a bound on the recording cost, not a phone measurement.

**Finding 2 (fit, observed in the Run C screenshot):** at 6 rows the field overflows the 375 px width on both sides (`__bench` fixes `dist = max(300, rows*S*0.5)` = 450, tuned for a landscape desktop). The bottom-right hint ("DRAG TO ORBIT · WHEEL TO ZOOM · 3-9 ROWS · CLICK A CELL") collides with the bottom-left legend ("0 IDLE" is drawn through it). A portrait phone needs either a larger default `dist` or a landscape lock via `lockOrientation()` (8.0+).

**Finding 3 (input, read from the code):** zoom is `wheel` only (line 119) and row count is `keydown` 3-9 (line 120) - neither exists on a phone; hover picking is `mousemove` (line 121), which touch does not fire, so `click` -> `picked` never gets a `hover` on touch. Orbit works, because it uses pointer events. Pinch-zoom and a tap hit-test are required before the TMA is playable; `disableVerticalSwipes()` is required before it is usable.

**Finding 4:** the prototype loads Outfit from `fonts.googleapis.com` (line 5). Inside Telegram that is an extra third-party request on every cold start; self-host or drop it.

### 6.5 What the TMA path costs in total

One Pages path (`/queen/` next to `/leela/`), one `<script>` tag, a viewport meta, touch input, `disableVerticalSwipes()`, one `web_app` keyboard button in a bot (leela's `Keyboard.webApp` pattern, private chats only), and - if the game ever needs the bot to know the result - `sendData` from a keyboard-button launch only. Server-side `initData` validation is optional until anything is trusted from the client; the supervisor on Railway is where it would go. No store, no review, no signing, no fee.

---

## 7. The App Store question, honestly

Verbatim from https://developer.apple.com/app-store/review/guidelines/ (fetched today):

> **4.2 Minimum Functionality.** Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or "app-like," it doesn't belong on the App Store. If your App doesn't provide some sort of lasting entertainment value or adequate utility, it may not be accepted.

> **4.2.2** Other than catalogs, apps shouldn't primarily be marketing materials, advertisements, web clippings, content aggregators, or a collection of links.

> **4.2.3 (i)** Your app should work on its own without requiring installation of another app to function. **(ii)** If your app needs to download additional resources in order to function on initial launch, disclose the size of the download and prompt users before doing so.

> **4.2.6** Apps created from a commercialized template or app generation service will be rejected unless they are submitted directly by the provider of the app's content.

> **4.7 Mini apps, mini games, streaming games, chatbots, plug-ins, and game emulators.** Apps may offer certain software that is not embedded in the binary, specifically HTML5 and JavaScript mini apps and mini games, streaming games, chatbots, and plug-ins. [...] You are responsible for all such software offered in your app, including ensuring that such software complies with these Guidelines and all applicable laws. [...] You must also ensure that the software adheres to the additional rules that follow in 4.7.1 through 4.7.5.

> **4.7.1** Software offered in apps under this rule must: follow all privacy guidelines [...]; include a method for filtering objectionable material, a mechanism to report content and timely responses to concerns, and the ability to block abusive users; and follow Guideline 3.1 in order to offer digital goods or services to end users.
> **4.7.2** Your app may not extend or expose native platform APIs or technologies to the software without prior permission from Apple.
> **4.7.3** Your app may not share data or privacy permissions to any individual software offered in your app without explicit user consent in each instance.
> **4.7.4** You must provide an index of software and metadata available in your app. It must include universal links that lead to all of the software offered in your app.
> **4.7.5** Your app must provide a way for users to identify software that exceeds the app's age rating, and use an age restriction mechanism based on verified or declared age to limit access by underage users.

What this means for a canvas game in a Capacitor shell:

1. **Embed the game in the binary.** 4.7 governs software "not embedded in the binary". Capacitor copies the built web assets into the app bundle and serves them from a local scheme; the game is then embedded, 4.7 does not apply, and 4.2 is the whole review. A shell that merely points `WKWebView` at `https://t27.ai/#/queen` is the "repackaged website" 4.2 names, and 4.2.3(i) ("work on its own") plus 4.7.4's index/universal-link requirement follow it around. Do not ship the remote-URL shell to review.
2. **4.2.3(ii):** if the sprite atlas is downloaded on first launch rather than bundled, its size must be disclosed and the user prompted. Bundle it.
3. **"App-like" in practice** (this is reasoning, not text from Apple): offline play of the local simulation, `HapticFeedback` -> native `UIImpactFeedbackGenerator` through the Capacitor Haptics plugin, native share sheet, state persisted on device, home-screen icon and launch screen, no browser chrome, and a game that is playable with the supervisor unreachable (the supervisor has been refusing every tick today on its $10/day cap - a reviewer would meet exactly that). "Lasting entertainment value" is the reviewer's phrase; an RTS whose only content is a live dashboard of somebody else's CI has to demonstrate that the local game is a game.
4. **4.2.6** is not a risk: Capacitor is a framework, not "a commercialized template or app generation service", and the submitter is the content owner.
5. **3.1.1** (not quoted; read) applies the moment anything is sold. The economy sells nothing; keep it so. Guideline 4.7.1's third bullet is the same rule stated for mini apps.
6. Requirements from the wrapper side, read today: Mac, Xcode 26.0+, iOS 15+ (Capacitor), Apple Developer Program enrolment with its annual fee (Electron's signing page), and for the Mac App Store variant the App Sandbox (Tauri's page).

Google Play has no 4.2 equivalent on the pages I read; its gate is technical (target API 36 from 2026-08-31, AAB, signing).

---

## 8. Recommended order of targets, with the reason for each position

| # | target | why here | what it costs before it ships |
|---|---|---|---|
| 1 | **Web desktop, t27.ai/#/queen** | It exists; the route is code-split at 3,306 B br [M]; the design was measured on this surface; shipping is a commit. Blocker to clear first: find out why the deployed site carries a `three` chunk this tree does not build [M] | resolve the deploy source; the game itself |
| 2 | **Telegram Mini App** | Highest reach per byte: same artifact + a 116,510 B [M] script served by Telegram, hosted on the Pages setup leela already fought through (HTTPS, branch policy, smoke test); the bot already sends the right button; no review, no fee, no signing. The comb runs at 1.4 ms median in a 375x756 iframe on this machine [M] | viewport meta, touch (pinch, tap-pick), `disableVerticalSwipes()`, portrait fit, one Pages path, one bot button; sell nothing |
| 3 | **Web mobile / PWA** | Same artifact again; the manifest exists [M]; a service worker makes it installable and offline-capable, which is also what Google's TWA path (#5) requires. Design for 16.7 ms here (Safari 60 fps default) | viewport meta (shared with #2), service worker, install prompt |
| 4 | **macOS** | The operator already runs trios on this machine; a `WKWebView` in Swift is the cheapest native shell there is, and no store is needed for the operator. Tauri later if a public Mac build is wanted; notarization then | one Swift view, or Tauri + signing |
| 5 | **Google Play** | Cheaper gate than Apple (technical, not editorial); TWA reuses the PWA from #3 with Digital Asset Links; Capacitor if native plugins are needed. Play's API-36 rule is dated and clear | Android Studio, keystore, Play Console, API 36 |
| 6 | **iOS App Store** | Only after #3-#5 have produced the offline, haptic, self-contained build that 4.2 demands; the review is the cost, not the wrapper. Embed the assets; sell nothing | Xcode 26, Developer Program, Capacitor iOS, 4.2 review |
| 7 | **Windows + Linux** | One Tauri build gives both, but each carries a documented trap (EV certificate on hardware; NVIDIA blank window) and no shipped surface of the team's exists there yet. Wait for desktop demand | Rust MSVC, EV cert, Ubuntu 22.04 base, NVIDIA env-var, AppImage 70+ MB |
| 8 | **Steam** | Last: $100 per product, a 30-day clock, a two-week coming-soon page, bank/tax onboarding, `SteamAPI_Init` needs the Steam client, the Electron binding disables context isolation, and Steam's onboarding page lists blockchain/cryptocurrency applications as prohibited - a Steam build must be TRI-free by construction. Every one of those is a reason to arrive with a finished game, not a prototype | wrapper + Steamworks + fee + waiting |
| - | **Unity / Godot** | Not in the order. Reach is identical, bytes are ~300-1,700x worse for the web-first targets, the languages are not the team's, and the committed measurements say the design does not need what the engines sell. Revisit only under the committed flip condition #3 (a solid, occluding, perspective-correct 3D world) | - |

---

## 9. What I did not measure, stated so nobody quotes it as measured

- **No phone.** Every frame number is desktop Chrome 148 on an M1 Pro emulating a 375x812 viewport under a load average of 14-75. No WKWebView, no Android WebView, no real Telegram client. The mobile numbers are a bound on JS recording cost and nothing else.
- **No sprites.** The comb is line art plus cached glow sprites. "Real ground" (textured tiles) was not drawn or timed; the only sprite figure in the corpus is render-budget's 256 cached glow sprites at 2.4 ms CPU [R]. A tile atlas benchmark is the next measurement this plan needs, and its byte cost will dominate every bundle figure above.
- **No wrapper was built.** Capacitor, Tauri, Electron, Expo and TWA sizes are either vendor claims [R] or the prebuilt Electron zip sizes from GitHub release headers [M]. No app was packaged.
- **Unity and Godot were not installed.** Their sizes are first-party or author-published figures, dated and linked.
- **Vendor quotations** other than Apple's came back through a summarising fetch; I did not diff them against the raw HTML.
- **Telegram page-size limit:** none found on the page read; absence of a stated limit is not a stated absence.
- **Safari's 60 fps rAF cap** is documented first-party only as a feature flag (WebKit bug 272226); the "rAF is what it governs" statement is from forum posts. Treat as likely, unverified.
- **The deployed site's build source** was not identified; only the mismatch was measured.
- **`deployment-sepolia.json`** was not opened.
- **Apple Developer Program price, Play Console fee:** not fetched; not stated here as numbers.

---

## 10. Scratch and its deletion

Everything lived in `/tmp/combtma`: `comb.html` (copy of the prototype), `comb-vp.html`, `tma.html`, `tma-vp.html`, `http.log`, `http.pid`, `live-index.html`, `live-index.js`, `live-queen.js`, `live-queen.br`. Peak size 448 KB [M `du -sh`], against a 400 MB ceiling. The `python3 -m http.server 8941` process was killed (`curl` afterwards: `000`, "server down"), then `rm -rf /tmp/combtma`; `ls -d /tmp/combtma` -> "No such file or directory"; `ls /tmp | grep -i comb` -> nothing. The browser pane was returned to the desktop preset. No file outside `/tmp` was written; `git status` in tri-27 shows three untracked docs that were present in my first directory listing before any of my commands ran.
