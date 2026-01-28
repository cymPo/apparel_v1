import { DashboardShell } from "@/components/common/dashboard/shell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) redirect("/auth/login");

    return <DashboardShell userEmail={user.email}>{children}</DashboardShell>;
}
