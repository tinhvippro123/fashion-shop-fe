import { ThemeProvider } from "@/shared/ui/theme-provider";
import { Toaster } from "sonner";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="admin-theme min-h-screen bg-background text-foreground font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    </ThemeProvider>
  );
}

