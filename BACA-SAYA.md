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
Apabila `index.html` (atau fail lain) diganti dengan versi baharu, tukar juga `VERSI` di baris atas `sw.js` dengan menambah nombornya (contohnya `lotong-v74` menjadi `lotong-v75`). Peranti akan memuat turun versi baharu apabila dibuka dengan internet.

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

## Modul Guru (Tugasan Cuti): cikgu isi modul sendiri dalam Google Sheet
Setiap **tab** dalam Google Sheet Papan Anugerah ialah **satu subjek** (contoh: `PI`, `MORAL`, `SAINS`, `MATH`, `BM`, `BI`). Murid membukanya melalui butang **📘 Tugasan Cuti** di muka depan atau menu jeda.

**Sekali sahaja:**
1. Gantikan kod Apps Script dengan `papan-anugerah.gs` yang baharu, kemudian **Simpan**.
2. Pilih fungsi **`sediakanModul`** pada bar atas Apps Script dan tekan **Jalankan** (benarkan akses jika diminta). Tab contoh `PI`, `MORAL`, `SAINS`, `MATH` dan helaian `Hantaran` akan dibina.
3. **Gunakan → Urus penggunaan → ✏️ Edit → Versi baharu → Gunakan.** URL kekal sama.

**Mengisi modul:** padam baris contoh dan isi baris baharu. Tab baharu dengan nama apa-apa (selain `Pemain`, `Mingguan`, `ParkingLot`, `Pengumuman`, `Akaun`, `Hantaran`, `Arahan`, atau yang bermula dengan `_`) terus menjadi subjek baharu.

| Lajur | Isi |
|---|---|
| aktif | `YA` atau `TIDAK` (kosong = YA). `TIDAK` menyorok soalan |
| tahun | kosong = semua Tahun; atau `4`, `4-6`, `1,2,3` |
| tajuk modul | soalan bertajuk sama dikumpulkan sebagai satu modul |
| jenis | `kuiz` (pilihan A–D, disemak automatik), `jawapan` (murid menaip) atau `amalan` (murid tandakan "Saya sudah buat") |
| soalan | soalan atau arahan |
| A, B, C, D | pilihan jawapan (untuk kuiz) |
| jawapan betul | `A`, `B`, `C` atau `D` |
| tarikh mula / tamat | pilihan: modul hanya muncul dalam tempoh ini |
| penerangan | dipaparkan selepas murid menjawab kuiz |

- Tab `PI` hanya dipaparkan kepada murid Pendidikan Islam, dan tab `MORAL` hanya kepada murid Pendidikan Moral. Tab lain dipaparkan kepada semua.
- **Jawapan murid** masuk ke helaian **Hantaran** (nama, Tahun, subjek, modul, soalan, jawapan, betul/tidak). Isi lajur **markah guru** dan **komen guru**; murid nampak komen itu dalam Tugasan Cuti.
- Tanpa internet, jawapan disimpan dalam peranti dan dihantar secara automatik apabila ada talian. Jawapan kuiz disemak semula oleh pelayan, bukan hanya oleh peranti murid.
- Jawapan murid tidak boleh mengandungi formula Sheet (dineutralkan). Gunakan nama dan kod akaun sahaja; jangan minta maklumat peribadi murid.
- **Status "sudah dijawab" dikongsi antara peranti** apabila murid menggunakan Akaun Murid yang sama (Kod Akaun). Tanpa akaun, status hanya ada pada peranti itu. Selepas menggantikan `papan-anugerah.gs`, ingat **Gunakan → Versi baharu** semula.

