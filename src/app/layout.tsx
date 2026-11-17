import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/components/i18n";
import { APP_NAME } from "@/lib/config";
import { getLang } from "@/lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Livraison rapide et fiable pour les commerces de Ngaoundéré, Dang et Bini.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f26b1d",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang === "ff" ? "ff" : "fr"}>
      <body className="min-h-dvh antialiased">
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
