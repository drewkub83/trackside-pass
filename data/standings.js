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
    note:"Sources: IMSA's own \"Tale of the Tape\" championship preview (Sep 24) plus Sportscar365 and RACER standings reports after Indianapolis." },
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
  { s:"vp", asOf:"LMP3 current after Canadian Tire Motorsport Park (Jul 12, its last round before Road Atlanta). GSX current after VIR (Aug 23).",
    classes:[
      { h:"LMP3", rows:[
        { pos:1, who:"Oscar Tunjo (#1 Gebhardt Intralogistics Motorsports)", gap:"Leads by 390 points (270 in sprint points) over his own teammate. Can clinch the title by starting Race 1 at Road Atlanta." },
        { pos:2, who:"Danny Soufi (Gebhardt Intralogistics Motorsports)", gap:"Tunjo's closest challenger, and teammate" }
      ] },
      { h:"GSX", rows:[
        { pos:1, who:"Westin Workman (#8 RAFA Racing)", pts:2680, gap:"Can clinch the title by starting Race 1 at Road Atlanta" },
        { pos:2, who:"Courtney Crone", pts:2280 },
        { pos:3, who:"Rafa Martinez", pts:1990 }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24) and IMSA.com race reports from Canadian Tire Motorsport Park and VIR." },
  { s:"mx5", asOf:"Current after Indianapolis (Sep 19-20). Two races at Road Atlanta decide the champion.",
    classes:[
      { h:"Championship", rows:[
        { pos:1, who:"Bobby Gossett", gap:"Took the points lead at Indianapolis" },
        { pos:2, who:"Justin Adakonis", gap:"Held the lead until a last-lap mechanical problem at Indianapolis" }
      ] }
    ],
    note:"Sources: RACER and SPEED SPORT race reports from Indianapolis. An exact points margin after Indianapolis was not published, so none is shown -- the last confirmed margin (Adakonis by 160, before VIR) is now stale since the points lead changed hands at Indianapolis." },
  { s:"carrera", asOf:"Current after Indianapolis (Sep 19-20). Road Atlanta is round 7 of 8; Circuit of the Americas closes the season.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Tyler Maxson (TOPP Racing)", gap:"Leads by 11 points" },
        { pos:2, who:"Aaron Jeansonne (Kellymoss)", gap:"11 points back" }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Patrick Mulcahy (ACI Motorsports)", gap:"Clinched the Pro-Am title at Indianapolis" }
      ] },
      { h:"Masters", rows:[
        { pos:1, who:"Marco Cirone (ACI Motorsports)", gap:"Leads by 52 points" },
        { pos:2, who:"Scott Blind (Ruckus Racing)", gap:"52 points back, the defending champion" }
      ] }
    ],
    note:"Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), Porsche Motorsport North America and Sportscar365 race reports from Indianapolis." }
];
