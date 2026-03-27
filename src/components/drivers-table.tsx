"use client";

import { useAbc } from "@/lib/abc-context";
import { es } from "@/lib/i18n/es";
import type { BuId } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DriversTable() {
  const { state, setDriverMetric } = useAbc();

  const setMetric = (driverId: string, buId: BuId, raw: string) => {
    const n = Number(raw);
    setDriverMetric(driverId, buId, Number.isFinite(n) ? Math.max(0, n) : 0);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{es.drivers.intro}</p>
      <div className="rounded-xl border border-border bg-card p-1 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[200px]">{es.drivers.columnDriver}</TableHead>
              {state.businessUnits.map((bu) => (
                <TableHead key={bu.id} className="text-right">
                  {bu.shortLabel}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.drivers.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                {state.businessUnits.map((bu) => (
                  <TableCell key={bu.id} className="text-right">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="ml-auto h-8 w-24 text-right tabular-nums"
                      value={d.buMetrics[bu.id]}
                      onChange={(e) => setMetric(d.id, bu.id, e.target.value)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
