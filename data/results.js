/* How it finished, one entry per completed race per series (like data/watch.js). Written after official
   results are posted. t = track id, d = event start day, s = series id (SERIES in data/series.js, so a
   weekend with several series -- Barber, Road Atlanta -- gets one entry per race, not one for the whole
   weekend), event = the race's name, groups = [{h: class, ...}]. Shown in place of the pre-race "cars to
   watch" list (Info tab) and as a "How it finished" card in the Race Day hub right after that series' race
   ends. Facts are only what published race reports said -- never guessed or inferred from standings.
   Each group is EITHER:
     - order: the finishing order, one string per position ("1. #24 BMW M Team WRT — van der Linde/Vanthoor"),
       as many places as the source actually gives (the Race Day hub shows the first 5, the Info tab all of
       them) -- use this when a real finishing order was published, which is the normal case; OR
     - the older winner/gap/podium shape (a single winner line plus an optional couple of names below it),
       kept for entries where only the winner was confirmed. */
const RESULTS = [
  { t:"indianapolis", d:"2026-09-18", s:"weathertech", event:"TireRack.com Battle on the Bricks",
    groups:[
      { h:"GTP", winner:"#24 BMW M Team WRT BMW M Hybrid V8 — Sheldon van der Linde, Dries Vanthoor",
        gap:"Won with a late pass of the #31, by 2.926 seconds at the line — the team's first IMSA win.",
        podium:["#31 Whelen Cadillac V-Series.R — Earl Bamber, Jack Aitken"] },
      { h:"LMP2", winner:"#18 Era Motorsport ORECA 07-Gibson — Christian Rasmussen, Nick Boulle",
        gap:"Class win." },
      { h:"GTD PRO", winner:"#64 Ford Racing Ford Mustang GT3 — Dennis Olsen, Ben Barker",
        gap:"Won by 0.993 seconds over the #4 Corvette on the last lap.",
        podium:["#4 Corvette Racing Corvette Z06 GT3.R — Nicky Catsburg, Tommy Milner","#9 Pfaff Motorsports Lamborghini Temerario GT3 — Andrea Caldarelli, Sandy Mitchell"] },
      { h:"GTD", winner:"#96 Turner Motorsport BMW — Robby Foley, Patrick Gallagher",
        gap:"The team's first win at Indianapolis, and its 26th class win overall.",
        podium:["#57 Winward Racing Mercedes-AMG GT3 EVO — Philip Ellis, Russell Ward"] }
    ],
    note:"Source: IMSA.com race report, Sportscar365 and Daily Sportscar post-race notebooks, motorsport.com." },
  { t:"road-atlanta", d:"2026-09-30", s:"vp", event:"Race 1 of 2",
    groups:[
      { h:"LMP3", order:[
        "1. #18 Forbush Performance Duqueine D09 — Jules Caranta",
        "2. #1 Gebhardt Intralogistics Motorsports Duqueine D09 — Oscar Tunjo"
      ] },
      { h:"GSX", order:[
        "1. #8 RAFA Racing Toyota GR Supra GT4 EVO2 — Westin Workman"
      ] }
    ],
    note:"Sources: Sportscar365 (\"Caranta Claims First IMSA Win; Tunjo, Workman Wrap Up Titles\") and Daily Sportscar race reports, Oct 1, 2026 (via web search; direct fetch of imsa.com/sportscar365.com was blocked in this environment). Caranta led flag-to-flag for his first career IMSA win, 11.781 seconds ahead of Tunjo, which clinched the 2026 LMP3 title for Tunjo a round early. Workman's win clinched the 2026 GSX title. No finishers beyond 2nd (LMP3) or the winner (GSX) could be confirmed from available sources." },
  { t:"road-atlanta", d:"2026-09-30", s:"mx5", event:"Race 1 of 2",
    groups:[
      { h:"Championship", order:[
        "1. #44 BSI Racing — Bobby Gossett",
        "2. #23 McCumbee McAleer Racing — Justin Adakonis",
        "3. #96 JTR Motorsports Engineering — Jared Thomas",
        "4. #11 Advanced Autosports — Matt Novak"
      ] }
    ],
    note:"Sources: RACER (\"Gossett builds MX-5 Cup point lead with Road Atlanta win\") and SPEED SPORT (\"Gossett Closes On Title With Atlanta MX-5 Romp\"), Oct 2, 2026 (via web search; direct fetch of racer.com/speedsport.com was blocked in this environment). Gossett started 22nd and won by 0.320 seconds after seven lead changes. No finishers beyond 4th could be confirmed; a separately reported 5th place wasn't corroborated across sources, so it's left out." },
  { t:"road-atlanta", d:"2026-09-30", s:"carrera", event:"Race 1 of 2",
    groups:[
      { h:"Pro", order:[
        "1. #77 TOPP Racing — Tyler Maxson",
        "2. #24 Kellymoss — Aaron Jeansonne",
        "3. TOPP Racing — Cole Kleck",
        "4. JTR Motorsports Engineering — Jared Thomas"
      ] },
      { h:"Pro-Am", order:[
        "1. #99 Kellymoss — Alan Metni"
      ] },
      { h:"Masters", order:[
        "1. Ruckus Racing — Scott Blind",
        "2. Richard Edge"
      ] }
    ],
    note:"Sources: Porsche Motorsport North America (\"Maxson, Cirone strengthen championship leads at Road Atlanta\") and Sportscar365 (\"Maxson Takes Race 1 Win at Road Atlanta\"), Oct 1, 2026 (via web search; direct fetch of racing.porsche.com/sportscar365.com was blocked in this environment). Maxson passed Jeansonne for the lead with about 10 minutes left; contact between the two at Turn 7 during the move was reported under stewards' review, with no decision confirmed in sources found. Cole Kleck's car number for this race wasn't independently confirmed, so none is given. No finishers beyond 4th (Pro) or the named class winners (Pro-Am, Masters) could be confirmed." }
];
