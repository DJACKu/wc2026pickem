// WC 2026 — données du tournoi (extraites de la roadmap)
// Chaque équipe: { code FIFA, name FR, flag emoji }

window.WC26 = {
  groups: {
    A: [
      { code: "MEX", name: "Mexique",        flag: "🇲🇽" },
      { code: "KOR", name: "Corée du Sud",   flag: "🇰🇷" },
      { code: "RSA", name: "Afrique du Sud", flag: "🇿🇦" },
      { code: "CZE", name: "Tchéquie",       flag: "🇨🇿" },
    ],
    B: [
      { code: "CAN", name: "Canada",            flag: "🇨🇦" },
      { code: "SUI", name: "Suisse",            flag: "🇨🇭" },
      { code: "QAT", name: "Qatar",             flag: "🇶🇦" },
      { code: "BIH", name: "Bosnie",            flag: "🇧🇦" },
    ],
    C: [
      { code: "BRA", name: "Brésil", flag: "🇧🇷" },
      { code: "MAR", name: "Maroc",  flag: "🇲🇦" },
      { code: "SCO", name: "Écosse", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      { code: "HAI", name: "Haïti",  flag: "🇭🇹" },
    ],
    D: [
      { code: "USA", name: "USA",       flag: "🇺🇸" },
      { code: "PAR", name: "Paraguay",  flag: "🇵🇾" },
      { code: "AUS", name: "Australie", flag: "🇦🇺" },
      { code: "TUR", name: "Turquie",   flag: "🇹🇷" },
    ],
    E: [
      { code: "GER", name: "Allemagne",      flag: "🇩🇪" },
      { code: "ECU", name: "Équateur",       flag: "🇪🇨" },
      { code: "CIV", name: "Côte d'Ivoire",  flag: "🇨🇮" },
      { code: "CUW", name: "Curaçao",        flag: "🇨🇼" },
    ],
    F: [
      { code: "NED", name: "Pays-Bas", flag: "🇳🇱" },
      { code: "JPN", name: "Japon",    flag: "🇯🇵" },
      { code: "TUN", name: "Tunisie",  flag: "🇹🇳" },
      { code: "SWE", name: "Suède",    flag: "🇸🇪" },
    ],
    G: [
      { code: "BEL", name: "Belgique",        flag: "🇧🇪" },
      { code: "IRN", name: "Iran",            flag: "🇮🇷" },
      { code: "EGY", name: "Égypte",          flag: "🇪🇬" },
      { code: "NZL", name: "Nouvelle-Zélande", flag: "🇳🇿" },
    ],
    H: [
      { code: "ESP", name: "Espagne",         flag: "🇪🇸" },
      { code: "URU", name: "Uruguay",         flag: "🇺🇾" },
      { code: "KSA", name: "Arabie Saoudite", flag: "🇸🇦" },
      { code: "CPV", name: "Cap-Vert",        flag: "🇨🇻" },
    ],
    I: [
      { code: "FRA", name: "France",  flag: "🇫🇷" },
      { code: "SEN", name: "Sénégal", flag: "🇸🇳" },
      { code: "NOR", name: "Norvège", flag: "🇳🇴" },
      { code: "IRQ", name: "Irak",    flag: "🇮🇶" },
    ],
    J: [
      { code: "ARG", name: "Argentine", flag: "🇦🇷" },
      { code: "AUT", name: "Autriche",  flag: "🇦🇹" },
      { code: "ALG", name: "Algérie",   flag: "🇩🇿" },
      { code: "JOR", name: "Jordanie",  flag: "🇯🇴" },
    ],
    K: [
      { code: "POR", name: "Portugal",    flag: "🇵🇹" },
      { code: "COL", name: "Colombie",    flag: "🇨🇴" },
      { code: "UZB", name: "Ouzbékistan", flag: "🇺🇿" },
      { code: "COD", name: "RD Congo",    flag: "🇨🇩" },
    ],
    L: [
      { code: "ENG", name: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "CRO", name: "Croatie",    flag: "🇭🇷" },
      { code: "PAN", name: "Panama",     flag: "🇵🇦" },
      { code: "GHA", name: "Ghana",      flag: "🇬🇭" },
    ],
  },

  phases: [
    { id: "groups", label: "Phase de poules", dates: "11 → 27 juin",       lock: "11 juin · 16h00 UTC",  status: "open"     },
    { id: "r32",    label: "16es de finale",  dates: "28 juin → 3 juillet", lock: "28 juin · 16h00 UTC",  status: "upcoming" },
    { id: "r16",    label: "8es de finale",   dates: "4 → 7 juillet",       lock: "4 juillet · 18h00 UTC",status: "upcoming" },
    { id: "qf",     label: "Quarts",          dates: "9 → 11 juillet",      lock: "9 juillet · 20h00 UTC",status: "upcoming" },
    { id: "sf",     label: "Demi-finales",    dates: "14 → 15 juillet",     lock: "14 juillet · 20h00 UTC",status: "upcoming" },
    { id: "final",  label: "Finales",         dates: "18 → 19 juillet",     lock: "18 juillet · 20h00 UTC",status: "upcoming" },
  ],

  // Quelques joueurs fictifs pour le classement
  players: [
    { handle: "kev",        name: "Kevin",      pts: 0, locked: true,  avatarHue: 15  },
    { handle: "leo",        name: "Léo",        pts: 0, locked: true,  avatarHue: 160 },
    { handle: "marine.b",   name: "Marine",     pts: 0, locked: true,  avatarHue: 280 },
    { handle: "thom",       name: "Thomas",     pts: 0, locked: false, avatarHue: 40  },
    { handle: "juju23",     name: "Julien",     pts: 0, locked: true,  avatarHue: 200 },
    { handle: "sasha",      name: "Sasha",      pts: 0, locked: true,  avatarHue: 340 },
    { handle: "antho",      name: "Anthony",    pts: 0, locked: false, avatarHue: 95  },
    { handle: "clemd",      name: "Clémence",   pts: 0, locked: true,  avatarHue: 320 },
    { handle: "yan_le_b",   name: "Yann",       pts: 0, locked: true,  avatarHue: 220 },
    { handle: "lou",        name: "Lou",        pts: 0, locked: true,  avatarHue: 50  },
    { handle: "vincent.k",  name: "Vincent",    pts: 0, locked: false, avatarHue: 180 },
    { handle: "alice_m",    name: "Alice",      pts: 0, locked: true,  avatarHue: 5   },
  ],
};
