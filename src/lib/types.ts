export const BU_IDS = ["tvaas", "tcs", "tivify"] as const;
export type BuId = (typeof BU_IDS)[number];

export type PersonnelType = "Empleado" | "Colaborador";

export type CostType = "Direct" | "Indirect";

export interface BusinessUnit {
  id: BuId;
  name: string;
  shortLabel: string;
}

export interface Personnel {
  id: string;
  name: string;
  type: PersonnelType;
  monthlyCost: number;
  homeBU: BuId;
}

export interface Client {
  id: string;
  name: string;
  buId: BuId;
}

export interface Activity {
  id: string;
  name: string;
  costType: CostType;
  /** Used for indirect activities; informs which driver is the default for that activity. */
  defaultDriverId?: string;
}

export interface TimeEntryLine {
  buId: BuId;
  activityId: string;
  clientId?: string;
  percentage: number;
}

export interface PersonTimeEntry {
  id: string;
  personId: string;
  entries: TimeEntryLine[];
}

export interface Driver {
  id: string;
  name: string;
  buMetrics: Record<BuId, number>;
}

export interface OtherExpense {
  id: string;
  name: string;
  amount: number;
  costType: CostType;
  buId?: BuId;
}

export interface AbcState {
  businessUnits: BusinessUnit[];
  personnel: Personnel[];
  clients: Client[];
  activities: Activity[];
  timeEntries: PersonTimeEntry[];
  drivers: Driver[];
  otherExpenses: OtherExpense[];
  /** Mock monthly revenue for P&L (€). */
  revenueByBu: Record<BuId, number>;
}
