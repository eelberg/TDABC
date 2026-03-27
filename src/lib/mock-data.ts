import type { AbcState } from "./types";

export const initialAbcState: AbcState = {
  businessUnits: [
    { id: "tvaas", name: "TVaaS", shortLabel: "TVaaS" },
    { id: "tcs", name: "TCS", shortLabel: "TCS" },
    { id: "tivify", name: "Tivify", shortLabel: "Tivify" },
  ],
  personnel: [
    {
      id: "p1",
      name: "Tech Lead",
      type: "Empleado",
      monthlyCost: 6000,
      homeBU: "tcs",
    },
    {
      id: "p2",
      name: "B2C Marketer",
      type: "Colaborador",
      monthlyCost: 4000,
      homeBU: "tivify",
    },
    {
      id: "p3",
      name: "TVaaS Sales Rep",
      type: "Empleado",
      monthlyCost: 5000,
      homeBU: "tvaas",
    },
    {
      id: "p4",
      name: "Support Agent",
      type: "Colaborador",
      monthlyCost: 3000,
      homeBU: "tivify",
    },
  ],
  clients: [
    { id: "c1", name: "Telkom", buId: "tvaas" },
    { id: "c2", name: "MasOrange", buId: "tcs" },
  ],
  activities: [
    {
      id: "a-direct-integration",
      name: "Custom Client Integration",
      costType: "Direct",
    },
    {
      id: "a-direct-marketing",
      name: "B2C Marketing",
      costType: "Direct",
    },
    {
      id: "a-direct-sales",
      name: "B2B Sales & Account Mgmt",
      costType: "Direct",
    },
    {
      id: "a-indirect-platform",
      name: "Core Platform Maintenance",
      costType: "Indirect",
      defaultDriverId: "d-tbs",
    },
    {
      id: "a-indirect-admin",
      name: "General Admin",
      costType: "Indirect",
      defaultDriverId: "d-tickets",
    },
  ],
  timeEntries: [
    {
      id: "te-p1",
      personId: "p1",
      entries: [
        {
          buId: "tcs",
          activityId: "a-indirect-platform",
          percentage: 50,
        },
        {
          buId: "tvaas",
          activityId: "a-direct-integration",
          clientId: "c1",
          percentage: 30,
        },
        {
          buId: "tivify",
          activityId: "a-indirect-admin",
          percentage: 20,
        },
      ],
    },
    {
      id: "te-p2",
      personId: "p2",
      entries: [
        {
          buId: "tivify",
          activityId: "a-direct-marketing",
          percentage: 85,
        },
        {
          buId: "tivify",
          activityId: "a-indirect-admin",
          percentage: 15,
        },
      ],
    },
    {
      id: "te-p3",
      personId: "p3",
      entries: [
        {
          buId: "tvaas",
          activityId: "a-direct-sales",
          clientId: "c1",
          percentage: 70,
        },
        {
          buId: "tvaas",
          activityId: "a-indirect-platform",
          percentage: 30,
        },
      ],
    },
    {
      id: "te-p4",
      personId: "p4",
      entries: [
        {
          buId: "tvaas",
          activityId: "a-direct-integration",
          percentage: 40,
        },
        {
          buId: "tcs",
          activityId: "a-indirect-admin",
          percentage: 35,
        },
        {
          buId: "tivify",
          activityId: "a-indirect-admin",
          percentage: 15,
        },
      ],
    },
  ],
  drivers: [
    {
      id: "d-tickets",
      name: "Support tickets (count)",
      buMetrics: { tvaas: 120, tcs: 80, tivify: 55 },
    },
    {
      id: "d-tbs",
      name: "TB transferred",
      buMetrics: { tvaas: 420, tcs: 310, tivify: 180 },
    },
  ],
  otherExpenses: [
    {
      id: "oe1",
      name: "Cloud & servers",
      amount: 8500,
      costType: "Indirect",
    },
    {
      id: "oe2",
      name: "Paid ads (B2C)",
      amount: 2200,
      costType: "Direct",
      buId: "tivify",
    },
    {
      id: "oe3",
      name: "TVaaS partner tooling",
      amount: 1500,
      costType: "Direct",
      buId: "tvaas",
    },
  ],
  revenueByBu: {
    tvaas: 42000,
    tcs: 28000,
    tivify: 19500,
  },
};
