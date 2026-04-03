/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getPengeluaran, tambahPengeluaran, updatePengeluaran, hapusPengeluaran } from "@/lib/api";
import type { Pengeluaran } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

const emptyForm = { kategori: "", jumlah: 0, keterangan: "" };

export default function PengeluaranPage() {
  const [list, setList] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterDari, setFilterDari] = useState("");
  const [filterSampai, setFilterSampai] = useState("");
  const { toast } = useToast();

  const fetchData = () => {
    setLoading(true);
    getPengeluaran({ dari: filterDari || undefined, sampai: filterSampai || undefined })
      .then(setList)
      .catch(() => toast({ title: "Gagal memuat pengeluaran", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [filterDari, filterSampai]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Pengeluaran) => {
    setEditId(p.id);
    setForm({ kategori: p.kategori, jumlah: p.jumlah, keterangan: p.keterangan });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updatePengeluaran(editId, form);
        toast({ title: "Pengeluaran berhasil diupdate" });
      } else {
        await tambahPengeluaran(form);
        toast({ title: "Pengeluaran berhasil ditambahkan" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus pengeluaran ini?")) return;
    try {
      await hapusPengeluaran(id);
      toast({ title: "Pengeluaran berhasil dihapus" });
      fetchData();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-header">Pengeluaran</h1>
          <p className="page-sub">Kelola pengeluaran toko</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Pengeluaran
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input type="date" value={filterDari} onChange={(e) => setFilterDari(e.target.value)} className="w-auto" />
        <Input type="date" value={filterSampai} onChange={(e) => setFilterSampai(e.target.value)} className="w-auto" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
                ) : list.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada pengeluaran</TableCell></TableRow>
                ) : (
                  list.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{formatTanggal(p.waktu)}</TableCell>
                      <TableCell>{p.kategori}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{p.keterangan}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">{formatRp(p.jumlah)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.user?.nama}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
