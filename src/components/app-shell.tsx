"use client";

import { BarChart3, Clock3, LayoutDashboard, Users } from "lucide-react";

import { DriversTable } from "@/components/drivers-table";
import { PlDashboard } from "@/components/pl-dashboard";
import { TeamTable } from "@/components/team-table";
import { TimeAllocator } from "@/components/time-allocator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          TVUP · Finance
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Time-driven activity-based costing
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Mock TDABC workspace: team costs, monthly time allocation, indirect drivers, and
          a live P&amp;L — all recalculated as you edit the timesheet.
        </p>
      </header>

      <Tabs defaultValue="team" className="flex min-h-0 flex-1 flex-col gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-muted/40 p-1 lg:grid-cols-4">
          <TabsTrigger value="team" className="gap-2 py-2">
            <Users className="size-4 shrink-0 opacity-70" />
            <span className="truncate">Team &amp; costs</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2 py-2">
            <Clock3 className="size-4 shrink-0 opacity-70" />
            <span className="truncate">Time allocation</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 py-2">
            <BarChart3 className="size-4 shrink-0 opacity-70" />
            <span className="truncate">Indirect drivers</span>
          </TabsTrigger>
          <TabsTrigger value="pl" className="gap-2 py-2">
            <LayoutDashboard className="size-4 shrink-0 opacity-70" />
            <span className="truncate">P&amp;L dashboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Team &amp; costs</CardTitle>
              <CardDescription>
                Personnel master data: employment type and monthly payroll by person.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Monthly time allocation</CardTitle>
              <CardDescription>
                Assign each person&apos;s time to business units and activities. Direct vs
                indirect follows the activity definition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeAllocator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-0 flex-1 outline-none">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Indirect cost drivers</CardTitle>
              <CardDescription>
                Operational metrics used to spread the indirect pool across TVaaS, TCS, and
                Tivify.
              </CardDescription>
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
