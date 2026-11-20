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
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "!bg-white dark:!bg-neutral-900 !text-neutral-900 dark:!text-neutral-100 !border !border-neutral-200 dark:!border-neutral-800 !shadow-md !rounded-lg",
          }}
        />
      </div>
    </ThemeProvider>
  );
}

