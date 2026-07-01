# Dokumentasi Optimasi Media

## Storage

MediaNova memakai Cloudinary free tier untuk upload media pada demo akademik. Firebase tetap digunakan untuk Authentication dan Firestore. Firestore menyimpan metadata post seperti `mediaURL`, `mediaType`, `caption`, jumlah like, jumlah comment, dan waktu upload.

## Video

- Playback memakai `expo-video`.
- Video pendek ditampilkan di `VidioFeedScreen` dengan vertical paging.
- Hanya video aktif yang diputar, video di luar viewport dipause.
- Video dibuat looping untuk pengalaman seperti Reels/TikTok.
- Progress bar dihitung dari `currentTime / duration`.
- Feed video memakai lazy rendering melalui `FlatList`, `initialNumToRender`, `windowSize`, dan `removeClippedSubviews`.

## Upload Besar

- Upload memakai XHR agar progress upload bisa ditampilkan.
- Progress upload ditampilkan dalam persen pada `CreatePostScreen`.
- Untuk demo, durasi video dibatasi 60 detik saat memilih atau merekam video.

## Format Rekomendasi

- Foto: JPEG, kualitas 0.8 sampai 0.9.
- Video: MP4, maksimal 60 detik untuk demo.
- Audio: M4A dari preset high quality Expo AV.

## Kompresi dan Resize

- Image picker memakai quality 0.8 untuk mengurangi ukuran file.
- Filter image menyimpan JPEG dengan kompresi 0.85.
- Camera filter melakukan resize gambar ke lebar 1080px saat apply beauty/filter preset.
- Video compression native belum diterapkan karena perlu library tambahan dan konfigurasi build; untuk demo gratis, pembatasan durasi dan Cloudinary upload progress dipakai sebagai strategi ringan.

## Offline Mode

Feed utama menyimpan hasil fetch terakhir ke AsyncStorage. Jika fetch dari Firestore gagal, aplikasi mencoba menampilkan cache lokal.

## Catatan Firebase Storage

Firebase Storage tidak digunakan pada implementasi demo agar project tetap gratis dan tidak membutuhkan billing setup. Jika nanti tersedia, `src/utils/cloudinary.ts` dapat diganti dengan service upload Firebase Storage tanpa mengubah struktur post di Firestore.
