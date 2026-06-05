// Source: ROADMAP §2.2 — groupes WC 2026 confirmés post-barrages, mars 2026.
// Codes : FIFA 3 lettres. flag_emoji utilisé tant qu'on n'a pas de SVG.

export type SeedTeam = {
  id: string;
  nameFr: string;
  nameEn: string;
  groupLetter: string;
  flagEmoji: string;
};

export const seedTeams: SeedTeam[] = [
  // Groupe A
  { id: "MEX", nameFr: "Mexique", nameEn: "Mexico", groupLetter: "A", flagEmoji: "🇲🇽" },
  { id: "KOR", nameFr: "Corée du Sud", nameEn: "South Korea", groupLetter: "A", flagEmoji: "🇰🇷" },
  { id: "RSA", nameFr: "Afrique du Sud", nameEn: "South Africa", groupLetter: "A", flagEmoji: "🇿🇦" },
  { id: "CZE", nameFr: "Tchéquie", nameEn: "Czech Republic", groupLetter: "A", flagEmoji: "🇨🇿" },
  // Groupe B
  { id: "CAN", nameFr: "Canada", nameEn: "Canada", groupLetter: "B", flagEmoji: "🇨🇦" },
  { id: "SUI", nameFr: "Suisse", nameEn: "Switzerland", groupLetter: "B", flagEmoji: "🇨🇭" },
  { id: "QAT", nameFr: "Qatar", nameEn: "Qatar", groupLetter: "B", flagEmoji: "🇶🇦" },
  { id: "BIH", nameFr: "Bosnie-Herzégovine", nameEn: "Bosnia and Herzegovina", groupLetter: "B", flagEmoji: "🇧🇦" },
  // Groupe C
  { id: "BRA", nameFr: "Brésil", nameEn: "Brazil", groupLetter: "C", flagEmoji: "🇧🇷" },
  { id: "MAR", nameFr: "Maroc", nameEn: "Morocco", groupLetter: "C", flagEmoji: "🇲🇦" },
  { id: "SCO", nameFr: "Écosse", nameEn: "Scotland", groupLetter: "C", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "HAI", nameFr: "Haïti", nameEn: "Haiti", groupLetter: "C", flagEmoji: "🇭🇹" },
  // Groupe D
  { id: "USA", nameFr: "États-Unis", nameEn: "United States", groupLetter: "D", flagEmoji: "🇺🇸" },
  { id: "PAR", nameFr: "Paraguay", nameEn: "Paraguay", groupLetter: "D", flagEmoji: "🇵🇾" },
  { id: "AUS", nameFr: "Australie", nameEn: "Australia", groupLetter: "D", flagEmoji: "🇦🇺" },
  { id: "TUR", nameFr: "Turquie", nameEn: "Turkey", groupLetter: "D", flagEmoji: "🇹🇷" },
  // Groupe E
  { id: "GER", nameFr: "Allemagne", nameEn: "Germany", groupLetter: "E", flagEmoji: "🇩🇪" },
  { id: "ECU", nameFr: "Équateur", nameEn: "Ecuador", groupLetter: "E", flagEmoji: "🇪🇨" },
  { id: "CIV", nameFr: "Côte d'Ivoire", nameEn: "Ivory Coast", groupLetter: "E", flagEmoji: "🇨🇮" },
  { id: "CUW", nameFr: "Curaçao", nameEn: "Curaçao", groupLetter: "E", flagEmoji: "🇨🇼" },
  // Groupe F
  { id: "NED", nameFr: "Pays-Bas", nameEn: "Netherlands", groupLetter: "F", flagEmoji: "🇳🇱" },
  { id: "JPN", nameFr: "Japon", nameEn: "Japan", groupLetter: "F", flagEmoji: "🇯🇵" },
  { id: "TUN", nameFr: "Tunisie", nameEn: "Tunisia", groupLetter: "F", flagEmoji: "🇹🇳" },
  { id: "SWE", nameFr: "Suède", nameEn: "Sweden", groupLetter: "F", flagEmoji: "🇸🇪" },
  // Groupe G
  { id: "BEL", nameFr: "Belgique", nameEn: "Belgium", groupLetter: "G", flagEmoji: "🇧🇪" },
  { id: "IRN", nameFr: "Iran", nameEn: "Iran", groupLetter: "G", flagEmoji: "🇮🇷" },
  { id: "EGY", nameFr: "Égypte", nameEn: "Egypt", groupLetter: "G", flagEmoji: "🇪🇬" },
  { id: "NZL", nameFr: "Nouvelle-Zélande", nameEn: "New Zealand", groupLetter: "G", flagEmoji: "🇳🇿" },
  // Groupe H
  { id: "ESP", nameFr: "Espagne", nameEn: "Spain", groupLetter: "H", flagEmoji: "🇪🇸" },
  { id: "URU", nameFr: "Uruguay", nameEn: "Uruguay", groupLetter: "H", flagEmoji: "🇺🇾" },
  { id: "KSA", nameFr: "Arabie Saoudite", nameEn: "Saudi Arabia", groupLetter: "H", flagEmoji: "🇸🇦" },
  { id: "CPV", nameFr: "Cap-Vert", nameEn: "Cape Verde", groupLetter: "H", flagEmoji: "🇨🇻" },
  // Groupe I
  { id: "FRA", nameFr: "France", nameEn: "France", groupLetter: "I", flagEmoji: "🇫🇷" },
  { id: "SEN", nameFr: "Sénégal", nameEn: "Senegal", groupLetter: "I", flagEmoji: "🇸🇳" },
  { id: "NOR", nameFr: "Norvège", nameEn: "Norway", groupLetter: "I", flagEmoji: "🇳🇴" },
  { id: "IRQ", nameFr: "Irak", nameEn: "Iraq", groupLetter: "I", flagEmoji: "🇮🇶" },
  // Groupe J
  { id: "ARG", nameFr: "Argentine", nameEn: "Argentina", groupLetter: "J", flagEmoji: "🇦🇷" },
  { id: "AUT", nameFr: "Autriche", nameEn: "Austria", groupLetter: "J", flagEmoji: "🇦🇹" },
  { id: "ALG", nameFr: "Algérie", nameEn: "Algeria", groupLetter: "J", flagEmoji: "🇩🇿" },
  { id: "JOR", nameFr: "Jordanie", nameEn: "Jordan", groupLetter: "J", flagEmoji: "🇯🇴" },
  // Groupe K
  { id: "POR", nameFr: "Portugal", nameEn: "Portugal", groupLetter: "K", flagEmoji: "🇵🇹" },
  { id: "COL", nameFr: "Colombie", nameEn: "Colombia", groupLetter: "K", flagEmoji: "🇨🇴" },
  { id: "UZB", nameFr: "Ouzbékistan", nameEn: "Uzbekistan", groupLetter: "K", flagEmoji: "🇺🇿" },
  { id: "COD", nameFr: "RD Congo", nameEn: "DR Congo", groupLetter: "K", flagEmoji: "🇨🇩" },
  // Groupe L
  { id: "ENG", nameFr: "Angleterre", nameEn: "England", groupLetter: "L", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "CRO", nameFr: "Croatie", nameEn: "Croatia", groupLetter: "L", flagEmoji: "🇭🇷" },
  { id: "PAN", nameFr: "Panama", nameEn: "Panama", groupLetter: "L", flagEmoji: "🇵🇦" },
  { id: "GHA", nameFr: "Ghana", nameEn: "Ghana", groupLetter: "L", flagEmoji: "🇬🇭" },
];

