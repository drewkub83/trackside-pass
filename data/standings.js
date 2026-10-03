/* Championship points standings, one entry per series (SERIES in data/series.js). Refreshed after each
   round -- asOf says exactly what it's current through. classes: [{h: class, rows: [{pos, who, pts?, gap?}]}].
   pts is the entry's own point total; gap is used instead when only a margin (not a hard total) was
   published, or as a short note like "Clinched the title". Never invent a number -- a row with no pts or
   gap is still valid, it just names who's there. Shown in the Race Day hub's Standings card (which follows
   the same series as What to watch, top-of-table only) and its full sheet (every row).
   These are DRIVER standings, not manufacturer or team standings (IMSA publishes those separately) -- `who`
   should name the driver(s). Only attach a car number when that driver has raced the same car all season:
   in the prototype classes especially, a driver can move between teammates' cars mid-season (points follow
   the driver, not the car), so naming a fixed car number for someone who's since switched would be wrong --
   name the team/manufacturer instead and say so in `gap` if it's known (e.g. Laurin Heinrich below). */
const STANDINGS = [
  { s:"weathertech", asOf:"Current after Indianapolis (Sep 20). Petit Le Mans is the season finale.",
    classes:[
      { h:"GTP", rows:[
        { pos:1, who:"Jack Aitken (Whelen Cadillac, #31)", pts:147 },
        { pos:2, who:"Laurin Heinrich (Porsche Penske Motorsport)", gap:"Closest championship challenger. Has driven both Penske Porsche 963s this season and moves to the #7 for Petit Le Mans." }
      ] },
      { h:"LMP2", rows:[
        { pos:1, who:"Tom Dillmann, Jeremy Clarke (Inter Europol Competition)", gap:"Leads by 4 points" },
        { pos:2, who:"George Kurtz, Alex Quinn (CrowdStrike Racing by APR)", gap:"4 points back" },
        { pos:3, who:"Daniel Goldburg (#22 United Autosports USA)", gap:"101 points back, mathematically alive" },
        { pos:4, who:"PJ Hyett, Dane Cameron (#99 AO Racing)", gap:"108 points back, mathematically alive" }
      ] },
      { h:"GTD PRO", rows:[
        { pos:1, who:"Nicky Catsburg, Tommy Milner (#4 Corvette Racing)", gap:"Leads by 47 points" },
        { pos:2, who:"Connor De Phillippi, Neil Verhagen (#1 Paul Miller Racing)", gap:"47 points back" },
        { pos:3, who:"Andrea Caldarelli, Sandy Mitchell (Pfaff Motorsports)", gap:"53 points back (6 behind 2nd place)" }
      ] },
      { h:"GTD", rows:[
        { pos:1, who:"Philip Ellis, Russell Ward (#57 Winward Racing)", gap:"Leads by 6 points" },
        { pos:2, who:"Robby Foley, Patrick Gallagher (#96 Turner Motorsport)", gap:"6 points back" }
      ] }
    ],
    note:"GTP is a genuine two-driver fight -- IMSA's own preview names only Aitken and Heinrich as mathematically able to win it, so no 3rd-5th is shown. GTD PRO has 7 of 9 full-season cars still mathematically alive per that same preview, but only the top 3's exact gaps were confirmed; the others weren't named precisely enough to add without guessing. Sources: IMSA's own \"Tale of the Tape\" championship preview (Sep 24) plus Sportscar365 and RACER standings reports after Indianapolis." },
  { s:"pilot", asOf:"Current after the FOX Factory 120 season finale at Road Atlanta (Oct 2); the 2026 season is complete.",
    classes:[
      { h:"GS", rows:[
        { pos:1, who:"Austin Krainz, Stevan McAleer (#27 AutoTechnic Racing)", gap:"Clinched the 2026 GS title without winning a race all season, capped by a 3rd-place finish in the FOX Factory 120 at Road Atlanta." },
        { pos:2, who:"Dillon Machavern, Luca Mars (#95 Turner Motorsport)", gap:"Runner-up in the 2026 GS championship after leading most of the season; finished 4th in the FOX Factory 120." },
        { pos:3, who:"Robert Noaker, Finn Wiebelhaus (#13 McCumbee McAleer Racing)", gap:"40 points back entering Road Atlanta; final standing not confirmed in sources found." },
        { pos:4, who:"Michael Cooper, Moisey Uretsky (#44 Ibiza Farm Motorsport)", gap:"120 points back entering Road Atlanta; final standing not confirmed in sources found." },
        { pos:5, who:"Bryce Ward (#57 Winward Racing)", gap:"130 points back entering Road Atlanta; final standing not confirmed in sources found." }
      ] },
      { h:"TCR", rows:[
        { pos:1, who:"Mason Filippi, Bryson Morris (#33 Bryan Herta Autosport)", gap:"Clinched the 2026 TCR title by winning the FOX Factory 120 at Road Atlanta, their own teammates' closest challengers." },
        { pos:2, who:"Denis Dupont, Preston Brown (#76 Bryan Herta Autosport)", gap:"Entered Road Atlanta 200 points back; final standing not confirmed in sources found." }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24) plus RACER, Frontstretch and Sportscar365 FOX Factory 120 race reports, Oct 2, 2026 (via web search; direct fetch was blocked in this environment). Exact final point totals for the season weren't found, so gaps above describe what the race reports confirmed rather than a new points table." },
  { s:"vp", asOf:"Current after Race 2 of 2, the 2026 season finale, at Road Atlanta (Oct 2); both titles were already clinched in Race 1. Point totals below predate Road Atlanta (last updated after Canadian Tire Motorsport Park and VIR) since updated post-race totals weren't published in sources found.",
    classes:[
      { h:"LMP3", rows:[
        { pos:1, who:"Oscar Tunjo (#1 Gebhardt Intralogistics Motorsports)", gap:"Clinched the 2026 LMP3 title by finishing 2nd in Race 1 at Road Atlanta, one round early, then finished 2nd again in Race 2." },
        { pos:2, who:"Danny Soufi (Gebhardt Intralogistics Motorsports)", gap:"Tunjo's closest challenger and teammate; finished 3rd in Race 2 at Road Atlanta after his car slowed late in Race 1, triggering that race's only caution." },
        { pos:3, who:"Travis Hill (#2 Shopify Racing)", gap:"Beat Brian Thienes to the LMP3 Bronze Cup class win in Race 2 at Road Atlanta (4th overall) with a Turn 1 move after a restart, capping their season-long fight." },
        { pos:4, who:"Brian Thienes (#77 Forte Racing)", gap:"Finished 5th overall in Race 2 at Road Atlanta, denied the Bronze Cup class win by Hill's late move." }
      ] },
      { h:"GSX", rows:[
        { pos:1, who:"Westin Workman (#8 RAFA Racing)", pts:2680, gap:"Clinched the 2026 GSX title by winning Race 1 at Road Atlanta, then swept the weekend by winning Race 2 as well, beating Courtney Crone by 9.424 seconds." },
        { pos:2, who:"Courtney Crone (#35 CarBahn Motorsports)", pts:2280 },
        { pos:3, who:"Rafa Martinez", pts:1990 }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), IMSA.com race reports from Canadian Tire Motorsport Park and VIR, and Sportscar365/SPEED SPORT Race 1 and Race 2 reports from Road Atlanta, Oct 1-2, 2026 (via web search; direct site fetches were blocked in this environment). Point totals above predate Road Atlanta." },
  { s:"mx5", asOf:"Current after the season finale (Race 2 of 2) at Road Atlanta (Oct 2). Bobby Gossett is the 2026 Whelen Mazda MX-5 Cup champion.",
    classes:[
      { h:"Championship", rows:[
        { pos:1, who:"Bobby Gossett (#44 BSI Racing)", gap:"2026 champion. Won Race 1 at Road Atlanta from 22nd on the grid, then finished 9th in Race 2, enough to clinch the title." },
        { pos:2, who:"Justin Adakonis (#23 McCumbee McAleer Racing)", gap:"Entered the Race 2 finale needing to overcome a points gap to Gossett; his own Race 2 finish and final championship position weren't confirmed in sources found." },
        { pos:3, who:"Jared Thomas (#96 JTR Motorsports Engineering)", gap:"One of the three drivers still mathematically alive for the title entering the Race 2 finale; his final championship position wasn't confirmed in sources found." }
      ] }
    ],
    note:"Sources: IMSA.com (\"DeLong Scores Win, Gossett Takes Mazda MX-5 Cup Championship at Michelin Raceway Road Atlanta\"), RACER (\"Gossett builds MX-5 Cup point lead with Road Atlanta win\") and SPEED SPORT, Oct 1-2, 2026 (via web search; direct site fetches were blocked in this environment). Final championship point totals weren't published in sources found, so positions 2-3 reflect who entered the finale in the title fight rather than a confirmed final order." },
  { s:"carrera", asOf:"Current after Race 2 of 2 at Road Atlanta (Oct 2), a weekend sweep for Maxson; the Circuit of the Americas round closes the season.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Tyler Maxson (TOPP Racing)", gap:"Entered Race 2 leading by 19 points, then swept the weekend with his eighth win of the season, beating Jeansonne by 5.020 seconds (new points gap not published in sources found)." },
        { pos:2, who:"Aaron Jeansonne (Kellymoss)", gap:"Finished 2nd again in Race 2 at Road Atlanta; new points gap not published in sources found." },
        { pos:3, who:"Callum Hedge (JDX Racing)", gap:"Finished 3rd in Race 2 at Road Atlanta." },
        { pos:4, who:"Janne Stiak (ACI Motorsports)", gap:"Finished 4th in Race 2 at Road Atlanta." },
        { pos:5, who:"Jared Thomas (JTR Motorsports Engineering)", gap:"Finished 5th in Race 2 at Road Atlanta, after 4th in Race 1." }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Patrick Mulcahy (ACI Motorsports)", gap:"Clinched the Pro-Am title at Indianapolis, then raced unopposed in both races at Road Atlanta." }
      ] },
      { h:"Masters", rows:[
        { pos:1, who:"Marco Cirone (ACI Motorsports)", gap:"Extended his lead further by winning Race 2 at Road Atlanta, beating Rob Walker by 1.452 seconds (new points gap not published in sources found)." },
        { pos:2, who:"Rob Walker (JTR Motorsports Engineering)", gap:"Finished 2nd in Race 2 at Road Atlanta." },
        { pos:3, who:"Scott Blind (Ruckus Racing)", gap:"The defending champion; won Masters in Race 1 at Road Atlanta but finished 3rd in Race 2 after an off-course excursion, still trailing Cirone in points." },
        { pos:4, who:"Richard Edge (ACI Motorsports)", gap:"Finished 2nd in the Masters class in Race 1 at Road Atlanta." }
      ] }
    ],
    note:"Pro and Masters positions below the top of each class are named from recent race reports, not an official points table -- their order isn't confirmed, and no points figures are shown for them since none were published. Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), Porsche Motorsport North America, Sportscar365 and GT REPORT race reports from Indianapolis and both Road Atlanta races (Oct 1-2, 2026, via web search; direct site fetches were blocked in this environment). Alan Metni (Kellymoss) won the Pro-Am race at Road Atlanta Race 1, his second win of the season, but Mulcahy's title was already clinched." }
];
