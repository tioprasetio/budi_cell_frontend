import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ProdukPage from "@/pages/Produk";
import TransaksiPage from "@/pages/Transaksi";
import PengeluaranPage from "@/pages/PengeluaranPage";
import StokMenipis from "@/pages/StokMenipis";
import NotFound from "@/pages/NotFound";
import RekapBulanan from "./pages/RekapBulanan";
import EditAkunPage from "./pages/EditAkunPage";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produk" element={<ProdukPage />} />
            <Route path="/transaksi" element={<TransaksiPage />} />
            <Route path="/pengeluaran" element={<PengeluaranPage />} />
            <Route path="/stok-menipis" element={<StokMenipis />} />
            <Route path="/rekap-bulanan" element={<RekapBulanan />} />
            <Route path="/edit-akun" element={<EditAkunPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
