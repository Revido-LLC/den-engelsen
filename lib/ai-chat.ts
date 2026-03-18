import { Vehicle, KPISnapshot, Branch } from "@/types";
import { formatEuro } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  vehicleIds?: string[];
  action?: { label: string; type: "filter" | "select" | "navigate"; payload: string };
}

// ── Helpers ────────────────────────────────────────────────────────────
function euro(n: number): string {
  return formatEuro(n);
}

function matchesAny(query: string, patterns: string[]): boolean {
  return patterns.some((p) => query.includes(p));
}

function topN<T>(arr: T[], n: number, key: (v: T) => number, desc = true): T[] {
  return [...arr].sort((a, b) => (desc ? key(b) - key(a) : key(a) - key(b))).slice(0, n);
}

const BRANCHES: Branch[] = ["Duiven", "Eindhoven", "Nijmegen", "Venlo", "Stein", "Tiel"];

// ── Main response generator ────────────────────────────────────────────
export function generateResponse(
  query: string,
  vehicles: Vehicle[],
  kpis: KPISnapshot,
  lang: "en" | "nl"
): ChatMessage {
  const q = query.toLowerCase().trim();
  const isNl = lang === "nl";

  // 1. Greeting
  if (matchesAny(q, ["hallo", "hello", "hi", "hey", "goedemorgen", "goedemiddag", "goedenavond"])) {
    return {
      role: "assistant",
      content: isNl
        ? "Hallo! Ik ben je VoorraadInzicht assistent. Ik kan je helpen met:\n- Kritieke voertuigen & acties\n- Rentekosten & prijsanalyse\n- Vestigingsoverzichten\n- Zoeken op merk, type of naam\n\nStel me gerust een vraag!"
        : "Hello! I'm your VoorraadInzicht assistant. I can help you with:\n- Critical vehicles & actions\n- Interest costs & price analysis\n- Branch overviews\n- Search by brand, type, or name\n\nFeel free to ask me anything!",
    };
  }

  // 2. Critical / urgent vehicles (>90 days)
  if (matchesAny(q, ["critical", "urgent", "kritiek", "kritieke", ">90", "90 dagen", "90 days"])) {
    const critical = vehicles.filter((v) => v.days_in_stock > 90);
    if (critical.length === 0) {
      return {
        role: "assistant",
        content: isNl
          ? "Goed nieuws! Er zijn momenteel **geen** voertuigen langer dan 90 dagen in voorraad."
          : "Good news! There are currently **no** vehicles in stock for more than 90 days.",
      };
    }
    const totalInterest = critical.reduce((sum, v) => sum + v.interest_cost, 0);
    const lines = critical.map(
      (v) =>
        `- **${v.name}** (${v.id}) — ${v.days_in_stock}${isNl ? "d" : "d"}, ${isNl ? "rente" : "interest"}: ${euro(v.interest_cost)}`
    );
    return {
      role: "assistant",
      content: isNl
        ? `Er zijn **${critical.length}** kritieke voertuigen (>90 dagen):\n${lines.join("\n")}\n\nTotale rentekosten: **${euro(totalInterest)}**`
        : `There are **${critical.length}** critical vehicles (>90 days):\n${lines.join("\n")}\n\nTotal interest cost: **${euro(totalInterest)}**`,
      vehicleIds: critical.map((v) => v.id),
      action: { label: isNl ? "Filter kritiek" : "Filter critical", type: "filter", payload: "status:red" },
    };
  }

  // 3. Branch queries
  const matchedBranch = BRANCHES.find((b) => q.includes(b.toLowerCase()));
  if (matchedBranch || matchesAny(q, ["vestiging", "vestigingen", "branch", "branches", "alle vestigingen", "all branches"])) {
    if (matchedBranch) {
      const branchVehicles = vehicles.filter((v) => v.branch === matchedBranch);
      const totalValue = branchVehicles.reduce((sum, v) => sum + v.price, 0);
      const avgDays = branchVehicles.length
        ? Math.round(branchVehicles.reduce((sum, v) => sum + v.days_in_stock, 0) / branchVehicles.length)
        : 0;
      const criticalCount = branchVehicles.filter((v) => v.days_in_stock > 90).length;
      const totalInterest = branchVehicles.reduce((sum, v) => sum + v.interest_cost, 0);
      return {
        role: "assistant",
        content: isNl
          ? `**${matchedBranch}** — ${branchVehicles.length} voertuigen\n- Totale waarde: **${euro(totalValue)}**\n- Gem. dagen in voorraad: **${avgDays}**\n- Rentekosten: **${euro(totalInterest)}**\n- Kritiek (>90d): **${criticalCount}**`
          : `**${matchedBranch}** — ${branchVehicles.length} vehicles\n- Total value: **${euro(totalValue)}**\n- Avg. days in stock: **${avgDays}**\n- Interest cost: **${euro(totalInterest)}**\n- Critical (>90d): **${criticalCount}**`,
        vehicleIds: branchVehicles.map((v) => v.id),
        action: { label: `${isNl ? "Filter" : "Filter"} ${matchedBranch}`, type: "filter", payload: `branch:${matchedBranch}` },
      };
    }
    // All branches overview
    const branchLines = BRANCHES.map((b) => {
      const bv = vehicles.filter((v) => v.branch === b);
      const avgD = bv.length ? Math.round(bv.reduce((s, v) => s + v.days_in_stock, 0) / bv.length) : 0;
      const interest = bv.reduce((s, v) => s + v.interest_cost, 0);
      return `- **${b}**: ${bv.length} ${isNl ? "voertuigen" : "vehicles"}, ${isNl ? "gem." : "avg."} ${avgD}${isNl ? "d" : "d"}, ${isNl ? "rente" : "interest"} ${euro(interest)}`;
    });
    return {
      role: "assistant",
      content: isNl
        ? `Overzicht van alle vestigingen:\n${branchLines.join("\n")}`
        : `Overview of all branches:\n${branchLines.join("\n")}`,
    };
  }

  // 4. Price queries
  if (matchesAny(q, ["cheapest", "expensive", "goedkoop", "duur", "duurste", "goedkoopste", "price reduction", "prijsverlaging"])) {
    if (matchesAny(q, ["cheapest", "goedkoop", "goedkoopste"])) {
      const cheapest = topN(vehicles, 3, (v) => v.price, false);
      const lines = cheapest.map(
        (v) => `- **${v.name}** — ${euro(v.price)} (${v.branch})`
      );
      return {
        role: "assistant",
        content: isNl
          ? `De 3 goedkoopste voertuigen:\n${lines.join("\n")}`
          : `The 3 cheapest vehicles:\n${lines.join("\n")}`,
        vehicleIds: cheapest.map((v) => v.id),
      };
    }
    if (matchesAny(q, ["expensive", "duur", "duurste"])) {
      const expensive = topN(vehicles, 3, (v) => v.price, true);
      const lines = expensive.map(
        (v) => `- **${v.name}** — ${euro(v.price)} (${v.branch})`
      );
      return {
        role: "assistant",
        content: isNl
          ? `De 3 duurste voertuigen:\n${lines.join("\n")}`
          : `The 3 most expensive vehicles:\n${lines.join("\n")}`,
        vehicleIds: expensive.map((v) => v.id),
      };
    }
    // Vehicles needing price reduction
    const needReduction = vehicles.filter((v) => v.discount_pct > 0);
    const lines = needReduction.slice(0, 5).map(
      (v) =>
        `- **${v.name}** — ${isNl ? "huidig" : "current"}: ${euro(v.price)}, ${isNl ? "geadviseerd" : "advised"}: ${euro(v.recommended_price)} (-${v.discount_pct}%)`
    );
    return {
      role: "assistant",
      content: isNl
        ? `**${needReduction.length}** voertuigen met prijsadvies:\n${lines.join("\n")}${needReduction.length > 5 ? `\n...en ${needReduction.length - 5} meer` : ""}`
        : `**${needReduction.length}** vehicles with price advice:\n${lines.join("\n")}${needReduction.length > 5 ? `\n...and ${needReduction.length - 5} more` : ""}`,
      vehicleIds: needReduction.slice(0, 5).map((v) => v.id),
    };
  }

  // 5. Interest / cost queries
  if (matchesAny(q, ["interest", "rente", "rentekosten", "cost", "kosten", "financing", "financiering"])) {
    const dailyCost = Math.round(kpis.total_interest_cost / (kpis.avg_days || 1));
    const top3 = topN(vehicles, 3, (v) => v.interest_cost, true);
    const lines = top3.map(
      (v) => `- **${v.name}** — ${euro(v.interest_cost)} (${v.days_in_stock}${isNl ? "d" : "d"})`
    );
    return {
      role: "assistant",
      content: isNl
        ? `Totale rentekosten: **${euro(kpis.total_interest_cost)}** over ${kpis.total_vehicles} voertuigen\nGem. kosten per dag: **${euro(dailyCost)}/dag**\n\nTop 3 hoogste rentekosten:\n${lines.join("\n")}`
        : `Total interest cost: **${euro(kpis.total_interest_cost)}** across ${kpis.total_vehicles} vehicles\nAvg. cost per day: **${euro(dailyCost)}/day**\n\nTop 3 highest interest cost:\n${lines.join("\n")}`,
      vehicleIds: top3.map((v) => v.id),
    };
  }

  // 6. Action / reduce queries
  if (matchesAny(q, ["reduce", "verlagen", "verlaging", "verlaagd", "reduction", "action", "actie", "acties", "todo", "to-do", "to do", "prijs verlaagd"])) {
    const actionVehicles = vehicles.filter((v) => v.pending_actions > 0);
    const priceReductions = vehicles.filter(
      (v) => v.action_items.some((a) => a.action_type === "price_reduction" && !a.completed)
    );
    const totalSavings = priceReductions.reduce(
      (sum, v) => sum + (v.price - v.recommended_price),
      0
    );
    const lines = priceReductions.slice(0, 4).map(
      (v) =>
        `- **${v.name}** — ${euro(v.price)} → ${euro(v.recommended_price)} (${isNl ? "bespaar" : "save"} ${euro(v.price - v.recommended_price)})`
    );
    return {
      role: "assistant",
      content: isNl
        ? `**${actionVehicles.length}** voertuigen met openstaande acties, waarvan **${priceReductions.length}** met prijsadvies:\n${lines.join("\n")}\n\nTotale potentiële aanpassing: **${euro(totalSavings)}**`
        : `**${actionVehicles.length}** vehicles with pending actions, of which **${priceReductions.length}** need price reduction:\n${lines.join("\n")}\n\nTotal potential adjustment: **${euro(totalSavings)}**`,
      vehicleIds: priceReductions.slice(0, 4).map((v) => v.id),
    };
  }

  // 7. Brand / type queries
  const brandPatterns: { pattern: string[]; brand: string }[] = [
    { pattern: ["man ", " man", "man"], brand: "MAN" },
    { pattern: ["vw", "volkswagen"], brand: "VW" },
    { pattern: ["ford"], brand: "Ford" },
    { pattern: ["renault"], brand: "Renault" },
    { pattern: ["mercedes", "benz"], brand: "Mercedes-Benz" },
    { pattern: ["peugeot"], brand: "Peugeot" },
    { pattern: ["toyota"], brand: "Toyota" },
  ];
  const typePatterns: { pattern: string[]; type: string }[] = [
    { pattern: ["truck", "trucks", "vrachtwagen", "vrachtwagens"], type: "truck" },
    { pattern: ["van", "vans", "bestelwagen", "bestelwagens", "bestel"], type: "van" },
  ];

  for (const bp of brandPatterns) {
    if (bp.pattern.some((p) => q === p || q.includes(p))) {
      const brandVehicles = vehicles.filter((v) => v.brand === bp.brand);
      if (brandVehicles.length === 0) {
        return {
          role: "assistant",
          content: isNl
            ? `Er zijn momenteel geen **${bp.brand}** voertuigen in voorraad.`
            : `There are currently no **${bp.brand}** vehicles in stock.`,
        };
      }
      const totalValue = brandVehicles.reduce((sum, v) => sum + v.price, 0);
      const avgDays = Math.round(
        brandVehicles.reduce((sum, v) => sum + v.days_in_stock, 0) / brandVehicles.length
      );
      return {
        role: "assistant",
        content: isNl
          ? `**${bp.brand}** — ${brandVehicles.length} voertuigen in voorraad\n- Totale waarde: **${euro(totalValue)}**\n- Gem. dagen in voorraad: **${avgDays}**\n- ${brandVehicles.filter((v) => v.status === "red").length} ${isNl ? "met actie vereist" : "need action"}`
          : `**${bp.brand}** — ${brandVehicles.length} vehicles in stock\n- Total value: **${euro(totalValue)}**\n- Avg. days in stock: **${avgDays}**\n- ${brandVehicles.filter((v) => v.status === "red").length} need action`,
        vehicleIds: brandVehicles.map((v) => v.id),
        action: { label: `Filter ${bp.brand}`, type: "filter", payload: `brand:${bp.brand}` },
      };
    }
  }

  for (const tp of typePatterns) {
    if (tp.pattern.some((p) => q.includes(p))) {
      const typeVehicles = vehicles.filter((v) => v.type === tp.type);
      const typeLabel = tp.type === "truck" ? (isNl ? "trucks" : "trucks") : (isNl ? "bestelwagens" : "vans");
      const totalValue = typeVehicles.reduce((sum, v) => sum + v.price, 0);
      const avgDays = typeVehicles.length
        ? Math.round(typeVehicles.reduce((sum, v) => sum + v.days_in_stock, 0) / typeVehicles.length)
        : 0;
      return {
        role: "assistant",
        content: isNl
          ? `**${typeVehicles.length}** ${typeLabel} in voorraad\n- Totale waarde: **${euro(totalValue)}**\n- Gem. dagen in voorraad: **${avgDays}**`
          : `**${typeVehicles.length}** ${typeLabel} in stock\n- Total value: **${euro(totalValue)}**\n- Avg. days in stock: **${avgDays}**`,
        vehicleIds: typeVehicles.map((v) => v.id),
        action: { label: `Filter ${typeLabel}`, type: "filter", payload: `type:${tp.type}` },
      };
    }
  }

  // 8. Count / overview queries
  if (matchesAny(q, ["how many", "hoeveel", "total", "totaal", "overview", "overzicht", "summary", "samenvatting"])) {
    const green = vehicles.filter((v) => v.status === "green").length;
    const amber = vehicles.filter((v) => v.status === "amber").length;
    const red = vehicles.filter((v) => v.status === "red").length;
    const trucks = vehicles.filter((v) => v.type === "truck").length;
    const vans = vehicles.filter((v) => v.type === "van").length;
    return {
      role: "assistant",
      content: isNl
        ? `Voorraadoverzicht: **${kpis.total_vehicles}** voertuigen\n\n${isNl ? "Status" : "Status"}: ${green} op schema, ${amber} aandacht, ${red} actie vereist\n${isNl ? "Type" : "Type"}: ${trucks} trucks, ${vans} bestelwagens\nGem. dagen: **${kpis.avg_days}** | Rentekosten: **${euro(kpis.total_interest_cost)}**`
        : `Inventory overview: **${kpis.total_vehicles}** vehicles\n\nStatus: ${green} on track, ${amber} attention, ${red} action required\nType: ${trucks} trucks, ${vans} vans\nAvg. days: **${kpis.avg_days}** | Interest cost: **${euro(kpis.total_interest_cost)}**`,
    };
  }

  // 9. Vehicle name/ID match
  const idMatch = q.match(/v\d{3}/i);
  if (idMatch) {
    const vehicle = vehicles.find((v) => v.id.toLowerCase() === idMatch[0].toLowerCase());
    if (vehicle) {
      return {
        role: "assistant",
        content: isNl
          ? `**${vehicle.name}** (${vehicle.id})\n- ${vehicle.branch} | ${vehicle.year} | ${vehicle.mileage > 0 ? vehicle.mileage.toLocaleString() + " km" : "Nieuw"}\n- Prijs: **${euro(vehicle.price)}** | Geadviseerd: **${euro(vehicle.recommended_price)}**\n- ${vehicle.days_in_stock} dagen in voorraad | Rente: **${euro(vehicle.interest_cost)}**\n- ${vehicle.pending_actions} openstaande acties`
          : `**${vehicle.name}** (${vehicle.id})\n- ${vehicle.branch} | ${vehicle.year} | ${vehicle.mileage > 0 ? vehicle.mileage.toLocaleString() + " km" : "New"}\n- Price: **${euro(vehicle.price)}** | Advised: **${euro(vehicle.recommended_price)}**\n- ${vehicle.days_in_stock} days in stock | Interest: **${euro(vehicle.interest_cost)}**\n- ${vehicle.pending_actions} pending actions`,
        vehicleIds: [vehicle.id],
        action: { label: isNl ? "Bekijk details" : "View details", type: "select", payload: vehicle.id },
      };
    }
  }

  // Name-based search: look for vehicle name parts
  const nameSearchTerms = ["tgx", "tgs", "tgm", "tgl", "crafter", "transporter", "caddy", "multivan", "ambulance", "refrigerated", "tipper", "container", "retarder", "box"];
  for (const term of nameSearchTerms) {
    if (q.includes(term)) {
      const matched = vehicles.filter((v) => v.name.toLowerCase().includes(term));
      if (matched.length === 1) {
        const v = matched[0];
        return {
          role: "assistant",
          content: isNl
            ? `**${v.name}** (${v.id})\n- ${v.branch} | ${v.year} | ${v.mileage > 0 ? v.mileage.toLocaleString() + " km" : "Nieuw"}\n- Prijs: **${euro(v.price)}** | Geadviseerd: **${euro(v.recommended_price)}**\n- ${v.days_in_stock} dagen in voorraad | Rente: **${euro(v.interest_cost)}**`
            : `**${v.name}** (${v.id})\n- ${v.branch} | ${v.year} | ${v.mileage > 0 ? v.mileage.toLocaleString() + " km" : "New"}\n- Price: **${euro(v.price)}** | Advised: **${euro(v.recommended_price)}**\n- ${v.days_in_stock} days in stock | Interest: **${euro(v.interest_cost)}**`,
          vehicleIds: [v.id],
          action: { label: isNl ? "Bekijk details" : "View details", type: "select", payload: v.id },
        };
      }
      if (matched.length > 1) {
        const lines = matched.map(
          (v) => `- **${v.name}** (${v.id}) — ${euro(v.price)}, ${v.days_in_stock}${isNl ? "d" : "d"}`
        );
        return {
          role: "assistant",
          content: isNl
            ? `${matched.length} voertuigen gevonden met "${term}":\n${lines.join("\n")}`
            : `Found ${matched.length} vehicles matching "${term}":\n${lines.join("\n")}`,
          vehicleIds: matched.map((v) => v.id),
        };
      }
    }
  }

  // 10. Fallback
  return {
    role: "assistant",
    content: isNl
      ? "Ik kon je vraag niet direct beantwoorden. Probeer een van deze onderwerpen:\n- \"Toon kritieke voertuigen\"\n- \"Wat zijn de rentekosten?\"\n- \"Overzicht vestiging Duiven\"\n- \"Welke voertuigen moeten in prijs verlaagd?\"\n- Een voertuig-ID zoals \"V001\" of naam zoals \"TGX\""
      : "I couldn't quite understand your question. Try one of these topics:\n- \"Show critical vehicles\"\n- \"What are the interest costs?\"\n- \"Branch overview for Duiven\"\n- \"Which vehicles need a price reduction?\"\n- A vehicle ID like \"V001\" or name like \"TGX\"",
  };
}

// ── Quick action chips ──────────────────────────────────────────────────
export const QUICK_ACTIONS = {
  en: [
    { label: "Critical vehicles", query: "Show critical vehicles" },
    { label: "Interest costs", query: "What are the total interest costs?" },
    { label: "Price reductions", query: "Which vehicles need a price reduction?" },
    { label: "Branch overview", query: "Give me an overview of all branches" },
  ],
  nl: [
    { label: "Kritieke voertuigen", query: "Toon kritieke voertuigen" },
    { label: "Rentekosten", query: "Wat zijn de totale rentekosten?" },
    { label: "Prijsverlagingen", query: "Welke voertuigen moeten in prijs verlaagd?" },
    { label: "Vestigingsoverzicht", query: "Geef een overzicht van alle vestigingen" },
  ],
};
