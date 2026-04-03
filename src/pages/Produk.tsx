/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getProduk, tambahProduk, updateProduk, hapusProduk } from "@/lib/api";
import type { Produk } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Tambahkan ini
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

// Daftar pilihan kategori
const KATEGORI_OPTIONS = [
  "Barang Elektronik",
  "Parabot Rumah Tangga",
  "Kartu Perdana",
  "Lainnya",
];

const emptyForm = {
  nama: "",
  kategori: "",
  satuan: "",
  stok: 0,
  stokMinimum: 0,
  hargaModal: 0,
  hargaJual: 0,
};

export default function ProdukPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // State untuk modal konfirmasi delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produkToDelete, setProdukToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getProduk({ search: search || undefined })
      .then(setProdukList)
      .catch(() =>
        toast({ title: "Gagal memuat produk", variant: "destructive" }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditId(p.id);
    setForm({
      nama: p.nama,
      kategori: p.kategori,
      satuan: p.satuan,
      stok: p.stok,
      stokMinimum: p.stokMinimum,
      hargaModal: p.hargaModal,
      hargaJual: p.hargaJual,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateProduk(editId, form);
        toast({ title: "Produk berhasil diupdate" });
      } else {
        await tambahProduk(form);
        toast({ title: "Produk berhasil ditambahkan" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk membuka modal konfirmasi delete
  const confirmDelete = (id: number) => {
    setProdukToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Fungsi untuk menghapus produk
  const handleDelete = async () => {
    if (!produkToDelete) return;

    setDeleting(true);
    try {
      await hapusProduk(produkToDelete);
      toast({ title: "Produk berhasil dihapus" });
      fetchData();
      setDeleteDialogOpen(false);
      setProdukToDelete(null);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-header">Produk</h1>
          <p className="page-sub">Kelola data produk toko</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Min Stok</TableHead>
                  <TableHead className="text-right">Harga Modal</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : produkList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Tidak ada produk
                    </TableCell>
                  </TableRow>
                ) : (
                  produkList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell>{p.kategori}</TableCell>
                      <TableCell>{p.satuan}</TableCell>
                      <TableCell
                        className={`text-right ${p.stok <= p.stokMinimum ? "text-destructive font-semibold" : ""}`}
                      >
                        {p.stok}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.stokMinimum}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRp(p.hargaModal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRp(p.hargaJual)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(p.id)} // Ganti langsung hapus dengan konfirmasi
                            className="text-destructive hover:text-destructive"
                          >
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

      {/* Modal Form Tambah/Edit Produk */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-[425px] md:max-w-[600px] mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nama Produk</Label>
                <Input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.kategori}
                  onValueChange={(value) =>
                    setForm({ ...form, kategori: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((kat) => (
                      <SelectItem key={kat} value={kat}>
                        {kat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Satuan</Label>
                <Input
                  value={form.satuan}
                  onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={form.stok}
                  onChange={(e) =>
                    setForm({ ...form, stok: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Minimum</Label>
                <Input
                  type="number"
                  value={form.stokMinimum}
                  onChange={(e) =>
                    setForm({ ...form, stokMinimum: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Modal</Label>
                <Input
                  type="number"
                  value={form.hargaModal}
                  onChange={(e) =>
                    setForm({ ...form, hargaModal: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual</Label>
                <Input
                  type="number"
                  value={form.hargaJual}
                  onChange={(e) =>
                    setForm({ ...form, hargaJual: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus Produk */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
