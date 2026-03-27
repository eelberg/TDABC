import { BU_IDS, type AbcState, type Activity, type BuId } from "./types";

function emptyBuRecord(): Record<BuId, number> {
  return { tvaas: 0, tcs: 0, tivify: 0 };
}

function activityMap(activities: Activity[]): Map<string, Activity> {
  return new Map(activities.map((a) => [a.id, a]));
}

/**
 * Indirect pool allocation across BUs: for each driver, BU share = metric / sum(metrics).
 * With multiple drivers, we use the arithmetic mean of those shares so each driver weighs equally.
 */
export function combinedIndirectShares(drivers: AbcState["drivers"]): Record<BuId, number> {
  if (drivers.length === 0) {
    const eq = 1 / BU_IDS.length;
    return { tvaas: eq, tcs: eq, tivify: eq };
  }

  const acc = emptyBuRecord();
  const nDrivers = drivers.length;
  // Arithmetic mean of per-driver BU shares so each driver contributes equally to allocation.
  for (const d of drivers) {
    const total = BU_IDS.reduce((s, bu) => s + Math.max(0, d.buMetrics[bu] ?? 0), 0);
    if (total <= 0) {
      const eq = 1 / BU_IDS.length;
      for (const bu of BU_IDS) acc[bu] += eq / nDrivers;
    } else {
      for (const bu of BU_IDS) {
        acc[bu] += (Math.max(0, d.buMetrics[bu] ?? 0) / total) / nDrivers;
      }
    }
  }

  const sumShares = BU_IDS.reduce((s, bu) => s + acc[bu], 0);
  if (sumShares <= 0) {
    const eq = 1 / BU_IDS.length;
    return { tvaas: eq, tcs: eq, tivify: eq };
  }
  return acc;
}

export interface PersonnelBreakdown {
  directPersonnelByBu: Record<BuId, number>;
  indirectPersonnelPool: number;
  unallocatedPersonnelCost: number;
}

export function computePersonnelBreakdown(state: AbcState): PersonnelBreakdown {
  const actMap = activityMap(state.activities);
  const directPersonnelByBu = emptyBuRecord();
  let indirectPersonnelPool = 0;
  let unallocatedPersonnelCost = 0;

  for (const person of state.personnel) {
    const sheet = state.timeEntries.find((t) => t.personId === person.id);
    const lines = sheet?.entries ?? [];
    const sumPct = lines.reduce((s, l) => s + Math.max(0, l.percentage), 0);
    if (sumPct > 100) {
      // UI should prevent this; cap effective allocation at 100% for engine stability.
    }
    const effectiveCap = Math.min(sumPct, 100);
    const scale = sumPct > 100 ? 100 / sumPct : 1;

    for (const line of lines) {
      const pct = Math.max(0, line.percentage) * scale;
      const lineCost = (person.monthlyCost * pct) / 100;
      const act = actMap.get(line.activityId);
      if (!act) continue;
      if (act.costType === "Direct") {
        directPersonnelByBu[line.buId] += lineCost;
      } else {
        indirectPersonnelPool += lineCost;
      }
    }

    const remainder = Math.max(0, 100 - effectiveCap);
    unallocatedPersonnelCost += (person.monthlyCost * remainder) / 100;
  }

  return { directPersonnelByBu, indirectPersonnelPool, unallocatedPersonnelCost };
}

export interface PlRow {
  key: string;
  label: string;
  group: number;
  byBu: Record<BuId, number>;
}

export interface CostEngineResult {
  personnel: PersonnelBreakdown;
  directOtherByBu: Record<BuId, number>;
  unassignedDirectOther: number;
  indirectOtherPool: number;
  totalIndirectPool: number;
  indirectShares: Record<BuId, number>;
  indirectAllocatedToBu: Record<BuId, number>;
  totalDirectCosts: number;
  totalIndirectCosts: number;
  plRows: PlRow[];
  /** Stacked segments for payroll distribution chart */
  personnelChartSegments: { key: string; label: string; value: number; kind: "direct" | "indirect" | "unallocated" }[];
}

