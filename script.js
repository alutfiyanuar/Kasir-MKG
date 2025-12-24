// === KONFIGURASI ===
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyXsupYZVFip_N7AW5MVvSUPuQLk84asEfB21TbMhPpYUmBGAa2k9US5KXOTANBtcYW/exec"; // TANPA SPASI DI AKHIR!

let produkList = [];
let daftarBelanja = [];
let daftarTransfer = [];

// === MUAT SEMUA DATA DALAM 1 REQUEST ===
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const isKasir =
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/";
    const isStock = window.location.pathname.includes("stock.html");

    // ✅ HANYA 1 REQUEST: ambil produk + nomor sekaligus
    const res = await fetch(WEB_APP_URL);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    produkList = data.produk;
    populateDropdowns();

    if (isKasir) {
      document.getElementById("noTransaksi").value = data.noTransaksi;
    }
    if (isStock) {
      document.getElementById("noTransfer").value = data.noTransfer;
    }
  } catch (error) {
    console.error("Gagal muat data:", error);
    alert("⚠️ Gagal memuat data. Periksa koneksi atau Web App URL.");
  }
});

// === ISI DROPDOWN ===
function populateDropdowns() {
  const selects = document.querySelectorAll('select[id="namaBarang"]');
  selects.forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Pilih Barang</option>';
    produkList.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.nama;
      option.textContent = item.nama;
      select.appendChild(option);
    });
    if (currentValue) select.value = currentValue;
  });
}

// === ISI HARGA OTOMATIS ===
function onBarangSelected(selectElement) {
  const selectedNama = selectElement.value;
  const produk = produkList.find((p) => p.nama === selectedNama);
  if (produk) {
    const form = selectElement.closest("form");
    const hargaInput = form.querySelector('input[id="harga"]');
    if (hargaInput) {
      const hargaNumeric = parseFloat(produk.harga);
      hargaInput.value = isNaN(hargaNumeric) ? 0 : hargaNumeric;
      hargaInput.dispatchEvent(new Event("input"));
    }
  }
}

// === HITUNG TOTAL HARGA ===
function hitungTotal() {
  const harga = parseFloat(document.getElementById("harga").value) || 0;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const total = harga * jumlah;
  document.getElementById("totalHarga").value = new Intl.NumberFormat(
    "id-ID"
  ).format(total);
}

// === TAMBAH KE DAFTAR BELANJA ===
function tambahKeDaftar() {
  if (!validateForm("kasirForm")) return;

  const noTransaksi = document.getElementById("noTransaksi").value;
  const tanggalInput = document.getElementById("tanggal").value;
  const tanggal = new Date(tanggalInput).toISOString().split("T")[0];
  const namaBarang = document.getElementById("namaBarang").value;
  const harga = parseFloat(document.getElementById("harga").value) || 0;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const totalHarga = harga * jumlah;

  daftarBelanja.push({
    noUrut: daftarBelanja.length + 1,
    noTransaksi,
    tanggal,
    namaBarang,
    harga,
    jumlah,
    totalHarga,
  });
  updateTabelDaftarBelanja();

  document.getElementById("namaBarang").value = "";
  document.getElementById("harga").value = "";
  document.getElementById("jumlah").value = "1";
  hitungTotal();
  document.getElementById("namaBarang").focus();
}

// === TAMBAH KE DAFTAR TRANSFER ===
function tambahKeDaftarTransfer() {
  if (!validateForm("stockForm")) return;

  const noTransfer = document.getElementById("noTransfer").value;
  const tanggalInput = document.getElementById("tanggal").value;
  const tanggal = new Date(tanggalInput).toISOString().split("T")[0];
  const namaBarang = document.getElementById("namaBarang").value;
  const harga = parseFloat(document.getElementById("harga").value) || 0;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const jenisTransfer = document.getElementById("jenisTransfer").value;

  daftarTransfer.push({
    noUrut: daftarTransfer.length + 1,
    noTransfer,
    tanggal,
    namaBarang,
    harga,
    jumlah,
    jenisTransfer,
  });
  updateTabelDaftarTransfer();

  document.getElementById("namaBarang").value = "";
  document.getElementById("harga").value = "";
  document.getElementById("jumlah").value = "1";
  document.getElementById("namaBarang").focus();
}

// === UPDATE TABEL ===
function updateTabelDaftarBelanja() {
  const tbody = document.querySelector("#daftarBelanja tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  daftarBelanja.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.noUrut}</td>
      <td>${item.noTransaksi}</td>
      <td>${item.tanggal}</td>
      <td>${item.namaBarang}</td>
      <td>Rp${new Intl.NumberFormat("id-ID").format(item.harga)}</td>
      <td>${item.jumlah}</td>
      <td>Rp${new Intl.NumberFormat("id-ID").format(item.totalHarga)}</td>
    `;
    tbody.appendChild(row);
  });
}

function updateTabelDaftarTransfer() {
  const tbody = document.querySelector("#daftarTransfer tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  daftarTransfer.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.noUrut}</td>
      <td>${item.noTransfer}</td>
      <td>${item.tanggal}</td>
      <td>${item.namaBarang}</td>
      <td>Rp${new Intl.NumberFormat("id-ID").format(item.harga)}</td>
      <td>${item.jumlah}</td>
      <td>${item.jenisTransfer}</td>
    `;
    tbody.appendChild(row);
  });
}

