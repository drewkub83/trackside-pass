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
  { s:"pilot", asOf:"Current after Indianapolis (Sep 20). The FOX Factory 120 on Oct 2 is the season finale.",
    classes:[
      { h:"GS", rows:[
        { pos:1, who:"Austin Krainz, Stevan McAleer (#27 AutoTechnic Racing)", gap:"Leads by 30 points" },
        { pos:2, who:"Dillon Machavern, Luca Mars (#95 Turner Motorsport)", gap:"30 points back, after leading most of the season" },
        { pos:3, who:"Robert Noaker, Finn Wiebelhaus (#13 McCumbee McAleer Racing)", gap:"40 points back" },
        { pos:4, who:"Michael Cooper, Moisey Uretsky (#44 Ibiza Farm Motorsport)", gap:"120 points back, mathematically alive" },
        { pos:5, who:"Bryce Ward (#57 Winward Racing)", gap:"130 points back, mathematically alive" }
      ] },
      { h:"TCR", rows:[
        { pos:1, who:"Mason Filippi, Bryson Morris (#33 Bryan Herta Autosport)", gap:"Leads by 200 points over their own teammates" },
        { pos:2, who:"Denis Dupont, Preston Brown (#76 Bryan Herta Autosport)", gap:"200 points back" }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24)." },
  { s:"vp", asOf:"LMP3 and GSX point totals below predate Road Atlanta (last updated after Canadian Tire Motorsport Park and VIR); both 2026 titles were clinched in Race 1 at Road Atlanta (Oct 1) as described below, though updated post-race point totals weren't published in sources found.",
    classes:[
      { h:"LMP3", rows:[
        { pos:1, who:"Oscar Tunjo (#1 Gebhardt Intralogistics Motorsports)", gap:"Clinched the 2026 LMP3 title by finishing 2nd in Race 1 at Road Atlanta, one round early." },
        { pos:2, who:"Danny Soufi (Gebhardt Intralogistics Motorsports)", gap:"Tunjo's closest challenger and teammate; his own title hopes ended when his car slowed late in Race 1 at Road Atlanta, triggering the race's only caution (his finishing position wasn't confirmed by available sources)." },
        { pos:3, who:"Travis Hill (#2 Shopify Racing)", gap:"Tied for 3rd in the Bronze Cup standings" },
        { pos:4, who:"Brian Thienes (#77 Forte Racing)", gap:"Tied for 3rd in the Bronze Cup standings" }
      ] },
      { h:"GSX", rows:[
        { pos:1, who:"Westin Workman (#8 RAFA Racing)", pts:2680, gap:"Clinched the 2026 GSX title by winning Race 1 at Road Atlanta, his 10th win in 11 races this season." },
        { pos:2, who:"Courtney Crone", pts:2280 },
        { pos:3, who:"Rafa Martinez", pts:1990 }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), IMSA.com race reports from Canadian Tire Motorsport Park and VIR, and Sportscar365/Daily Sportscar Race 1 reports from Road Atlanta, Oct 1, 2026 (via web search; direct site fetches were blocked in this environment). Point totals above predate Road Atlanta Race 1." },
  { s:"mx5", asOf:"Current after Race 1 of 2 at Road Atlanta (Oct 1); Race 2 on Oct 2 decides the 2026 champion.",
    classes:[
      { h:"Championship", rows:[
        { pos:1, who:"Bobby Gossett", pts:2990, gap:"Won Race 1 at Road Atlanta from 22nd on the grid, extending his points lead over Adakonis." },
        { pos:2, who:"Justin Adakonis", pts:2890, gap:"100 points back after finishing 2nd in Race 1 at Road Atlanta." },
        { pos:3, who:"Jared Thomas", gap:"Finished 3rd in Race 1 at Road Atlanta; among the drivers still mathematically alive for the title." }
      ] }
    ],
    note:"Sources: RACER (\"Gossett builds MX-5 Cup point lead with Road Atlanta win\") and SPEED SPORT, Oct 2, 2026 (via web search; direct site fetches were blocked in this environment). The cited point totals show an unchanged 100-point gap despite the article describing Gossett as having grown his lead with the win -- reported as published rather than adjusted, since the underlying math couldn't be independently verified." },
  { s:"carrera", asOf:"Current after Race 1 of 2 at Road Atlanta (Oct 1); Race 2 and the Circuit of the Americas round remain this season.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Tyler Maxson (TOPP Racing)", gap:"Leads by 19 points after winning Race 1 at Road Atlanta, passing Jeansonne for the lead in the closing minutes (contact between the two during the move was under stewards' review, with no decision confirmed in sources found)." },
        { pos:2, who:"Aaron Jeansonne (Kellymoss)", gap:"19 points back after finishing 2nd in Race 1 at Road Atlanta." },
        { pos:3, who:"Callum Hedge (JDX Racing)", gap:"Closest of the chasing pack" },
        { pos:4, who:"Jared Thomas (JTR Motorsports Engineering)", gap:"In the chasing pack; finished 4th in Race 1 at Road Atlanta." },
        { pos:5, who:"Janne Stiak (ACI Motorsports)", gap:"In the chasing pack, with 5 podiums in 6 races at Indianapolis" }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Patrick Mulcahy (ACI Motorsports)", gap:"Clinched the Pro-Am title at Indianapolis" }
      ] },
      { h:"Masters", rows:[
        { pos:1, who:"Marco Cirone (ACI Motorsports)", gap:"Extended his lead with a strong finish in Race 1 at Road Atlanta (exact new margin not published)." },
        { pos:2, who:"Scott Blind (Ruckus Racing)", gap:"The defending champion; won the Masters class in Race 1 at Road Atlanta, but still trails Cirone in points." },
        { pos:3, who:"Rob Walker (JTR Motorsports Engineering)" },
        { pos:4, who:"Richard Edge (ACI Motorsports)", gap:"Finished 2nd in the Masters class in Race 1 at Road Atlanta." }
      ] }
    ],
    note:"Pro positions 3-5 are named from recent race reports, not an official points table -- their order past Maxson/Jeansonne isn't confirmed, and no points figures are shown for them since none were published. Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), Porsche Motorsport North America and Sportscar365 race reports from Indianapolis and Road Atlanta Race 1 (Oct 1, 2026, via web search; direct site fetches were blocked in this environment). Alan Metni (Kellymoss) won the Pro-Am race at Road Atlanta Race 1, his second win of the season, but Mulcahy's title was already clinched." }
];
