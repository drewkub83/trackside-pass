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
  { s:"weathertech", asOf:"Final 2026 standings after Motul Petit Le Mans (Oct 3); the season is complete.",
    classes:[
      { h:"GTP", rows:[
        { pos:1, who:"Jack Aitken (Whelen Cadillac, #31)", gap:"2026 GTP champion, the first solo GTP driver champion; clinched on the grid at Petit Le Mans. The #31 Cadillac Whelen (Aitken, Earl Bamber, Frederik Vesti) won the team title and Cadillac the manufacturer title." }
      ] },
      { h:"LMP2", rows:[
        { pos:1, who:"Alex Quinn, George Kurtz (#04 CrowdStrike Racing by APR)", gap:"2026 LMP2 champions, clinched by winning Petit Le Mans. Kurtz also won the Jim Trueman Award." },
        { pos:2, who:"Tom Dillmann, Jeremy Clarke (#43 Inter Europol Competition)", gap:"Closest title rival; finished 2nd in the finale by 0.666 seconds." }
      ] },
      { h:"GTD PRO", rows:[
        { pos:1, who:"Neil Verhagen, Connor De Phillippi (#1 Paul Miller Racing)", gap:"2026 GTD PRO champions, clinched with 3rd place at Petit Le Mans." }
      ] },
      { h:"GTD", rows:[
        { pos:1, who:"Philip Ellis, Russell Ward (#57 Winward Racing)", gap:"2026 GTD champions, a third straight title, sealed with the Petit Le Mans win." }
      ] }
    ],
    note:"Champions only: final points totals per class were not in the sources, so none are shown (IMSA's own points sheet is Alkamel timing data, which this project does not use). Michelin Endurance Cup winners: GTP Julien Andlauer, Felipe Nasr, Laurin Heinrich (Porsche Penske); LMP2 Kurtz, Quinn, Sowery (CrowdStrike Racing by APR). Source: IMSA.com Petit Le Mans recaps, Oct 3 and Oct 4, 2026." },
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
    note:"Pro and Masters positions below the top of each class are named from recent race reports, not an official points table -- their order isn't confirmed, and no points figures are shown for them since none were published. Sources: IMSA's \"Tale of the Tape\" championship preview (Sep 24), Porsche Motorsport North America, Sportscar365 and GT REPORT race reports from Indianapolis and both Road Atlanta races (Oct 1-2, 2026, via web search; direct site fetches were blocked in this environment). Alan Metni (Kellymoss) won the Pro-Am race at Road Atlanta Race 1, his second win of the season, but Mulcahy's title was already clinched." },
  { s:"gtwce", asOf:"Current after round 9 of 10 in the 2026 season (Barcelona). Next: Portimao; no points from it are included yet.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Lucas Auer / Maro Engel", pts:131.5 },
        { pos:2, who:"Ricardo Feller / Bastian Buus", pts:102 },
        { pos:3, who:"Kelvin Van Der Linde / Charles Weerts", pts:97 },
        { pos:4, who:"Luca Stolz", pts:86 },
        { pos:5, who:"Daniel Juncadella", pts:80 },
        { pos:6, who:"Nicki Thiim", pts:75.5 },
        { pos:7, who:"Arthur Leclerc", pts:75.5 },
        { pos:8, who:"Thomas Neubauer", pts:65.5 },
        { pos:9, who:"Marco Sorensen / Mattia Drudi", pts:59 },
        { pos:10, who:"Jordan Pepper", pts:58 },
        { pos:11, who:"Thierry Vermeulen / Ben Green", pts:56.5 },
        { pos:12, who:"Jules Gounon", pts:53.5 },
        { pos:13, who:"Thomas Fleming / Louis Prette", pts:51.5 },
        { pos:14, who:"Dorian Boccolacci", pts:49.5 },
        { pos:15, who:"Chris Lulham", pts:47.5 },
        { pos:16, who:"Max Hesse / Valentino Rossi", pts:46.5 },
        { pos:17, who:"Morris Schuring", pts:44 },
        { pos:18, who:"Dean Macdonald", pts:39.5 },
        { pos:19, who:"Ariel Levi", pts:34.5 },
        { pos:20, who:"Benjamin Goethe", pts:32 }
      ] },
      { h:"Teams", rows:[
        { pos:1, who:"Team WRT", pts:142.5 },
        { pos:2, who:"Winward Racing", pts:137.5 },
        { pos:3, who:"Lionspeed GP", pts:104 },
        { pos:4, who:"2Seas Motorsport", pts:88 },
        { pos:5, who:"AF Corse", pts:87.5 },
        { pos:6, who:"Garage 59", pts:85.5 },
        { pos:7, who:"Comtoyou Racing", pts:81 },
        { pos:8, who:"Emil Frey Racing", pts:71 },
        { pos:9, who:"Tresor Attempto Racing", pts:67.5 },
        { pos:10, who:"Boutsen VDS", pts:66.5 },
        { pos:11, who:"Rutronik Racing", pts:34 },
        { pos:12, who:"Rowe Racing", pts:33 },
        { pos:13, who:"CSA Racing", pts:30.5 },
        { pos:14, who:"Eastalent Racing", pts:23 },
        { pos:15, who:"Kessel Racing", pts:21 },
        { pos:16, who:"GetSpeed", pts:19.5 },
        { pos:17, who:"HRT Ford Racing", pts:16 },
        { pos:18, who:"Walkenhorst Motorsport", pts:12 },
        { pos:19, who:"Paradine Competition", pts:11 },
        { pos:20, who:"VSR", pts:10.5 }
      ] }
    ],
    note:"Overall GT World Challenge Europe Powered by AWS standings (Endurance and Sprint Cup combined), top 20 positions of each table. Drivers sharing a position are listed together (they share the same points). The series' own page says: Standings remain provisional following appeal #63 Grasser Racing Team Lamborghini against Decision 06 at Zandvoort. Source: gt-world-challenge-europe.com/standings (Teams and Drivers 2026), read 2026-10-15."
  },
  { s:"indycar", asOf:"Final 2026 standings after the Mission Foods Grand Prix of Monterey at Laguna Seca (Sep 6); the season is complete.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Alex Palou", pts:631, gap:"6 wins. 2026 champion: fourth straight title, fifth in six years, clinched before the finale." },
        { pos:2, who:"Kyle Kirkwood", pts:545, gap:"2 wins" },
        { pos:3, who:"Christian Lundgaard", pts:535, gap:"2 wins" },
        { pos:4, who:"Pato O'Ward", pts:522, gap:"3 wins" },
        { pos:5, who:"David Malukas", pts:514 },
        { pos:6, who:"Scott McLaughlin", pts:482, gap:"1 win, the Monterey finale" },
        { pos:7, who:"Marcus Ericsson", pts:429, gap:"1 win" },
        { pos:8, who:"Josef Newgarden", pts:423, gap:"2 wins" },
        { pos:9, who:"Felix Rosenqvist", pts:412, gap:"1 win, the Indianapolis 500" },
        { pos:10, who:"Rinus VeeKay", pts:378 },
        { pos:11, who:"Will Power", pts:368 },
        { pos:12, who:"Scott Dixon", pts:331 },
        { pos:13, who:"Kyffin Simpson", pts:327 },
        { pos:14, who:"Marcus Armstrong", pts:320 },
        { pos:15, who:"Alexander Rossi", pts:307 }
      ] }
    ],
    note:"Source: INDYCAR.com official championship standings (2026), read Oct 16, 2026; the finale report confirms the order (Kirkwood passed Lundgaard for 2nd, Ericsson passed Newgarden for 7th, VeeKay held 10th). Wins are the official wins column; Palou won the title by 86 points." },
  { s:"gtwca", asOf:"Final 2026 standings after the Indianapolis 8 Hour (Oct 11, double points); the season is complete.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Robby Foley, Justin Rothberg (#29 Turner Motorsport)", pts:154, gap:"2026 Pro champions: Turner's first Pro title." },
        { pos:2, who:"Mikael Grenier, Michai Stephens (JMF Motorsports)", pts:144 },
        { pos:3, who:"Matias Perez Companc (AF Corse USA)", pts:141 },
        { pos:4, who:"Frederik Schandorff (AF Corse USA)", pts:131 },
        { pos:5, who:"Michael McCann Jr., Zachary Vanier (McCann Racing)", pts:103 },
        { pos:6, who:"Alex Sedgwick, Cameron Lawrence (Dollahite Racing)", pts:68 }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Kyle Washington (GMG Racing)", pts:142, gap:"2026 Pro-Am champion." },
        { pos:2, who:"Dave Musial Jr., Ryan Yardley (Wright Motorsports)", pts:116, gap:"Yardley also won the SRO GT Academy title." },
        { pos:3, who:"Aaron Telitz, Todd Coleman", pts:82 },
        { pos:4, who:"Jason Daskalos", pts:64 },
        { pos:5, who:"Danny Dyszelski", pts:60 },
        { pos:6, who:"Colin Braun, Michael Clark", pts:50 }
      ] },
      { h:"Am", rows:[
        { pos:1, who:"Jay Schreibman (AF Corse USA)", pts:193, gap:"2026 Am champion, his second straight." },
        { pos:2, who:"Oswaldo Negri (AF Corse USA)", pts:150 },
        { pos:3, who:"Benny Simonsen (AF Corse USA)", pts:93 },
        { pos:4, who:"Mitchell Green", pts:61 },
        { pos:5, who:"Jon Morley", pts:25 },
        { pos:6, who:"Marc Austin, Jay Logan", pts:18 }
      ] }
    ],
    note:"Driver standings by class, top 6 positions of each table; drivers who share a position share the same points (listed together). A team is named only where the series' team table or a race report confirms it. Source: gt-world-challenge-america.com standings (Drivers and Teams 2026, Pro / Pro-Am / Am), read Oct 16, 2026." },
  { s:"f1", asOf:"Current after the Singapore Grand Prix (Oct 11, 2026): 17 races are done and six remain, starting at Austin on Oct 25.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Kimi Antonelli (Mercedes)", pts:340 },
        { pos:2, who:"George Russell (Mercedes)", pts:238 },
        { pos:3, who:"Lewis Hamilton (Ferrari)", pts:229 },
        { pos:4, who:"Max Verstappen (Red Bull Racing)", pts:221 },
        { pos:5, who:"Charles Leclerc (Ferrari)", pts:215 },
        { pos:6, who:"Lando Norris (McLaren)", pts:201 },
        { pos:7, who:"Oscar Piastri (McLaren)", pts:138 },
        { pos:8, who:"Isack Hadjar (Red Bull Racing)", pts:97 },
        { pos:9, who:"Liam Lawson (Racing Bulls)", pts:75 },
        { pos:10, who:"Pierre Gasly (Alpine)", pts:41 },
        { pos:11, who:"Arvid Lindblad (Racing Bulls)", pts:38 },
        { pos:12, who:"Franco Colapinto (Alpine)", pts:27 },
        { pos:13, who:"Oliver Bearman (Haas)", pts:23 },
        { pos:14, who:"Nico Hülkenberg (Audi)", pts:13 },
        { pos:15, who:"Gabriel Bortoleto (Audi)", pts:10 },
        { pos:16, who:"Esteban Ocon (Haas)", pts:7 },
        { pos:16, who:"Fernando Alonso (Aston Martin)", pts:7 },
        { pos:16, who:"Carlos Sainz (Williams)", pts:7 },
        { pos:19, who:"Alexander Albon (Williams)", pts:5 },
        { pos:20, who:"Yuki Tsunoda (Racing Bulls)", pts:1 },
        { pos:21, who:"Lance Stroll (Aston Martin)", pts:0 },
        { pos:21, who:"Valtteri Bottas (Cadillac)", pts:0 },
        { pos:21, who:"Sergio Pérez (Cadillac)", pts:0 }
      ] },
      { h:"Constructors", rows:[
        { pos:1, who:"Mercedes", pts:578 },
        { pos:2, who:"Ferrari", pts:444 },
        { pos:3, who:"McLaren", pts:339 },
        { pos:4, who:"Red Bull Racing", pts:332 },
        { pos:5, who:"Racing Bulls", pts:100 },
        { pos:6, who:"Alpine", pts:68 },
        { pos:7, who:"Haas", pts:30 },
        { pos:8, who:"Audi", pts:23 },
        { pos:9, who:"Williams", pts:12 },
        { pos:10, who:"Aston Martin", pts:7 },
        { pos:11, who:"Cadillac", pts:0 }
      ] }
    ],
    note:"Source: formula1.com official 2026 drivers' and teams' standings, read Oct 16, 2026. Drivers on the same points share a position; the order within a tie follows the official table." }
];
