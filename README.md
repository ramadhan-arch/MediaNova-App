# MediaNova

MediaNova adalah aplikasi social media berbasis React Native + Expo untuk upload foto, video pendek, audio post, interaksi sosial, dan kamera dengan filter.

## Tech Stack

- React Native + Expo
- React Navigation
- Zustand
- Firebase Authentication
- Firebase Firestore
- Cloudinary free tier untuk media storage demo
- expo-video
- expo-camera
- expo-image-picker
- expo-image-manipulator
- expo-av
- expo-notifications

## Catatan Storage Gratis

Spesifikasi awal menyebut Firebase Storage. Untuk menjaga project tetap gratis dan aman dari risiko billing, implementasi demo memakai Cloudinary free tier sebagai media storage. Firebase tetap digunakan untuk Authentication dan Firestore. Metadata post menyimpan URL media dari Cloudinary.

Service upload dibuat terpisah di `src/utils/cloudinary.ts`, sehingga bisa diganti ke Firebase Storage jika akun project menyediakan billing dan konfigurasi storage.

## Fitur

- Register, login, logout dengan Firebase Auth
- Feed post image, video, dan audio
- Infinite scroll feed
- Cache feed offline menggunakan AsyncStorage
- Like dan comment
- Follow / unfollow user
- Search user dan konten
- In-app notification collection
- Local notification setelah post berhasil dibuat
- Dark mode dan light mode
- Edit profile nama dan bio
- Video shorts feed dengan vertical paging, autoplay, auto pause, loop, like, comment, save, share, progress bar, dan Read More caption
- Video recording menggunakan expo-camera
- Audio recording dan audio player dengan progress bar serta playback speed
- Camera filter, sticker overlay, brightness, contrast, saturation control, dan selfie timer 3 detik

## Menjalankan Project

```bash
npm install
npx expo start
```

Untuk test di device, gunakan Expo Go atau development build sesuai kebutuhan.

## Konfigurasi yang Perlu Koordinasi

Beberapa fitur butuh akses owner Firebase/Google Cloud:

- Google Sign-In: aktifkan provider Google di Firebase Authentication dan sediakan OAuth Client ID.
- FCM: butuh setup Firebase Cloud Messaging untuk package Android/iOS.
- Firebase Storage: tidak dipakai pada demo gratis ini karena berpotensi butuh billing setup.

## Struktur Folder

```text
src/
  components/
  hooks/
  screens/
  store/
  utils/
assets/
```

## Dokumentasi Tambahan

- [Optimasi Media](./MEDIA_OPTIMIZATION.md)
- [Implementasi Filter](./FILTER_IMPLEMENTATION.md)