export function runCostEngine(state: AbcState): CostEngineResult {
  const personnel = computePersonnelBreakdown(state);
  const directOtherByBu = emptyBuRecord();
  let unassignedDirectOther = 0;
  let indirectOtherPool = 0;

  for (const oe of state.otherExpenses) {
    if (oe.costType === "Direct") {
      if (oe.buId) directOtherByBu[oe.buId] += oe.amount;
      else unassignedDirectOther += oe.amount;
    } else {
      indirectOtherPool += oe.amount;
    }
  }

  const totalIndirectPool = personnel.indirectPersonnelPool + indirectOtherPool;
  const indirectShares = combinedIndirectShares(state.drivers);
  const indirectAllocatedToBu = emptyBuRecord();
  for (const bu of BU_IDS) {
    indirectAllocatedToBu[bu] = totalIndirectPool * indirectShares[bu];
  }

  const totalDirectPersonnel = BU_IDS.reduce((s, bu) => s + personnel.directPersonnelByBu[bu], 0);
  const totalDirectOther =
    BU_IDS.reduce((s, bu) => s + directOtherByBu[bu], 0) + unassignedDirectOther;
  const totalDirectCosts = totalDirectPersonnel + totalDirectOther;
  const totalIndirectCosts = totalIndirectPool;

  const revenue = state.revenueByBu;
  const directCostsByBu = emptyBuRecord();
  for (const bu of BU_IDS) {
    directCostsByBu[bu] =
      personnel.directPersonnelByBu[bu] + directOtherByBu[bu];
  }

  const grossMarginByBu = emptyBuRecord();
  for (const bu of BU_IDS) {
    grossMarginByBu[bu] = revenue[bu] - directCostsByBu[bu];
  }

  const realEbitdaByBu = emptyBuRecord();
  for (const bu of BU_IDS) {
    realEbitdaByBu[bu] = grossMarginByBu[bu] - indirectAllocatedToBu[bu];
  }

  const groupRevenue = BU_IDS.reduce((s, bu) => s + revenue[bu], 0);
  const groupDirect =
    BU_IDS.reduce((s, bu) => s + directCostsByBu[bu], 0) + unassignedDirectOther;
  const groupGross = groupRevenue - groupDirect;
  const groupAllocatedIndirect = BU_IDS.reduce((s, bu) => s + indirectAllocatedToBu[bu], 0);
  const groupEbitda = groupGross - groupAllocatedIndirect;

  const plRows: PlRow[] = [
    {
      key: "revenue",
      label: "Revenue",
      group: groupRevenue,
      byBu: { ...revenue },
    },
    {
      key: "direct",
      label: "Direct costs",
      group: groupDirect,
      byBu: {
        tvaas: directCostsByBu.tvaas,
        tcs: directCostsByBu.tcs,
        tivify: directCostsByBu.tivify,
      },
    },
    {
      key: "gross",
      label: "Gross margin",
      group: groupGross,
      byBu: { ...grossMarginByBu },
    },
    {
      key: "indirect",
      label: "Allocated indirect costs",
      group: groupAllocatedIndirect,
      byBu: { ...indirectAllocatedToBu },
    },
    {
      key: "ebitda",
      label: "Real EBITDA",
      group: groupEbitda,
      byBu: { ...realEbitdaByBu },
    },
  ];

  const buMeta = Object.fromEntries(state.businessUnits.map((b) => [b.id, b.shortLabel])) as Record<
    BuId,
    string
  >;

  const personnelChartSegments: CostEngineResult["personnelChartSegments"] = [];
  for (const bu of BU_IDS) {
    const v = personnel.directPersonnelByBu[bu];
    if (v > 0) {
      personnelChartSegments.push({
        key: `direct-${bu}`,
        label: `${buMeta[bu]} · direct`,
        value: v,
        kind: "direct",
      });
    }
  }
  if (personnel.indirectPersonnelPool > 0) {
    personnelChartSegments.push({
      key: "indirect-pool",
      label: "Indirect activities (payroll)",
      value: personnel.indirectPersonnelPool,
      kind: "indirect",
    });
  }
  if (personnel.unallocatedPersonnelCost > 0) {
    personnelChartSegments.push({
      key: "unallocated",
      label: "Unallocated capacity",
      value: personnel.unallocatedPersonnelCost,
      kind: "unallocated",
    });
  }

  return {
    personnel,
    directOtherByBu,
    unassignedDirectOther,
    indirectOtherPool,
    totalIndirectPool,
    indirectShares,
    indirectAllocatedToBu,
    totalDirectCosts,
    totalIndirectCosts,
    plRows,
    personnelChartSegments,
  };
}
