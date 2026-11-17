import { AppHeader } from "@/components/ui";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader
        title="Espace commerçant"
        links={[
          { href: "/commercant", label: "Mes courses" },
          { href: "/commercant/nouvelle", label: "+ Nouvelle course" },
          { href: "/commercant/profil", label: "Mon commerce" },
        ]}
      />
      {children}
    </>
  );
}
