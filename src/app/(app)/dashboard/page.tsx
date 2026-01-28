import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Signed in as <span className="font-medium">{data.user?.email}</span>
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Auth</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Login, protected routes, and sign out are ready.
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Theme</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Dark mode toggle + settings page.
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Shell</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        SaaS admin layout (sidebar + topbar + user menu).
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        Replace the nav items in <span className="font-medium">dashboard/nav.ts</span> with your app’s modules.
                    </p>
                    <p>
                        Add new pages under <span className="font-medium">/dashboard</span> and keep auth + theming.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}