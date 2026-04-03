import { useEffect, useState } from "react";
import { getRekapBulanan, getStokMenipis } from "@/lib/api";
import type { RekapDataBulanan, Produk } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function RekapBulanan() {
  const [rekap, setRekap] = useState<RekapDataBulanan | null>(null);
  const [stokMenipis, setStokMenipis] = useState<Produk[]>([]);
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRekapBulanan(bulan, tahun), getStokMenipis()])
      .then(([r, s]) => {
        setRekap(r);
        setStokMenipis(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const stats = rekap
    ? [
        {
          label: "Total Pemasukan",
          value: formatRp(rekap.totalPemasukan),
          icon: DollarSign,
          color: "text-primary",
        },
        {
          label: "Keuntungan",
          value: formatRp(rekap.totalKeuntungan),
          icon: TrendingUp,
          color: "text-success",
        },
        {
          label: "Pengeluaran",
          value: formatRp(rekap.totalPengeluaran),
          icon: TrendingDown,
          color: "text-destructive",
        },
        {
          label: "Laba Bersih",
          value: formatRp(rekap.labaBulan),
          icon: BarChart3,
          color: "text-info",
        },
        {
          label: "Jumlah Transaksi",
          value: rekap.jumlahTransaksi.toString(),
          icon: ShoppingCart,
          color: "text-warning",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-header">Rekap Bulanan</h1>
          <p className="page-sub">Rekap Bulanan toko Budi Cell</p>
        </div>
        <div className="flex gap-2">
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((b, i) => (
              <option key={i} value={i + 1}>
                {b}
              </option>
            ))}
          </select>

          <Input
            type="number"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="w-28"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </span>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {rekap && Object.keys(rekap.perJenis).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Per Jenis Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(rekap.perJenis).map(([jenis, nominal]) => (
                    <div key={jenis} className="bg-accent/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground capitalize">
                        {jenis.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatRp(nominal as number)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stokMenipis.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Stok Menipis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stokMenipis.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-warning/5 rounded-lg px-4 py-2"
                    >
                      <span className="font-medium text-sm">{p.nama}</span>
                      <span className="text-xs text-destructive font-semibold">
                        Sisa: {p.stok} / Min: {p.stokMinimum}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
