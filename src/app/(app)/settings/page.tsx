"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const current = theme === "system" ? systemTheme : theme;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Customize your boilerplate.</p>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Current: <span className="font-medium">{current}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={theme === "light" ? "default" : "outline"}
                            onClick={() => setTheme("light")}
                        >
                            Light
                        </Button>
                        <Button
                            type="button"
                            variant={theme === "dark" ? "default" : "outline"}
                            onClick={() => setTheme("dark")}
                        >
                            Dark
                        </Button>
                        <Button
                            type="button"
                            variant={theme === "system" ? "default" : "outline"}
                            onClick={() => setTheme("system")}
                        >
                            System
                        </Button>
                    </div>

                    <Separator />

                    <div className="text-xs text-muted-foreground">
                        Tip: “System” follows your Windows light/dark preference.
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Add RBAC, profiles, and org/company switching here when your app needs it.
                </CardContent>
            </Card>
        </div>
    );
}