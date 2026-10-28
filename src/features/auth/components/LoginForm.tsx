"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/users/stores/auth.store";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, logout } = useAuthStore();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    try {
      const loggedUser = await login(email, password);
      if (!loggedUser.isAdmin) {
        logout();
        toast.error("Tài khoản này không có quyền Quản trị viên (ADMIN)!");
        return;
      }
      toast.success("Đăng nhập quản trị thành công!");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error((error as Error).message || "Tài khoản hoặc mật khẩu không chính xác!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Nửa bên trái: Hình ảnh Branding */}
      <div className="hidden bg-primary lg:block relative">
        <Image
          src="/login-bg.jpg"
          alt="Luxe Fashion Cover"
          fill
          className="h-full w-full object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute top-10 left-10 flex items-center gap-2">
          <div className="bg-card/90 p-3 rounded-lg shadow-lg">
            <Image
              src="/logo.png"
              alt="Luxe Fashion"
              width={140}
              height={40}
              className="object-contain"
            />
          </div>
        </div>

        <div className="absolute bottom-10 left-10 max-w-lg text-white">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            LUXE Fashion Admin
          </h1>
          <p className="text-zinc-200 text-lg leading-relaxed">
            Hệ thống quản trị và kiểm soát dữ liệu nội bộ. Vui lòng đăng nhập
            với tài khoản được cấp quyền để truy cập không gian làm việc.
          </p>
        </div>
      </div>

      {/* Nửa bên phải: Form Đăng Nhập */}
      <div className="flex items-center justify-center py-12 bg-background min-h-screen">
        <div className="mx-auto grid w-95 gap-8 px-4">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Đăng nhập</h1>
            <p className="text-balance text-muted-foreground text-sm mt-1">
              Nhập thông tin tài khoản quản trị để truy cập hệ thống
            </p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="font-semibold text-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@luxe.vn"
                  defaultValue="admin@luxe.vn"
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="font-semibold text-foreground"
                  >
                    Mật khẩu
                  </Label>
                  <Link
                    href="/"
                    className="inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Về trang chủ
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue="admin123"
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </div>
          </form>

          <div className="mt-2 text-center text-sm text-muted-foreground">
            Hệ thống quản trị chỉ dành cho nhân viên quản lý nội bộ.
          </div>
        </div>
      </div>
    </div>
  );
}

