/**
 * LO:TONG: Papan Anugerah Mingguan (Google Apps Script)
 * ----------------------------------------------------
 * Skrip ini menyimpan markah pemain dalam Google Sheets supaya semua murid
 * melihat papan anugerah yang sama. Langkah pemasangan ada dalam BACA-SAYA.md.
 *
 * Helaian "Pemain": satu baris bagi setiap pemain (dikemas kini setiap kali bermain).
 * Helaian "Mingguan": rekod setiap minggu (untuk "Juara minggu lepas").
 * Untuk menyorok sesuatu nama, taip apa-apa (contohnya: ya) dalam lajur "sorok".
 */
const HELAIAN_PEMAIN = 'Pemain';
const HELAIAN_MINGGUAN = 'Mingguan';
const HELAIAN_NOTA = 'ParkingLot';
const HELAIAN_UMUM = 'Pengumuman';   // pengumuman perhimpunan yang ditulis oleh cikgu (masa nyata)   // nota "Cikgu, nak cikgu tambah" (Parking Lot PAK21), hanya untuk cikgu

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
    if (!cariBaris_(sh, id) && !sh.getDataRange().getValues().some(function (r) { return r[5] === id; })) {
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
