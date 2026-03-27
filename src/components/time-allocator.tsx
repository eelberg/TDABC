"use client";

import { useMemo, useState } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

import { useAbc } from "@/lib/abc-context";
import { formatEuro } from "@/lib/format";
import { es } from "@/lib/i18n/es";
import type { BuId, TimeEntryLine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

const NO_CLIENT = "__none__";

function patchEntries(
  entries: TimeEntryLine[],
  index: number,
  patch: Partial<TimeEntryLine>,
): TimeEntryLine[] {
  return entries.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

export function TimeAllocator() {
  const { state, setPersonTimeEntries } = useAbc();
  const [personId, setPersonId] = useState("");

  const effectivePersonId =
    state.personnel.find((p) => p.id === personId)?.id ??
    state.personnel[0]?.id ??
    "";

  const person = state.personnel.find((p) => p.id === effectivePersonId);
  const entries = useMemo(() => {
    const sheet = state.timeEntries.find((t) => t.personId === effectivePersonId);
    return sheet?.entries ?? [];
  }, [state.timeEntries, effectivePersonId]);

  const defaultActivityId = state.activities[0]?.id ?? "";

  const sumPct = useMemo(
    () => entries.reduce((s, e) => s + Math.max(0, e.percentage), 0),
    [entries],
  );
  const overAllocated = sumPct > 100;
  const unallocatedPct = Math.max(0, 100 - sumPct);
  const unallocatedEuro = person
    ? (person.monthlyCost * unallocatedPct) / 100
    : 0;

  const unallocatedNote = es.time.unallocatedNote
    .replace("{pct}", unallocatedPct.toFixed(0))
    .replace("{amount}", formatEuro(unallocatedEuro));

  const updateRow = (index: number, patch: Partial<TimeEntryLine>) => {
    if (!effectivePersonId) return;
    let next = patchEntries(entries, index, patch);
    const row = next[index];
    if (row && patch.buId !== undefined) {
      const clientOk = row.clientId
        ? state.clients.some((c) => c.id === row.clientId && c.buId === row.buId)
        : true;
      if (!clientOk) {
        next = patchEntries(next, index, { clientId: undefined });
      }
    }
    setPersonTimeEntries(effectivePersonId, next);
  };

  const addRow = () => {
    if (!effectivePersonId || !person) return;
    const bu = person.homeBU;
    const actId =
      state.activities.find((a) => a.id === defaultActivityId)?.id ??
      state.activities[0]?.id ??
      "";
    setPersonTimeEntries(effectivePersonId, [
      ...entries,
      {
        buId: bu,
        activityId: actId,
        percentage: 0,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (!effectivePersonId) return;
    setPersonTimeEntries(
      effectivePersonId,
      entries.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="person">{es.time.person}</Label>
          <Select
            value={effectivePersonId}
            onValueChange={(v) => v && setPersonId(v)}
          >
            <SelectTrigger id="person" className="w-full min-w-[240px] sm:w-72">
              <SelectValue placeholder={es.time.selectPerson} />
            </SelectTrigger>
            <SelectContent>
              {state.personnel.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} · {formatEuro(p.monthlyCost)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {person ? (
          <div className="text-sm text-muted-foreground">
            {es.time.monthlyCost}{" "}
            <span className="font-medium text-foreground">
              {formatEuro(person.monthlyCost)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">{es.time.monthAllocation}</span>
          <span
            className={`text-sm tabular-nums ${overAllocated ? "text-destructive" : "text-muted-foreground"}`}
          >
            {sumPct.toFixed(0)}% {es.time.percentOfTime}
            {overAllocated ? ` · ${es.time.over100}` : ""}
          </span>
        </div>
        <Progress value={Math.min(sumPct, 100)} />
        <p className="text-xs text-muted-foreground">{unallocatedNote}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{es.time.allocationRows}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={!effectivePersonId}
        >
          <PlusCircle className="mr-1.5 size-4" />
          {es.common.addRow}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[120px]">{es.common.bu}</TableHead>
              <TableHead className="min-w-[200px]">{es.time.columns.activity}</TableHead>
              <TableHead className="min-w-[160px]">{es.time.columns.client}</TableHead>
              <TableHead className="w-28 text-right">{es.time.columns.pct}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {es.time.emptyRows}
                </TableCell>
              </TableRow>
            ) : (
              entries.map((row, index) => {
                const clientsHere = state.clients.filter((c) => c.buId === row.buId);
                return (
                  <TableRow key={`${effectivePersonId}-${index}`}>
                    <TableCell>
                      <Select
                        value={row.buId}
                        onValueChange={(v) => {
                          if (!v) return;
                          updateRow(index, { buId: v as BuId });
                        }}
                      >
                        <SelectTrigger size="sm" className="min-w-[112px]">
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
                    <TableCell>
                      <Select
                        value={row.activityId}
                        onValueChange={(v) => {
                          if (!v) return;
                          updateRow(index, { activityId: v });
                        }}
                      >
                        <SelectTrigger size="sm" className="min-w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {state.activities.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.clientId ?? NO_CLIENT}
                        onValueChange={(v) => {
                          if (v == null) return;
                          updateRow(index, {
                            clientId: v === NO_CLIENT ? undefined : v,
                          });
                        }}
                      >
                        <SelectTrigger size="sm" className="min-w-[140px]">
                          <SelectValue placeholder={es.common.optional} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CLIENT}>{es.common.none}</SelectItem>
                          {clientsHere.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        className="h-8 text-right tabular-nums"
                        value={row.percentage}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          updateRow(index, {
                            percentage: Number.isFinite(n)
                              ? Math.max(0, Math.min(100, n))
                              : 0,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(index)}
                        aria-label={es.common.removeRowAria}
                      >
                        <MinusCircle className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {overAllocated ? (
        <p className="text-sm text-destructive">{es.time.overAllocatedWarning}</p>
      ) : null}
    </div>
  );
}
