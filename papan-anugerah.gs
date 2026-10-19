/**
 * LO:TONG: Papan Anugerah Mingguan (Google Apps Script)
 * ----------------------------------------------------
 * Skrip ini menyimpan markah pemain dalam Google Sheets supaya semua murid
 * melihat papan anugerah yang sama. Langkah pemasangan ada dalam BACA-SAYA.md.
 *
 * Helaian "Pemain": satu baris bagi setiap pemain (dikemas kini setiap kali bermain).
 * Helaian "Mingguan": rekod setiap minggu (untuk "Juara minggu lepas").
 * Untuk menyorok sesuatu nama, taip apa-apa (contohnya: ya) dalam lajur "sorok".
 *
 * Helaian "Akaun": akaun murid (Kod Akaun + PIN 4 digit) untuk memulihkan kemajuan di peranti lain.
 *   - PIN TIDAK disimpan; hanya cincangannya (pinHash).
 *   - Murid lupa PIN? Taip PIN baharu (4 digit) dalam lajur "pinBaru". Murid masukkan PIN itu
 *     semasa "Pulihkan akaun" dan PIN baharu terus berkuat kuasa.
 *   - Akaun dikunci 10 minit selepas 5 kali PIN salah.
 *
 * MODUL GURU (Tugasan Cuti): setiap TAB dalam Sheet ini ialah SATU SUBJEK (contoh: PI, MORAL, SAINS, MATH, BM, BI).
 *   - Jalankan fungsi sediakanModul() sekali untuk membina tab contoh. Padam baris contoh dan isi modul cikgu.
 *   - Tab baharu dengan nama apa-apa (selain tab sistem) terus menjadi subjek baharu dalam game.
 *   - Lajur: aktif | tahun | tajuk | jenis | soalan | A | B | C | D | jawapan | mula | tamat | penerangan
 *   - Jawapan murid masuk ke helaian "Hantaran". Cikgu boleh isi lajur "markah guru" dan "komen guru"; murid nampak komen itu.
 */
const HELAIAN_PEMAIN = 'Pemain';
const HELAIAN_MINGGUAN = 'Mingguan';
const HELAIAN_NOTA = 'ParkingLot';   // nota "Cikgu, nak cikgu tambah" (Parking Lot PAK21), hanya untuk cikgu
const HELAIAN_UMUM = 'Pengumuman';   // pengumuman perhimpunan yang ditulis oleh cikgu (masa nyata)
const HELAIAN_AKAUN = 'Akaun';       // akaun murid: simpanan kemajuan di awan
const HELAIAN_HANTARAN = 'Hantaran'; // jawapan murid untuk modul guru
const HELAIAN_SISTEM = ['Pemain', 'Mingguan', 'ParkingLot', 'Pengumuman', 'Akaun', 'Hantaran', 'Arahan'];   // bukan subjek

