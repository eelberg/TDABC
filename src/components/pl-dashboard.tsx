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
import { es } from "@/lib/i18n/es";
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

type PlRowKey = keyof typeof es.pl.rows;

function plRowLabel(key: string): string {
  if (key in es.pl.rows) {
    return es.pl.rows[key as PlRowKey];
  }
  return key;
}

function segmentDisplayLabel(segmentKey: string, buLabels: Record<string, string>): string {
  if (segmentKey === "indirect-pool") return es.pl.chart.indirectPool;
  if (segmentKey === "unallocated") return es.pl.chart.unallocated;
  if (segmentKey.startsWith("direct-")) {
    const bu = segmentKey.slice("direct-".length);
    const name = buLabels[bu] ?? bu;
    return `${name} · ${es.pl.chart.directSuffix}`;
  }
  return segmentKey;
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
        label: segmentDisplayLabel(s.key, buLabels),
        value: Math.round(s.value),
        kind: s.kind,
      })),
    [result.personnelChartSegments, buLabels],
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
            <CardDescription>{es.pl.kpi.totalDirect}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.totalDirectCosts)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {es.pl.kpi.totalDirectHint}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{es.pl.kpi.indirectPool}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.totalIndirectCosts)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {es.pl.kpi.indirectPoolHint}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{es.pl.kpi.unallocatedPayroll}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatEuro(result.personnel.unallocatedPersonnelCost)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {es.pl.kpi.unallocatedPayrollHint}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{es.pl.plCard.title}</CardTitle>
          <CardDescription>{es.pl.plCard.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[200px]">{es.pl.columns.line}</TableHead>
                <TableHead className="text-right">{es.pl.columns.totalGroup}</TableHead>
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
                  <TableCell className="font-medium">{plRowLabel(row.key)}</TableCell>
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
              {es.pl.unassignedDirect}{" "}
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
          <CardTitle>{es.pl.distribution.title}</CardTitle>
          <CardDescription>{es.pl.distribution.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">{es.pl.distribution.empty}</p>
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
              {es.pl.distribution.legendDirect}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: "var(--chart-3)" }}
              />
              {es.pl.distribution.legendIndirect}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: "var(--muted-foreground)" }}
              />
              {es.pl.distribution.legendUnallocated}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
