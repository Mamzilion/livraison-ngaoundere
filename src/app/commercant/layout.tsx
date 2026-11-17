import { AppHeader } from "@/components/ui";
import { getT } from "@/lib/i18n-server";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <>
      <AppHeader
        items={[
          { href: "/commercant", label: t("m.tabCourses"), icon: "list", exact: true },
          { href: "/commercant/nouvelle", label: t("m.tabNew"), icon: "plus" },
          { href: "/commercant/profil", label: t("m.tabShop"), icon: "store" },
        ]}
      />
      {children}
    </>
  );
}