function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    if (p.aksi === 'hantar') out = hantar_(p);
    else if (p.aksi === 'padam') out = padam_(p);
    else if (p.aksi === 'nota') out = nota_(p);
    else if (p.aksi === 'pengumuman') out = pengumuman_();
    else if (p.aksi === 'modul') out = modul_();
    else if (p.aksi === 'semakModul') out = semakModul_(p);
    else out = senarai_(p);
  } catch (err) {
    out = { ok: false, ralat: String(err) };
  }
  const json = JSON.stringify(out);
  if (p.callback && /^[A-Za-z0-9_]+$/.test(p.callback)) {
    return ContentService.createTextOutput(p.callback + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// Akaun murid: dihantar dengan POST (data kemajuan terlalu besar untuk URL)
function doPost(e) {
  let out;
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (b.aksi === 'akaunBina') out = akaunBina_(b);
    else if (b.aksi === 'akaunSimpan') out = akaunSimpan_(b);
    else if (b.aksi === 'akaunAmbil') out = akaunAmbil_(b, true);
    else if (b.aksi === 'akaunSemak') out = akaunAmbil_(b, false);
    else if (b.aksi === 'hantarModul') out = hantarModul_(b);
    else out = { ok: false, ralat: 'aksi tidak dikenali' };
  } catch (err) {
    out = { ok: false, ralat: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function helaian_(nama, tajuk) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nama);
  if (!sh) { sh = ss.insertSheet(nama); sh.appendRow(tajuk); sh.setFrozenRows(1); }
  return sh;
}
function pemain_() { return helaian_(HELAIAN_PEMAIN, ['id', 'nama', 'tahun', 'pangkat', 'mata', 'minggu', 'mataMinggu', 'hariMinggu', 'hariJumlah', 'kemaskini', 'sorok']); }
function mingguan_() { return helaian_(HELAIAN_MINGGUAN, ['kunci', 'id', 'nama', 'tahun', 'minggu', 'mataMinggu', 'hariMinggu']); }

function bersih_(t, n) { return String(t || '').replace(/[<>"'`]/g, '').trim().slice(0, n); }
function nombor_(v, maks) { const n = Math.floor(Number(v) || 0); return Math.max(0, Math.min(n, maks)); }

function cariBaris_(sh, kunci) {
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) if (String(data[i][0]) === kunci) return { baris: i + 1, nilai: data[i] };
  return null;
}

function hantar_(p) {
  const id = bersih_(p.id, 40);
  const nama = bersih_(p.nama, 16);
  if (!id || !nama) return { ok: false, ralat: 'tiada id/nama' };
  const minggu = bersih_(p.minggu, 10);
  const rekod = [id, nama, nombor_(p.tahun, 6), bersih_(p.pangkat, 30), nombor_(p.mata, 1000000), minggu,
    nombor_(p.mataMinggu, 100000), nombor_(p.hariMinggu, 7), nombor_(p.hariJumlah, 5000), new Date()];
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const sh = pemain_(), ada = cariBaris_(sh, id);
    if (ada) sh.getRange(ada.baris, 1, 1, 10).setValues([rekod]);
    else sh.appendRow(rekod.concat(['']));
    if (minggu) {
      const mw = mingguan_(), k = id + '|' + minggu, adaM = cariBaris_(mw, k);
      const r2 = [k, id, nama, rekod[2], minggu, rekod[6], rekod[7]];
      if (adaM) mw.getRange(adaM.baris, 1, 1, 7).setValues([r2]); else mw.appendRow(r2);
    }
  } finally { kunci.releaseLock(); }
  return { ok: true };
}

function padam_(p) {
  const id = bersih_(p.id, 40); if (!id) return { ok: false };
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try { const sh = pemain_(), ada = cariBaris_(sh, id); if (ada) sh.getRange(ada.baris, 11).setValue('ya (pemain)'); }
  finally { kunci.releaseLock(); }
  return { ok: true };
}

// Helaian "Pengumuman": lajur A = pengumuman, B = tarikh mula (pilihan), C = tarikh tamat (pilihan), D = papar (YA/TIDAK)
function pengumuman_() {
  const sh = helaian_(HELAIAN_UMUM, ['pengumuman', 'tarikh mula', 'tarikh tamat', 'papar (YA/TIDAK)']);
  const kini = new Date(); kini.setHours(12, 0, 0, 0);
  const tarikh = function (v, akhir) { if (!v) return null; const d = new Date(v); if (isNaN(d)) return null; d.setHours(akhir ? 23 : 0, akhir ? 59 : 0, 0, 0); return d; };
  const out = sh.getDataRange().getValues().slice(1).filter(function (r) {
    if (!r[0] || String(r[3]).toUpperCase() === 'TIDAK') return false;
    const m = tarikh(r[1], false), t = tarikh(r[2], true);
    return (!m || kini >= m) && (!t || kini <= t);
  }).map(function (r) { return bersih_(r[0], 160); }).slice(0, 5);
  return { ok: true, pengumuman: out };
}

function nota_(p) {
  const id = bersih_(p.id, 40), teks = bersih_(p.teks, 140);
  if (!id || !teks) return { ok: false };
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const sh = helaian_(HELAIAN_NOTA, ['masa', 'nama', 'tahun', 'kategori', 'nota', 'id', 'sudah dibaca']);
    // Elak nota berganda: nota yang sama (id sama) mungkin dihantar semula jika sambungan terputus
    if (!sh.getDataRange().getValues().some(function (r) { return r[5] === id; })) {
      sh.appendRow([new Date(), bersih_(p.nama, 16), nombor_(p.tahun, 6), bersih_(p.kat, 30), teks, id, '']);
    }
  } finally { kunci.releaseLock(); }
  return { ok: true };
}

function senarai_(p) {
  const tersorok = {};
  const pemain = pemain_().getDataRange().getValues().slice(1).filter(function (r) {
    if (r[10]) { tersorok[r[0]] = true; return false; } return r[0];
  }).map(function (r) {
    return { id: r[0], nama: r[1], tahun: r[2], pangkat: r[3], mata: r[4], minggu: r[5], mataMinggu: r[6], hariMinggu: r[7], hariJumlah: r[8] };
  });
  let lepas = [];
  if (p.lepas) {
    lepas = mingguan_().getDataRange().getValues().slice(1)
      .filter(function (r) { return r[4] === p.lepas && !tersorok[r[1]] && r[5] > 0; })
      .sort(function (a, b) { return b[5] - a[5]; }).slice(0, 3)
      .map(function (r) { return { nama: r[2], tahun: r[3], mataMinggu: r[5] }; });
  }
  return { ok: true, pemain: pemain, lepas: lepas };
}

/* ===================== Akaun murid ===================== */
// Lajur: 0 kod, 1 nama, 2 tahun, 3 pinHash, 4 pinBaru, 5 masa, 6 dibina, 7 kemaskini, 8 salah, 9 kunciSampai, 10-17 data (dipecah)
const AKAUN_DATA_LAJUR = 8, AKAUN_DATA_SAIZ = 45000;
function akaun_() { return helaian_(HELAIAN_AKAUN, ['kod', 'nama', 'tahun', 'pinHash', 'pinBaru', 'masa', 'dibina', 'kemaskini', 'salah', 'kunciSampai', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data8']); }
function kodSah_(k) { return /^LTG-[A-Z0-9]{4}$/.test(String(k || '')); }
function cincang_(kod, pin) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'LOTONG:AKAUN:' + kod + ':' + pin, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function pecah_(data) {
  const t = String(data || ''), out = [];
  for (let i = 0; i < AKAUN_DATA_LAJUR; i++) out.push(t.slice(i * AKAUN_DATA_SAIZ, (i + 1) * AKAUN_DATA_SAIZ));
  return out;
}
function cariAkaun_(sh, kod) {
  const kol = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues();
  for (let i = 1; i < kol.length; i++) if (String(kol[i][0]) === kod) return i + 1;
  return 0;
}
// Semak PIN (dengan had cubaan). Pulangkan { ok, baris, nilai } atau { ok:false, sebab }
function sahkan_(sh, b) {
  const kod = String(b.kod || '').toUpperCase(), hash = String(b.pinHash || '');
  if (!kodSah_(kod)) return { ok: false, sebab: 'tiada' };
  const baris = cariAkaun_(sh, kod); if (!baris) return { ok: false, sebab: 'tiada' };
  const r = sh.getRange(baris, 1, 1, 10 + AKAUN_DATA_LAJUR).getValues()[0], kini = Date.now();
  if (Number(r[9]) > kini) return { ok: false, sebab: 'kunci', saat: Math.ceil((Number(r[9]) - kini) / 1000) };
  let betul = hash && hash === String(r[3]);
  let pinBaru = String(r[4] === 0 ? '0' : (r[4] || '')).trim(); if (/^\d{1,4}$/.test(pinBaru)) pinBaru = ('0000' + pinBaru).slice(-4);   // Sheets membuang 0 di depan (0123 → 123)
  if (!betul && /^\d{4}$/.test(pinBaru) && hash === cincang_(kod, pinBaru)) {   // PIN baharu yang ditetapkan oleh cikgu
    sh.getRange(baris, 4, 1, 2).setValues([[hash, '']]); r[3] = hash; betul = true;
  }
  if (!betul) {
    const salah = (Number(r[8]) || 0) + 1;
    if (salah >= 5) { sh.getRange(baris, 9, 1, 2).setValues([[0, kini + 10 * 60 * 1000]]); return { ok: false, sebab: 'kunci', saat: 600 }; }
    sh.getRange(baris, 9).setValue(salah); return { ok: false, sebab: 'pin', baki: 5 - salah };
  }
  if (Number(r[8]) || Number(r[9])) sh.getRange(baris, 9, 1, 2).setValues([[0, 0]]);
  return { ok: true, baris: baris, nilai: r };
}
function akaunBina_(b) {
  const kod = String(b.kod || '').toUpperCase(), nama = bersih_(b.nama, 16), hash = String(b.pinHash || '');
  if (!kodSah_(kod) || !nama || !/^[0-9a-f]{64}$/.test(hash)) return { ok: false, ralat: 'data tidak sah' };
  const data = String(b.data || ''); if (data.length > AKAUN_DATA_LAJUR * AKAUN_DATA_SAIZ) return { ok: false, sebab: 'besar' };
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const sh = akaun_();
    if (cariAkaun_(sh, kod)) return { ok: false, sebab: 'wujud' };
    const masa = Number(b.masa) || 0;
    sh.appendRow([kod, nama, nombor_(b.tahun, 6), hash, '', masa, new Date(), new Date(), 0, 0].concat(pecah_(data)));
    return { ok: true, masa: masa };
  } finally { kunci.releaseLock(); }
}
function akaunSimpan_(b) {
  const data = String(b.data || ''); if (data.length > AKAUN_DATA_LAJUR * AKAUN_DATA_SAIZ) return { ok: false, sebab: 'besar' };
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const sh = akaun_(), v = sahkan_(sh, b); if (!v.ok) return v;
    const masa = Number(b.masa) || 0, masaAwan = Number(v.nilai[5]) || 0;
    if (masa < masaAwan) return { ok: false, sebab: 'lebihBaharu', masa: masaAwan };
    const nama = bersih_(b.nama, 16) || v.nilai[1];
    sh.getRange(v.baris, 2, 1, 2).setValues([[nama, nombor_(b.tahun, 6) || v.nilai[2]]]);
    sh.getRange(v.baris, 6).setValue(masa); sh.getRange(v.baris, 8).setValue(new Date());
    sh.getRange(v.baris, 11, 1, AKAUN_DATA_LAJUR).setValues([pecah_(data)]);
    return { ok: true, masa: masa };
  } finally { kunci.releaseLock(); }
}
function akaunAmbil_(b, denganData) {
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const sh = akaun_(), v = sahkan_(sh, b); if (!v.ok) return v;
    const r = v.nilai, out = { ok: true, kod: r[0], nama: r[1], tahun: Number(r[2]) || 1, masa: Number(r[5]) || 0 };
    if (denganData) out.data = r.slice(10, 10 + AKAUN_DATA_LAJUR).join('');
    return out;
  } finally { kunci.releaseLock(); }
}

/* ===================== Modul Guru (Tugasan Cuti): satu tab = satu subjek ===================== */
const LAJUR_MODUL = ['aktif (YA/TIDAK)', 'tahun (kosong = semua; cth 4 atau 4-6 atau 1,2,3)', 'tajuk modul', 'jenis (kuiz / jawapan / amalan)', 'soalan atau arahan', 'A', 'B', 'C', 'D', 'jawapan betul (A/B/C/D)', 'tarikh mula', 'tarikh tamat', 'penerangan selepas jawab'];

function teks_(t, n) { return String(t === null || t === undefined ? '' : t).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n); }
// Elak formula Google Sheets daripada teks murid (=, +, -, @ di permulaan)
function selamat_(t) { t = String(t); return /^[=+\-@]/.test(t) ? "'" + t : t; }

function tahunModul_(v) {
  const t = String(v === null || v === undefined ? '' : v).trim(); if (!t) return [];
  const out = {};
  t.split(/[,;\s]+/).forEach(function (bahagian) {
    const m = bahagian.match(/^(\d)\s*-\s*(\d)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= 6) out[i] = true; }
    else if (/^\d$/.test(bahagian) && +bahagian >= 1 && +bahagian <= 6) out[+bahagian] = true;
  });
  return Object.keys(out).map(Number);
}
function tarikhModul_(v, akhir) { if (!v) return null; const d = new Date(v); if (isNaN(d)) return null; d.setHours(akhir ? 23 : 0, akhir ? 59 : 0, 0, 0); return d; }

