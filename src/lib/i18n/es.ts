/**
 * Cadenas de interfaz en español (aplicación mono-idioma).
 */
export const es = {
  meta: {
    title: "TVUP · TDABC",
    description:
      "Costeo basado en actividades impulsado por el tiempo (TDABC) para las unidades de negocio TVUP (TVaaS, TCS, Tivify).",
  },
  common: {
    loading: "Cargando…",
    bu: "UN",
    addRow: "Añadir fila",
    removeRowAria: "Eliminar fila",
    none: "Ninguno",
    optional: "Opcional",
  },
  auth: {
    title: "TDABC TVUP",
    subtitle:
      "Inicia sesión con tu cuenta Microsoft 365 autorizada (dominios tvup.media o thechannelstore.tv).",
    signInMicrosoft: "Iniciar sesión con Microsoft",
    signOut: "Cerrar sesión",
    notConfigured:
      "Firebase no está configurado. Añade las variables NEXT_PUBLIC_FIREBASE_* en .env.local (consulta .env.example).",
    errors: {
      domain:
        "Solo se permiten cuentas @tvup.media o @thechannelstore.tv. Se ha cerrado la sesión.",
      popupBlocked:
        "El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio e inténtalo de nuevo.",
      popupClosed: "Se cerró la ventana de inicio de sesión antes de terminar. Inténtalo de nuevo.",
      unauthorizedDomain:
        "Firebase no autoriza este dominio. En Firebase Console → Authentication → Settings → Authorized domains, añade el host exacto de la URL (p. ej. tdabc.vercel.app o tu dominio).",
      operationNotAllowed:
        "El proveedor Microsoft no está habilitado en Firebase (Authentication → Sign-in method → Microsoft).",
      network:
        "Error de red al contactar con Firebase. Comprueba la conexión e inténtalo de nuevo.",
      generic: "No se pudo iniciar sesión. Inténtalo de nuevo.",
      noEmail:
        "No se pudo obtener el correo de la cuenta. Usa una cuenta Microsoft 365 con correo corporativo.",
    },
  },
  shell: {
    kicker: "TVUP · Finanzas",
    title: "Costeo basado en actividades (TDABC)",
    description:
      "Espacio de trabajo TDABC de demostración: equipo, imputación horaria, drivers indirectos y un PyG en vivo — todo se recalcula al editar el parte de horas.",
    tabs: {
      team: "Equipo y costes",
      time: "Imputación horaria",
      drivers: "Drivers indirectos",
      pl: "Panel PyG",
    },
    teamCard: {
      title: "Equipo y costes",
      description:
        "Datos maestros de personal: tipo de contratación y coste mensual por persona.",
    },
    timeCard: {
      title: "Imputación horaria mensual",
      description:
        "Asigna el tiempo de cada persona a unidades de negocio y actividades. Lo directo o indirecto lo marca la actividad.",
    },
    driversCard: {
      title: "Drivers de coste indirecto",
      description:
        "Métricas operativas para repartir el pool indirecto entre TVaaS, TCS y Tivify.",
    },
  },
  team: {
    columns: {
      name: "Nombre",
      type: "Tipo",
      homeBu: "UN de origen",
      monthlyCost: "Coste mensual",
    },
    footnote:
      "El coste de personal impulsa el TDABC: los cambios aquí se reflejan al instante en la imputación y el PyG.",
  },
  time: {
    person: "Persona",
    selectPerson: "Selecciona una persona",
    monthlyCost: "Coste mensual",
    monthAllocation: "Imputación del mes",
    percentOfTime: "del tiempo",
    over100: "supera el 100%",
    unallocatedNote:
      "Sin asignar: {pct}% ({amount}) — no cuenta como coste directo ni indirecto de nómina hasta que se asigne.",
    allocationRows: "Filas de imputación",
    columns: {
      activity: "Actividad",
      client: "Cliente",
      pct: "%",
    },
    emptyRows:
      "Aún no hay filas. Añade una fila para imputar el tiempo de esta persona.",
    overAllocatedWarning:
      "La imputación total supera el 100%. El motor escala las filas proporcionalmente al 100% para los cálculos.",
  },
  drivers: {
    intro:
      "Los drivers operativos reparten el pool de costes indirectos entre las unidades de negocio. Con varios drivers, se promedia su peso para las cuotas de imputación.",
    columnDriver: "Driver",
  },
  pl: {
    kpi: {
      totalDirect: "Costes directos totales",
      totalDirectHint:
        "Otros costes directos + nómina en actividades directas (por UN).",
      indirectPool: "Pool indirecto total",
      indirectPoolHint:
        "Otros indirectos + nómina en actividades indirectas; luego imputado con drivers.",
      unallocatedPayroll: "Nómina sin asignar",
      unallocatedPayrollHint:
        "Tiempo no imputado en el parte (por debajo del 100% de asignación).",
    },
    plCard: {
      title: "PyG y rentabilidad",
      description:
        "Vista consolidada: ingresos, costes directos, margen bruto, costes indirectos imputados y EBITDA real — por unidad de negocio y total grupo.",
    },
    columns: {
      line: "Concepto",
      totalGroup: "Total grupo",
    },
    rows: {
      revenue: "Ingresos",
      direct: "Costes directos",
      gross: "Margen bruto",
      indirect: "Costes indirectos imputados",
      ebitda: "EBITDA real",
    },
    unassignedDirect:
      "Los otros costes directos sin UN solo se incluyen en el total de grupo:",
    distribution: {
      title: "Distribución del coste de personal",
      description:
        "Nómina según el parte: mano de obra directa por UN, pool indirecto y capacidad no asignada.",
      empty: "Aún no hay imputación de personal para mostrar.",
      legendDirect: "Directo (por UN)",
      legendIndirect: "Actividades indirectas",
      legendUnallocated: "Sin asignar",
    },
    chart: {
      directSuffix: "directo",
      indirectPool: "Actividades indirectas (nómina)",
      unallocated: "Capacidad no asignada",
    },
  },
} as const;

export type EsStrings = typeof es;
