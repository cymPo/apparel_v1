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
                <h1 className="text-2xl font-semibold tracking-tight">BLANK NEW PAGE</h1>
                <p className="mt-1 text-sm text-muted-foreground">Customize your boilerplate.</p>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Add new page here.
                </CardContent>
            </Card>
        </div>
    );
}