function modul_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), kini = new Date(), subjek = [];
  ss.getSheets().forEach(function (sh) {
    const nama = sh.getName();
    if (nama.charAt(0) === '_' || HELAIAN_SISTEM.indexOf(nama) >= 0) return;
    const v = sh.getDataRange().getValues(); if (v.length < 2) return;
    const item = [];
    for (let i = 1; i < v.length && item.length < 300; i++) {
      const r = v[i];
      if (String(r[0]).toUpperCase() === 'TIDAK') continue;
      const soalan = teks_(r[4], 400); if (!soalan) continue;
      const m = tarikhModul_(r[10], false), t = tarikhModul_(r[11], true);
      if ((m && kini < m) || (t && kini > t)) continue;
      const pilihan = [r[5], r[6], r[7], r[8]].map(function (x) { return teks_(x, 120); });
      let jenis = String(r[3] || '').toLowerCase();
      jenis = /kuiz|pilih/.test(jenis) ? 'kuiz' : /amal/.test(jenis) ? 'amalan' : 'jawapan';
      const adaPilihan = pilihan.filter(function (x) { return x; }).length;
      if (jenis === 'kuiz' && adaPilihan < 2) jenis = 'jawapan';
      item.push({ rid: nama + '!' + (i + 1), tahun: tahunModul_(r[1]), tajuk: teks_(r[2], 60) || 'Latihan', jenis: jenis, soalan: soalan,
        pilihan: pilihan, betul: String(r[9] || '').trim().toUpperCase().slice(0, 1), terang: teks_(r[12], 300) });
    }
    if (item.length) subjek.push({ nama: teks_(nama, 30), item: item });
  });
  return { ok: true, subjek: subjek };
}

