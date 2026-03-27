"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAbc } from "@/lib/abc-context";
import { runCostEngine } from "@/lib/cost-engine";
import { formatEuro, formatEuroDetailed } from "@/lib/format";
import { BU_IDS } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function cellClass(rowKey: string, isTotal = false) {
  if (rowKey === "gross" || rowKey === "ebitda") {
    return isTotal ? "font-semibold tabular-nums" : "tabular-nums";
  }
  return "tabular-nums";
}

export function PlDashboard() {
  const { state } = useAbc();

  const result = useMemo(() => runCostEngine(state), [state]);

  const buLabels = useMemo(
    () =>
      Object.fromEntries(
        state.businessUnits.map((b) => [b.id, b.shortLabel]),
      ) as Record<string, string>,
    [state.businessUnits],
  );

  const chartData = useMemo(
    () =>
      result.personnelChartSegments.map((s) => ({
        label: s.label,
        value: Math.round(s.value),
        kind: s.kind,
      })),
    [result.personnelChartSegments],
  );

  const fillForKind = (kind: string) => {
    if (kind === "direct") return "var(--chart-2)";
    if (kind === "indirect") return "var(--chart-3)";
    return "var(--muted-foreground)";
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total direct costs</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.totalDirectCosts)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Direct other + payroll on direct activities (by BU).
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total indirect pool</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.totalIndirectCosts)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Indirect other + payroll on indirect activities, then allocated by drivers.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unallocated payroll</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.personnel.unallocatedPersonnelCost)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Time not assigned in the timesheet (below 100% allocation).
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&amp;L and profitability</CardTitle>
          <CardDescription>
            Consolidated view: revenue, direct costs, gross margin, allocated indirect
            costs, and real EBITDA — by business unit and group total.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[200px]">Line</TableHead>
                <TableHead className="text-right">Total group</TableHead>
                {BU_IDS.map((id) => (
                  <TableHead key={id} className="text-right">
                    {buLabels[id]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.plRows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell
                    className={`text-right ${cellClass(row.key, true)} ${
                      row.key === "ebitda" ? "text-foreground" : ""
                    }`}
                  >
                    {formatEuro(row.group)}
                  </TableCell>
                  {BU_IDS.map((id) => (
                    <TableCell
                      key={id}
                      className={`text-right ${cellClass(row.key)}`}
                    >
                      {formatEuro(row.byBu[id])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.unassignedDirectOther > 0 ? (
            <p className="text-sm text-muted-foreground">
              Direct other expenses without a BU are included in the group total only:{" "}
              <span className="font-medium text-foreground">
                {formatEuro(result.unassignedDirectOther)}
              </span>
              .
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personnel cost distribution</CardTitle>
          <CardDescription>
            Payroll routed through the timesheet: direct labor by BU, indirect labor
            pool, and unallocated capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No personnel allocation to display yet.
            </p>
          ) : (
            <div className="h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatEuro(Number(v))}
                    className="text-xs"
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={168}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const n =
                        typeof value === "number"
                          ? value
                          : Number(value ?? 0);
                      return formatEuroDetailed(
                        Number.isFinite(n) ? n : 0,
                      );
                    }}
                    contentStyle={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={fillForKind(entry.kind)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: "var(--chart-2)" }}
              />
              Direct (by BU)
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: "var(--chart-3)" }}
              />
              Indirect activities
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: "var(--muted-foreground)" }}
              />
              Unallocated
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
