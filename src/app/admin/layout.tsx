import { AppHeader } from "@/components/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader
        title="Administration"
        links={[
          { href: "/admin", label: "Courses" },
          { href: "/admin/reversements", label: "Reversements" },
          { href: "/admin/comptes", label: "Livreurs & commerçants" },
        ]}
      />
      {children}
    </>
  );
}
