/* Championships shown on the home screen, one entry per series.
   match/skip: how a race is found in a track's `events` (by its series text `s`) -- or, for a support series
          (viaSupport:true), by the event's `support` list instead, since it never headlines its own weekend.
   optIn: a series that is off by default: either a support series that rides along with a main series, or a niche series
          (HSR) with its own weekends. The fan turns it on in Settings ("Series I follow") if they actually follow it.
          Never shown in the home hero's "X + Y" headline, and it stays off the home screen until turned on.
   stops: venues that are on the series schedule but have no map yet. They show in that series' list as "Map coming soon"
          and disappear from here automatically once a track with the same id is added to data/.
   showAll: also list every other venue in the app as "date to be announced" (IMSA does this).
   Sources: INDYCAR.com (2027 Phase One schedule, announced Aug 12, 2026), IMSA.com, SRO America (provisional 2027 calendar, June 26, 2026),
   GT World Challenge Europe (gt-world-challenge-europe.com calendar, checked Oct 7, 2026). */
/* the day schedules, lists of cars and drivers to watch and support races were last checked (shown in Settings). Update it whenever they are refreshed. */
const DATA_UPDATED = "2026-10-07";
const CHAMPS = [
  { id:"imsa", name:"IMSA", tile:"IMSA", full:"WeatherTech SportsCar Championship", match:/IMSA/i, skip:/test/i, guide:"weathertech",
    note:"Every venue on the 2027 IMSA WeatherTech schedule, including the Long Beach and Detroit street circuits and Canadian Tire Motorsport Park, plus Mid-Ohio." },
  { id:"indycar", name:"IndyCar", tile:"INDY", full:"NTT INDYCAR SERIES", match:/INDYCAR/i, guide:"indycar",
    note:"These are the first eight races of the 2027 season. INDYCAR will announce the rest in the coming weeks, and we will add them here. Race weekends run Friday to Sunday.",
    stops:[
      { id:"st-petersburg", short:"St. Petersburg", place:"St. Petersburg, Florida", kind:"Street circuit", e:"Firestone Grand Prix of St. Petersburg", d:"2027-03-05", t:3 },
      { id:"arlington",     short:"Arlington",      place:"Arlington, Texas",        kind:"Street circuit", e:"Java House Grand Prix of Arlington",     d:"2027-03-19", t:3 }
    ] },
  { id:"gtwca", name:"GT World Challenge", tile:"GTWC", full:"GT World Challenge America Powered by AWS", match:/GT World Challenge America|Texas 8 Hour/i, guide:"gtwca",
    note:"Barber (Sep 25-27) and the Indianapolis 8 Hour (Oct 9-11) finish the 2026 season. Then the provisional 2027 calendar: seven rounds, including the first Texas 8 Hour at Circuit of the Americas and the return of Watkins Glen. Dates can still change.",
    stops:[
      { id:"sonoma", short:"Sonoma", place:"Sonoma, California", kind:"Road course", e:"GT World Challenge America", d:"2027-04-02", t:3 },
      { id:"cota",   short:"COTA", place:"Austin, Texas", kind:"Road course", e:"Texas 8 Hour", d:"2027-05-07", t:3 }
    ] },
  { id:"gtwce", name:"GT World Europe", tile:"GTWE", full:"GT World Challenge Europe Powered by AWS", match:/GT World Challenge Europe|24 Hours of Spa/i, guide:"gtwce",
    note:"Portimão finishes the 2026 season (Oct 15-18). The 2027 calendar is ten rounds across Europe, five Endurance Cup and five Sprint Cup, with the CrowdStrike 24 Hours of Spa as the marquee event. Dates come from GT World's published calendar. Circuits show Map coming soon until their maps are added.",
    stops:[
      { id:"portimao",            short:"Portimão",          place:"Portimão, Portugal",            kind:"Road course", e:"GT World Challenge Europe: Portimão (Endurance Cup finale)", d:"2026-10-15", t:4 },
      { id:"paul-ricard",         short:"Paul Ricard",       place:"Le Castellet, France",          kind:"Road course", e:"GT World Challenge Europe: Paul Ricard (Endurance Cup)",     d:"2027-04-15", t:4 },
      { id:"brands-hatch",        short:"Brands Hatch",      place:"Kent, England",                 kind:"Road course", e:"GT World Challenge Europe: Brands Hatch (Sprint Cup)",       d:"2027-05-01", t:2 },
      { id:"imola",               short:"Imola",             place:"Imola, Italy",                  kind:"Road course", e:"GT World Challenge Europe: Imola (Endurance Cup)",           d:"2027-05-21", t:3 },
      { id:"spa-francorchamps",   short:"Spa-Francorchamps", place:"Stavelot, Belgium",             kind:"Road course", e:"CrowdStrike 24 Hours of Spa",                                d:"2027-06-24", t:4 },
      { id:"misano",              short:"Misano",            place:"Misano Adriatico, Italy",       kind:"Road course", e:"GT World Challenge Europe: Misano (Sprint Cup)",             d:"2027-07-16", t:3 },
      { id:"magny-cours",         short:"Magny-Cours",       place:"Magny-Cours, France",           kind:"Road course", e:"GT World Challenge Europe: Magny-Cours (Sprint Cup)",        d:"2027-07-30", t:3 },
      { id:"nurburgring",         short:"Nürburgring",       place:"Nürburg, Germany",              kind:"Road course", e:"GT World Challenge Europe: Nürburgring (Endurance Cup)",     d:"2027-08-27", t:3 },
      { id:"zandvoort",           short:"Zandvoort",         place:"Zandvoort, Netherlands",        kind:"Road course", e:"GT World Challenge Europe: Zandvoort (Sprint Cup)",          d:"2027-09-17", t:3 },
      { id:"hungaroring",         short:"Hungaroring",       place:"Budapest, Hungary",             kind:"Road course", e:"GT World Challenge Europe: Budapest (Sprint Cup)",           d:"2027-10-01", t:3 },
      { id:"barcelona-catalunya", short:"Barcelona",         place:"Montmeló, Spain",               kind:"Road course", e:"GT World Challenge Europe: Barcelona (Endurance Cup)",       d:"2027-10-22", t:3 }
    ] },
  { id:"carreracup", name:"Porsche Carrera Cup", tile:"CARR", full:"Porsche Carrera Cup North America", match:/Porsche Carrera Cup/i, viaSupport:true, optIn:true,
    note:"Races as a support series at IMSA WeatherTech weekends. Its own dates and venues follow that weekend's schedule." },
  { id:"pilotchallenge", name:"Pilot Challenge", tile:"MPC", full:"Michelin Pilot Challenge", match:/Michelin Pilot Challenge/i, viaSupport:true, optIn:true,
    note:"Races as a support series at IMSA WeatherTech weekends. Its own dates and venues follow that weekend's schedule." },
  { id:"hsr", name:"HSR", tile:"HSR", full:"Historic Sportscar Racing", match:/HSR/i, optIn:true,
    note:"Vintage and historic sports and race cars, with its own race weekends at Daytona, Sebring, Road Atlanta and Watkins Glen. Dates come from HSR's published schedule; several are still provisional and can change." }
];
