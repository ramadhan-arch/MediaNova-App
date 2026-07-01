# Dokumentasi Implementasi Filter

## Lokasi

Implementasi kamera dan filter berada di:

- `src/screens/media/CameraFilterScreen.tsx`
- `src/screens/main/CreatePostScreen.tsx`

## Filter Warna

MediaNova menyediakan filter:

- Normal
- Grayscale
- Sepia
- Warm
- Cool
- Vivid

Filter menggunakan kombinasi `expo-image-manipulator` dan tint overlay visual. `expo-image-manipulator` dipakai untuk proses file seperti resize dan kompresi JPEG. Beberapa efek warna seperti warm, cool, vivid, dan sepia disimulasikan dengan overlay warna karena API manipulasi warna Expo terbatas.

## Sticker Overlay

Sticker dipilih dari daftar emoji/sticker sederhana dan ditampilkan di atas preview foto. Untuk demo, sticker menjadi overlay visual di preview sebelum gambar dipakai sebagai post.

## Brightness, Contrast, Saturation

Kontrol brightness, contrast, dan saturation disediakan di tab Beauty. Nilai kontrol dipakai sebagai preset visual dan memengaruhi tampilan overlay/hasil kompresi demo. Untuk implementasi produksi, filter warna penuh sebaiknya memakai pipeline image processing khusus.

## Selfie Timer

Selfie timer tersedia melalui tombol `3,2,1`. Saat aktif, aplikasi menampilkan countdown 3 detik sebelum membuka kamera.

## Alur

```text
Pilih foto / Kamera
-> Preview
-> Pilih filter / beauty / sticker
-> Pakai
-> Create Post
-> Upload
```

## Batasan Demo

- Sticker dan beberapa efek warna masih berupa overlay visual.
- Saturation tidak melakukan manipulasi piksel penuh.
- Implementasi dipilih agar tetap kompatibel dengan Expo dan tidak membutuhkan layanan berbayar.