// === BATAL SEMUA ===
function batalDaftarBelanja() {
  if (daftarBelanja.length === 0) return;
  if (confirm("Hapus semua item di daftar belanja?")) {
    daftarBelanja = [];
    updateTabelDaftarBelanja();
  }
}

function batalDaftarTransfer() {
  if (daftarTransfer.length === 0) return;
  if (confirm("Hapus semua item di daftar transfer?")) {
    daftarTransfer = [];
    updateTabelDaftarTransfer();
  }
}

// === SIMPAN TRANSAKSI ===
async function simpanTransaksi() {
  if (daftarBelanja.length === 0) {
    alert("Daftar belanja kosong!");
    return;
  }
  // ✅ Tambahkan konfirmasi
  const totalItem = daftarBelanja.length;
  const totalHarga = daftarBelanja.reduce(
    (sum, item) => sum + item.totalHarga,
    0
  );
  const konfirmasi = confirm(
    `📦 Konfirmasi Transaksi\n\n` +
      `Jumlah item: ${totalItem}\n` +
      `Total harga: Rp${new Intl.NumberFormat("id-ID").format(
        totalHarga
      )}\n\n` +
      `Apakah Anda yakin ingin menyimpan transaksi ini?`
  );

  if (!konfirmasi) return; // Jika dibatalkan, hentikan
  const formData = new FormData();
  formData.append("action", "simpanTransaksiBatch");
  formData.append("data", JSON.stringify(daftarBelanja));

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.status === "success") {
      alert(`✅ ${result.count} item disimpan!`);

      // PERBARUI NOMOR TRANSAKSI
      const nomorRes = await fetch(`${WEB_APP_URL}?action=getNomorTransaksi`);
      const nomorData = await nomorRes.json();
      if (!nomorData.error) {
        document.getElementById("noTransaksi").value = nomorData.noTransaksi;
      }

      daftarBelanja = [];
      updateTabelDaftarBelanja();
      document.getElementById("namaBarang").value = "";
      document.getElementById("harga").value = "";
      document.getElementById("jumlah").value = "1";
      hitungTotal();
    } else {
      throw new Error(result.message || "Gagal simpan");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Gagal menyimpan data.");
  }
}

// === SIMPAN TRANSFER ===
async function simpanTransfer() {
  if (daftarTransfer.length === 0) {
    alert("Daftar transfer kosong!");
    return;
  }

  // ✅ Tambahkan konfirmasi
  const totalItem = daftarTransfer.length;
  const jenis = daftarTransfer[0].jenisTransfer; // Asumsikan semua item jenis sama
  const konfirmasi = confirm(
    `📦 Konfirmasi Transfer\n\n` +
      `Jenis: ${jenis}\n` +
      `Jumlah item: ${totalItem}\n\n` +
      `Apakah Anda yakin ingin menyimpan transfer ini?`
  );

  if (!konfirmasi) return; // Jika dibatalkan, hentikan

  const formData = new FormData();
  formData.append("action", "simpanTransferBatch");
  formData.append("data", JSON.stringify(daftarTransfer));

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.status === "success") {
      alert(`✅ ${result.count} item disimpan!`);

      // PERBARUI NOMOR TRANSFER
      const nomorRes = await fetch(`${WEB_APP_URL}?action=getNomorTransfer`);
      const nomorData = await nomorRes.json();
      if (!nomorData.error) {
        document.getElementById("noTransfer").value = nomorData.noTransfer;
      }

      daftarTransfer = [];
      updateTabelDaftarTransfer();
      document.getElementById("namaBarang").value = "";
      document.getElementById("harga").value = "";
      document.getElementById("jumlah").value = "1";
    } else {
      throw new Error(result.message || "Gagal simpan");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Gagal menyimpan data.");
  }
}

// === VALIDASI FORM ===
function validateForm(formId) {
  const form = document.getElementById(formId);
  const required = form.querySelectorAll("[required]");
  for (let field of required) {
    if (!field.value.trim()) {
      alert("Lengkapi semua data!");
      field.focus();
      return false;
    }
  }
  return true;
}
// === GANTI WARNA SELECT JENIS TRANSFER ===
document.addEventListener("DOMContentLoaded", function () {
  const jenisTransferSelect = document.getElementById("jenisTransfer");
  if (jenisTransferSelect) {
    // Fungsi update warna
    function updateJenisTransferColor() {
      const value = jenisTransferSelect.value;
      jenisTransferSelect.classList.remove("retur", "tambah-stock");
      if (value === "RETUR") {
        jenisTransferSelect.classList.add("retur");
      } else if (value === "TAMBAH STOCK") {
        jenisTransferSelect.classList.add("tambah-stock");
      }
    }

    // Jalankan saat halaman dimuat
    updateJenisTransferColor();

    // Jalankan saat ada perubahan
    jenisTransferSelect.addEventListener("change", updateJenisTransferColor);
  }
});
