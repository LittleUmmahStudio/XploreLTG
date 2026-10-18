# LO:TONG: a little school story (versi PWA)

Folder ini membolehkan LO:TONG **dipasang** pada telefon, tablet atau Chromebook seperti aplikasi, dan **dimainkan tanpa internet**.

## Kandungan
| Fail | Kegunaan |
|---|---|
| `index.html` | Game LO:TONG |
| `bunyi/` | Muzik dan bunyi suasana (dimuat di latar belakang) |
| `manifest.webmanifest` | Maklumat aplikasi (nama, ikon, mod skrin penuh) |
| `sw.js` | Service worker untuk main tanpa internet |
| `icon-*.png`, `apple-touch-icon.png` | Ikon aplikasi |

## Hos di GitHub Pages
1. Cipta repositori baharu di GitHub, contohnya `lotong`.
2. Muat naik **semua fail dalam folder ini, termasuk folder `bunyi`** ke repositori itu (bukan folder `lotong` itu sendiri). Pastikan `index.html` berada di akar repositori dan fail bunyi berada di `bunyi/`. Di laman GitHub, folder `bunyi` boleh diseret terus ke ruang *Upload files*.
3. Pergi ke **Settings → Pages**. Di bawah *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, kemudian **Save**.
4. Tunggu 1 hingga 2 minit. Game boleh dibuka di `https://NAMA-PENGGUNA.github.io/lotong/`.

## Pasang pada peranti
- **Android / Chromebook (Chrome):** buka pautan di atas, tunggu sehingga halaman dimuatkan sepenuhnya, kemudian tekan butang **📲 Pasang Game** di muka depan. Butang ini juga boleh didapati melalui menu Chrome → *Pasang aplikasi*.
- **iPhone / iPad (Safari):** tekan butang **Kongsi**, kemudian **Tambah ke Skrin Utama**.

## Main tanpa internet
Buka game **sekali dengan internet** selepas dipasang, supaya Three.js dan fon disimpan dalam peranti. Selepas itu, game boleh dimainkan walaupun tanpa internet.

## Mengemas kini game
Apabila `index.html` (atau fail lain) diganti dengan versi baharu, tukar juga `VERSI` di baris atas `sw.js` dengan menambah nombornya (contohnya `lotong-v67` menjadi `lotong-v68`). Peranti akan memuat turun versi baharu apabila dibuka dengan internet.

## Jika aplikasi Android tidak terbuka atau pegun
1. Buang aplikasi LO:TONG lama dari skrin utama (tekan lama ikon → *Nyahpasang* / *Buang*).
2. Buka pautan GitHub Pages dalam Chrome dan tunggu muka depan dimuatkan. Muat semula halaman sekali.
3. Pasang semula melalui butang **📲 Pasang Game** atau menu Chrome → *Pasang aplikasi*.
4. Jika game masih tidak bermula selepas 15 saat, skrin akan menunjukkan butang **Baiki & muat semula**. Butang ini membersihkan salinan lama dan memuat turun semula game.

## Akaun Murid (simpan kemajuan di awan)
Akaun murid menggunakan Apps Script yang sama dengan Papan Anugerah. **Sekali sahaja**, kemas kini skrip:
1. Buka Google Sheet Papan Anugerah → **Sambungan → Apps Script**.
2. Gantikan semua kod dengan kandungan `papan-anugerah.gs` yang baharu, kemudian **Simpan**.
3. **Gunakan (Deploy) → Urus penggunaan → ✏️ Edit → Versi: Versi baharu → Gunakan**. URL kekal sama.
4. Helaian **Akaun** akan dibina secara automatik apabila murid pertama membina akaun.

Cara guna:
- Bila game dibuka, murid yang belum ada akaun akan nampak tetingkap **Akaun Murid**. Mereka boleh **Bina akaun baharu**, **Pulihkan akaun** (Kod Akaun + PIN), atau tekan **Nanti dulu**. Butang **👤 Akaun** di muka depan membuka tetingkap ini semula.
- Kemajuan disegerakkan secara automatik bila ada internet (kira-kira 20 saat selepas setiap simpanan, dan bila game ditutup).
- **Murid lupa Kod Akaun:** cari namanya dalam helaian **Akaun**.
- **Murid lupa PIN:** taip PIN baharu (4 nombor) dalam lajur **pinBaru**. Murid tekan *Saya sudah ada akaun* dan masukkan PIN itu; PIN baharu terus berkuat kuasa.
- PIN tidak disimpan (hanya cincangan). Akaun dikunci 10 minit selepas 5 kali PIN salah.
- Jangan ubah lajur **pinHash**, **masa** atau **data1–data8** secara manual.

## Papan Anugerah Mingguan (dikongsi seluruh sekolah)
Tanpa langkah ini, Papan Anugerah hanya menunjukkan profil dalam peranti yang sama. Supaya semua murid melihat papan yang sama:

