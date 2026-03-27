"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { initialAbcState } from "@/lib/mock-data";
import type {
  AbcState,
  BuId,
  Personnel,
  TimeEntryLine,
} from "@/lib/types";

export type AbcAction =
  | {
      type: "UPDATE_PERSONNEL";
      id: string;
      patch: Partial<Pick<Personnel, "monthlyCost" | "type" | "homeBU" | "name">>;
    }
  | { type: "SET_PERSON_TIME_ENTRIES"; personId: string; entries: TimeEntryLine[] }
  | { type: "SET_DRIVER_METRIC"; driverId: string; buId: BuId; value: number }
  | {
      type: "UPDATE_OTHER_EXPENSE";
      id: string;
      patch: Partial<Pick<AbcState["otherExpenses"][number], "amount" | "buId" | "name">>;
    }
  | { type: "SET_REVENUE"; buId: BuId; value: number };

function abcReducer(state: AbcState, action: AbcAction): AbcState {
  switch (action.type) {
    case "UPDATE_PERSONNEL": {
      return {
        ...state,
        personnel: state.personnel.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      };
    }
    case "SET_PERSON_TIME_ENTRIES": {
      const idx = state.timeEntries.findIndex((t) => t.personId === action.personId);
      if (idx === -1) {
        return {
          ...state,
          timeEntries: [
            ...state.timeEntries,
            {
              id: `te-${action.personId}`,
              personId: action.personId,
              entries: action.entries,
            },
          ],
        };
      }
      const next = [...state.timeEntries];
      next[idx] = { ...next[idx], entries: action.entries };
      return { ...state, timeEntries: next };
    }
    case "SET_DRIVER_METRIC": {
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId
            ? {
                ...d,
                buMetrics: {
                  ...d.buMetrics,
                  [action.buId]: action.value,
                },
              }
            : d,
        ),
      };
    }
    case "UPDATE_OTHER_EXPENSE": {
      return {
        ...state,
        otherExpenses: state.otherExpenses.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e,
        ),
      };
    }
    case "SET_REVENUE": {
      return {
        ...state,
        revenueByBu: {
          ...state.revenueByBu,
          [action.buId]: action.value,
        },
      };
    }
    default:
      return state;
  }
}

type AbcContextValue = {
  state: AbcState;
  dispatch: React.Dispatch<AbcAction>;
  updatePersonnel: (
    id: string,
    patch: Partial<Pick<Personnel, "monthlyCost" | "type" | "homeBU" | "name">>,
  ) => void;
  setPersonTimeEntries: (personId: string, entries: TimeEntryLine[]) => void;
  setDriverMetric: (driverId: string, buId: BuId, value: number) => void;
};

const AbcContext = createContext<AbcContextValue | null>(null);

export function AbcProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(abcReducer, initialAbcState);

  const updatePersonnel = useCallback(
    (id: string, patch: Partial<Pick<Personnel, "monthlyCost" | "type" | "homeBU" | "name">>) => {
      dispatch({ type: "UPDATE_PERSONNEL", id, patch });
    },
    [],
  );

  const setPersonTimeEntries = useCallback((personId: string, entries: TimeEntryLine[]) => {
    dispatch({ type: "SET_PERSON_TIME_ENTRIES", personId, entries });
  }, []);

  const setDriverMetric = useCallback((driverId: string, buId: BuId, value: number) => {
    dispatch({ type: "SET_DRIVER_METRIC", driverId, buId, value });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      updatePersonnel,
      setPersonTimeEntries,
      setDriverMetric,
    }),
    [state, updatePersonnel, setPersonTimeEntries, setDriverMetric],
  );

  return <AbcContext.Provider value={value}>{children}</AbcContext.Provider>;
}

export function useAbc(): AbcContextValue {
  const ctx = useContext(AbcContext);
  if (!ctx) {
    throw new Error("useAbc must be used within AbcProvider");
  }
  return ctx;
}