## Level, XP, pangkat dan Prestasi Saya (v76)
- **Level 1–20** berdasarkan XP: XP untuk level L = 37 × L^1.6 (Level 3 ±215, Level 10 ±1,470, Level 20 ±4,460). Sasaran: murid yang rajin sampai Level 20 dalam ±12 minggu persekolahan.
- **XP** datang daripada mata (Kebaikan + Ilmu + Reputasi) yang sedia ada, ditambah +1 Ilmu bagi setiap soalan yang dijawab betul pada cubaan pertama (+2 dalam Tugasan Cuti). Pemain sedia ada: mata terkumpul dijadikan XP awal dan pangkat yang sudah dicapai tidak diturunkan.
- **Pengawal:** XP penuh sehingga 90 sehari, selepas itu separuh. Misi yang sama dalam satu minggu: kali pertama penuh, kali kedua separuh, seterusnya suku.
- **7 pangkat:** Penolong Baru (L1), Sahabat Prihatin (L3), Pembantu Setia (L6, ketepatan ≥60%), Wira Sekolah (L10, ketepatan ≥70%, Gred A 3 hari), Ikon Jejak Kebaikan (L14, + 6 lencana), Duta Kebaikan (L18, + 10 lencana), Legenda LO:TONG (L20, + 14 lencana). Ketepatan dikira daripada 100 soalan terakhir (sekurang-kurangnya 10 atau 20 soalan).
- **18 lencana berperingkat baharu** (Gangsa/Perak/Emas): Pejuang Ilmu, Jitu, Hadir Setia, Serba Boleh, Pelajar Cuti, Mercu Level. Tiga lencana Emas adalah rahsia.
- **📊 Prestasi Saya:** butang dalam Profil dan menu jeda. Paparan level, syarat naik pangkat, ketepatan, minggu ini berbanding minggu lalu, dan jadual setiap subjek.
- **Tab `Prestasi` dalam Sheet** (dibina automatik): satu baris bagi setiap murid (level, XP, pangkat, ketepatan, ringkasan subjek, lencana, hari main). Dikemas kini apabila game menghantar ringkasan (tertakluk pada tetapan Papan Anugerah). **Gantikan `papan-anugerah.gs` dan Gunakan → Versi baharu** supaya tab ini berfungsi.
- Pemalar boleh dilaras dalam objek `Tahap` (K, E, HAD_HARI) dan dalam `CONTENT.pangkat`.

## Cangkerang GLB bangunan (v77, prototaip: Pusat Sumber)
- Hanya bangunan **PSS** menggunakan aset 3D `assets/pss_shell.glb` (badan + bumbung: sudut dinding bersudut serong, cornice, 14 tingkap berbingkai tirus (hadapan 4 simetri di kiri dan kanan pintu tengah, belakang 4, setiap sisi 3) dengan kaca terbenam, lintel dan kotak bunga, pintu berlengkung dua daun, bumbung dengan fascia/soffit, rabung dan tulang bumbung bulat serta finial; AO terbakar dalam warna bucu). 1,579 segi tiga, 63 KB. Bangunan lain tidak disentuh.
- Susun atur, ukuran, perlanggaran, pintu masuk, papan tanda, penghalang kamera dan data pemain **tidak berubah**. Plinth dan cucur atap masih dijana oleh kod.
- **Selamat:** versi asal dibina dahulu, GLB dimuat di latar belakang. Jika GLB gagal dimuat, tiada internet, atau ukurannya tidak sepadan dengan tapak bangunan, permainan terus menggunakan bangunan asal.
- **Suis mati:** dalam konsol pelayar, `localStorage.setItem('lotong.glb','0')` kemudian muat semula. Padam kunci itu untuk mengaktifkan semula.
- **Grafik:** berfungsi dalam Komik penuh dan Ringan. Tiada bayang masa nyata. Bahan GLB ditukar kepada bahan toon permainan, jadi garis dakwat dan kabus sama.
- Aset dijana oleh `tools/gen_pss_shell.py` (Python sahaja, tiada Blender): `python3 tools/gen_pss_shell.py --png pratonton.png`. Folder `tools/` untuk pembangun, tidak perlu dimuat naik.
- **Aset buatan Blender kelak:** eksport GLB dengan dua nod bernama `pss_body` dan `pss_roof`, asal pada pusat bangunan di tanah, +x ialah hadapan, 1 unit = 1 meter, dan hanya warna bucu (tanpa tekstur). Permainan menolak aset yang ukurannya tidak sepadan dengan tapak.
- Pemuat ialah `GLBMini` dalam `index.html` (bukan `GLTFLoader.js` rasmi, kerana fail rasmi tidak boleh dimuat turun dalam persekitaran pembangunan ini). Ia menyokong mesh berwarna-bucu sahaja.
- **Semak dalam permainan:** buka konsol pelayar selepas permainan dimuat. Mesej `Cangkerang GLB: pss dimuat, 1579 segi tiga, … ms` bermakna GLB aktif. Mesej `Cangkerang GLB gagal (pss), guna versi asal: …` bermakna bangunan asal digunakan (sebab dinyatakan dalam mesej).

