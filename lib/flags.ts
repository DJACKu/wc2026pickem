// FIFA 3-letter code → flagcdn code (ISO 3166-1 alpha-2, lowercased, with
// subdivision suffix when needed). Windows ne rend pas les emojis drapeaux,
// donc on sert des SVG depuis flagcdn.com.

export const FIFA_TO_FLAG: Record<string, string> = {
  // Groupe A
  MEX: "mx", KOR: "kr", RSA: "za", CZE: "cz",
  // Groupe B
  CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
  // Groupe C
  BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht",
  // Groupe D
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  // Groupe E
  GER: "de", ECU: "ec", CIV: "ci", CUW: "cw",
  // Groupe F
  NED: "nl", JPN: "jp", TUN: "tn", SWE: "se",
  // Groupe G
  BEL: "be", IRN: "ir", EGY: "eg", NZL: "nz",
  // Groupe H
  ESP: "es", URU: "uy", KSA: "sa", CPV: "cv",
  // Groupe I
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  // Groupe J
  ARG: "ar", AUT: "at", ALG: "dz", JOR: "jo",
  // Groupe K
  POR: "pt", COL: "co", UZB: "uz", COD: "cd",
  // Groupe L
  ENG: "gb-eng", CRO: "hr", PAN: "pa", GHA: "gh",
};

export function flagSvgUrl(fifaCode: string): string {
  const iso = FIFA_TO_FLAG[fifaCode] ?? "un";
  return `https://flagcdn.com/${iso}.svg`;
}
