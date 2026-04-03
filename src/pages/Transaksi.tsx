/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  getTransaksi,
  tambahTransaksi,
  hapusTransaksi,
  getProduk,
} from "@/lib/api";
import type { Transaksi, Produk } from "@/types";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const jenisOptions = [
  "jual_barang",
  "transfer",
  "pulsa",
  "tarik_tunai",
  "voucher",
];

interface ItemForm {
  produkId: number;
  jumlah: number;
  hargaSatuan: number;
}

export default function TransaksiPage() {
  const [list, setList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterDari, setFilterDari] = useState("");
  const [filterSampai, setFilterSampai] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // State untuk modal konfirmasi delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transaksiToDelete, setTransaksiToDelete] = useState<number | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    jenis: "transfer",
    keterangan: "",
    nominal: 0,
    modal: 0,
    catatan: "",
  });
  const [items, setItems] = useState<ItemForm[]>([]);

  const fetchData = () => {
    setLoading(true);
    getTransaksi({
      jenis: filterJenis || undefined,
      dari: filterDari || undefined,
      sampai: filterSampai || undefined,
    })
      .then(setList)
      .catch(() =>
        toast({ title: "Gagal memuat transaksi", variant: "destructive" }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [filterJenis, filterDari, filterSampai]);

  const openAdd = async () => {
    setForm({
      jenis: "transfer",
      keterangan: "",
      nominal: 0,
      modal: 0,
      catatan: "",
    });
    setItems([]);
    try {
      const p = await getProduk();
      setProdukList(p);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
      toast({ title: "Gagal memuat daftar produk", variant: "destructive" });
    }
    setDialogOpen(true);
  };

  const addItem = () =>
    setItems([...items, { produkId: 0, jumlah: 1, hargaSatuan: 0 }]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItemForm, val: number) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: val };
    if (field === "produkId") {
      const produk = produkList.find((p) => p.id === val);
      if (produk) newItems[i].hargaSatuan = produk.hargaJual;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = { ...form };
      if (form.jenis === "jual_barang") {
        data.items = items;
        data.nominal = items.reduce((s, i) => s + i.jumlah * i.hargaSatuan, 0);
        data.modal = items.reduce((s, i) => {
          const p = produkList.find((pr) => pr.id === i.produkId);
          return s + (p ? p.hargaModal * i.jumlah : 0);
        }, 0);
      }
      await tambahTransaksi(data);
      toast({ title: "Transaksi berhasil disimpan" });
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
    setTransaksiToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!transaksiToDelete) return;

    setDeleting(true);
    try {
      await hapusTransaksi(transaksiToDelete);
      toast({ title: "Transaksi berhasil dihapus" });
      fetchData();
      setDeleteDialogOpen(false);
      setTransaksiToDelete(null);
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
          <h1 className="page-header">Transaksi</h1>
          <p className="page-sub">Kelola transaksi harian</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Transaksi
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterJenis} onValueChange={setFilterJenis}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {jenisOptions.map((j) => (
              <SelectItem key={j} value={j}>
                {j.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDari}
          onChange={(e) => setFilterDari(e.target.value)}
          className="w-auto"
          placeholder="Dari"
        />
        <Input
          type="date"
          value={filterSampai}
          onChange={(e) => setFilterSampai(e.target.value)}
          className="w-auto"
          placeholder="Sampai"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Keuntungan</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Tidak ada transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">
                        {formatTanggal(t.waktu)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block bg-accent text-accent-foreground text-xs px-2 py-1 rounded-md capitalize font-medium">
                          {t.jenis.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {t.jenis === "jual_barang" && t.items?.length > 0 ? (
                          <div className="space-y-1">
                            {t.items.map((item, i) => (
                              <div key={i} className="text-sm">
                                • {item.produk?.nama} x{item.jumlah}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="truncate block">{t.keterangan}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRp(t.nominal)}
                      </TableCell>
                      <TableCell className="text-right text-success font-medium">
                        {formatRp(t.keuntungan)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.user?.nama}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(t.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.jenis}
                onValueChange={(v) => setForm({ ...form, jenis: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jenisOptions.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Input
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
              />
            </div>

            {form.jenis !== "jual_barang" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nominal</Label>
                  <Input
                    type="number"
                    value={form.nominal}
                    onChange={(e) =>
                      setForm({ ...form, nominal: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modal</Label>
                  <Input
                    type="number"
                    value={form.modal}
                    onChange={(e) =>
                      setForm({ ...form, modal: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
            )}

            {form.jenis === "jual_barang" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Items Produk</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Tambah Item
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-end gap-2 bg-muted/50 p-3 rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Produk</Label>
                      <Select
                        value={item.produkId ? String(item.produkId) : ""}
                        onValueChange={(v) =>
                          updateItem(i, "produkId", Number(v))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {produkList.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nama} (stok: {p.stok})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Jumlah</Label>
                      <Input
                        type="number"
                        value={item.jumlah}
                        onChange={(e) =>
                          updateItem(i, "jumlah", Number(e.target.value))
                        }
                        min={1}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Harga</Label>
                      <Input
                        type="number"
                        value={item.hargaSatuan}
                        onChange={(e) =>
                          updateItem(i, "hargaSatuan", Number(e.target.value))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(i)}
                      className="text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                rows={2}
              />
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