function hantaranHelaian_() {
  return helaian_(HELAIAN_HANTARAN, ['masa', 'nama', 'tahun', 'id', 'subjek', 'tajuk', 'jenis', 'soalan', 'jawapan murid', 'betul', 'markah guru', 'komen guru', 'kunci']);
}

// Murid hantar jawapan (POST). Jawapan kuiz disemak semula terhadap helaian guru.
function hantarModul_(b) {
  const id = bersih_(b.id, 40), nama = bersih_(b.nama, 16), hid = bersih_(b.hantarId, 40);
  if (!id || !nama || !hid || !Array.isArray(b.jawapan)) return { ok: false, ralat: 'data tidak lengkap' };
  const subjek = teks_(b.subjek, 30), sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(subjek);
  if (!sh || sh.getName().charAt(0) === '_' || HELAIAN_SISTEM.indexOf(sh.getName()) >= 0) return { ok: false, ralat: 'subjek tidak sah' };
  const data = sh.getDataRange().getValues();
  const kunci = LockService.getScriptLock(); kunci.waitLock(8000);
  try {
    const hs = hantaranHelaian_(), ada = {};
    const nBaris = hs.getLastRow();
    if (nBaris > 1) hs.getRange(2, 13, nBaris - 1, 1).getValues().forEach(function (r) { ada[r[0]] = true; });
    const baru = []; let skor = 0, jumlah = 0;
    b.jawapan.slice(0, 60).forEach(function (j) {
      const rid = teks_(j.rid, 60), k = hid + '|' + rid; if (ada[k]) return;
      const no = +(rid.split('!')[1] || 0), r = data[no - 1] || [];
      const soalan = teks_(r[4], 400) || teks_(j.soalan, 400);
      const jenis = String(j.jenis || ''), jwp = teks_(j.jwp, 300);
      let betul = '-';
      if (jenis === 'kuiz') { jumlah++; betul = String(r[9] || '').trim().toUpperCase().slice(0, 1) === jwp.toUpperCase().slice(0, 1) ? 'Ya' : 'Tidak'; if (betul === 'Ya') skor++; }
      baru.push([new Date(), nama, nombor_(b.tahun, 6), id, subjek, teks_(r[2], 60) || teks_(b.tajuk, 60), jenis, selamat_(soalan), selamat_(jwp), betul, '', '', k]);
    });
    if (baru.length) hs.getRange(hs.getLastRow() + 1, 1, baru.length, 13).setValues(baru);
    return { ok: true, skor: skor, jumlah: jumlah };
  } finally { kunci.releaseLock(); }
}

