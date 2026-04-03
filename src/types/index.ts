export interface User {
  id: number;
  nama: string;
  username: string;
}

export interface Produk {
  id: number;
  nama: string;
  kategori: string;
  satuan: string;
  stok: number;
  stokMinimum: number;
  hargaModal: number;
  hargaJual: number;
}

export interface TransaksiItem {
  id: number;
  produkId: number;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
  produk?: Produk;
}

export interface Transaksi {
  id: number;
  userId: number;
  jenis: string;
  keterangan: string;
  nominal: number;
  modal: number;
  keuntungan: number;
  catatan?: string;
  waktu: string;
  items?: TransaksiItem[];
  user?: { nama: string };
}

export interface Pengeluaran {
  id: number;
  userId: number;
  kategori: string;
  jumlah: number;
  keterangan: string;
  waktu: string;
  user?: { nama: string };
}

export interface RekapHarian {
  tanggal: string;
  totalPemasukan: number;
  totalKeuntungan: number;
  totalPengeluaran: number;
  labaHari: number;
  perJenis: Record<string, number>;
  jumlahTransaksi: number;
}

export interface RekapDataBulanan {
  tanggal: string;
  totalPemasukan: number;
  totalKeuntungan: number;
  totalPengeluaran: number;
  labaBulan: number;
  perJenis: Record<string, number>;
  jumlahTransaksi: number;
}
