/* eslint-disable @typescript-eslint/no-explicit-any */
// Ganti BASE_URL sesuai dengan URL backend Express.js kamu
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}

// Auth
export const login = (username: string, password: string) =>
  apiRequest<{
    token: string;
    user: { id: number; nama: string; username: string };
  }>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const updateAkun = (data: { nama?: string; password?: string }) =>
  apiRequest<{
    message: string;
    user: { id: number; nama: string; username: string };
  }>("/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Produk
export const getProduk = (params?: { kategori?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.kategori) query.set("kategori", params.kategori);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiRequest<any[]>(`/ambil-produk${qs ? `?${qs}` : ""}`);
};

export const getProdukById = (id: number) =>
  apiRequest<any>(`/ambil-produk/${id}`);

export const tambahProduk = (data: any) =>
  apiRequest<any>("/tambah-produk", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProduk = (id: number, data: any) =>
  apiRequest<any>(`/update-produk/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const hapusProduk = (id: number) =>
  apiRequest<any>(`/hapus-produk/${id}`, { method: "DELETE" });

export const getStokMenipis = () => apiRequest<any[]>("/stok/menipis");

// Transaksi
export const getTransaksi = (params?: {
  jenis?: string;
  dari?: string;
  sampai?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.jenis && params.jenis !== "all") {
    query.set("jenis", params.jenis);
  }
  if (params?.dari) query.set("dari", params.dari);
  if (params?.sampai) query.set("sampai", params.sampai);
  const qs = query.toString();
  return apiRequest<any[]>(`/ambil-transaksi${qs ? `?${qs}` : ""}`);
};

export const tambahTransaksi = (data: any) =>
  apiRequest<any>("/tambah-transaksi", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const hapusTransaksi = (id: number) =>
  apiRequest<any>(`/hapus-transaksi/${id}`, { method: "DELETE" });

export const getRekapHarian = (tanggal?: string) => {
  const qs = tanggal ? `?tanggal=${tanggal}` : "";
  return apiRequest<any>(`/rekap/harian${qs}`);
};

export const getRekapBulanan = (bulan?: number, tahun?: number) => {
  const query = new URLSearchParams();
  if (bulan) query.set("bulan", String(bulan));
  if (tahun) query.set("tahun", String(tahun));

  const qs = query.toString();
  return apiRequest<any>(`/rekap/bulanan${qs ? `?${qs}` : ""}`);
};

// Pengeluaran
export const getPengeluaran = (params?: {
  kategori?: string;
  dari?: string;
  sampai?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.kategori) query.set("kategori", params.kategori);
  if (params?.dari) query.set("dari", params.dari);
  if (params?.sampai) query.set("sampai", params.sampai);
  const qs = query.toString();
  return apiRequest<any[]>(`/ambil-pengeluaran${qs ? `?${qs}` : ""}`);
};

export const tambahPengeluaran = (data: any) =>
  apiRequest<any>("/tambah-pengeluaran", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePengeluaran = (id: number, data: any) =>
  apiRequest<any>(`/update-pengeluaran/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const hapusPengeluaran = (id: number) =>
  apiRequest<any>(`/hapus-pengeluaran/${id}`, { method: "DELETE" });
