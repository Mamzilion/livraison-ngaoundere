import { AppHeader } from "@/components/ui";
import { getT } from "@/lib/i18n-server";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <>
      <AppHeader
        links={[
          { href: "/commercant", label: t("m.navCourses") },
          { href: "/commercant/nouvelle", label: t("m.navNew") },
          { href: "/commercant/profil", label: t("m.navShop") },
        ]}
      />
      {children}
    </>
  );
}
