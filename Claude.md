# CLAUDE.md

Panduan ini membantu Claude Code memahami struktur dan aturan project ini.

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Backend**: Firebase (Firestore, Storage, Auth)
- **State Management**: Zustand (`useStore`)
- **Navigation**: React Navigation
- **Video**: expo-video (`useVideoPlayer`, `VideoView`)
- **Icons**: @expo/vector-icons (Ionicons)
- **Safe Area**: react-native-safe-area-context

## Struktur Folder

```
/
├── app/                  # Entry point & navigasi
├── screens/              # Halaman utama
│   ├── feed/
│   │   ├── FeedScreen.tsx        # Feed campuran (foto, video, audio)
│   │   └── VideoFeedScreen.tsx   # Feed video TikTok-style
│   └── ...
├── components/           # Komponen reusable
│   └── AudioPlayer.tsx
├── store/
│   └── useStore.ts       # Zustand global state
├── utils/
│   └── firebase.ts       # Inisialisasi Firebase
└── CLAUDE.md
```

## Aturan Coding

- Selalu pakai **TypeScript**, hindari `any` kalau bisa
- Komponen yang masuk FlatList **wajib** pakai `React.memo`
- Fungsi yang jadi props FlatList **wajib** pakai `useCallback`
- `onViewableItemsChanged` dan `viewabilityConfig` di FlatList **wajib** pakai `useRef().current` agar referensi stabil
- Jangan taruh logika fetch di dalam `renderItem`
- Semua video player **harus** di-pause saat komponen unmount atau tidak aktif

## Firebase

- Database: Firestore
- Collection utama: `posts`, `notifications`, `users`
- Sub-collection: `posts/{postId}/comments`
- Field `mediaType`: `'image'` | `'video'` | `'audio'`

## Konvensi State

- Global state (user, posts) → Zustand `useStore`
- Local UI state (modal, loading, input) → `useState`

## Hal yang Harus Dihindari

- Jangan buat inline function di `renderItem` FlatList
- Jangan duplicate kondisi `if (loading)` 
- Jangan import yang tidak dipakai
- Jangan pakai `useCallback` untuk `onViewableItemsChanged` — pakai `useRef().current`