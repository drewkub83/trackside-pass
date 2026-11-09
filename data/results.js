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
       kept for entries where only the winner was confirmed.
   "Pick your podium" (data/entries.js): when the weekend has an entry for the series there, the games are scored from these lines. Then (1) every group's `h` must be
   EXACTLY a class name of that entry (IMSA: GTP, LMP2, GTD PRO, GTD; GT World Challenge America: Pro, Pro-Am, Am; Formula 1 and IndyCar: Race), never a variant such as
   "Pro-Am (overall winner)"; (2) give the top THREE of every class whenever the report names them, one line each with the car number as "#NN" ("1. #24 BMW M Team WRT ...");
   (3) a weekend with two races: write one entry per race with `race` = the race session's name; the game scores the first one. Places the report does not name stay out. */
const RESULTS = [
  { t:"interlagos", d:"2026-11-06", s:"f1", event:"Brazilian Grand Prix",
    groups:[
      { h:"Race", order:[
        "1. #1 Lando Norris (McLaren)",
        "2. #3 Max Verstappen (Red Bull Racing)",
        "3. #6 Isack Hadjar (Red Bull Racing)",
        "4. #63 George Russell (Mercedes)",
        "5. #12 Kimi Antonelli (Mercedes)",
        "6. #81 Oscar Piastri (McLaren)",
        "7. #30 Liam Lawson (Racing Bulls)",
        "8. #16 Charles Leclerc (Ferrari)",
        "9. #44 Lewis Hamilton (Ferrari)",
        "10. #27 Nico Hülkenberg (Audi)",
        "11. #41 Arvid Lindblad (Racing Bulls)",
        "12. #14 Fernando Alonso (Aston Martin)",
        "13. #43 Franco Colapinto (Alpine)",
        "14. #10 Pierre Gasly (Alpine)",
        "15. #23 Alexander Albon (Williams)",
        "16. #5 Gabriel Bortoleto (Audi)",
        "17. #87 Oliver Bearman (Haas)",
        "18. #11 Sergio Pérez (Cadillac)",
        "19. #55 Carlos Sainz (Williams)",
        "20. #51 Rafael Camara (Haas)",
        "21. #18 Lance Stroll (Aston Martin)",
        "22. #77 Valtteri Bottas (Cadillac)"
      ] }
    ],
    note:"(automatic update) Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA race classification), full classification of the Grand Prix on 2026-11-08. Sprint results are not included." },
  { t:"lusail", d:"2026-11-06", s:"motogp", event:"Grand Prix of Qatar",
    groups:[
      { h:"Race", order:[
        "1. #72 Marco Bezzecchi (Aprilia Racing)",
        "2. #93 Marc Marquez (Ducati Lenovo Team)",
        "3. #25 Raul Fernandez (SuperFile Trackhouse MotoGP Team)",
        "4. #79 Ai Ogura (SuperFile Trackhouse MotoGP Team)",
        "5. #23 Enea Bastianini (Red Bull KTM Tech3)",
        "6. #37 Pedro Acosta (Red Bull KTM Factory Racing)",
        "7. #89 Jorge Martin (Aprilia Racing)",
        "8. #49 Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)",
        "9. #5 Johann Zarco (Castrol Honda LCR)",
        "10. #27 Iker Lecuona (BK8 Gresini Racing MotoGP)",
        "11. #21 Franco Morbidelli (Pertamina Enduro VR46 Racing Team)",
        "12. #54 Fermin Aldeguer (BK8 Gresini Racing MotoGP)",
        "13. #12 Maverick Viñales (Red Bull KTM Tech3)",
        "14. #96 Jake Dixon (Honda HRC Castrol)"
      ] }
    ],
    note:"(automatic update) Source: the MotoGP results service (api.pulselive.motogp.com, the data motogp.com is drawn from), full classification of the Sunday Grand Prix, race day 2026-11-08." },
  { t:"monza", d:"2026-11-06", s:"wec", event:"6 Hours of Monza",
    groups:[
      { h:"Hypercar", order:[
        "1. #38 Cadillac Hertz Team Jota",
        "2. #36 Alpine Endurance Team",
        "3. #51 Ferrari AF Corse",
        "4. #94 Peugeot TotalEnergies",
        "5. #15 BMW M Team WRT",
        "6. #83 AF Corse",
        "7. #20 BMW M Team WRT",
        "8. #93 Peugeot TotalEnergies",
        "9. #50 Ferrari AF Corse",
        "10. #8 Toyota Racing",
        "11. #7 Toyota Racing",
        "12. #007 Aston Martin Thor Team",
        "13. #17 Genesis Magma Racing",
        "14. #009 Aston Martin Thor Team",
        "15. #12 Cadillac Hertz Team Jota",
        "16. #35 Alpine Endurance Team",
        "17. #19 Genesis Magma Racing"
      ] },
      { h:"LMGT3", order:[
        "1. #92 The Bend Manthey",
        "2. #23 Heart Of Racing Team",
        "3. #33 TF Sport",
        "4. #69 Team WRT",
        "5. #91 Manthey DK Engineering",
        "6. #79 Iron Lynx",
        "7. #61 Iron Lynx",
        "8. #21 Vista AF Corse",
        "9. #27 Heart Of Racing Team",
        "10. #78 Akkodis ASP Team",
        "11. #34 Racing Team Turkey By TF",
        "12. #77 Proton Competition",
        "13. #10 Garage 59",
        "14. #88 Proton Competition",
        "15. #87 Akkodis ASP Team",
        "16. #54 Vista AF Corse",
        "17. #58 Garage 59",
        "18. #32 Team WRT"
      ] }
    ],
    note:"(automatic update) Source: fiawec.com race summary page (race/summary/5066), full classification of each class, read 2026-11-09." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", event:"Mexico City Grand Prix",
    groups:[
      { h:"Race", order:[
        "1. #3 Max Verstappen (Red Bull Racing)",
        "2. #44 Lewis Hamilton (Ferrari)",
        "3. #12 Kimi Antonelli (Mercedes)",
        "4. #16 Charles Leclerc (Ferrari)",
        "5. #1 Lando Norris (McLaren)",
        "6. #63 George Russell (Mercedes)",
        "7. #30 Liam Lawson (Racing Bulls)",
        "8. #5 Gabriel Bortoleto (Audi)",
        "9. #6 Isack Hadjar (Red Bull Racing)",
        "10. #50 Ryo Hirakawa (Haas)",
        "11. #23 Alexander Albon (Williams)",
        "12. #55 Carlos Sainz (Williams)",
        "13. #81 Oscar Piastri (McLaren)",
        "14. #27 Nico Hülkenberg (Audi)",
        "15. #43 Franco Colapinto (Alpine)",
        "16. #11 Sergio Pérez (Cadillac)",
        "17. #10 Pierre Gasly (Alpine)",
        "18. #41 Arvid Lindblad (Racing Bulls)",
        "19. #87 Oliver Bearman (Haas)",
        "20. #77 Valtteri Bottas (Cadillac)",
        "21. #18 Lance Stroll (Aston Martin)",
        "22. #14 Fernando Alonso (Aston Martin)"
      ] }
    ],
    note:"(automatic update) Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA race classification), full classification of the Grand Prix on 2026-11-01. Sprint results are not included." },
  { t:"martinsville", d:"2026-10-30", s:"nascar", event:"Xfinity 500",
    groups:[
      { h:"Race", order:[
        "1. #24 William Byron (Hendrick Motorsports)",
        "2. #9 Chase Elliott (Hendrick Motorsports)",
        "3. #54 Ty Gibbs (Joe Gibbs Racing)",
        "4. #21 Josh Berry (Wood Brothers Racing)",
        "5. #97 Shane Van Gisbergen (Trackhouse Racing)",
        "6. #11 Denny Hamlin (Joe Gibbs Racing)",
        "7. #3 Austin Dillon (Richard Childress Racing)",
        "8. #23 Bubba Wallace (23XI Racing)",
        "9. #5 Kyle Larson (Hendrick Motorsports)",
        "10. #20 Christopher Bell (Joe Gibbs Racing)",
        "11. #1 Ross Chastain (Trackhouse Racing)",
        "12. #45 Tyler Reddick (23XI Racing)",
        "13. #48 Alex Bowman (Hendrick Motorsports)",
        "14. #19 Chase Briscoe (Joe Gibbs Racing)",
        "15. #34 Todd Gilliland (Front Row Motorsports)",
        "16. #71 Michael McDowell (Spire Motorsports)",
        "17. #88 Connor Zilisch (Trackhouse Racing)",
        "18. #22 Joey Logano (Team Penske)",
        "19. #38 Zane Smith (Front Row Motorsports)",
        "20. #33 Austin Hill (Richard Childress Racing)",
        "21. #77 Carson Hocevar (Spire Motorsports)",
        "22. #10 Ty Dillon (Kaulig Racing)",
        "23. #60 Ryan Preece (RFK Racing)",
        "24. #17 Chris Buescher (RFK Racing)",
        "25. #16 AJ Allmendinger (Kaulig Racing)",
        "26. #4 Noah Gragson (Front Row Motorsports)",
        "27. #6 Brad Keselowski (RFK Racing)",
        "28. #7 Daniel Suárez (Spire Motorsports)",
        "29. #43 Erik Jones (Legacy Motor Club)",
        "30. #47 Ricky Stenhouse Jr (HYAK Motorsports)",
        "31. #42 John H. Nemechek (Legacy Motor Club)",
        "32. #35 Riley Herbst (23XI Racing)",
        "33. #51 Cody Ware (Rick Ware Racing)",
        "34. #41 Cole Custer (Haas Factory Team)",
        "35. #12 Ryan Blaney (Team Penske)",
        "36. #2 Austin Cindric (Team Penske)",
        "37. #66 Josh Bilicki (Garage 66)"
      ] }
    ],
    note:"(automatic update) Source: NASCAR race data (cf.nascar.com, the files nascar.com race pages use), full classification of the race, race day 2026-11-01." },
  { t:"sepang", d:"2026-10-30", s:"motogp", event:"Grand Prix of Malaysia",
    groups:[
      { h:"Race", order:[
        "1. #93 Marc Marquez (Ducati Lenovo Team)",
        "2. #37 Pedro Acosta (Red Bull KTM Factory Racing)",
        "3. #73 Alex Marquez (BK8 Gresini Racing MotoGP)",
        "4. #79 Ai Ogura (SuperFile Trackhouse MotoGP Team)",
        "5. #23 Enea Bastianini (Red Bull KTM Tech3)",
        "6. #72 Marco Bezzecchi (Aprilia Racing)",
        "7. #10 Luca Marini (Honda HRC Castrol)",
        "8. #49 Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)",
        "9. #33 Brad Binder (Red Bull KTM Factory Racing)",
        "10. #21 Franco Morbidelli (Pertamina Enduro VR46 Racing Team)",
        "11. #20 Fabio Quartararo (Monster Energy Yamaha MotoGP Team)",
        "12. #42 Alex Rins (Monster Energy Yamaha MotoGP Team)",
        "13. #63 Francesco Bagnaia (Ducati Lenovo Team)",
        "14. #12 Maverick Viñales (Red Bull KTM Tech3)",
        "15. #27 Iker Lecuona (BK8 Gresini Racing MotoGP)",
        "16. #43 Jack Miller (Prima Pramac Yamaha MotoGP)"
      ] }
    ],
    note:"(automatic update) Source: the MotoGP results service (api.pulselive.motogp.com, the data motogp.com is drawn from), full classification of the Sunday Grand Prix, race day 2026-11-01." },
  { t:"cota", d:"2026-10-23", s:"f1", event:"United States Grand Prix",
    groups:[
      { h:"Race", order:[
        "1. #12 Kimi Antonelli (Mercedes)",
        "2. #16 Charles Leclerc (Ferrari)",
        "3. #3 Max Verstappen (Red Bull Racing)",
        "4. #44 Lewis Hamilton (Ferrari)",
        "5. #1 Lando Norris (McLaren)",
        "6. #6 Isack Hadjar (Red Bull Racing)",
        "7. #81 Oscar Piastri (McLaren)",
        "8. #63 George Russell (Mercedes)",
        "9. #30 Liam Lawson (Racing Bulls)",
        "10. #10 Pierre Gasly (Alpine)",
        "11. #27 Nico Hülkenberg (Audi)",
        "12. #41 Arvid Lindblad (Racing Bulls)",
        "13. #5 Gabriel Bortoleto (Audi)",
        "14. #31 Esteban Ocon (Haas)",
        "15. #18 Lance Stroll (Aston Martin)",
        "16. #14 Fernando Alonso (Aston Martin)",
        "17. #23 Alexander Albon (Williams)",
        "18. #55 Carlos Sainz (Williams)",
        "19. #11 Sergio Pérez (Cadillac)",
        "20. #77 Valtteri Bottas (Cadillac)",
        "21. #43 Franco Colapinto (Alpine)",
        "22. #87 Oliver Bearman (Haas)"
      ] }
    ],
    note:"(automatic update) Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA race classification), full classification of the Grand Prix on 2026-10-25. Sprint results are not included." },
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
  { t:"cota", d:"2026-10-23", s:"f1academy", race:"Opening Race - F1 Academy", event:"F1 Academy, Austin: Opening Race",
    groups:[
      { h:"Race", order:[
        "1. Alisha Palmowski (Campos Racing)",
        "2. Nina Gademan",
        "3. Alba Larsen",
        "4. Lisa Billard",
        "5. Emma Felbermayr",
        "6. Natalia Granada",
        "7. Payton Westcott"
      ] }
    ],
    note:"Sources: F1 Academy, 'Opening Race: Alisha Palmowski claims her fifth victory of the season in commanding Austin drive' (f1academy.com); Formula1.com, 'Alisha Palmowski closes in on title with Opening Race victory in Austin'; Pit Debrief race report. Car numbers and teams other than the winner's are left out: the reports seen did not give them." },
  { t:"cota", d:"2026-10-23", s:"carrera", race:"Race 1 of 2 - Porsche Carrera Cup", event:"Porsche Carrera Cup North America, COTA: Race 1 of 2",
    groups:[
      { h:"Pro", order:[
        "1. #40 ACI Motorsports — Janne Stiak",
        "2. #24 Kellymoss — Aaron Jeansonne",
        "3. #77 TOPP Racing — Tyler Maxson"
      ] },
      { h:"Pro-Am", order:[
        "1. #14 GMG Racing — James Sofronas",
        "2. #54 Patrick Mulcahy",
        "3. #58 Kellymoss — Steve Wetterau"
      ] },
      { h:"Masters", order:[
        "1. #45 Ruckus Racing — Scott Blind"
      ] }
    ],
    note:"Sources: Porsche Motorsport North America (\"Stiak takes COTA win, Maxson clinches Mobil Pro class title\") and Sportscar365 (\"Stiak Earns Win, Maxson Clinches Pro Title in Race 1 at COTA\"), Oct 24, 2026 (via web search; direct fetch was blocked in this environment). Stiak's second win of the season; Maxson's third place clinched the 2026 Pro title (provisional, subject to post-race technical inspection). A late multi-car Masters incident meant the race ended under yellow. Sofronas led all 13 laps. Mulcahy's team was not given; places below those listed were not confirmed in these sources." },
  { t:"cota", d:"2026-10-23", s:"f1academy", race:"Reverse Grid Race - F1 Academy", event:"F1 Academy, Austin: Reverse Grid Race",
    groups:[
      { h:"Race", order:[
        "1. Alba Larsen",
        "2. Alisha Palmowski (Campos Racing)",
        "3. Lisa Billard"
      ] }
    ],
    note:"Sources: Pit Debrief, 'F1 Academy 2026 United States GP Reverse Grid Race report' and 'Reverse Grid Race results' (pitdebrief.com, Oct 24, 2026; via web search, direct fetch blocked here). Larsen's first F1 Academy win, from 4th on the grid; Palmowski came from 8th to 2nd and clinched the 2026 drivers' title; Billard's first series podium. A Safety Car followed a Turn 16 collision (Ferreira, Jacquet, Danielsson). Places below 3rd, car numbers and the other teams were not confirmed in the reports seen, so they are left out." },
  { t:"cota", d:"2026-10-23", s:"carrera", race:"Race 2 of 2 - Porsche Carrera Cup", event:"Porsche Carrera Cup North America, COTA: Race 2 of 2 (season finale)",
    groups:[
      { h:"Pro", order:[
        "1. #77 TOPP Racing — Tyler Maxson",
        "2. #40 ACI Motorsports — Janne Stiak",
        "3. #96 JTR Motorsports Engineering — Jared Thomas"
      ] },
      { h:"Pro-Am", order:[
        "1. #54 ACI Motorsports — Patrick Mulcahy"
      ] }
    ],
    note:"Source: Sportscar365, \"Maxson Captures Season Finale Win at COTA\" (Oct 25, 2026; via web search, direct fetch blocked here). Maxson, already 2026 Pro champion after Race 1, won by more than six seconds. Callum Hedge got a 10-second post-race penalty for track limits, which promoted Stiak to 2nd and Thomas to 3rd. Pro-Am places below the winner and the Masters class result were not in the report seen, so they are left out." },
  { t:"cota", d:"2026-10-23", s:"f1academy", race:"Feature Race - F1 Academy", event:"F1 Academy, Austin: Feature Race",
    groups:[
      { h:"Race", order:[
        "1. Nina Gademan (MP Motorsport)",
        "2. Payton Westcott",
        "3. Natalia Granada",
        "4. Jade Jacquet",
        "5. Emma Felbermayr"
      ] }
    ],
    note:"Sources: Pit Debrief, 'F1 Academy 2026 United States GP Feature Race report' and 'Feature Race results' (pitdebrief.com, Oct 25, 2026); Motorsport Week, 'F1 Academy 2026 US GP - Feature Race Results' (via web search). Gademan won from 3rd on the grid. Champion Alisha Palmowski and Alba Larsen collided on lap 10 while fighting for 2nd and both retired. Jacquet's 4th is her best F1 Academy finish. Car numbers and the other teams were not confirmed in the reports seen, so they are left out." },
  { t:"martinsville", d:"2026-10-30", s:"trucks", race:"Race - Craftsman Truck Series", event:"NASCAR Craftsman Truck Series, Martinsville: Black's Tire 200",
    groups:[
      { h:"Race", order:[
        "1. Chandler Smith (Front Row Motorsports)",
        "2. Ben Rhodes",
        "3. Layne Riggs (Front Row Motorsports)",
        "4. Ty Majeski",
        "5. Tristan McKee"
      ] }
    ],
    note:"Sources: Yahoo Sports, 'Race Results: 2026 NASCAR Truck Series Black's Tire 200 at Martinsville' and 'Chandler Smith wins Martinsville as NASCAR Truck title fight tightens'; Yardbarker, 'Chandler Smith wins NASCAR Truck Series race at Martinsville; Layne Riggs gains on Kaden Honeycutt'; Racing News, 'Martinsville Race Results: NASCAR Trucks (October 30, 2026)' (Oct 30, 2026; via web search, direct fetch blocked here). Results were unofficial when reported. Smith passed teammate Riggs on the final restart and won by 0.574s; pole-sitter McKee (16) became the youngest pole winner in series history. Points leader Kaden Honeycutt finished 14th and leads Riggs by 20 points going to Homestead. Truck numbers and the teams of Rhodes, Majeski and McKee were not confirmed in the reports seen, so they are left out." },
  { t:"martinsville", d:"2026-10-30", s:"oreilly", race:"Race - O'Reilly Auto Parts Series", event:"NASCAR O'Reilly Auto Parts Series, Martinsville: National Debt Relief 250",
    groups:[
      { h:"Race", order:[
        "1. #1 Carson Kvapil (JR Motorsports)",
        "2. #7 Justin Allgaier (JR Motorsports)",
        "3. #17 Corey Day (Hendrick Motorsports)",
        "4. #20 Brandon Jones (Joe Gibbs Racing)"
      ] }
    ],
    note:"Sources: Motorsport.com, 'Carson Kvapil wins Martinsville as Justin Allgaier takes NASCAR O'Reilly points lead'; Yahoo Sports, 'Who won NASCAR O'Reilly Series Martinsville race? Winner is Carson Kvapil plus full results'; Jayski, 'Carson Kvapil delivers clutch performance at Martinsville to keep championship hopes alive' (Oct 31, 2026; via web search, direct fetch blocked here). Results were unofficial when reported. Kvapil led a race-high 121 laps and beat teammate Allgaier by 0.434s; Allgaier took the points lead from Jesse Love, who finished 30th. Places below 4th were not confirmed in the reports seen, so they are left out." },
  { t:"homestead-miami", d:"2026-11-06", s:"trucks", race:"Race - Craftsman Truck Series", event:"NASCAR Craftsman Truck Series Championship Race, Homestead-Miami",
    groups:[
      { h:"Race", order:[
        "1. #11 Kaden Honeycutt (Tricon Garage)",
        "2. #91 Christian Eckes (McAnally-Hilgemann Racing)",
        "3. #19 Daniel Hemric (McAnally-Hilgemann Racing)",
        "4. #88 Ty Majeski (ThorSport Racing)",
        "5. Stewart Friesen"
      ] }
    ],
    note:"Sources: Racing News, 'Homestead Race Results: NASCAR Trucks (November 6, 2026)'; Yahoo Sports, 'NASCAR Truck Series results, finishing order of championship race at Homestead'; Yardbarker, 'Kaden Honeycutt wins NASCAR Truck Series race at Homestead and 2026 championship' (Nov 6-7, 2026; via web search, direct fetch blocked here). Honeycutt won his first Truck Series championship, beating points leader Layne Riggs by 83 points; Riggs was collected in contact with Nick Sanchez on lap 2, took a flat tire, and finished 32nd, six laps down. Stewart Friesen's truck number and team were not confirmed in the sources seen." },
  { t:"homestead-miami", d:"2026-11-06", s:"oreilly", race:"Race - O'Reilly Auto Parts Series", event:"NASCAR O'Reilly Auto Parts Series Championship Race, Homestead-Miami",
    groups:[
      { h:"Race", order:[
        "1. #20 Brandon Jones (Joe Gibbs Racing)",
        "2. #1 Carson Kvapil (JR Motorsports)",
        "3. #19 Brent Crews (Joe Gibbs Racing)",
        "4. #2 Jesse Love (Richard Childress Racing)",
        "5. #99 Parker Retzlaff (Viking Motorsports)"
      ] }
    ],
    note:"Sources: Motorsport.com, 'Justin Allgaier wins 2026 NASCAR O'Reilly championship as Brandon Jones wins Homestead finale'; Yahoo Sports, 'NASCAR O'Reilly Series results, finishing order of championship race at Homestead'; Racing News, 'Homestead-Miami Race Results: NASCAR O'Reilly (November 7, 2026)' (Nov 7, 2026; via web search, direct fetch blocked here). Jones held off Kvapil by 3.937 seconds for his ninth series win. Justin Allgaier (#7) finished 7th, enough to win the 2026 championship by 14 points over defending champion Jesse Love -- JR Motorsports' fifth series title. Crews was the highest-finishing rookie and secured 2026 Rookie of the Year." }
];
