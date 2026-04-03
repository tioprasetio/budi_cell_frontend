import { useEffect, useState } from "react";
import { getStokMenipis } from "@/lib/api";
import type { Produk } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function StokMenipis() {
  const [list, setList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStokMenipis()
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          Stok Menipis
        </h1>
        <p className="page-sub">Produk yang stoknya di bawah batas minimum</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok Saat Ini</TableHead>
                  <TableHead className="text-right">Stok Minimum</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
                ) : list.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Semua stok aman 👍</TableCell></TableRow>
                ) : (
                  list.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell>{p.kategori}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">{p.stok}</TableCell>
                      <TableCell className="text-right">{p.stokMinimum}</TableCell>
                      <TableCell className="text-right">{formatRp(p.hargaJual)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