1. Buka [Google Sheets](https://sheets.google.com) dan cipta helaian baharu, contohnya **LO:TONG Papan Anugerah**.
2. Pilih menu **Sambungan → Apps Script**. Padam kod sedia ada, kemudian tampal semua kandungan fail `papan-anugerah.gs`. Tekan **Simpan**.
3. Tekan **Gunakan (Deploy) → Penggunaan baharu**. Pilih jenis **Aplikasi web**:
   - *Laksanakan sebagai:* **Saya**
   - *Siapa yang mempunyai akses:* **Sesiapa sahaja (Anyone)**
4. Tekan **Gunakan**, benarkan akses akaun Google, dan salin **URL aplikasi web** (berakhir dengan `/exec`).
5. Buka `index.html`, cari baris `const PAPAN_URL = '...';` dan tampal URL itu di antara tanda petikan. (URL Apps Script cikgu sudah dimasukkan dalam versi ini.)
6. Muat naik `index.html` yang dikemas kini ke GitHub, dan tukar `VERSI` dalam `sw.js`.

**Mengurus papan:** markah murid muncul dalam helaian **Pemain**. Untuk menyorok nama yang tidak sesuai, taip `ya` dalam lajur **sorok**. Murid juga boleh menyorok nama sendiri melalui **Tetapan → Nama di Papan Anugerah**.

**Nota:** markah dihantar oleh peranti murid, jadi papan ini sesuai untuk motivasi, bukan untuk penilaian rasmi. Gunakan nama panggilan sahaja, bukan nama penuh.

## Parking Lot "Cikgu, nak cikgu tambah" (maklum balas murid)
- Murid boleh menampal nota (Saya suka, Saya keliru, Cikgu nak cikgu tambah, Soalan untuk cikgu) dari muka depan atau menu jeda.
- Nota dihantar ke helaian **ParkingLot** dalam Google Sheet yang sama dengan Papan Anugerah. Hanya cikgu yang boleh membacanya; nota tidak dipaparkan kepada murid lain.
- **Penting:** kemas kini skrip Apps Script dengan kandungan `papan-anugerah.gs` yang baharu, kemudian pilih **Gunakan (Deploy) → Urus penggunaan → ✏️ Edit → Versi: Versi baharu → Gunakan**. URL kekal sama, jadi `index.html` tidak perlu diubah.

## Pengumuman perhimpunan (masa nyata)
- Perhimpunan pagi berlangsung pukul 7:10 hingga 7:20 di Dewan Terbuka (mod Hari Persekolahan).
- Pengumuman automatik: hari dan tarikh, hari batik, menu istimewa kantin, tarikh penting minggu itu, nilai murni minggu ini, juara Papan Anugerah, dan **cuaca semasa di Tambunan** (Open-Meteo).
- **Pengumuman cikgu:** dalam Google Sheet yang sama, buka helaian **Pengumuman** (dicipta automatik). Tulis pengumuman di lajur A. Lajur B dan C (tarikh mula dan tamat) adalah pilihan. Lajur D: tulis TIDAK untuk menyembunyikan. Pengumuman muncul serta-merta pada perhimpunan seterusnya (maksimum 5).
- Berita umum dari internet tidak diambil secara automatik supaya kandungan sentiasa sesuai untuk murid.
- Selepas mengemas kini `papan-anugerah.gs`, pilih **Gunakan → Urus penggunaan → ✏️ Edit → Versi baharu → Gunakan**.

## Ruang Guru (jana Kod Hadiah)
- Di muka depan, tekan **👩‍🏫 Ruang Guru** dan masukkan kata laluan guru. Selepas masuk, cikgu boleh menjana kod hadiah untuk murid dan menyalin senarainya.
- Kata laluan **tidak disimpan** dalam game; hanya cincangannya (SHA-256). Fail ini juga tidak mengandungi kata laluan, jadi selamat dimuat naik ke GitHub.
- Selepas 5 cubaan salah, Ruang Guru dikunci selama 60 saat.
- Ruang Guru hanya terbuka untuk sesi itu. Tekan **🔒 Keluar Ruang Guru** sebelum memberi peranti kepada murid, atau tutup game.
- Kod hadiah sah selama 14 hari dan setiap murid boleh menebus satu kod sekali sahaja (melalui **🎁 Ada Kod Cikgu?**).

## Main Bersama (Geng)
- Tekan **🤝** dalam permainan (atau **Main Bersama** di muka depan). Seorang murid tekan **Buka Geng** dan mendapat **Kod Geng** (contoh `LTG-4821`); kawan tekan **Sertai** dan masukkan 4 nombor itu. Sehingga 4 orang dalam satu geng.
- Ketua geng memilih aktiviti: **Gotong-royong kutip sampah** atau **Cari kad huruf bersama**. Semua ahli mendapat ganjaran apabila selesai.
- Hanya emoji dan ayat sedia boleh dihantar; tiada chat bebas.
- Perlu internet, dan hanya berfungsi dari GitHub Pages (bukan pautan claude.ai). Jika rangkaian sekolah menyekat sambungan, cuba hotspot telefon.

## Simpanan
Kemajuan disimpan dalam pelayar setiap peranti. Gunakan **Tetapan → Sandaran simpanan → Eksport** untuk menyalin kemajuan, dan **Import** untuk memulihkannya di peranti lain.

## Kredit fon
- **Kurland** (teks dan dialog) oleh GGBotNet, dilesenkan di bawah SIL Open Font License 1.1 (https://scripts.sil.org/OFL). Fon ini dibenamkan dalam `index.html`.
- **Raventure** (tajuk dan butang): sila semak syarat lesen di laman tempat fon ini dimuat turun.
- **Noto Naskh Arabic** (tulisan Jawi) daripada Google Fonts, SIL Open Font License 1.1.