// Komen / markah cikgu + modul yang sudah dijawab oleh seorang murid (GET ?aksi=semakModul&id=...&alt=...)
// "id" = Kod Akaun (atau ID pemain); "alt" = ID lama. Dua-dua dipadankan supaya semua peranti murid yang sama nampak status yang sama.
function semakModul_(p) {
  const ids = [bersih_(p.id, 40), bersih_(p.alt, 40)].filter(function (x) { return x; });
  if (!ids.length) return { ok: false };
  const v = hantaranHelaian_().getDataRange().getValues().slice(1), semakan = [], kumpul = {};
  for (let i = v.length - 1; i >= 0; i--) {
    const r = v[i]; if (ids.indexOf(String(r[3])) < 0) continue;
    if (semakan.length < 80 && (String(r[10]).trim() !== '' || String(r[11]).trim() !== '')) {
      semakan.push({ subjek: teks_(r[4], 30), tajuk: teks_(r[5], 60), soalan: teks_(r[7], 80), markah: teks_(r[10], 20), komen: teks_(r[11], 300) });
    }
    // Kumpulkan ikut satu percubaan (kunci = hantarId|rid), kemudian ambil percubaan terkini bagi setiap modul
    const hid = String(r[12] || '').split('|')[0]; if (!hid) continue;
    const masa = r[0] instanceof Date ? r[0].getTime() : (Number(new Date(r[0])) || 0);
    const g = kumpul[hid] = kumpul[hid] || { subjek: teks_(r[4], 30), tajuk: teks_(r[5], 60), masa: 0, skor: 0, jumlah: 0 };
    if (masa > g.masa) g.masa = masa;
    if (r[6] === 'kuiz') { g.jumlah++; if (r[9] === 'Ya') g.skor++; }
  }
  const terkini = {};
  Object.keys(kumpul).forEach(function (h) { const g = kumpul[h], k = g.subjek + '|' + g.tajuk; if (!terkini[k] || g.masa > terkini[k].masa) terkini[k] = g; });
  return { ok: true, semakan: semakan, siap: Object.keys(terkini).map(function (k) { return terkini[k]; }) };
}

