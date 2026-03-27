"use client";

import { BarChart3, Clock3, LayoutDashboard, LogOut, Users } from "lucide-react";

import { DriversTable } from "@/components/drivers-table";
import { PlDashboard } from "@/components/pl-dashboard";
import { TeamTable } from "@/components/team-table";
import { TimeAllocator } from "@/components/time-allocator";
import { useAuth } from "@/lib/auth/auth-context";
import { es } from "@/lib/i18n/es";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AppShell() {
  const { signOutUser, user } = useAuth();

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {es.shell.kicker}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {es.shell.title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{es.shell.description}</p>
            {user?.email ? (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 self-start"
            onClick={() => void signOutUser()}
          >
            <LogOut className="size-4 opacity-70" />
            {es.auth.signOut}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="team" className="flex min-h-0 flex-1 flex-col gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-muted/40 p-1 lg:grid-cols-4">
          <TabsTrigger value="team" className="gap-2 py-2">
            <Users className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{es.shell.tabs.team}</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2 py-2">
            <Clock3 className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{es.shell.tabs.time}</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 py-2">
            <BarChart3 className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{es.shell.tabs.drivers}</span>
          </TabsTrigger>
          <TabsTrigger value="pl" className="gap-2 py-2">
            <LayoutDashboard className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{es.shell.tabs.pl}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>{es.shell.teamCard.title}</CardTitle>
              <CardDescription>{es.shell.teamCard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>{es.shell.timeCard.title}</CardTitle>
              <CardDescription>{es.shell.timeCard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeAllocator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>{es.shell.driversCard.title}</CardTitle>
              <CardDescription>{es.shell.driversCard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <DriversTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pl" className="mt-0 flex-1 outline-none">
          <PlDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