## Garaj guru dan papan nama Pusat Sumber (v78)
- Bumbung garaj guru dinaikkan dari 3.4 m ke **5.2 m** (bawah bumbung): melepasi tingkap PSS (puncak lintel 4.2 m) dan papan nama PSS (puncak 4.5 m), dan kekal di bawah cornice PSS (5.7 m). Tapak, kereta dan susun atur tidak berubah. Tiang, dinding belakang dan papan "Garaj Guru" mengikut ketinggian baharu.
- **Tiang** disusun semula supaya mengapit papan nama PSS (ruang bersih 1.1 m di kiri dan kanan); sebelum ini satu tiang tepat di hadapan papan.
- **Cutaway:** `GarajAtap` menyorok bumbung garaj hanya apabila bumbung itu berada di antara kamera dan papan nama PSS (pemain dalam jarak 22 m, di luar bangunan), selepas 0.35 saat supaya tidak berkelip. Untuk mematikan: tetapkan `GarajAtap.AKTIF = false` dalam `index.html`.
- `python3 tools/preview_garaj.py keluar.png` menjana pratonton garaj bersama PSS.

## Ketinggian tingkap PSS (v79)
- Tingkap diturunkan ikut skala watak (~1.55 m): **dasar kaca 0.80 m (paras dada)**, kotak bunga 0.52-0.74 m (paras pinggang), puncak kaca 2.00 m. Semua dinding menggunakan satu nilai `WIN_VC` dalam `tools/gen_pss_shell.py`. Jana semula dengan `python3 tools/gen_pss_shell.py`.
- `python3 tools/preview_skala.py keluar.png` menjana pratonton watak di sebelah tingkap.
- Bumbung garaj guru kekal 5.2 m. Dengan tingkap yang lebih rendah, ia boleh diturunkan ke ±4.7 m (di atas papan nama) jika mahu: ubah `GH` dalam `garaj()`.

## Saiz pintu PSS (v80)
- Pintu utama PSS dibesarkan ±20%: **2.8 m tinggi x 1.8 m lebar** (sebelum ini 2.3 x 1.5), bingkai luar 2.06 x 2.93 m. Bingkai kekal 0.49 m di bawah papan nama (bawah papan 3.42 m). Papan timbul, celah dua daun dan tombol diskala mengikut saiz pintu. Pintu masih di tengah hadapan.
- Laras dengan `DOOR_H` dan `DOOR_HALF` dalam `tools/gen_pss_shell.py`, kemudian jana semula GLB. Penjana akan gagal jika pintu terlalu hampir dengan papan nama.

## Dalaman Pusat Sumber (GLB, v82)
- Dalaman Pusat Sumber dibina daripada dua fail: `assets/pss_interior_shell.glb` (lantai, dinding, sekatan Ruang Digital) dan `assets/pss_interior_props.glb` (perabot, sauh interaksi).
- Fail ini dijana oleh `tools/gen_pss_interior.py` (Python sahaja). Untuk menjana semula: `python3 tools/gen_pss_interior.py lotong/assets --png pratonton.png`.
- Jika fail GLB gagal dimuat, game terus guna susun atur Pusat Sumber yang lama. Untuk mematikan dalaman GLB pada satu peranti (ujian), jalankan `localStorage.setItem('lotong.glbDalam', '0')` dalam konsol pelayar.
- Selepas mengemas kini, upload kedua-dua fail GLB ke folder `assets/` dan tukar `VERSI` dalam `sw.js`.

