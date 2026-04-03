/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { updateAkun } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function EditAkunPage() {
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [nama, setNama] = useState(user.nama || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (password && password.length < 6) {
      toast({ title: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }

    try {
      const res = await updateAkun({
        nama,
        password: password || undefined,
      });

      localStorage.setItem("user", JSON.stringify(res.user));

      toast({ title: "Akun berhasil diupdate" });
      setPassword("");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center items-start p-4">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle>Edit Akun</CardTitle>
          <CardDescription>
            Ubah informasi akun Anda di bawah ini
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user.username} disabled />
            </div>

            {/* Nama */}
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengganti"
              />
            </div>

            {/* Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
