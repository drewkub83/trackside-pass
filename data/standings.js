/* Championship points standings, one entry per series (SERIES in data/series.js). Refreshed after each
   round -- asOf says exactly what it's current through. classes: [{h: class, rows: [{pos, who, pts?, gap?}]}].
   pts is the entry's own point total; gap is used instead when only a margin (not a hard total) was
   published, or as a short note like "Clinched the title". Never invent a number -- a row with no pts or
   gap is still valid, it just names who's there. Shown in the Race Day hub's Standings card (which follows
   the same series as What to watch, top-of-table only) and its full sheet (every row). */
const STANDINGS = [
  { s:"weathertech", asOf:"Current after Indianapolis (Sep 20). Petit Le Mans is the season finale.",
    classes:[
      { h:"GTP", rows:[
        { pos:1, who:"#31 Whelen Cadillac (Earl Bamber, Jack Aitken)", pts:147 },
        { pos:2, who:"#6 Porsche Penske Porsche 963 (Laurin Heinrich)", gap:"Closest championship challenger" }
      ] },
      { h:"LMP2", rows:[
        { pos:1, who:"Inter Europol Competition (Tom Dillmann, Jeremy Clarke)", gap:"Leads by 4 points" },
        { pos:2, who:"CrowdStrike Racing by APR (George Kurtz, Alex Quinn)", gap:"4 points back" }
      ] },
      { h:"GTD PRO", rows:[
        { pos:1, who:"#4 Corvette Racing (Nicky Catsburg, Tommy Milner)", gap:"Leads by 47 points" },
        { pos:2, who:"#1 Paul Miller Racing BMW (Connor De Phillippi, Neil Verhagen)", gap:"47 points back" },
        { pos:3, who:"Pfaff Motorsports (Andrea Caldarelli, Sandy Mitchell)", gap:"53 points back" }
      ] },
      { h:"GTD", rows:[
        { pos:1, who:"#57 Winward Racing Mercedes-AMG (Philip Ellis, Russell Ward)", gap:"Leads by 6 points" },
        { pos:2, who:"#96 Turner Motorsport BMW (Robby Foley, Patrick Gallagher)", gap:"6 points back" }
      ] }
    ],
    note:"Sources: IMSA.com and RACER standings reports after Indianapolis." },
  { s:"pilot", asOf:"Current after Indianapolis (Sep 20). The FOX Factory 120 on Oct 2 is the season finale.",
    classes:[
      { h:"GS", rows:[
        { pos:1, who:"#27 AutoTechnic Racing BMW (Austin Krainz, Stevan McAleer)", gap:"Leads unofficially by 40 points" },
        { pos:2, who:"#95 Turner Motorsport BMW (Dillon Machavern, Luca Mars)", gap:"~40 points back, after leading most of the season" },
        { pos:3, who:"#13 McCumbee McAleer Racing Ford Mustang (Robert Noaker, Finn Wiebelhaus)", gap:"~50 points back" }
      ] },
      { h:"TCR", rows:[
        { pos:1, who:"#33 Bryan Herta Autosport Hyundai (Mason Filippi, Bryson Morris)", gap:"Led by 260 points over their own teammates entering Indianapolis" }
      ] }
    ],
    note:"Sources: Sportscar365 and SPEED SPORT race reports from Indianapolis." },
  { s:"vp", asOf:"LMP3 current after Canadian Tire Motorsport Park (Jul 12, its last round before Road Atlanta). GSX current after VIR (Aug 23).",
    classes:[
      { h:"LMP3", rows:[
        { pos:1, who:"#1 Gebhardt Motorsport Duqueine D09 (Oscar Tunjo)", gap:"Leads by 390 points (270 in sprint points) over his own teammate" },
        { pos:2, who:"Gebhardt Motorsport (Danny Soufi)", gap:"Tunjo's closest challenger, and teammate" }
      ] },
      { h:"GSX", rows:[
        { pos:1, who:"#8 RAFA Racing Toyota GR Supra (Westin Workman)", pts:2680, gap:"Can clinch the title by starting Race 1 at Road Atlanta" },
        { pos:2, who:"Courtney Crone", pts:2280 },
        { pos:3, who:"Rafa Martinez", pts:1990 }
      ] }
    ],
    note:"Sources: IMSA.com race reports from Canadian Tire Motorsport Park and VIR." },
  { s:"mx5", asOf:"Current after Indianapolis (Sep 19-20). Two races at Road Atlanta decide the champion.",
    classes:[
      { h:"Championship", rows:[
        { pos:1, who:"Bobby Gossett", gap:"Took the points lead at Indianapolis" },
        { pos:2, who:"Justin Adakonis", gap:"Held the lead until a last-lap mechanical problem at Indianapolis" }
      ] }
    ],
    note:"Sources: RACER and SPEED SPORT race reports from Indianapolis. An exact points margin was not published, so none is shown." },
  { s:"carrera", asOf:"Current after Indianapolis (Sep 19-20). Road Atlanta is round 7 of 8; Circuit of the Americas closes the season.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Tyler Maxson", gap:"Leads by 11 points" },
        { pos:2, who:"Aaron Jeansonne (Kellymoss)", gap:"11 points back" }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Patrick Mulcahy", gap:"Clinched the Pro-Am title at Indianapolis" }
      ] },
      { h:"Masters", rows:[
        { pos:1, who:"Marco Cirone", gap:"Leads Masters" }
      ] }
    ],
    note:"Sources: Porsche Motorsport North America and Sportscar365 race reports from Indianapolis." }
];
