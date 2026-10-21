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
  { t:"portimao", d:"2026-10-15", s:"gtwce", event:"GT World Challenge Europe: Portimão (Endurance Cup finale)",
    groups:[
      { h:"Pro", order:[
        "1. #17 Mercedes-AMG Team GetSpeed Mercedes-AMG GT3 EVO — Ralf Aron, Maximilian Götz, Fabian Schiller",
        "2. #80 Lionspeed GP Porsche 911 GT3 R EVO — Ricardo Feller, Thomas Preining, Bastian Buus",
        "3. #2 Boutsen VDS Porsche 911 GT3 R EVO — Morris Schuring, Dorian Boccolacci, Alessio Picariello",
        "4. #59 Garage 59 McLaren 720S GT3 EVO — Joseph Loake, Dean Macdonald, Jack Hawksworth",
        "5. #3 Mercedes-AMG Team Verstappen Racing Mercedes-AMG GT3 EVO — Ben Barnicoat, Chris Lulham, Max Verstappen"
      ] },
      { h:"Gold", order:[
        "1. #71 Selected Car Racing Ferrari 296 GT3 EVO — Frederik Schandorff, Malte Ebdrup, Simon Birch",
        "2. #998 Rowe Racing BMW M4 GT3 EVO — Ugo De Wilde, Tim Tramnitz, Jens Klingmann",
        "3. #60 JMW Motorsport Ferrari 296 GT3 EVO — Casper Stevenson, Giacomo Altoe, Konsta Lappalainen",
        "4. #4 Optimum Motorsport McLaren 720S GT3 EVO — Freddie Tomlinson, Harry George, Adam Smalley",
        "5. #99 Tresor Attempto Racing Audi R8 LMS GT3 EVO II — Dylan Pereira, Andrea Frassineti, Alex Aka"
      ] },
      { h:"Silver", order:[
        "1. #30 Team WRT BMW M4 GT3 EVO — Amaury Cordeel, Matisse Lismont, Ignacio Montenegro",
        "2. #6 GetSpeed Team Bartone Bros Mercedes-AMG GT3 EVO — Anthony Bartone, Aurelien Panis, Cesar Gazeau",
        "3. #66 Tresor Attempto Racing Audi R8 LMS GT3 EVO II — Sebastian Øgaard, Rocco Mazzola, Ariel Levi",
        "4. #5 Optimum Motorsport McLaren 720S GT3 EVO — Dante Rappange, Guilherme Oliveira, Mikey Porter",
        "5. #65 HRT Ford Racing Ford Mustang GT3 EVO — Maxime Oosten, Nicolas Baert, Eduardo Coseteng"
      ] },
      { h:"Bronze", order:[
        "1. #222 2Seas Motorsport Mercedes-AMG GT3 EVO — Kiern Jewiss, Charles Dawson, Reece Barr",
        "2. #87 Winward Racing Mercedes-AMG GT3 EVO — Gabriele Piana, Rinat Salikhov, Marvin Dienst",
        "3. #42 Oman Racing by Century Motorsport BMW M4 GT3 EVO — Javier Sagrera, Ahmad Al Harthy, Calan Williams",
        "4. #991 Paradine Competition BMW M4 GT3 EVO — James Kellett, Darren Leung, Robert De Haan",
        "5. #74 Kessel Racing Ferrari 296 GT3 EVO — Dustin Blattner, Lorenzo Patrese, Dennis Marschall"
      ] }
    ],
    note:"Source: the series' official Main Race classification, https://www.gt-world-challenge-europe.com/results/2026/portimao/main-race (top five per class)." },
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
    note:"Sources: Porsche Motorsport North America (\"Maxson, Cirone strengthen championship leads at Road Atlanta\") and Sportscar365 (\"Maxson Takes Race 1 Win at Road Atlanta\"), Oct 1, 2026 (via web search; direct fetch of racing.porsche.com/sportscar365.com was blocked in this environment). Maxson passed Jeansonne for the lead with about 10 minutes left; contact between the two at Turn 7 during the move was reported under stewards' review, with no decision confirmed in sources found. Cole Kleck's car number for this race wasn't independently confirmed, so none is given. No finishers beyond 4th (Pro) or the named class winners (Pro-Am, Masters) could be confirmed." },
  { t:"road-atlanta", d:"2026-09-30", s:"vp", event:"Race 2 of 2",
    groups:[
      { h:"LMP3", order:[
        "1. #18 Forbush Performance — Jules Caranta",
        "2. #1 Gebhardt Intralogistics Motorsports — Oscar Tunjo",
        "3. Danny Soufi",
        "4. #2 Shopify Racing — Travis Hill",
        "5. #77 Forte Racing — Brian Thienes"
      ] },
      { h:"GSX", order:[
        "1. #8 RAFA Racing Toyota GR Supra GT4 EVO2 — Westin Workman",
        "2. #35 CarBahn Motorsports BMW M4 GT4 EVO — Courtney Crone",
        "3. #5 KMW Motorsports with TMR Engineering Porsche 718 GT4 RS Clubsport — Angus Rogers"
      ] }
    ],
    note:"Sources: Sportscar365 (\"Caranta, Workman Double Up to Conclude VPRC Season\") and SPEED SPORT (\"Caranta & Workman Complete Weekend Sweeps\"), Oct 2, 2026 (via web search; direct fetch was blocked in this environment). Caranta beat Tunjo by 2.031 seconds for his second straight win, a weekend sweep; both the LMP3 (Tunjo) and GSX (Workman) titles were already clinched in Race 1. Workman beat Crone by 9.424 seconds. Hill passed Thienes in Turn 1 after a restart to take 4th overall and the LMP3 Bronze Cup class win, capping their season-long fight. Soufi's car number/team for this race wasn't independently confirmed, so none is given. No finishers beyond 5th (LMP3) or 3rd (GSX) could be confirmed." },
  { t:"road-atlanta", d:"2026-09-30", s:"mx5", event:"Race 2 of 2",
    groups:[
      { h:"Championship", order:[
        "1. #42 PDR Racing — Parker DeLong",
        "2. Jeremy Fletcher"
      ] }
    ],
    note:"Sources: IMSA.com (\"DeLong Scores Win, Gossett Takes Mazda MX-5 Cup Championship at Michelin Raceway Road Atlanta\") and SPEED SPORT (\"DeLong Wins Dash, Gossett Wears Crown\" and \"Parker DeLong Claims Atlanta MX-5 Cup Glory\"), Oct 2, 2026 (via web search; direct fetch was blocked in this environment). DeLong passed Fletcher in Turn 1 on the final lap and won by 0.164 seconds. Bobby Gossett (#44 BSI Racing) finished 9th, enough to clinch the 2026 Whelen Mazda MX-5 Cup championship. Finishing positions 3rd-8th weren't confirmed in sources found, so they're left out." },
  { t:"road-atlanta", d:"2026-09-30", s:"carrera", event:"Race 2 of 2",
    groups:[
      { h:"Pro", order:[
        "1. #77 TOPP Racing — Tyler Maxson",
        "2. #24 Kellymoss — Aaron Jeansonne",
        "3. JDX Racing — Callum Hedge",
        "4. ACI Motorsports — Janne Stiak",
        "5. JTR Motorsports Engineering — Jared Thomas"
      ] },
      { h:"Pro-Am", order:[
        "1. Patrick Mulcahy"
      ] },
      { h:"Masters", order:[
        "1. #88 ACI Motorsports — Marco Cirone",
        "2. #53 JTR Motorsports Engineering — Rob Walker",
        "3. #45 Ruckus Racing — Scott Blind"
      ] }
    ],
    note:"Sources: GT REPORT (\"Porsche Carrera Cup NA Road Atlanta Race 2: Maxson Drives Away to Weekend Sweep\") and Sportscar365 (\"Maxson Sweeps Weekend; Cirone Clinches Masters Title\"), Oct 2, 2026 (via web search; direct fetch was blocked in this environment). Maxson led flag-to-flag for a weekend sweep, his eighth win of the season, 5.020 seconds ahead of Jeansonne. Mulcahy again raced unopposed in Pro-Am. Cirone beat Walker by 1.452 seconds in Masters; Blind completed that podium after an off-course excursion. No finishers beyond 5th (Pro) or 3rd (Masters) could be confirmed." },
  { t:"road-atlanta", d:"2026-09-30", s:"pilot", event:"FOX Factory 120",
    groups:[
      { h:"GS", order:[
        "1. #14 Circle H Racing Aston Martin Vantage AMR GT4 EVO — Thomas Merrill, Martin Sarukhanyan",
        "2. #46 TeamTGM Ford Mustang GT4 — Paul Holton, Matt Plumb",
        "3. #27 AutoTechnic Racing BMW M4 GT4 EVO — Austin Krainz, Stevan McAleer",
        "4. #95 Turner Motorsport BMW M4 GT4 EVO — Dillon Machavern, Luca Mars",
        "5. CarBahn Motorsports with Peregrine Racing — Cameron Shields, Steven Wetterau"
      ] },
      { h:"TCR", order:[
        "1. #33 Bryan Herta Autosport Hyundai Elantra N TCR — Mason Filippi, Bryson Morris",
        "2. #21 Victor Gonzalez Racing CUPRA Leon VZ TCR — William Tally, Caleb Bacon",
        "3. #56 Baker Racing Audi RS3 LMS TCR — Dean Baker, Kenny Riedmann"
      ] }
    ],
    note:"Sources: RACER (\"First-time winners wrap Michelin Pilot Challenge season at Road Atlanta\"), Frontstretch (\"Thomas Merrill, Martin Sarukhanyan Win FOX Factory 120\" and \"Consistency Brings The Grand Sport Title To AutoTechnic Racing\") and Sportscar365 (\"Circle H Wins, AutoTechnic Takes GS Title at Road Atlanta\"), Oct 2, 2026 (via web search; direct fetch was blocked in this environment). This is the season finale and runs GS and TCR together on one grid; the order above is each class's own running order, not the combined overall order. Merrill/Sarukhanyan passed Filippi's TCR-class Hyundai for the race lead with 13 minutes left and won their first Pilot Challenge race by 2.339 seconds. Krainz/McAleer clinched the 2026 GS title without winning a race this season; Filippi/Morris clinched the TCR title." },
  { t:"road-atlanta", d:"2026-09-30", s:"weathertech", event:"Motul Petit Le Mans",
    groups:[
      { h:"GTP", order:[
        "1. #6 Porsche Penske Motorsport Porsche 963 \u2014 Laurens Vanthoor, Kevin Estre, Matt Campbell",
        "2. #24 BMW M Team WRT BMW M Hybrid V8 \u2014 Sheldon van der Linde, Dries Vanthoor, Robin Frijns",
        "3. #40 Cadillac Wayne Taylor Racing Cadillac V-Series.R \u2014 Jordan Taylor, Louis Deletraz, Colton Herta"
      ] },
      { h:"LMP2", order:[
        "1. #04 CrowdStrike Racing by APR ORECA LMP2 07 \u2014 Alex Quinn, George Kurtz, Toby Sowery",
        "2. #43 Inter Europol Competition ORECA LMP2 07 \u2014 Tom Dillmann, Jeremy Clarke, Bijoy Garg"
      ] },
      { h:"GTD PRO", winner:"#68 Car Blanche Aston Martin Vantage GT3 Evo \u2014 Mattia Drudi, Valentin Hasse Clot, Marco Sorensen",
        gap:"Car Blanche's first GTD PRO win, in its first Endurance Cup start in the class.",
        podium:["#1 Paul Miller Racing BMW M4 GT3 EVO \u2014 Neil Verhagen, Connor De Phillippi (3rd, enough to clinch the class title)"] },
      { h:"GTD", winner:"#57 Winward Racing Mercedes-AMG GT3 \u2014 Russell Ward, Philip Ellis, Indy Dontje",
        gap:"Pole to win; Ward and Ellis took a third straight GTD title." }
    ],
    note:"Source: IMSA.com race recaps (Oct 3 and Oct 4, 2026) plus NBC Sports. 10-hour race, season finale. GTP: Vanthoor passed Earl Bamber's #31 Cadillac for the lead with 49 minutes left and won by 1.205 s over van der Linde; the #40 took the last podium place on the final lap, the pole-sitting #60 Acura dropped to 6th after a late energy stop. LMP2: Quinn held off Dillmann by 0.666 s. Only the positions IMSA's recaps name are listed; the rest of the GTD PRO and GTD podiums were not in the sources." },
  { t:"barber", d:"2026-09-25", s:"gtwca", event:"GT World Challenge America at Barber",
    groups:[
      { h:"Pro", winner:"#12 AF Corse USA Ferrari 296 GT3 EVO \u2014 Matias Perez Companc, Frederik Schandorff",
        gap:"Won the 3-hour race (125 laps, 3:00:36.357) after taking the combined qualifying top spot too." }
    ],
    note:"Source: gt-world-challenge-america.com race results (Barber, 2026), read Oct 16, 2026. The site's round page lists only each session's top car, so only the overall (Pro) winner is shown; other classes and the rest of the order were not confirmed." },
  { t:"indianapolis", d:"2026-10-07", s:"gtwca", event:"Indianapolis 8 Hour",
    groups:[
      { h:"Pro-Am (overall winner)", winner:"#32 GMG Racing Porsche 911 GT3 R \u2014 Kyle Washington, Riccardo Pera, Ayhancan G\u00fcven",
        gap:"Won overall by 56 seconds, the largest margin in the history of the Indianapolis 8 Hour. Clinched the Pro-Am drivers' title for Washington and the teams' title for GMG Racing.",
        podium:["#69 Archangel Motorsports McLaren 720S GT3 (2nd in class and overall)"] },
      { h:"Pro", winner:"#29 Turner Motorsport BMW M4 GT3 EVO \u2014 Justin Rothberg, Connor De Phillippi, Robby Foley",
        gap:"Foley passed the #12 AF Corse USA Ferrari for the lead with 1h22 left and clinched the Pro title for Foley and Rothberg." },
      { h:"Am", winner:"#11 MAD Joker Racing Mercedes-AMG GT3 EVO",
        gap:"Held off the #163 AF Corse USA Ferrari 296 GT3 EVO (2nd); Scuderia Corsa was 3rd. AF Corse USA's Jay Schreibman took the Am title.",
        podium:[] }
    ],
    note:"Sources: RACER race report (Oct 11, 2026) and gt-world-challenge-america.com results (winner of the race and the Pro superpole, driver names as listed there). Double-points finale. Other positions in each class were not confirmed, so none are listed." },
  { t:"indianapolis", d:"2026-10-07", s:"gt4a", event:"Pirelli GT4 America season finale, Race 2 (Oct 11)",
    groups:[
      { h:"Silver", winner:"#68 RAFA Racing Team Toyota GR Supra GT4 — Tyler Gonzalez, Westin Workman",
        gap:"Their second win of the weekend, but the title went to RS1's Luca Mars and Spencer Pumpelly by one point.", podium:[] },
      { h:"Pro-Am", winner:"#39 Dome Motorsport Mercedes-AMG GT4 — Allen Patten, Marc Miller",
        gap:"Patten passed NOLASPORT's Matt Travis with four minutes left.", podium:[] },
      { h:"Am", winner:"Laura Hayes",
        gap:"Frankie Muniz and Tyler Stone (#30 TechSport Racing Ford Mustang GT4) took the Am title.", podium:[] }
    ],
    note:"Source: SRO America's season-finale release (published on racer.com, Oct 11, 2026). Only class winners were stated; Laura Hayes' car number and co-driver were not given, and Race 1 results were not confirmed, so they are left out." },
  { t:"indianapolis", d:"2026-10-07", s:"gta", event:"GT America season finale, Race 2 (Oct 11)",
    groups:[
      { h:"SRO3", winner:"#100 Risi Competizione Maserati MC20 GT2 — Peter Dempsey",
        gap:"A weekend sweep on Maserati's GT America debut; champion Memo Gidley (#56 SKI Autosports Audi) ran second.", podium:[] },
      { h:"GT4", winner:"Damir Hot", gap:"From pole, sweeping the weekend; Craig Lumsden took the GT4 title.", podium:[] },
      { h:"Cup", winner:"David Lecko", gap:"Unopposed, closing out his Cup title season.", podium:[] }
    ],
    note:"Source: SRO America's season-finale release (published on racer.com, Oct 11, 2026). Positions below the winners were not stated, so none are listed." },
  { t:"indianapolis", d:"2026-10-07", s:"tca", event:"TC America season finale, Race 2 (Oct 11)",
    groups:[
      { h:"TC", order:[
        "1. #4 JMF Motorsports Toyota GR Corolla TC — Braydon Arthur",
        "2. #78 Ricca Autosport Hyundai Elantra N1 TC Evo — Matan Rosenberg",
        "3. #77 Ricca Autosport Hyundai Elantra N1 TC Evo — André Castro"
      ] }
    ],
    note:"Run in the rain. Arthur swept the weekend and clinched the 2026 title; Castro is vice-champion. Source: SRO America's season-finale release (published on racer.com, Oct 11, 2026); places below third were not given." },
  { t:"laguna-seca", d:"2026-09-06", s:"indycar", event:"Mission Foods Grand Prix of Monterey",
    groups:[
      { h:"Race", order:[
        "1. Scott McLaughlin (Team Penske)",
        "2. Kyle Kirkwood (Andretti Global)",
        "3. Alexander Rossi (Ed Carpenter Racing)",
        "4. Felix Rosenqvist (Meyer Shank Racing w/ Curb Agajanian)",
        "5. David Malukas (Team Penske)",
        "6. Christian Lundgaard (Arrow McLaren)",
        "7. Marcus Armstrong (Meyer Shank Racing w/ Curb Agajanian)",
        "8. Alex Palou (Chip Ganassi Racing)",
        "9. Marcus Ericsson (Andretti Global)"
      ] }
    ],
    note:"Source: INDYCAR.com \"Instant Recall\" (Sep 7, 2026). The 2026 season finale; McLaughlin led 87 of 95 laps from pole for his first win in 36 races, Kirkwood was 1.3739 s behind. Alex Palou's 8th place was enough: he had already clinched his fourth straight championship. Scott Dixon finished 17th in his last race with Chip Ganassi Racing. 10th place was not in the source. d is the race day (Sunday)." },
];