## Blok Bilik: PI, SPBT, SUSU (GLB, v83)
- Luar: `assets/bilik_shell.glb` (3 pintu berlengkung). Dalam: `pi_`, `spbt_`, `susu_` + `interior_shell.glb` / `interior_props.glb`.
- Dijana oleh `tools/gen_bilik.py`: `python3 tools/gen_bilik.py lotong/assets --png-luar luar.png --png-dalam dalam.png`.
- Kedudukan peti sejuk, rak buku teks (tempat letak buku), kotak buku dan tempat duduk murid sama seperti dahulu, jadi tugasan tidak berubah.
- Peti sejuk di Bilik SUSU: tekan **Lihat** dan kedua-dua pintu terbuka.
- Jika fail GLB sesuatu bilik gagal dimuat, bilik itu terus guna susun atur lama. Mati sementara untuk ujian: `localStorage.setItem('lotong.glbDalam','0')` (dalaman) atau `'lotong.glb'` (luar dan dalam).
- Selepas mengemas kini, upload semua fail dalam `assets/` dan tukar `VERSI` dalam `sw.js`.

## Prasekolah dan Rumah Guru (GLB, v84)
- Luar: `prasekolah_shell.glb`, `rumahguru1_shell.glb`, `rumahguru2_shell.glb`, `rumahguru3_shell.glb`. Tinggi Prasekolah diturunkan kepada 4.8 m. Rumah Guru kekal 5.0 m kerana atap garaj (3.4 m) dan papan nama (4.2 m) bergantung padanya.
- Dalam: `prasekolah_interior_*` dan `rumah1/2/3_interior_*` (shell + props). Tiga Rumah Guru berkongsi susun atur; warna dinding, sofa dan permaidani berbeza.
- Dijana oleh `tools/gen_pra_rumah.py`: `python3 tools/gen_pra_rumah.py lotong/assets --png-luar luar.png --png-dalam dalam.png`.
- Tempat letak mainan (di atas rak), meja bekas air dan semua sasaran tugasan Prasekolah dan Rumah Guru kekal pada kedudukan asal.
- Interaksi baharu: kabinet di Rumah Guru.

## Makmal Sains (GLB, v85)
- Dalaman: `assets/makmal_interior_shell.glb` dan `assets/makmal_interior_props.glb`, dijana oleh `tools/gen_makmal.py`: `python3 tools/gen_makmal.py lotong/assets --png pratonton.png --png-dekat dekat.png`.
- Semua 9 interaksi, 5 tugasan eksperimen (syarat dan keutamaan misi), keperluan kot makmal, mikroskop, eksperimen warna dan fakta Sistem Suria kekal seperti asal. Sauh GLB bernama `int_*`; hiasan tanpa perlanggaran bernama `lalu_*`.
- Kod permainan masih menjana: mentol litar (`Makmal.mentol`), air dalam tangki dan kotak gelap tumbuhan (kedua-duanya lut sinar), papan Sains, poster, Cikgu Shahrul dan murid.
- Jika fail GLB makmal gagal dimuat, susun atur asal `LAYOUT.makmal` digunakan secara automatik.

## Aktiviti mikroskop (v86)
- `Peralatan.mikroskop()` kini membuka `Mikroskop.buka()`: letak slaid, laras fokus, lihat sel kulit bawang, Catat Pemerhatian. Dialog lama kekal sebagai `Peralatan.mikroskopLama()` (fallback di luar Makmal).
- GLB: nod bergerak `lalu_mikroskop_slaid` (pangsi di pentas) dan `lalu_mikroskop_tombol` (pangsi pada paksi tombol). Dijana oleh `tools/gen_makmal.py`.
- Ganjaran +1 Ilmu sekali sehari menggunakan kunci `mikroskop` yang sama seperti sebelum ini.

