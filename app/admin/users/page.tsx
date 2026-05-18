import { requireRole } from "@/lib/auth/require-session";
import { AdminUsersTable } from "@/components/admin/admin-users-table-client";
import { fetchAdminUsers } from "@/lib/supabase/admin/admin-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const { role } = await requireRole(["admin", "moderator"]);
  const supabase = await createSupabaseServerClient();
  const users = await fetchAdminUsers(supabase, 120);
  const canManageRoles = role === "admin";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Kimlik</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">Kullanıcılar</h1>
        <p className="text-[0.9rem] text-muted-foreground">
          {canManageRoles
            ? "Terapist rolü atanınca dizin satırı otomatik oluşur (kullanıcı bir sonraki istekte /therapist paneline yönlendirilir). Engelli hesaplar girişten sonra erişemez."
            : "Rol ve hesap engeli yalnızca yönetici hesapları tarafından yönetilebilir."}
        </p>
      </header>
      <AdminUsersTable users={users} canManageRoles={canManageRoles} />
    </div>
  );
}
