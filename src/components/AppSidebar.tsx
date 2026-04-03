import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Wallet,
  AlertTriangle,
  LogOut,
  NotebookPen,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuGroups = [
  {
    label: "Dashboard",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Master Data",
    items: [
      { title: "Produk", url: "/produk", icon: Package },
      { title: "Stok Menipis", url: "/stok-menipis", icon: AlertTriangle },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { title: "Transaksi", url: "/transaksi", icon: ArrowLeftRight },
      { title: "Pengeluaran", url: "/pengeluaran", icon: Wallet },
    ],
  },
  {
    label: "Laporan",
    items: [
      { title: "Rekap Bulanan", url: "/rekap-bulanan", icon: NotebookPen },
    ],
  },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <div className={`p-4 ${collapsed ? "px-2" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">
                BC
              </div>
              {!collapsed && (
                <span className="font-bold text-sidebar-accent-foreground text-lg">
                  Budi Cell
                </span>
              )}
            </div>
          </div>

          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          onClick={() => {
                            if (isMobile) setOpenMobile(false);
                          }}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className={`p-3 ${collapsed ? "px-1" : ""}`}>
            {!collapsed && user && (
              <p className="text-xs text-sidebar-foreground/60 mb-2 px-2 truncate">
                Halo, {user.nama}
              </p>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="hover:bg-sidebar-accent/50 text-sidebar-foreground/80">
                      <User className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Akun</span>}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align={collapsed ? "center" : "start"}
                    className="w-40"
                  >
                    <DropdownMenuItem
                      onClick={() => navigate("/edit-akun")}
                      className="cursor-pointer"
                    >
                      Edit Akun
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setLogoutDialogOpen(true)}
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Modal Konfirmasi Logout */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login
              kembali untuk mengakses akun Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