## Eksperimen warna interaktif (v87)
- `Peralatan.warna()` kini membuka `Warna.buka()`: pilih dua bikar, bawa dan condongkan bikar ke atas bekas, tuangan cecair beranimasi dengan pusaran, jawab warna yang terhasil. Soalan, teks maklum balas dan ganjaran (+1 Ilmu sekali sehari, kunci `warna`) sama seperti dahulu. Dialog lama kekal sebagai `Peralatan.warnaLama()` dan digunakan jika GLB tiada.
- GLB (`tools/gen_makmal.py`): nod `lalu_warna_bikar_*`, `lalu_warna_cecair_*` (anak bikar), `lalu_warna_bekas`, `lalu_warna_cecair_bekas`, `lalu_warna_pusaran`, `lalu_warna_aliran`. Warna cecair diwarnakan oleh kod; dinding kaca lut sinar dijana oleh kod.
- Kawalan: seretan, butang ◀▶ −+, anak panah / WASD, kekunci 1-2-3, R = Set Semula, Esc = Keluar.

## Pembetulan v88
- Eksperimen warna: bahan cecair kini diambil daripada Mesh anak (GLBMini membungkus setiap nod sebagai Group + Mesh). Sebelum ini `Warna.buka()` ralat dalam susun atur GLB.
- `sw.js`: fail yang dipasang ke cache baharu diambil terus daripada pelayan (`cache: 'reload'`) dan halaman utama disemak semula setiap kali (`no-cache`), supaya cache versi baharu tidak berisi fail lama daripada cache HTTP GitHub Pages.
- Bilik menunggu aset GLB sehingga 8 saat (dahulu 2.5 saat) sebelum guna susun atur asal, dan memaparkan "Memuatkan bilik…".
- Semakan dalam konsol pelayar: `Object.keys(InteriorGLB.hasil).map(k => k + ': ' + (InteriorGLB.hasil[k] ? 'OK' : 'GAGAL'))`

## Teroka Sistem Suria (v89)
- `Peralatan.suria()` kini membuka `Suria.buka()`: Mula, orbit lapan planet (laju berbeza, tidak mengikut skala), Jeda/Sambung, sudut pandangan, pilih planet (nama + fakta) dan Cabaran Susun. Ganjaran +1 Ilmu (kunci `suria`, sekali sehari) hanya selepas cabaran berjaya. Fakta asal kekal sebagai `Peralatan.suriaLama()` jika GLB tiada.
- GLB: `model_suria` (pelantar, tetap, berperlanggaran) dipisahkan daripada nod `lalu_suria_matahari`, `lalu_suria_<planet>` (pangsi di pusat planet) dan `lalu_suria_batang`. Papan nama `tanda_suria` menyatakan "Tidak mengikut skala".
- Kawalan: ketik/seret kanvas, butang, anak panah/WASD, kekunci 0-8, Space = Jeda, Esc = Keluar.

## Paparan item yang lapang (v90)
- Modul `Fokus` (dikongsi oleh Mikroskop, Eksperimen Warna dan Sistem Suria): watak dalam jarak 1.7 m daripada model (murid, guru, pemain) mengecil perlahan semasa kamera dekat dan pulih selepas ditutup; paparan 3D dialihkan ke ruang bebas di atas panel (`camera.setViewOffset`); panel boleh dikecilkan (butang Kecilkan atau kekunci H); HUD tidak penting (objektif, ringkasan tugas, peta mini) disorok semasa aktiviti (`body.fokusItem`).
- Tiada perubahan pada fail GLB.

## Litar elektrik interaktif (v91)
- `Makmal.litar()` (selepas semakan kot makmal) membuka `Litar.buka()`: sambung tiga wayar ke terminal bercincin warna sama (seret, atau ketik wayar kemudian terminal), tekan suis ON/OFF (mentol menyala/padam dengan halo kuning lembut), soalan pemerhatian, Set Semula / Cuba Lagi / Keluar. Soalan asal kekal sebagai `Makmal.litarLama()` (fallback tanpa GLB).
- `Makmal.siap('litar', ...)` dipanggil sekali sahaja apabila panel ditutup selepas berjaya (misi dan ganjaran sedia ada).
- GLB: `lalu_litar` kini hanya papan, bateri, soket dan terminal. Nod bergerak `lalu_litar_suis` (pangsi di terminal kiri) dan `lalu_litar_klip_merah/kuning/biru` (pangsi di hujung sentuh). Wayar dijana kod supaya mengikuti klip.
- Kawalan: seret/sentuh, butang, kekunci 1-3 (wayar), 4-6 (terminal), T atau Space (suis), R (semula), H (kecilkan), Esc.

