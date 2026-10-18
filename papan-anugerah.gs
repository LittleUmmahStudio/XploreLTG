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
 */
const HELAIAN_PEMAIN = 'Pemain';
const HELAIAN_MINGGUAN = 'Mingguan';
const HELAIAN_NOTA = 'ParkingLot';   // nota "Cikgu, nak cikgu tambah" (Parking Lot PAK21), hanya untuk cikgu
const HELAIAN_UMUM = 'Pengumuman';   // pengumuman perhimpunan yang ditulis oleh cikgu (masa nyata)
const HELAIAN_AKAUN = 'Akaun';       // akaun murid: simpanan kemajuan di awan

function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    if (p.aksi === 'hantar') out = hantar_(p);
    else if (p.aksi === 'padam') out = padam_(p);
    else if (p.aksi === 'nota') out = nota_(p);
    else if (p.aksi === 'pengumuman') out = pengumuman_();
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