// Jalankan SEKALI: bina tab contoh PI, MORAL, SAINS, MATH. Padam baris contoh dan isi modul sendiri.
function sediakanModul() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contoh = {
    PI: [['YA', '1-3', 'Adab Harian', 'kuiz', 'Apakah yang dibaca sebelum makan?', 'Bismillah', 'Alhamdulillah', 'Insya-Allah', '', 'A', '', '', 'Kita membaca Bismillah sebelum makan.'],
         ['YA', '', 'Amalan Cuti', 'amalan', 'Bantu ibu bapa di rumah dan ceritakan apa yang kamu buat.', '', '', '', '', '', '', '', '']],
    MORAL: [['YA', '', 'Nilai Murni', 'kuiz', 'Murid menyerahkan dompet yang dijumpai kepada guru. Nilai apakah ini?', 'Kejujuran', 'Keberanian', 'Kerjasama', '', 'A', '', '', ''],
            ['YA', '', 'Nilai Murni', 'jawapan', 'Ceritakan satu perbuatan baik yang kamu lakukan hari ini.', '', '', '', '', '', '', '', '']],
    SAINS: [['YA', '4-6', 'Tumbuhan', 'kuiz', 'Apakah yang diperlukan tumbuhan untuk membuat makanan?', 'Cahaya matahari', 'Plastik', 'Batu', '', 'A', '', '', '']],
    MATH: [['YA', '1-2', 'Tambah', 'kuiz', '12 + 8 = ?', '18', '20', '22', '', 'B', '', '', '']]
  };
  Object.keys(contoh).forEach(function (nama) {
    if (ss.getSheetByName(nama)) return;
    const sh = ss.insertSheet(nama);
    sh.getRange(1, 1, 1, LAJUR_MODUL.length).setValues([LAJUR_MODUL]).setFontWeight('bold').setWrap(true);
    sh.setFrozenRows(1);
    sh.getRange(2, 1, contoh[nama].length, LAJUR_MODUL.length).setValues(contoh[nama]);
    sh.setColumnWidth(5, 320);
  });
  hantaranHelaian_();
}