## Uji magnet interaktif (v92)
- `Makmal.magnet()` (selepas semakan kot makmal) membuka `Magnet.buka()`: seret magnet ladam merah-biru ke enam objek (klip, paku, skru, pemadam, pensel, sudu). Objek besi ditarik dalam jarak 8 cm dan melekat pada kutub; objek lain kekal. Selepas semua diuji, murid mengelaskan ke "Ditarik Magnet" / "Tidak Ditarik Magnet". Kuiz asal kekal sebagai `Makmal.magnetLama()` (fallback tanpa GLB).
- `Makmal.siap('magnet', ...)` dipanggil sekali sahaja apabila panel ditutup selepas berjaya.
- GLB: `lalu_magnet` (alas ujian), `lalu_magnet_ladam` (pangsi di tapak), `lalu_magnet_klip/paku/skru/pemadam/pensel/sudu` (pangsi di pusat objek).
- Kawalan: seret/sentuh magnet, butang ◀▲▼▶, anak panah/WASD, 1-6 (bawa magnet ke objek / pilih objek), L (lepaskan), D/T (kelaskan), R (semula), H (kecilkan), Esc.

## Terapung atau tenggelam interaktif (v93)
- `Makmal.terapung()` (selepas semakan kot makmal) membuka `Terapung.buka()`: pilih objek, ramal (terapung/tenggelam), seret ke atas tangki dan lepaskan. Percikan dan riak ringan, objek terapung mencelup lalu menetap di permukaan, objek tenggelam menurun ke dasar. Pemerhatian dibandingkan dengan ramalan. Kuiz asal kekal sebagai `Makmal.terapungLama()` (fallback tanpa GLB).
- `Makmal.siap('terapung', ...)` dipanggil sekali sahaja apabila panel ditutup selepas keenam-enam objek diuji.
- GLB: `lalu_tangki_air` (bingkai tangki + dulang), `lalu_terapung_pingpong/gabus/kayu/batu/syiling/skru` (pangsi di pusat objek). Isi air lut sinar kekal dijana kod.
- Kawalan: seret/sentuh, butang Jatuhkan ke air, 1-6 (objek), F/T (ramalan), Space/Enter/E (jatuhkan), R (semula), H (kecilkan), Esc.

## Papan Jawi magnet, fasa 1 (v94)
- Bilik PI: anchor tunggal `int_papan_jawi` ("Aktiviti Jawi") menggantikan dua interaksi papan putih yang bertindih. Menu: **Aktiviti Jawi** atau **Lihat papan putih** (`PapanPutih.lihat('pi')` dikekalkan).
- Aktiviti: lima huruf tunggal daripada `CONTENT.jawi.huruf` (12 pertama); seret ubin magnet ke petak nama huruf yang betul (betul: melekap; salah: pulang ke dulang). Alternatif ketik, dan kekunci 1-5 (ubin) dengan Q/W/E/R/T (petak). Ganjaran sedia ada sekali sehari (`jawi_papan_pi`, +1 Ilmu) hanya selepas selesai.
- GLB (`tools/gen_bilik.py`, `bilik_pi()`): bingkai kayu papan, `lalu_jawi_dulang`, `lalu_jawi_ubin_1..5` (pangsi di pusat ubin). Glif Jawi dilukis oleh kod permainan pada kanvas (fon Jawi sedia ada, huruf tunggal).
- Hanya `pi_interior_props.glb` berubah; GLB bilik lain tidak disentuh.
