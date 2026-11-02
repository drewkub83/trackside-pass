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
  { s:"motogp", asOf:"Current after the Petronas Grand Prix of Malaysia (2026-11-01).",
    classes:[
      { h:"Riders", rows:[
        { pos:1, who:"Marc Marquez (Ducati Lenovo Team)", pts:399 },
        { pos:2, who:"Jorge Martin (Aprilia Racing)", pts:355 },
        { pos:3, who:"Marco Bezzecchi (Aprilia Racing)", pts:332 },
        { pos:4, who:"Pedro Acosta (Red Bull KTM Factory Racing)", pts:295 },
        { pos:5, who:"Ai Ogura (SuperFile Trackhouse MotoGP Team)", pts:278 },
        { pos:6, who:"Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", pts:265 },
        { pos:7, who:"Raul Fernandez (SuperFile Trackhouse MotoGP Team)", pts:236 },
        { pos:8, who:"Alex Marquez (BK8 Gresini Racing MotoGP)", pts:197 },
        { pos:9, who:"Francesco Bagnaia (Ducati Lenovo Team)", pts:173 },
        { pos:10, who:"Enea Bastianini (Red Bull KTM Tech3)", pts:134 },
        { pos:11, who:"Fermin Aldeguer (BK8 Gresini Racing MotoGP)", pts:125 },
        { pos:12, who:"Brad Binder (Red Bull KTM Factory Racing)", pts:118 },
        { pos:13, who:"Luca Marini (Honda HRC Castrol)", pts:117 },
        { pos:14, who:"Fabio Quartararo (Monster Energy Yamaha MotoGP Team)", pts:79 },
        { pos:15, who:"Diogo Moreira (Pro Honda LCR)", pts:78 }
      ] }
    ],
    note:"(automatic update) Source: the MotoGP results service (api.pulselive.motogp.com), the riders' championship, top 15; Sprint and Grand Prix points both count. A cancelled race scores nothing." },
  { s:"wec", asOf:"Current as of 2026-10-26, from fiawec.com (the series' own standings page).",
    classes:[
      { h:"Hypercar", rows:[
        { pos:1, who:"#8 Brendon Hartley, Ryō Hirakawa, Sébastien Buemi", pts:114 },
        { pos:2, who:"#7 Kamui Kobayashi, Mike Conway, Nyck de Vries", pts:97 },
        { pos:3, who:"#15 Kevin Magnussen, Raffaele Marciello", pts:75 },
        { pos:4, who:"#20 René Rast, Robin Frijns", pts:75 },
        { pos:5, who:"#15 Dries Vanthoor", pts:69 },
        { pos:6, who:"#50 Antonio Fuoco, Miguel Molina, Nicklas Nielsen", pts:69 },
        { pos:7, who:"#20 Sheldon van der Linde", pts:65 },
        { pos:8, who:"#51 Alessandro Pier Guidi, Antonio Giovinazzi, James Calado", pts:59 },
        { pos:9, who:"#12 Norman Nato, Will Stevens", pts:58 },
        { pos:10, who:"#35 Charles Milesi, Ferdinand Habsburg", pts:57 }
      ] },
      { h:"LMGT3", rows:[
        { pos:1, who:"#33 TF Sport", pts:92 },
        { pos:2, who:"#92 The Bend Manthey", pts:74 },
        { pos:3, who:"#34 Racing Team Turkey By TF", pts:70 },
        { pos:4, who:"#69 Team WRT", pts:66 },
        { pos:5, who:"#21 Vista AF Corse", pts:64 },
        { pos:6, who:"#27 Heart Of Racing Team", pts:62 },
        { pos:7, who:"#10 Garage 59", pts:57 },
        { pos:8, who:"#91 Manthey DK Engineering", pts:54 },
        { pos:9, who:"#23 Heart Of Racing Team", pts:51 },
        { pos:10, who:"#32 Team WRT", pts:48 }
      ] }
    ],
    note:"(automatic update) Source: fiawec.com standings page, top ten of each table. Hypercar: crews (all drivers of a car share its points); LMGT3: teams, listed by car number. Check the site for the round count." },
  { s:"f3", asOf:"Current as of 2026-10-26, from www.fiaformula3.com (the series' own standings page).",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Ugo Ugochukwu", pts:159 },
        { pos:2, who:"Freddie Slater", pts:145 },
        { pos:3, who:"Tuukka Taponen", pts:109 },
        { pos:4, who:"Taito Kato", pts:105 },
        { pos:5, who:"Théophile Naël", pts:88 },
        { pos:6, who:"Pedro Clerot", pts:88 },
        { pos:7, who:"Ernesto Rivera", pts:87 },
        { pos:8, who:"Brando Badoer", pts:71 },
        { pos:9, who:"Hiyu Yamakoshi", pts:71 },
        { pos:10, who:"Noah Stromsted", pts:65 }
      ] }
    ],
    note:"(automatic update) Source: www.fiaformula3.com drivers' standings, top ten, read 2026-10-26. The page lists no team per driver. Check the site for the current round count." },
  { s:"f2", asOf:"Current as of 2026-10-26, from www.fiaformula2.com (the series' own standings page).",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Rafael Câmara", pts:207 },
        { pos:2, who:"Nikola Tsolov", pts:200 },
        { pos:3, who:"Alexander Dunne", pts:189 },
        { pos:4, who:"Gabriele Mini", pts:163 },
        { pos:5, who:"Dino Beganovic", pts:137 },
        { pos:6, who:"Noel Leon", pts:133 },
        { pos:7, who:"Martinius Stenshorne", pts:107 },
        { pos:8, who:"Joshua Dürksen", pts:90 },
        { pos:9, who:"Kush Maini", pts:90 },
        { pos:10, who:"Laurens van Hoepen", pts:90 }
      ] }
    ],
    note:"(automatic update) Source: www.fiaformula2.com drivers' standings, top ten, read 2026-10-26. The page lists no team per driver. Check the site for the current round count." },
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
  { s:"carrera", asOf:"Final 2026 standings after the Circuit of the Americas finale (Oct 23); the season is complete.",
    classes:[
      { h:"Pro", rows:[
        { pos:1, who:"Tyler Maxson (TOPP Racing)", gap:"2026 Mobil Pro class champion, clinched in Race 1 at COTA; won the finale (Race 2) by more than six seconds." },
        { pos:2, who:"Janne Stiak (ACI Motorsports)", gap:"Won Race 1 at COTA; promoted to 2nd in Race 2 after Hedge's post-race track-limits penalty." },
        { pos:3, who:"Jared Thomas (JTR Motorsports Engineering)", gap:"Promoted to 3rd in Race 2 at COTA after Hedge's penalty." },
        { pos:4, who:"Aaron Jeansonne (Kellymoss)", gap:"Maxson's closest title rival entering COTA, trailing by 19 points." },
        { pos:5, who:"Callum Hedge (JDX Racing)", gap:"3rd on track in Race 2 at COTA, demoted by a 10-second track-limits penalty." }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Patrick Mulcahy (ACI Motorsports)", gap:"2026 Pro-Am champion, clinched at Indianapolis; won Race 2 at COTA." }
      ] },
      { h:"Masters", rows:[
        { pos:1, who:"Marco Cirone (ACI Motorsports)", gap:"2026 Masters champion." },
        { pos:2, who:"Rob Walker (JTR Motorsports Engineering)", gap:"Runner-up entering the COTA finale." },
        { pos:3, who:"Scott Blind (Ruckus Racing)", gap:"The defending champion; third in points entering COTA." }
      ] }
    ],
    note:"(no automatic reader) Entrant champion: TOPP Racing (back-to-back). Pro and Masters positions below the champion are named from recent race reports, not an official season points table -- their final order wasn't published in sources found, so these reflect standing entering or finishing at COTA, not confirmed final points. Sources: Porsche Newsroom (\"Maxson secures Porsche Carrera Cup North America title...\"), racing.porsche.com's COTA race report, Sportscar365 and Stuttcars (Oct 24-25, 2026, via web search; direct site fetches were blocked in this environment)." },
  { s:"gtwce", asOf:"Current after the final round of the 2026 season (Portimao): the season is complete.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Lucas Auer / Maro Engel", pts:131.5 },
        { pos:2, who:"Ricardo Feller / Bastian Buus", pts:120 },
        { pos:3, who:"Kelvin Van Der Linde / Charles Weerts", pts:97 },
        { pos:4, who:"Luca Stolz", pts:86 },
        { pos:5, who:"Daniel Juncadella", pts:80 },
        { pos:6, who:"Arthur Leclerc", pts:76.5 },
        { pos:7, who:"Nicki Thiim", pts:75.5 },
        { pos:8, who:"Thomas Neubauer", pts:65.5 },
        { pos:9, who:"Dorian Boccolacci", pts:65.5 },
        { pos:10, who:"Morris Schuring", pts:60 },
        { pos:11, who:"Marco Sorensen / Mattia Drudi", pts:59 },
        { pos:12, who:"Jordan Pepper", pts:58 },
        { pos:13, who:"Thierry Vermeulen / Ben Green", pts:56.5 },
        { pos:14, who:"Jules Gounon", pts:53.5 },
        { pos:15, who:"Thomas Fleming / Louis Prette", pts:51.5 },
        { pos:16, who:"Chris Lulham", pts:49.5 },
        { pos:17, who:"Thomas Preining", pts:48 },
        { pos:18, who:"Dean Macdonald", pts:47.5 },
        { pos:19, who:"Max Hesse / Valentino Rossi", pts:46.5 },
        { pos:20, who:"Fabian Schiller / Maximilian Götz", pts:41 }
      ] },
      { h:"Teams", rows:[
        { pos:1, who:"Team WRT", pts:152.5 },
        { pos:2, who:"Winward Racing", pts:138.5 },
        { pos:3, who:"Lionspeed GP", pts:122 },
        { pos:4, who:"AF Corse", pts:99.5 },
        { pos:5, who:"Garage 59", pts:93.5 },
        { pos:6, who:"2Seas Motorsport", pts:92 },
        { pos:7, who:"Boutsen VDS", pts:82.5 },
        { pos:8, who:"Comtoyou Racing", pts:81 },
        { pos:9, who:"Emil Frey Racing", pts:71 },
        { pos:10, who:"Tresor Attempto Racing", pts:67.5 },
        { pos:11, who:"GetSpeed", pts:44.5 },
        { pos:12, who:"Rowe Racing", pts:39 },
        { pos:13, who:"Rutronik Racing", pts:34 },
        { pos:14, who:"CSA Racing", pts:30.5 },
        { pos:15, who:"Eastalent Racing", pts:23 },
        { pos:16, who:"Kessel Racing", pts:21 },
        { pos:17, who:"HRT Ford Racing", pts:16 },
        { pos:18, who:"Walkenhorst Motorsport", pts:14 },
        { pos:19, who:"Paradine Competition", pts:11 },
        { pos:20, who:"VSR", pts:10.5 }
      ] }
    ],
    note:"Overall GT World Challenge Europe Powered by AWS standings (Endurance and Sprint Cup combined), top 20 positions of each table. Drivers sharing a position are listed together (they share the same points). The series' own page says: Standings remain provisional following appeal #63 Grasser Racing Team Lamborghini against Decision 06 at Zandvoort. Source: gt-world-challenge-europe.com/standings (Teams and Drivers 2026), read 2026-10-18."
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
  { s:"f1", asOf:"Current after the Mexico City Grand Prix (Nov 1, 2026): 19 races are done and 4 remain.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Kimi Antonelli (Mercedes)", pts:380 },
        { pos:2, who:"Max Verstappen (Red Bull Racing)", pts:261 },
        { pos:3, who:"Lewis Hamilton (Ferrari)", pts:259 },
        { pos:4, who:"George Russell (Mercedes)", pts:250 },
        { pos:5, who:"Charles Leclerc (Ferrari)", pts:245 },
        { pos:6, who:"Lando Norris (McLaren)", pts:221 },
        { pos:7, who:"Oscar Piastri (McLaren)", pts:150 },
        { pos:8, who:"Isack Hadjar (Red Bull Racing)", pts:105 },
        { pos:9, who:"Liam Lawson (Racing Bulls)", pts:79 },
        { pos:10, who:"Pierre Gasly (Alpine)", pts:43 },
        { pos:11, who:"Arvid Lindblad (Racing Bulls)", pts:38 },
        { pos:12, who:"Franco Colapinto (Alpine)", pts:31 },
        { pos:13, who:"Oliver Bearman (Haas)", pts:23 },
        { pos:14, who:"Nico Hülkenberg (Audi)", pts:13 },
        { pos:15, who:"Gabriel Bortoleto (Audi)", pts:10 },
        { pos:16, who:"Esteban Ocon (Haas)", pts:7 },
        { pos:17, who:"Fernando Alonso (Aston Martin)", pts:7 },
        { pos:18, who:"Carlos Sainz (Williams)", pts:7 },
        { pos:19, who:"Alexander Albon (Williams)", pts:5 },
        { pos:20, who:"Yuki Tsunoda (Racing Bulls)", pts:1 },
        { pos:21, who:"Lance Stroll (Aston Martin)", pts:0 },
        { pos:22, who:"Valtteri Bottas (Cadillac)", pts:0 },
        { pos:23, who:"Ryo Hirakawa (Haas)", pts:0 },
        { pos:24, who:"Sergio Pérez (Cadillac)", pts:0 }
      ] },
      { h:"Constructors", rows:[
        { pos:1, who:"Mercedes", pts:630 },
        { pos:2, who:"Ferrari", pts:504 },
        { pos:3, who:"Red Bull Racing", pts:380 },
        { pos:4, who:"McLaren", pts:371 },
        { pos:5, who:"Racing Bulls", pts:104 },
        { pos:6, who:"Alpine", pts:74 },
        { pos:7, who:"Haas", pts:30 },
        { pos:8, who:"Audi", pts:23 },
        { pos:9, who:"Williams", pts:12 },
        { pos:10, who:"Aston Martin", pts:7 },
        { pos:11, who:"Cadillac", pts:0 }
      ] }
    ],
    note:"(automatic update) Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA championship tables), read 2026-11-02. Drivers on the same points share a position only if the table shows it." },
  { s:"f1academy", asOf:"Current after Austin (Oct 23-25, 2026); Palmowski clinched the title there with the Las Vegas round (Nov 19-21) still to run.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Alisha Palmowski (Campos Racing)", pts:172, gap:"2026 champion, clinched at Austin with three races still to run." },
        { pos:2, who:"Nina Gademan (MP Motorsport)", pts:119, gap:"Passed Felbermayr for 2nd by winning Austin's Feature Race." },
        { pos:3, who:"Emma Felbermayr", pts:113 }
      ] }
    ],
    note:"(no automatic reader) Source: motorsport.com's F1 Academy standings page, cross-checked against OneRacing's reporting of Palmowski's point total (both read Oct 26-Nov 1, 2026, via web search; direct fetch was blocked in this environment). Places below 3rd were not confirmed in the sources found after Austin, so they are left out." },
  { s:"gt4a", asOf:"Final 2026 standings after the Indianapolis finale (Oct 10-11); the season is complete.",
    classes:[
      { h:"Silver", rows:[
        { pos:1, who:"Luca Mars, Spencer Pumpelly (RS1, #028): 2026 Silver champions", pts:259 },
        { pos:2, who:"Tyler Gonzalez, Westin Workman (RAFA Racing Team)", pts:258 },
        { pos:3, who:"Francis Selldorff, Kevin Boehm", pts:192 }
      ] },
      { h:"Pro-Am", rows:[
        { pos:1, who:"Sam Craven, Kenton Koch", gap:"2026 Pro-Am champions; Craven clinched the drivers' title in Saturday's Race 1." }
      ] },
      { h:"Am", rows:[
        { pos:1, who:"Frankie Muniz, Tyler Stone (TechSport Racing)", gap:"2026 Am champions, settled in the final race." }
      ] }
    ],
    note:"Silver points from gt4-america.com's own driver standings (all 13 rounds scored), read Oct 21, 2026. Pro-Am and Am champions from SRO America's season-finale release (published on racer.com, Oct 11, 2026); RS1 won the Silver title by one point despite retiring from the final race after an opening-lap incident, while RAFA won both Indianapolis races. The official Pro-Am and Am points tables could not be read, so no totals are shown for them." },
  { s:"gta", asOf:"Final 2026 standings after the Indianapolis finale (Oct 10-11); the season is complete.",
    classes:[
      { h:"SRO3", rows:[
        { pos:1, who:"Memo Gidley (SKI Autosports, #56)", gap:"2026 SRO3 champion, clinched before the finale; 10 wins, tying the record for a single GT America season." }
      ] },
      { h:"GT4", rows:[
        { pos:1, who:"Craig Lumsden", gap:"2026 GT4 class champion." }
      ] },
      { h:"Cup", rows:[
        { pos:1, who:"David Lecko", gap:"2026 Cup class champion; won the final race unopposed." }
      ] }
    ],
    note:"Champions only, from SRO America's season-finale release (published on racer.com, Oct 11, 2026). Points totals were not read from the official table, so none are shown." },
  { s:"tca", asOf:"Final 2026 standings after the Indianapolis finale (Oct 10-11); the season is complete.",
    classes:[
      { h:"TC", rows:[
        { pos:1, who:"Braydon Arthur (JMF Motorsports, #4 Toyota GR Corolla)", gap:"2026 TC America champion: arrived five points clear of Castro and swept both Indianapolis races. Toyota won the TC manufacturers' title." },
        { pos:2, who:"André Castro (Ricca Autosport, #77 Hyundai Elantra N1)", gap:"Vice-champion; third in the final race." }
      ] }
    ],
    note:"From SRO America's season-finale release (published on racer.com, Oct 11, 2026). Final points totals were not read from the official table, so none are shown." },
  { s:"grcup", asOf:"Final 2026 standings after the Indianapolis finale (Oct 10-11); the season is complete.",
    classes:[
      { h:"Am", rows:[
        { pos:1, who:"Spike Kohlbecker (TechSport Racing, #15)", gap:"2026 GR Cup champion: six wins and 11 podiums in 14 races; the series' all-time wins leader." }
      ] },
      { h:"Legends Cup", rows:[
        { pos:1, who:"Patrick Brunson (Eagles Canyon with Fast Track)", gap:"2026 WWEX Group Legends Cup champion (drivers 40 and over): six class wins in 10 races." }
      ] }
    ],
    note:"Champions only, from GAZOO Racing's own release \"GAZOO Racing Crowns 2026 GR Cup Series Champions\" (grcupseries.com, Oct 11, 2026). Points totals were not published there, so none are shown." },
  { s:"nascar", asOf:"Current after the Xfinity 500 at Martinsville (Nov 1, 2026); one race (Homestead-Miami, Nov 8) decides the title.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Kyle Larson", pts:2469, gap:"Leads with one race left; could not clinch at Martinsville (finished 9th) but has a big cushion into Homestead." },
        { pos:2, who:"Christopher Bell", pts:2402, gap:"-67" },
        { pos:3, who:"Denny Hamlin", pts:2399, gap:"-70; sources differ on whether he is already mathematically eliminated." },
        { pos:4, who:"Chase Briscoe", pts:2385, gap:"-84" },
        { pos:5, who:"Joey Logano", pts:2366, gap:"-103" },
        { pos:6, who:"Tyler Reddick", pts:2344, gap:"-125" },
        { pos:7, who:"Ryan Blaney", pts:2336, gap:"-133" },
        { pos:8, who:"Ty Gibbs", pts:2309, gap:"-160" },
        { pos:9, who:"William Byron", pts:2303, gap:"-166; won the Martinsville race, his first win of 2026." },
        { pos:10, who:"Chase Elliott", pts:2268, gap:"-201; finished 2nd at Martinsville." }
      ] }
    ],
    note:"(no automatic reader) Source: Yahoo Sports' post-Martinsville points table (Nov 1, 2026), cross-checked against the pre-race baseline reported by NASCAR.com and other outlets, via web search (direct fetch was blocked in this environment). The 2026 championship is decided by points, not a four-driver Championship finale -- Larson needs only to out-score his rivals at Homestead-Miami (Nov 8)." },
  { s:"oreilly", asOf:"Current after the National Debt Relief 250 at Martinsville (Oct 31, 2026); Homestead-Miami (Nov 7) decides the title among five drivers still eligible.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Justin Allgaier", pts:2436, gap:"Runner-up to Kvapil at Martinsville, his JR Motorsports teammate." },
        { pos:2, who:"Jesse Love", pts:2414, gap:"-22" },
        { pos:3, who:"Corey Day", pts:2413, gap:"-23" },
        { pos:4, who:"Carson Kvapil", pts:2405, gap:"-31; won at Martinsville, his third win of 2026." },
        { pos:5, who:"Sheldon Creed", pts:2394, gap:"-42" }
      ] }
    ],
    note:"(no automatic reader) Source: Yahoo Sports' post-Martinsville points table, cross-checked against On3's reporting of the same figures (both Oct 31-Nov 1, 2026, via web search; direct fetch was blocked in this environment). Allgaier, Love, Day, Kvapil and Creed all have a mathematical shot at the title at Homestead-Miami." },
  { s:"trucks", asOf:"Current after the Black's Tire 200 at Martinsville (Oct 30, 2026); Homestead-Miami (Nov 6) decides the title, a two-driver fight.",
    classes:[
      { h:"Drivers", rows:[
        { pos:1, who:"Kaden Honeycutt", pts:2403, gap:"Finished 14th at Martinsville after a messy final restart but still leads." },
        { pos:2, who:"Layne Riggs", pts:2383, gap:"-20; finished 3rd at Martinsville." },
        { pos:3, who:"Chandler Smith", pts:2300, gap:"-103; won at Martinsville but is eliminated from the title fight." },
        { pos:4, who:"Ty Majeski", pts:2275, gap:"-128; eliminated." },
        { pos:5, who:"Christian Eckes", pts:2263, gap:"-140; eliminated." }
      ] }
    ],
    note:"(no automatic reader) Source: Yahoo Sports' post-Martinsville points table, cross-checked against Jayski's reporting of the same figures (both Oct 30-31, 2026, via web search; direct fetch was blocked in this environment). Only Honeycutt and Riggs can still win the title at Homestead-Miami." }
];
