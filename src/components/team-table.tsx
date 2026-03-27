"use client";

import { useAbc } from "@/lib/abc-context";
import { formatEuro } from "@/lib/format";
import { es } from "@/lib/i18n/es";
import type { BuId, PersonnelType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TeamTable() {
  const { state, updatePersonnel } = useAbc();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-1 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{es.team.columns.name}</TableHead>
              <TableHead>{es.team.columns.type}</TableHead>
              <TableHead>{es.team.columns.homeBu}</TableHead>
              <TableHead className="text-right">{es.team.columns.monthlyCost}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.personnel.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Select
                    value={p.type}
                    onValueChange={(v) => {
                      if (!v) return;
                      updatePersonnel(p.id, { type: v as PersonnelType });
                    }}
                  >
                    <SelectTrigger size="sm" className="min-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empleado">Empleado</SelectItem>
                      <SelectItem value="Colaborador">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={p.homeBU}
                    onValueChange={(v) => {
                      if (!v) return;
                      updatePersonnel(p.id, { homeBU: v as BuId });
                    }}
                  >
                    <SelectTrigger size="sm" className="min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {state.businessUnits.map((bu) => (
                        <SelectItem key={bu.id} value={bu.id}>
                          {bu.shortLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      className="h-8 w-28 text-right tabular-nums"
                      value={Number.isFinite(p.monthlyCost) ? p.monthlyCost : 0}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        updatePersonnel(p.id, {
                          monthlyCost: Number.isFinite(n) ? Math.max(0, n) : 0,
                        });
                      }}
                    />
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {formatEuro(p.monthlyCost)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">{es.team.footnote}</p>
    </div>
  );
}