export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

// Phases : id, label, opens_at, locks_at (UTC). Les locks_at sont des placeholders
// raisonnables (cf. ROADMAP §2.3) ; l'admin peut les ajuster avant chaque phase.
export const seedPhases = [
  {
    id: "groups",
    labelFr: "Phase de groupes",
    opensAt: new Date("2026-05-01T00:00:00Z"),
    locksAt: new Date("2026-06-11T17:00:00Z"), // coup d'envoi (Estadio Azteca, ~11h CT)
    sortOrder: 1,
  },
  {
    id: "r32",
    labelFr: "16es de finale",
    opensAt: new Date("2026-06-27T22:00:00Z"),
    locksAt: new Date("2026-06-28T16:00:00Z"),
    sortOrder: 2,
  },
  {
    id: "r16",
    labelFr: "8es de finale",
    opensAt: new Date("2026-07-03T22:00:00Z"),
    locksAt: new Date("2026-07-04T16:00:00Z"),
    sortOrder: 3,
  },
  {
    id: "qf",
    labelFr: "Quarts de finale",
    opensAt: new Date("2026-07-08T00:00:00Z"),
    locksAt: new Date("2026-07-09T16:00:00Z"),
    sortOrder: 4,
  },
  {
    id: "sf",
    labelFr: "Demi-finales",
    opensAt: new Date("2026-07-12T00:00:00Z"),
    locksAt: new Date("2026-07-14T16:00:00Z"),
    sortOrder: 5,
  },
  {
    id: "final",
    labelFr: "Petite finale + Finale",
    opensAt: new Date("2026-07-16T00:00:00Z"),
    locksAt: new Date("2026-07-18T16:00:00Z"),
    sortOrder: 6,
  },
] as const;
