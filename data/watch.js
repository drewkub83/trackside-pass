/* Cars and drivers to watch: one entry per series per race weekend, written after that series' last race so it is accurate.
   t = track id, d = first day of the event, s = series id (matches SERIES in series.js; the Race Day hub shows the entry for
   whichever series is on track), asOf = what it is current as of, groups = [{h: class, items: [[car or driver, why]]}].
   from (optional) = the first day an entry shows. To update a series mid-weekend, add a NEW entry with the same t, d and s and a
   later from (for example after qualifying): the newest entry whose from has arrived replaces the older one. Old entries stay as history.
   Facts are only what published race reports and standings said. Refresh this before each weekend. */
const WATCH = [
  { t:"cota", d:"2026-10-23", s:"f1", asOf:"Current on Oct 16, a week before practice: the standings are after the Singapore Grand Prix (17 races done, six to go), and the weekend's session times are formula1.com's.",
    groups:[
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points with six races left and eight wins this season. He can clinch the title in Austin only if he wins, George Russell finishes ninth or lower and Lewis Hamilton finishes fifth or lower; a second place leaves it open."],
        ["George Russell (Mercedes)", "Antonelli's team-mate is second on 238 points with three wins (Australia, Austria, Azerbaijan). He keeps the title fight going unless Antonelli wins and he finishes ninth or lower."]
      ] },
      { h:"The chasers", items:[
        ["Lewis Hamilton (Ferrari)", "Third on 229 points. If Antonelli wins, a Hamilton finish in the top four keeps Antonelli from clinching. He holds the record for Austin wins, five between 2012 and 2017."],
        ["Max Verstappen (Red Bull Racing)", "Won the last two races, in Bahrain and Singapore, and is fourth on 221. He won at COTA in 2023 after starting sixth."],
        ["Charles Leclerc (Ferrari)", "Fifth on 215 points and winner of the British GP. His 1:36.169 from 2019 is still the official race lap record at COTA."],
        ["Lando Norris (McLaren)", "Sixth on 201 points with two wins this year, in Hungary and the Netherlands. McLaren and Red Bull Racing are only seven points apart in the fight for third in the constructors' championship."]
      ] },
      { h:"What to look for", items:[
        ["Three practice sessions, no sprint", "Austin has two practice sessions on Friday (12:30 and 16:00 local) and a third on Saturday at 12:30, then qualifying at 16:00. The race is Sunday at 15:00. With no sprint, practice is the only time the teams get to learn the car on this track."],
        ["Where the track decides things", "Turn 1 is a climb into a broad corner with difficult braking, turns 3 to 6 are a fast sequence where a messy entry hurts the next change of direction, and the stadium section at turns 12 to 15 rewards placing the car precisely. Turns 15 and 16 are a good place for close racing."]
      ] }
    ],
    note:"Sources: formula1.com (2026 standings and race results, read Oct 16, 2026; the Austin timetable and the circuit's official race lap record), GrandPrix.com, 'How Antonelli can clinch the 2026 title in Austin' (Oct 11, 2026), and GrandPrix247's Austin preview for the circuit notes. Hamilton's and Verstappen's COTA records are from Motorsport Week's race-week guide." },
  { t:"portimao", d:"2026-10-15", s:"gtwce", asOf:"Current on Oct 15, before practice: the 61-car entry list is official and the standings are after round 9 (Barcelona). The 3-hour race is Saturday, Oct 17, 5 PM track time.",
    groups:[
      { h:"The headline: Pro", items:[
        ["#3 Mercedes-AMG Team Verstappen Racing (Max Verstappen, Ben Barnicoat, Chris Lulham)", "Four-time Formula 1 champion Max Verstappen makes his GT World Challenge Europe debut, in the car run by 2Seas Motorsport (Daily Sportscar). The car's only Endurance Cup podium this season was the Nürburgring, where it finished 3rd in the Pro class."],
        ["#48 Mercedes-AMG Team MANN-FILTER (Lucas Auer, Maro Engel, Luca Stolz)", "Already Endurance Cup drivers' champions, clinched at the Nürburgring. They have not finished lower than 4th in the Pro class in four Endurance Cup races, so for them the finale is a free swing at a win."],
        ["#7 Comtoyou Aston Martin (Mattia Drudi, Nicki Thiim, Ross Gunn)", "Won the Pro class at Paul Ricard and at the Nürburgring. Ross Gunn replaces Marco Sorensen for this round. Comtoyou are second in the Endurance Cup teams table, 26 points behind Winward, and can only catch them with a perfect weekend (Daily Sportscar)."]] },
      { h:"Overall titles", items:[
        ["Lucas Auer / Maro Engel (Winward)", "Lead the full-season drivers' table on 131.5 points, 29.5 clear of the next crew, with the final round to run. The series marks the standings provisional, and Daily Sportscar says the outcome of an appeal over a Misano disqualification could cut the lead to 20."],
        ["Team WRT vs Winward Racing", "Team WRT lead the full-season teams table on 142.5, five points ahead of Winward on 137.5."]] },
      { h:"Gold Cup: three crews, one title", items:[
        ["#998 Rowe Racing BMW (Ugo De Wilde, Jens Klingmann, Tim Tramnitz)", "Lead the Endurance Cup Gold standings on 89 points, three clear of #58. Won the Spa 24 Hours class."],
        ["#58 Garage 59 McLaren (Benjamin Goethe, Louis Prette, Thomas Fleming)", "Three points back on 86, and the Paul Ricard class winners. #71 Selected Car Racing Ferrari (11 back) is the outside chance."]] },
      { h:"Bronze Cup", items:[
        ["#74 Kessel Racing Ferrari (Dustin Blattner and team-mates)", "Won the Bronze class at Monza and Spa. Dustin Blattner has 87 points to the #991 Paradine BMW crew's 71. The points table lists Dennis Marschall first on 102, but Daily Sportscar and Dive-Bomb both say the Bronze title fight is really Blattner against the #991 crew because of driver-eligibility rules. They differ on who exactly is ineligible, so treat that detail as unconfirmed."]] },
      { h:"Silver Cup", items:[
        ["#30 Team WRT BMW (Ignacio Montenegro, Amaury Cordeel, Matisse Lismont)", "The Silver Cup title is already decided in their favour (87 points to 56). They have finished second in the class three times this season but have no Endurance Cup class win yet, so a victory is the thing left to chase."]] }
    ],
    note:"Sources: the series' own standings pages (Endurance Cup tables by class and the teams table, read Oct 14), its official entry list and Main Race results for Paul Ricard, Monza, Spa and the Nürburgring, its finale news piece, and Daily Sportscar's entry-list report (Oct 14) and Dive-Bomb's preview for the title situations and the Misano appeal. The #3 line-up is new, so no form is shown for it. Several sources disagree on small details (Daily Sportscar calls the #71 an AF Corse entry; the official list says Selected Car Racing, which is used here). Standings are provisional." },
  { t:"portimao", d:"2026-10-15", s:"gtwce", from:"2026-10-16",
    asOf:"Current after Friday morning's Free Practice 1; FP2 and qualifying are later Friday, the race is Saturday at 5 PM track time.",
    groups:[
      { h:"The headline: Pro", items:[
        ["#3 Mercedes-AMG Team Verstappen Racing (Max Verstappen, Ben Barnicoat, Chris Lulham)", "Verstappen's official GT World Challenge Europe debut: 20th overall in FP1 on a 1:43.046, about four tenths off the pace. Three minutes into the session he made contact with Ezequiel Pérez Companc's #25 Sainteloc Racing Audi at Turn 3, and the incident was still under investigation as of FP1's end (GPFans, PlanetF1, Speedweek)."],
        ["#84 Eastalent Racing Audi (Christopher Haase, Simon Reicher, Markus Winkelhock)", "Topped FP1 outright, a 1:42.643 that beat Kelvin van der Linde's #32 Team WRT BMW by just 0.004s (GT World Challenge Europe's own FP1 report, Daily Sportscar)."],
        ["#48 Mercedes-AMG Team MANN-FILTER (Lucas Auer, Maro Engel, Luca Stolz)", "Already Endurance Cup drivers' champions, clinched at the Nürburgring; the finale is a free swing at a win for them."],
        ["#7 Comtoyou Aston Martin (Mattia Drudi, Nicki Thiim, Ross Gunn)", "Won the Pro class at Paul Ricard and the Nürburgring. Comtoyou are second in the Endurance Cup teams table, 26 points behind Winward, and need a perfect weekend to catch them."]] },
      { h:"Overall titles", items:[
        ["Lucas Auer / Maro Engel (Winward)", "Lead the full-season drivers' table on 131.5 points, 29.5 clear of the next crew, with the final round to run. The series marks the standings provisional pending an appeal over a Misano disqualification."],
        ["Team WRT vs Winward Racing", "Team WRT lead the full-season teams table on 142.5, five points ahead of Winward on 137.5."]] },
      { h:"Gold Cup: three crews, one title", items:[
        ["#998 Rowe Racing BMW (Ugo De Wilde, Jens Klingmann, Tim Tramnitz)", "Lead the Endurance Cup Gold standings on 89 points, three clear of #58."],
        ["#58 Garage 59 McLaren (Benjamin Goethe, Louis Prette, Thomas Fleming)", "Three points back on 86. #71 Selected Car Racing Ferrari (11 back) is the outside chance."],
        ["#99 Tresor by Attempto Audi (Alex Aka and team-mates)", "Fastest Gold Cup car in FP1, 3rd overall on a 1:42.686, though it is not one of the three crews fighting for the Gold Cup title."]] },
      { h:"Bronze Cup", items:[
        ["#74 Kessel Racing Ferrari (Dustin Blattner and team-mates)", "Won the Bronze class at Monza and Spa. Dustin Blattner has 87 points to the #991 Paradine BMW crew's 71; Daily Sportscar and Dive-Bomb say the real fight is Blattner against that crew because of driver-eligibility rules affecting the points table's nominal leader."],
        ["#11 Comtoyou Aston Martin (Valentin Hasse-Clot and team-mates)", "Fastest Bronze Cup car in FP1, 7th overall on a 1:42.850."]] },
      { h:"Silver Cup", items:[
        ["#30 Team WRT BMW (Ignacio Montenegro, Amaury Cordeel, Matisse Lismont)", "The Silver Cup title is already decided in their favour. They were also the fastest Silver Cup car in FP1, 10th overall, though still without an Endurance Cup class win this season."]] }
    ],
    note:"Sources: GT World Challenge Europe's own FP1 report (\"FP1: Haase fastest for Eastalaent Audi as Verstappen makes official debut at Portimão\") and results page, plus search-engine summaries of Daily Sportscar's FP1 report and GPFans/PlanetF1/Speedweek coverage of the Verstappen-Pérez Companc contact. The series' own site and Daily Sportscar could not be reached directly from this environment, so those details are relayed via published-article summaries rather than the original pages. The Eastalent crew's Portimão line-up is inferred from its season-long Endurance Cup roster (Haase/Reicher plus Winkelhock for enduros), not a Portimão-specific confirmation. Standings carried over from the Oct 15 entry are unchanged since Oct 14." },
  { t:"portimao", d:"2026-10-15", s:"gtwce", from:"2026-10-17",
    asOf:"Current after Friday evening's qualifying; the 3-hour race starts Saturday at 5 PM local time (12 PM EDT). The series' own results pages could not be reached directly from this environment; this entry relies on published-article summaries (RACER, Motorsport.com, Speedweek, Dive-Bomb, GPblog and others), which agree on the headline positions but not on every detail.",
    groups:[
      { h:"The headline: Pro", items:[
        ["#3 Mercedes-AMG Team Verstappen Racing (Max Verstappen, Ben Barnicoat, Chris Lulham)", "Verstappen starts his GT World Challenge Europe race debut 15th of 61 cars, 0.553s off pole after a session the team described as bouncing and handling trouble; Verstappen's own 1:42.093 was the fastest of the three drivers' laps, more than half a second quicker than his team-mates'."],
        ["#2 Boutsen VDS Porsche (Morris Schuring, Dorian Boccolacci, Alessio Picariello)", "Overall and Pro-class pole, 1:42.071, the team's first-ever Endurance Cup pole and Porsche's first in just over two years. #17 GetSpeed Mercedes-AMG starts 2nd (+0.108s) and the #80 Lionspeed GP Porsche 3rd (+0.179s)."],
        ["#7 Comtoyou Aston Martin (Mattia Drudi, Nicki Thiim, Ross Gunn)", "Qualified 9th, +0.281s off pole. Missing the pole position bonus point, needed as part of a perfect weekend to catch Winward in the Endurance Cup teams' standings, led RACER to report the point as mathematically settled in Winward's favour; that call is not independently confirmed from this environment."],
        ["#48 Mercedes-AMG Team MANN-FILTER (Lucas Auer, Maro Engel, Luca Stolz)", "Already Endurance Cup drivers' champions; the finale is a free swing at a win."]] },
      { h:"Overall titles", items:[
        ["Lucas Auer / Maro Engel (Winward)", "Lead the full-season drivers' table by 29.5 points with the final round to run, pending the Misano DQ appeal."],
        ["Team WRT vs Winward Racing", "Team WRT lead the full-season teams table by five points over Winward entering the race."]] },
      { h:"Gold Cup: three crews, one title", items:[
        ["#71 Selected Car Racing Ferrari (Frederik Schandorff, Malte Ebdrup, Simon Birch)", "Took Gold Cup pole and the fastest lap of the whole session, Birch's 1:41.652, starting 8th overall. They came in 11 points behind standings leader #998 Rowe and 8 behind #58 Garage 59, so pole's bonus point narrows that gap a little."],
        ["#58 Garage 59 McLaren (Benjamin Goethe, Louis Prette, Thomas Fleming)", "Second in Gold Cup qualifying, +0.189s off their class pole, 3 points behind #998 Rowe in the standings."],
        ["#998 Rowe Racing BMW (Ugo De Wilde, Jens Klingmann, Tim Tramnitz)", "Leads the Gold Cup standings by 3 points over Garage 59 but did not qualify among the fastest Gold Cup cars; its exact grid slot could not be confirmed from this environment."]] },
      { h:"Bronze Cup", items:[
        ["#991 Paradine Competition BMW (Darren Leung, James Kellett, Robert de Haan)", "Took Bronze Cup pole, the team's first pole of its 2026 Endurance campaign, as the crew chasing Kessel's Dustin Blattner (71 points to 87) for the Bronze title."],
        ["#74 Kessel Racing Ferrari (Dustin Blattner and team-mates)", "Won the Bronze class at Monza and Spa. Its Portimão grid slot could not be confirmed from this environment."]] },
      { h:"Silver Cup", items:[
        ["#65 HRT Ford Mustang (Eduardo Coseteng, Maxime Oosten, Nicolas Baert)", "Took Silver Cup pole, 13th overall, the team's second class pole of the season after Monza."],
        ["#30 Team WRT BMW (Ignacio Montenegro, Amaury Cordeel, Matisse Lismont)", "The Silver Cup title is already decided in their favour; their grid slot here could not be confirmed from this environment, but they are chasing their first Endurance Cup class win of the season."]] }
    ],
    note:"Sources: RACER (\"Verstappen starting 15th for GT return; Boutsen VDS Porsche takes Portimao pole\"), Motorsport.com, Speedweek, GPblog, Dive-Bomb and Motorsport Week qualifying reports (all Oct 16-17, reached via search-engine summaries since gt-world-challenge-europe.com, sportscar365.com and most outlets' own pages could not be reached directly from this environment). Gold/Bronze/Silver class pole crews and gaps are corroborated across multiple of those reports; #998 Rowe's, #74 Kessel's and #30 WRT's exact grid positions were not found and are left unconfirmed rather than guessed. The Winward/Comtoyou teams'-title claim is RACER's alone. A general Portimão forecast (AccuWeather) showed dry, mild conditions for Saturday with low rain chance; no race-specific forecast was found. Standings and title-fight framing carried over from the Oct 15/16 entries." },
  { t:"barber", d:"2026-09-25", s:"gtwca", asOf:"Current after Road America (Aug 30). Barber is the second-to-last round.",
    groups:[
      { h:"GT World Challenge America: Pro", items:[
        ["#8 JMF Motorsports (Michai Stephens, Mikael Grenier)", "Lead the Pro standings by 4 points, 96 to 92, after Road America."],
        ["#29 Turner Motorsport BMW (Justin Rothberg, Robby Foley)", "Won at Road America, their second Pro win of the season, and trail JMF by 4 points with one round left."]] },
      { h:"Pro-Am", items:[
        ["Dave Musial Jr. and Ryan Yardley (Wright Motorsports)", "Lead Pro-Am by 3 points, 80 to 77 over Kyle Washington and Tom Sargent, after moving into the lead at Road America."],
        ["#9 TR3 Racing Mercedes (Brayton Williams, Daniel Morad)", "Won Pro-Am at Road America and finished third overall, but sit seventh in the Pro-Am standings on 40 points."]] },
      { h:"Am", items:[
        ["Jay Schreibman (AF Corse USA)", "Leads Am by a wide margin, 118 points to 75 for second-placed Oswaldo Negri, after winning the first four rounds; Road America ended his unbeaten run."],
        ["#67 Scuderia Corsa Ferrari (Mitchell Green, Jon Morley)", "Won Am at Road America on the team's series debut, after a drive-through penalty."]] }
    ],
    note:"Sources: GT World Challenge America's own standings pages (checked directly, Pro/Pro-Am/Am driver tables) plus RACER and Frontstretch race reports. Point totals above are confirmed current through Road America (Round 5)." },
  { t:"barber", d:"2026-09-25", s:"gtwca", from:"2026-09-27",
    asOf:"Current after Sunday morning qualifying (Qualifying 1 and 2). The race starts at 12:30 PM CT.",
    groups:[
      { h:"GT World Challenge America: Pro", items:[
        ["#12 AF Corse USA Ferrari (Frederik Schandorff, Matias Perez Companc)", "Took overall pole for the race, edging the Pro points leaders by just 0.027 seconds on a two-session average of 1:20.868."],
        ["#34 JMF Motorsports Mercedes-AMG (Michai Stephens, Mikael Grenier)", "Start second and still lead the Pro standings by 4 points, 96 to 92, over Turner Motorsport's Rothberg and Foley entering the race."],
        ["#29 Turner Motorsport BMW (Justin Rothberg, Robby Foley)", "Trail JMF by 4 points with one round left after Barber; won at Road America and need another strong result to keep the title fight open for the finale."]] },
      { h:"Pro-Am", items:[
        ["#28 RS1 Porsche (Jan Heylen, Danny Dyszelski)", "Took Pro-Am pole, 4th overall, with Heylen arriving at Barber 14 points behind the Pro-Am points leaders."],
        ["#31 Wright Motorsports Porsche (Dave Musial Jr., Ryan Yardley)", "Lead Pro-Am by 3 points over GMG Racing's Washington and Sargent entering the race."],
        ["#32 GMG Racing Porsche (Kyle Washington, Tom Sargent)", "Qualified 12th overall despite Sargent turning the fastest single lap of the weekend; Sargent says they \"have to win\" at Barber to stay in the Pro-Am fight."]] },
      { h:"Am", items:[
        ["Jay Schreibman (AF Corse USA)", "The Am points leader's #163 Ferrari is the only Am entry at Barber; he only needs to complete his minimum drive time in the final two races to clinch the title."],
        ["#163 AF Corse USA Ferrari (Jay Schreibman, Oswaldo Negri)", "Negri returns to the car at Barber after missing the previous two rounds while recovering from Achilles tendon surgery."]] }
    ],
    note:"Sources: Sportscar365 and Daily Sportscar (Barber qualifying reports and practice notebooks), GT REPORT (Friday and Saturday on-track notebooks), and Pit Debrief (Barber preview and standings), checked Sunday morning Sept 27 after Qualifying 1 and 2." },
  { t:"barber", d:"2026-09-25", s:"gt4a", asOf:"Current after Road America (Aug 30). Barber is the second-to-last GT4 America weekend; Indianapolis (Oct 8-11) closes the season.",
    groups:[
      { h:"Silver", items:[
        ["#028 RS1 Porsche 718 Cayman GT4 RS Clubsport (Spencer Pumpelly, Luca Mars)", "Lead Silver by 59 points and can clinch the title at Barber, according to Sportscar365's preview. RS1 also won the wet Race 2 at Road America."],
        ["RAFA Racing Team Toyota GR Supra GT4 EVO2 (Westin Workman, Tyler Gonzalez)", "The nearest challengers to RS1 in the Silver standings."]] },
      { h:"Pro-Am", items:[
        ["#94 Random Vandals Racing BMW M4 GT4 (Sam Craven, Kenton Koch)", "Lead Pro-Am, but Blackdog Racing's McLaren has been closing in."],
        ["#33 Blackdog Racing McLaren Artura GT4 (Michael Cooper, Tony Gaples)", "17 points behind Craven and Koch, on a four-race win streak."]] },
      { h:"Am", items:[
        ["#36 BimmerWorld BMW (James Clay, James Walker Jr.)", "Still lead Am, but lost ground at Road America."],
        ["#30 TechSport Racing Ford Mustang GT4 (Frankie Muniz, Tyler Stone)", "12 points behind the BimmerWorld BMW after Road America."],
        ["Random Vandals Racing BMW (Denny Stripling, Judson Holt)", "Third, nine points behind the Mustang."]] }
    ],
    note:"Sources: Sportscar365 (GT4 America Barber preview), BimmerLife's Road America report, Frontstretch and the series' team standings. Gaps are as those reports gave them after Road America." },
  { t:"barber", d:"2026-09-25", s:"grcup", asOf:"Current after Road America (Aug 30). Barber is Rounds 11 and 12, with four races left in the season.",
    groups:[
      { h:"Championship", items:[
        ["Spike Kohlbecker (TechSport Racing)", "Leads the standings by 13 points. A retirement in Race 2 at Road America trimmed his lead."],
        ["Jeremy Fletcher (Copeland Motorsports)", "Swept both Road America races, with his team rebuilding the car after a fire in testing. He is the closest title rival."],
        ["Will Robusto and Max Schwid", "Separated by 5 points in the fight for third."]] }
    ],
    note:"Source: Sportscar365's Barber preview, published Sep 23. The exact points totals were not in the article, so they are left out." },
  { t:"barber", d:"2026-09-25", s:"gta", asOf:"Current after Road America (Aug 30).",
    groups:[
      { h:"SRO3 (GT3 cars)", items:[
        ["#56 SKI Autosports Audi R8 LMS GT3 Evo II (Memo Gidley)", "Swept Road America for his eighth win of the season, extending his points lead. He won Race 1 by 2.351 seconds over Tony Davis."]] },
      { h:"GT2", items:[
        ["#62 Team LNT Ginetta G56 GT2 (Lawrence Tomlinson)", "Won GT2 in Race 1 at Road America."]] },
      { h:"GT4", items:[
        ["#610 Colorado Motorsport with Flying Lizard BMW M4 GT4 (Craig Lumsden)", "Won GT4 in Race 1 at Road America and said the result could help lock in the class title."]] },
      { h:"Cup", items:[
        ["#89 RacingSupport Ginetta GTP8 (David Lecko)", "Won the Cup class in Race 1 at Road America."]] }
    ],
    note:"Sources: GT America's own Road America race report and RACER and Sportscar365 reports. Points totals were not in those reports, so they are left out." },
  { t:"barber", d:"2026-09-25", s:"tca", asOf:"Standings after Road America were not confirmed; this is what the season's race reports established.",
    groups:[
      { h:"Championship", items:[
        ["Braydon Arthur (#4 JMF Motorsports Toyota GR Corolla TC)", "Swept the Circuit of the Americas weekend and then Road Atlanta, where he turned pole into victory to cut Andre Castro's lead."],
        ["Andre Castro (#77 Ricca Autosport Hyundai Elantra N TC)", "Led the standings before Road Atlanta by 30 points. He and Arthur were tied at the top after Friday's opener at Road America."]] }
    ],
    note:"Sources: RACER's reports from Circuit of The Americas and Road Atlanta, and a Road America race report. Points after Road America were not available, so no totals are shown." },
  { t:"road-atlanta", d:"2026-09-30", s:"weathertech", asOf:"Current after Indianapolis (Sep 20). Petit Le Mans is the season finale.",
    groups:[
      { h:"GTP", items:[
        ["#31 Whelen Cadillac (Earl Bamber, Jack Aitken)", "Aitken extended the points lead to 147 with a runner-up finish at Indianapolis. He needs about a 9th-place finish or better at Petit to clinch the drivers' title."],
        ["#6 Porsche Penske Porsche 963 (Laurin Heinrich)", "The closest championship challenger."],
        ["#24 BMW M Team WRT (Sheldon van der Linde, Dries Vanthoor)", "Won at Indianapolis with a late pass of the #31, the team's first IMSA win."]] },
      { h:"LMP2", items:[
        ["Inter Europol Competition Oreca (Tom Dillmann, Jeremy Clarke)", "Lead the class by 4 points after Indianapolis, the tightest fight of the four classes."],
        ["CrowdStrike Racing by APR (George Kurtz, Alex Quinn)", "Four points back, after recovering from first-lap damage at Indianapolis."],
        ["#18 Era Motorsport (Christian Rasmussen, Nick Boulle)", "Won LMP2 at Indianapolis. Rasmussen races IndyCar for Ed Carpenter Racing."]] },
      { h:"GTD PRO", items:[
        ["#4 Corvette Racing Corvette Z06 GT3.R (Nicky Catsburg, Tommy Milner)", "Took the points lead with a runner-up finish at Indianapolis, 47 points ahead of Paul Miller Racing."],
        ["#1 Paul Miller Racing BMW (Connor De Phillippi, Neil Verhagen)", "47 points behind after leading for most of the season; closest championship challenger."],
        ["Pfaff Motorsports (Andrea Caldarelli, Sandy Mitchell)", "Third, 53 points behind the Corvette."],
        ["#64 Ford Mustang (Ben Barker, Dennis Olsen)", "Won at Indianapolis on the last lap."]] },
      { h:"GTD", items:[
        ["#57 Winward Racing Mercedes-AMG (Philip Ellis, Russell Ward)", "Leads by 6 points after Indianapolis, chasing a third straight GTD title."],
        ["#96 Turner Motorsport (Robby Foley, Patrick Gallagher)", "6 points back. Won at Indianapolis, the team's first win there and its 26th class victory overall."]] }
    ],
    note:"Sources: IMSA.com, Sportscar365 (Indianapolis post-race notebook), RACER and Daily Sportscar race and standings reports after the TireRack.com Battle on the Bricks." },
  { t:"road-atlanta", d:"2026-09-30", s:"pilot", asOf:"Current after Indianapolis (Sep 20). The FOX Factory 120 on Oct 2 is the season finale.",
    groups:[
      { h:"GS", items:[
        ["#27 AutoTechnic Racing BMW (Austin Krainz, Stevan McAleer)", "Lead the GS standings, unofficially by 40 points, after finishing fifth at Indianapolis."],
        ["#95 Turner Motorsport BMW (Dillon Machavern, Luca Mars)", "Held the points lead until their car stopped on track at Indianapolis; they finished 17th and now trail by about 40."],
        ["#13 McCumbee McAleer Racing Ford Mustang GT4 (Robert Noaker, Finn Wiebelhaus)", "Third in the standings, about 50 points back."],
        ["#44 Ibiza Farm Motorsport McLaren Artura GT4 (Michael Cooper, Moisey Uretsky)", "Won at Indianapolis for the second straight year, passing Mike Skeen's Mustang on the last lap after a late caution."],
        ["Heart of Racing Aston Martin (Hannah Greenemeier)", "Took the team's fourth GS pole of 2026 at Indianapolis."]] },
      { h:"TCR", items:[
        ["#33 Bryan Herta Autosport Hyundai Elantra N TCR (Mason Filippi, Bryson Morris)", "Came into Indianapolis with seven podiums in eight races and a 260-point lead over their teammates in the #76 Hyundai (Denis Dupont, Preston Brown)."],
        ["#99 Victor Gonzalez Racing Cupra Leon VZ TCR (Tyler Gonzalez, Steven Clemons)", "Won TCR at Indianapolis."]] }
    ],
    note:"Sources: IMSA race reports and points standings via Sportscar365 and SPEED SPORT after the Indianapolis Motor Speedway 120. GS margins are the unofficial figures those reports gave. The TCR lead is as it stood before Indianapolis." },
  { t:"road-atlanta", d:"2026-09-30", s:"vp", asOf:"Current after the last rounds for each class: LMP3 at Canadian Tire Motorsport Park (Jul 12), GSX at VIR (Aug 23). Road Atlanta is the season finale.",
    groups:[
      { h:"LMP3", items:[
        ["#1 Gebhardt Motorsport Duqueine D09 Toyota (Oscar Tunjo)", "Leads the LMP3 standings, by 390 points over his teammate Danny Soufi going into the Canadian Tire round, and won Race 1 there."],
        ["Gebhardt Motorsport Duqueine D09 (Wyatt Brichacek)", "Won Race 2 at Canadian Tire Motorsport Park, finishing ahead of Tunjo by almost six seconds."]] },
      { h:"GSX", items:[
        ["#8 RAFA Racing Toyota GR Supra GT4 EVO2 (Westin Workman)", "Has won nine of the season's ten GSX races and leads with 2,680 points, ahead of Courtney Crone (2,280) and Rafa Martinez (1,990). He can clinch the title a race early by starting Race 1 at Road Atlanta."]] }
    ],
    note:"Sources: IMSA race reports and points standings after VIR (GSX) and Canadian Tire Motorsport Park (LMP3), plus Sportscar365 and RACER. LMP3 did not race at VIR, so its standings have not moved since July." },
  { t:"road-atlanta", d:"2026-09-30", s:"mx5", asOf:"Current after Indianapolis (Sep 19-20). Two races at Road Atlanta decide the 2026 champion.",
    groups:[
      { h:"Championship", items:[
        ["Bobby Gossett", "Took the points lead at Indianapolis after winning Race 11 from 16th on the grid by 0.145 second, his third win this season."],
        ["Justin Adakonis", "Had led the standings until his car stopped on the last lap of Race 12 at Indianapolis with a mechanical problem, and was scored 28th."],
        ["Nathan Nicholson", "Indianapolis native who took his first MX-5 Cup pole and then his first win, in Race 12, by 0.251 second over Jeremy Fletcher."],
        ["Jeremy Fletcher", "Runner-up in Race 12 at Indianapolis. He won a race at Road Atlanta in last year's finale weekend."]] }
    ],
    note:"Sources: IMSA and RACER race reports and SPEED SPORT from Indianapolis. The points gap after Race 12 was not in those reports, so it is left out here rather than guessed." },
  { t:"road-atlanta", d:"2026-09-30", s:"carrera", asOf:"Current after Indianapolis (Sep 19-20). Road Atlanta is round 7 of 8; Circuit of the Americas closes the season.",
    groups:[
      { h:"Pro", items:[
        ["Tyler Maxson", "Leads the Pro standings by 11 points. Won Race 1 at Indianapolis for his sixth win of the season, then finished fifth in Race 2."],
        ["Aaron Jeansonne (Kellymoss)", "11 points back after his first win of the season, in Race 2 at Indianapolis."],
        ["Janne Stiak", "Second in both Indianapolis races, 1.301 seconds behind Maxson in Race 1 and 1.651 behind Jeansonne in Race 2."]] },
      { h:"Pro-Am", items:[
        ["Patrick Mulcahy", "Clinched the Pro-Am title at Indianapolis with two rounds still to run, extending his winning streak to 12 straight races."]] },
      { h:"Masters", items:[
        ["Marco Cirone", "Leads Masters and extended his advantage with his win at Indianapolis."]] }
    ],
    note:"Sources: Porsche Motorsport North America and Sportscar365 race reports from Indianapolis. Four races remain: two at Road Atlanta and two at Circuit of the Americas." },
  { t:"road-atlanta", d:"2026-09-30", s:"carrera", from:"2026-10-01",
    asOf:"Current after Wednesday practice at Road Atlanta (Sep 30). Two Carrera Cup races remain this weekend.",
    groups:[
      { h:"Pro", items:[
        ["Tyler Maxson (TOPP Racing)", "Topped combined Wednesday practice with a 1:20.824 in the second session, edging Practice 1 pace-setter Jared Thomas by 0.051 seconds. Leads the Pro standings by 11 points into the weekend."],
        ["Jared Thomas (JTR Motorsports Engineering)", "Set the pace in Practice 1 before Maxson's second-session lap went 0.051 seconds quicker."],
        ["Aaron Jeansonne (Kellymoss)", "Fourth on combined practice times, 11 points behind Maxson in the Pro standings after winning Race 2 at Indianapolis."],
        ["Cole Kleck (TOPP Racing)", "Maxson's teammate was third on the combined practice times."]] },
      { h:"Pro-Am", items:[
        ["Patrick Mulcahy", "Clinched the Pro-Am title at Indianapolis with two rounds still to run, extending his winning streak to 12 straight races."]] },
      { h:"Masters", items:[
        ["Marco Cirone", "Leads Masters and extended his advantage with his win at Indianapolis."],
        ["Joel Johnson", "A series debutant, led both practice sessions in Masters, with a 1:22.925 from the first session good for 10th quickest overall."]] }
    ],
    note:"Sources: Sportscar365 (\"Maxson Tops Wednesday Practice at Road Atlanta,\" Sep 30) for Wednesday's combined practice times; Porsche Motorsport North America and Sportscar365 Indianapolis race reports for points-standings context." },
  { t:"road-atlanta", d:"2026-09-30", s:"weathertech", from:"2026-10-02",
    asOf:"Current after Thursday practice (Oct 1) at Road Atlanta. Qualifying and the start of the 10-hour race are still to come.",
    groups:[
      { h:"GTP", items:[
        ["#7 Porsche Penske Motorsport Porsche 963", "Topped both of Thursday's long-run sessions, the afternoon practice (1:10.639) and the night session, after Meyer Shank Racing's Acuras went 1-2 in the morning session (#93 Nick Yelloly 1:11.506, just 0.003 seconds ahead of #60 Tom Blomqvist)."],
        ["#31 Whelen Cadillac V-Series.R (Earl Bamber, Jack Aitken)", "Aitken leads the GTP standings with 147 points and needs roughly a 9th-place finish or better here to clinch the title; was fourth-fastest in Thursday morning practice."],
        ["#6 Porsche Penske Porsche 963 (Laurin Heinrich)", "The other Penske entry ran second-fastest behind its sister car in Thursday afternoon practice; Heinrich is the closest championship challenger to Aitken."]
      ] },
      { h:"LMP2", items:[
        ["#43 Inter Europol Competition ORECA (Tom Dillmann, Jeremy Clarke)", "Clarke topped Thursday afternoon LMP2 practice; the team leads the class by 4 points over CrowdStrike Racing by APR entering the weekend."],
        ["#22 United Autosports ORECA (Daniel Goldburg)", "Had a rough Thursday: hit the Turn 5 tire barrier nose-first in afternoon practice, then was sideswiped by the #23 Aston Martin Valkyrie at Turn 10A after returning for night practice."]
      ] },
      { h:"GTD PRO", items:[
        ["#62 Risi Competizione Ferrari 296 GT3 Evo (Daniel Serra)", "Fastest in Thursday afternoon practice, just ahead of points leader Nicky Catsburg's #4 Corvette."],
        ["#4 Corvette Racing Corvette Z06 GT3.R (Nicky Catsburg, Tommy Milner)", "Leads GTD PRO by 47 points over Paul Miller Racing's BMW; third driver Nico Varrone was fastest in Thursday night practice in the car."],
        ["#1 Paul Miller Racing BMW M4 GT3 EVO (Connor De Phillippi, Neil Verhagen)", "47 points behind the Corvette; Verhagen was second-fastest in Thursday morning practice."]
      ] },
      { h:"GTD", items:[
        ["#57 Winward Racing Mercedes-AMG GT3 EVO (Philip Ellis, Russell Ward)", "Leads GTD by 6 points but managed only nine laps in Thursday afternoon practice while chasing a mechanical issue."],
        ["Turner Motorsport BMW M4 GT3 EVO (Robby Foley, Patrick Gallagher)", "6 points back of Winward; a Turner BMW was fastest in Thursday night GTD practice."]
      ] }
    ],
    note:"Sources: Sportscar365, RACER, Daily Sportscar and GT-Report Thursday practice reports, Oct 1-2, 2026 (via web search; several of these sites blocked direct fetches in this environment). Driver attribution on the fastest Thursday-afternoon GTP lap was reported inconsistently between sources (Heinrich vs. Andlauer in the #7 car), so no individual driver is credited for that lap above; the GTD car number for Thursday night's fastest time was also inconsistently reported, so none is given." },
  { t:"road-atlanta", d:"2026-09-30", s:"weathertech", from:"2026-10-03",
    asOf:"Current after Friday qualifying (Oct 2) for the Motul Petit Le Mans. The 10-hour race starts at 12:10 PM ET Saturday.",
    groups:[
      { h:"GTP", items:[
        ["#60 Meyer Shank Racing Acura ARX-06 (Tom Blomqvist)", "Took pole at 1:09.703, leading a front-row sweep for Acura in what multiple reports called the program's final GTP race; teammate Nick Yelloly's #93 Acura starts second, 0.222 seconds back."],
        ["#31 Whelen Cadillac V-Series.R (Jack Aitken)", "Qualified fourth. Leads the GTP standings and can clinch the 2026 drivers' title simply by starting the race."],
        ["#7 Porsche Penske Motorsport Porsche 963 (Laurin Heinrich)", "Qualified seventh. The only other driver still mathematically able to win the GTP title."],
        ["#24 BMW M Team WRT BMW M Hybrid V8 (Sheldon van der Linde, Dries Vanthoor)", "Qualified third, the top non-Acura, non-championship-contending GTP car."]
      ] },
      { h:"LMP2", items:[
        ["#99 AO Racing ORECA 07 (PJ Hyett)", "Took LMP2 pole, his first pole in more than a year."],
        ["#43 Inter Europol Competition ORECA (Tom Dillmann, Jeremy Clarke)", "Leads the LMP2 standings by 4 points over CrowdStrike Racing by APR entering the race."]
      ] },
      { h:"GTD PRO", items:[
        ["#1 Paul Miller Racing BMW M4 GT3 EVO (Neil Verhagen, Connor De Phillippi)", "Verhagen took GTD PRO pole at 1:18.194 in the closing moments of qualifying. The team trails the points lead by 47."],
        ["#4 Corvette Racing Corvette Z06 GT3.R (Nicky Catsburg, Tommy Milner)", "Leads GTD PRO by 47 points entering the season finale."]
      ] },
      { h:"GTD", items:[
        ["#57 Winward Racing Mercedes-AMG GT3 EVO (Philip Ellis, Russell Ward)", "Ellis took GTD pole at 1:18.674. The team leads the class by 6 points chasing a third straight GTD title."],
        ["#96 Turner Motorsport BMW M4 GT3 EVO (Robby Foley, Patrick Gallagher)", "6 points back of Winward entering the race."]
      ] }
    ],
    note:"Sources: NBC Sports, RACER (\"Blomqvist puts Acura on pole for Petit Le Mans, its final GTP race\"), IMSA.com (\"Blomqvist Lands on Motul Petit Le Mans Pole\"), Sportscar365 (\"Blomqvist Leads Acura Front Row Lockout for Petit Le Mans\") and GT-Report Friday qualifying reports, Oct 2, 2026 (via web search; several of these sites blocked direct fetches in this environment)." },
  { t:"indianapolis", d:"2026-10-09", s:"gtwca",
    asOf:"Entering the Indianapolis 8 Hour (Oct 9-10), the GT World Challenge America season finale, run jointly with the Intercontinental GT Challenge's own season finale. A record 29-car entry list: 6 Pro, 20 Pro-Am, 3 Am.",
    groups:[
      { h:"GT World Challenge America: Pro", items:[
        ["JMF Motorsports Mercedes-AMG (Michai Stephens, Mikael Grenier)", "Lead the Pro standings by 9 points, 114 to 105, after finishing second at Barber."],
        ["AF Corse USA Ferrari (Frederik Schandorff, Matias Perez Companc)", "9 points back after winning at Barber, their second Pro win of the season."],
        ["Turner Motorsport BMW (Justin Rothberg, Robby Foley)", "Third, 10 points back, with the season's longest race left to close the gap."]
      ] },
      { h:"Pro-Am", items:[
        ["GMG Racing Porsche (Kyle Washington, Tom Sargent)", "Lead Pro-Am by 6 points, 95 to 89, after finishing third at Barber."],
        ["RS1 Porsche (Jan Heylen, Danny Dyszelski)", "6 points back entering the finale."],
        ["Wright Motorsports Porsche (Dave Musial Jr., Ryan Yardley)", "Third, 9 points back; the team adds Porsche factory drivers Laurin Heinrich -- fresh off finishing runner-up in IMSA's GTP title fight at Petit Le Mans -- and Kevin Estre to its lineup for the 8-hour."],
        ["Archangel Motorsports McLaren (Aaron Telitz, Todd Coleman)", "Won at Barber for the team's first Pro-Am victory, climbing to fifth in points (52)."],
        ["Random Vandals Racing BMW (Marcus Ericsson, Hampus Ericsson, Derek DeBoer)", "IndyCar driver Marcus Ericsson joins his brother Hampus for the 8-hour -- a notable one-off addition to the entry list, not a title contender (10th in points)."]
      ] },
      { h:"Am", items:[
        ["AF Corse USA Ferrari (Jay Schreibman, Oswaldo Negri)", "Lead Am by a commanding 143-to-25 margin over Scuderia Corsa; the title is effectively already settled since no rival can gain more than 25 points in one race."]
      ] }
    ],
    note:"Sources: GT World Challenge America's own standings pages (Pro/Pro-Am/Am Teams, checked directly, Oct 5), its Barber race recap (\"AF Corse USA Takes Second Pro Win of Season as Archangel Motorsports Breaks Through at Barber in Pro-Am\"), and Sportscar365's entry-list report (\"29 Entries on Provisional Indy 8H Entry List\"), via web search. Three-time defending Indy 8 Hour champion Team WRT is sitting this one out after BMW reduced factory support for the final IGTC rounds. Driver-to-team pairings are as those sources gave them; the two different car numbers earlier Barber entries used for JMF Motorsports' Pro car weren't consistent between reports, so no car number is given here for any team." },
  { t:"cota", d:"2026-10-23", s:"carrera", at:"2026-10-21T18:59:11Z",
    asOf:"Current after Road Atlanta (Oct 1-2); Circuit of the Americas is the eight-round season finale, run with the United States Grand Prix.",
    groups:[
      { h:"Pro", items:[
        ["Tyler Maxson (TOPP Racing)", "Swept both races at Road Atlanta, his seventh and eighth wins of the season, and leads the Pro standings entering the finale (current points gap not published in sources found)."],
        ["Aaron Jeansonne (Kellymoss)", "Runner-up in both Road Atlanta races; the closest challenger to Maxson for the Pro title."],
        ["Callum Hedge (JDX Racing)", "Third in Road Atlanta's second race, also in the Pro title picture behind Maxson and Jeansonne."]
      ] },
      { h:"Pro-Am", items:[
        ["Patrick Mulcahy (ACI Motorsports)", "Already clinched the Pro-Am title at Indianapolis and raced unopposed at Road Atlanta; Austin is a formality for the class."]
      ] },
      { h:"Masters", items:[
        ["Marco Cirone (ACI Motorsports)", "Leads Masters after winning both races at Road Atlanta and goes into the finale as the class favorite."],
        ["Rob Walker (JTR Motorsports Engineering)", "Runner-up in both Road Atlanta races, the closest Masters challenger to Cirone."]
      ] }
    ],
    note:"Sources: data/standings.js's Carrera Cup standings (current after Road Atlanta, Oct 2), drawn from Porsche Motorsport North America and Sportscar365 race reports; Porsche's own 2026 calendar release confirms the season closes at Circuit of the Americas. Current points gaps entering Austin were not published in sources found." },
  { t:"cota", d:"2026-10-23", s:"f1academy", at:"2026-10-21T18:59:11Z",
    asOf:"Current after the Dutch GP round at Zandvoort (Aug 21-23); Austin is the penultimate round before the Las Vegas finale.",
    groups:[
      { h:"Championship", items:[
        ["Alisha Palmowski (Campos Racing)", "Leads by 48 points after winning the Zandvoort Feature Race, her fourth win of the season; with 104 points still available over Austin and Las Vegas, she can clinch the title in Austin."],
        ["Emma Felbermayr", "48 points back after her lowest-scoring weekend of the season at Zandvoort; needs a big result in Austin to carry the fight to Las Vegas."],
        ["Nina Gademan", "Third in points after Zandvoort."],
        ["Alba Larsen (MP Motorsport)", "Climbed to fourth in the standings at Zandvoort after a slow start to the season."]
      ] }
    ],
    note:"Sources: F1 Academy's own Zandvoort Feature Race report (f1academy.com) and pitdebrief.com's post-round standings, cross-checked; Goodwood's title-fight preview (goodwood.com) naming Austin as a round where Palmowski can clinch the title. This is one of two 2026 rounds (with Montreal) run as a three-race weekend after the original Jeddah round was cancelled." },
  { t:"cota", d:"2026-10-23", s:"masters", at:"2026-10-21T18:59:11Z",
    asOf:"Current as of Oct 21: no 2026 Austin entry list, driver roster or car count was found in sources checked.",
    groups:[
      { h:"What to expect", items:[
        ["Masters Racing Legends, 1966-85 Formula 1 cars", "A practice, qualifying and two-race weekend for pre-1986 Grand Prix cars, run alongside the United States Grand Prix as in past Austin appearances; this year's entry list wasn't published in sources checked, so which cars and drivers make the trip isn't confirmed yet."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page (mastershistoricracing.com) confirming the Oct 23-25 date; no 2026 Austin entry list was found as of this writing. Check back closer to the weekend." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", at:"2026-10-22T00:23:54Z",
    asOf:"Current on Oct 22, before the Austin weekend: the standings are after the Singapore Grand Prix (17 races done). The United States GP on Oct 25 runs before this one and could already settle the title or move the constructors' fight -- those numbers will be out of date by the time this weekend starts.",
    groups:[
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points over team-mate George Russell with six races left. He can already clinch the title at Austin on Oct 25 -- the race just before this one -- by outscoring Russell there by 24 points; if that happens, Mexico City is run with the title settled."],
        ["George Russell (Mercedes)", "Second on 238 points. Keeps the title fight alive into Mexico City unless Antonelli has already clinched it at Austin five days earlier."]
      ] },
      { h:"The chasers", items:[
        ["Lewis Hamilton (Ferrari)", "Third on 229 points."],
        ["Max Verstappen (Red Bull Racing)", "Fourth on 221 points."],
        ["Charles Leclerc (Ferrari)", "Fifth on 215 points."],
        ["Lando Norris (McLaren)", "Sixth on 201 points. Won last year's Mexico City GP from pole, leading every lap for his first win at this circuit; McLaren lead Red Bull Racing by just 7 points (339-332) in the fight for third in the constructors' championship."]
      ] },
      { h:"Checo Perez's home race", items:[
        ["Sergio Perez (Cadillac)", "Back at his home race after missing the 2025 edition, in his first season with Cadillac's debut F1 team alongside Valtteri Bottas; both are still on zero points this year. The weekend doubles as a celebration of his 300th grand prix start -- Cadillac is holding a public show run on Paseo de la Reforma in Mexico City on Wednesday, Oct 28, around 10:00 (registration is requested through Cadillac's official X account; the route and exact times may still change)."]
      ] },
      { h:"What to look for", items:[
        ["Thin air at 2,240 m", "The Autodromo Hermanos Rodriguez is one of the highest circuits on the calendar; the altitude cuts aerodynamic downforce and strains engine cooling, which is why cars run unusually high-drag wings here."],
        ["The stadium section", "The track cuts through the old Foro Sol arena for its final sector -- McLaren's own site calls it one of the loudest sections on the calendar."],
        ["No sprint", "A normal weekend: two practice sessions Friday, one more and qualifying Saturday, race Sunday. Neither of the last two winners here was a Red Bull car -- Carlos Sainz (Ferrari) in 2024, Norris (McLaren) in 2025."]
      ] }
    ],
    note:"Sources: racingnews365.com and crash.net (2026 standings after the Singapore GP and the Austin title-clinch scenario, read Oct 22, 2026), f1-fansite.com and mclaren.com (2026 Mexico City session times and circuit notes), riverramayanews.mx and cronica.com.mx (Perez's return, 300th start and the Oct 28 Reforma show run), autosport.com/motorauthority.com (2024 race result) and planetf1.com/racingnews365.com (2025 race result)." },
  { t:"cota", d:"2026-10-23", s:"f1", from:"2026-10-23", at:"2026-10-23T19:23:34Z",
    asOf:"Current after Friday's Free Practice 1 (12:30 PM local). FP2 follows at 4 PM local, FP3 Saturday at 12:30 PM, qualifying Saturday at 4 PM, and the race Sunday at 3 PM, all local time.",
    groups:[
      { h:"FP1: Ferrari quickest, Verstappen's best lap deleted", items:[
        ["Charles Leclerc (Ferrari)", "Fastest in FP1, a 1:36.052, after Ferrari brought floor, sidepod-inlet and diffuser updates for the SF-26."],
        ["Max Verstappen (Red Bull Racing)", "Went quicker on a 1:35.860, but it was deleted for exceeding track limits at Turn 19, leaving him classified second, 0.084s off Leclerc."],
        ["Lando Norris (McLaren)", "Third, 0.245s off the pace, with George Russell fourth (+0.326s), Kimi Antonelli fifth (+0.481s) and Lewis Hamilton sixth (+0.503s)."],
        ["Colton Herta (Cadillac, in for Sergio Perez)", "Cadillac's reserve driver ran Perez's car for his mandatory young-driver FP1 outing (every team must give a rookie two FP1 sessions this year) -- not because Perez was hurt. He was classified 21st; this was his fourth FP1 appearance of the season after Barcelona, Hungary and Monza, and the first by an American in a US-based F1 session since Logan Sargeant in 2023."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points over team-mate George Russell with six races left. Practice times don't change the standings; he can still clinch the title here only by winning while Russell finishes ninth or lower and Hamilton fifth or lower."],
        ["George Russell (Mercedes)", "Second on 238 points. Keeps the title fight alive unless Antonelli wins and he finishes ninth or lower."]
      ] },
      { h:"What to look for in the rest of the weekend", items:[
        ["No sprint, three practice sessions", "With no sprint this weekend, FP2 and FP3 are the only remaining chances for teams to fine-tune the car before qualifying Saturday afternoon."],
        ["Verstappen's pace", "He has won the last two races (Bahrain and Singapore) and was fastest in FP1 before the deletion, with Red Bull looking competitive again at a track he won at in 2023."]
      ] }
    ],
    note:"Sources: PlanetF1 ('Charles Leclerc fastest in US GP FP1 as FIA holds unusual test'), Formula1.com's FP1 report, Motorsport Week's and Scuderia Fans' FP1 classifications (all Oct 23, 2026), and RacingNews365/Motorsport.com on Colton Herta's 2026 FP1 outings and the mandatory young-driver rule. Formula1.com and the series' own live-timing pages could not be reached directly from this environment; results are relayed via these published reports. Championship standings and title-clinch scenario carried over unchanged from the Oct 16 entry." },
  { t:"cota", d:"2026-10-23", s:"carrera", from:"2026-10-23", at:"2026-10-23T21:24:16Z",
    asOf:"Current after Friday's lone practice at COTA (Oct 23). Qualifying and Race 1 are Saturday, Race 2 Sunday.",
    groups:[
      { h:"Pro: a 27-point title fight", items:[
        ["Tyler Maxson (TOPP Racing, No. 77)", "Leads Aaron Jeansonne by 27 points entering the finale and needs 29 points or more across the two remaining races (56 available) to clinch the title. Topped Friday's practice at 2:06.255."],
        ["Cole Kleck (TOPP Racing, No. 78)", "Maxson's teammate was second overall and in Pro, 0.415 seconds back, at 2:06.670."],
        ["Janne Stiak (ACI Motorsports, No. 40)", "Completed the overall and Pro top three in practice."]
      ] },
      { h:"Pro-Am", items:[
        ["James Sofronas (GMG Racing, No. 14)", "Led Pro-Am in practice at 2:09.093, his first series start since Sebring in March. Patrick Mulcahy has already clinched the Pro-Am title."]
      ] },
      { h:"Masters", items:[
        ["Joel Johnson (JDX Racing, No. 70)", "Topped the Masters class in practice at 2:09.923. Marco Cirone leads the Masters points standings entering the weekend."]
      ] }
    ],
    note:"Sources: Sportscar365 ('Maxson Paces Lone COTA Practice' and 'Maxson, Jeansonne Set for Pro Title Fight in COTA Finale,' both Oct 23, 2026, via web search; the site could not be reached directly from this environment). The Masters points gap behind Cirone was not given in sources found." },
  { t:"cota", d:"2026-10-23", s:"f1", from:"2026-10-23", at:"2026-10-23T22:22:28Z",
    asOf:"Current after Friday's Free Practice 2 (4 PM local). FP3 follows Saturday at 12:30 PM local, qualifying at 4 PM, and the race Sunday at 3 PM, all local time.",
    groups:[
      { h:"FP2: Leclerc tops both Friday sessions", items:[
        ["Charles Leclerc (Ferrari)", "Fastest again, a 1:35.291, after also topping FP1. He briefly lost the top spot to Verstappen before going quicker."],
        ["Kimi Antonelli (Mercedes)", "Second, just 0.042s off Leclerc's pace -- the closest margin at the top of the two sessions so far."],
        ["Max Verstappen (Red Bull Racing)", "Third, 0.189s back, after briefly going fastest himself. He also had a lap deleted for track limits in FP1."],
        ["Lewis Hamilton (Ferrari)", "Fourth, 0.615s off Leclerc, with George Russell fifth (+0.744s)."],
        ["Lando Norris (McLaren)", "Seventh, 1.082s off the pace, with McLaren team-mate Oscar Piastri eighth (+1.096s). Alex Albon (Williams) lost his representative lap to track limits and was classified last."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points over team-mate George Russell with six races left. Practice times don't change the standings; he can still clinch the title here only by winning while Russell finishes ninth or lower and Hamilton fifth or lower."],
        ["George Russell (Mercedes)", "Second on 238 points. Keeps the title fight alive unless Antonelli wins and he finishes ninth or lower."]
      ] },
      { h:"What to look for Saturday", items:[
        ["One more practice before it counts", "FP3 Saturday at 12:30 PM local is the last chance to fine-tune the car before qualifying at 4 PM, with no sprint this weekend."],
        ["Leclerc's pace, Verstappen's recent form", "Leclerc has been fastest in both sessions so far, but Verstappen has won the last two races (Bahrain, Singapore) and was quick again here on Friday."]
      ] }
    ],
    note:"Sources: ScuderiaFans and RacingNews365 FP2 classifications, PlanetF1 and GrandPrix247 FP2 reports, Motorsport Week's FP2 results table (all Oct 23, 2026). Formula1.com and the series' own live-timing pages could not be reached directly from this environment; results are relayed via these published reports. Championship standings and title-clinch scenario carried over unchanged from the Oct 16 entry." },
  { t:"cota", d:"2026-10-23", s:"masters", from:"2026-10-23", at:"2026-10-23T22:22:28Z",
    asOf:"Current as of Oct 23, after this weekend's scheduled practice and qualifying sessions: still no 2026 Austin entry list, car count, or session results were found in sources checked, despite repeated searches of Masters Historic Racing's own site and race-media coverage.",
    groups:[
      { h:"What to expect", items:[
        ["Masters Racing Legends, 1966-85 Formula 1 cars", "A one-session practice, one-session qualifying and two-race weekend (25 minutes each) for pre-1986 Grand Prix cars, run alongside the United States Grand Prix as in past Austin appearances. Neither this year's entry list nor Friday's practice/qualifying results have turned up in sources checked, so which cars and drivers are racing, and how they qualified, isn't confirmed."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page (mastershistoricracing.com) confirms the Oct 23-25 date and the one-practice/one-qualifying/two-race format, but could not be reached directly from this environment to check for a published entry list or results, and none turned up in further web searches today. Check back once the series or a race report publishes the grid and results." },
  { t:"cota", d:"2026-10-23", s:"f1academy", from:"2026-10-23", at:"2026-10-24T00:23:21Z",
    asOf:"Current after Friday's Opening Race (Oct 23). The Reverse Grid Race follows Saturday at 6 PM local and the Feature Race Sunday at 12 PM local -- the last two rounds of points at COTA before the Las Vegas finale.",
    groups:[
      { h:"Opening Race: Palmowski closes in on the title", items:[
        ["Alisha Palmowski (Campos Racing)", "Won from pole, crossing the line about 1.9 seconds ahead of Nina Gademan -- race reports describe the result as a big step toward clinching the title, which she entered the weekend leading by 48 points."],
        ["Nina Gademan (MP Motorsport)", "Finished second after a stewards investigation into a move earlier in the race by podium rival Alba Larsen was dropped, leaving the result unchanged."],
        ["Alba Larsen (MP Motorsport)", "Completed the podium in third."]
      ] },
      { h:"What's left at COTA", items:[
        ["Reverse Grid Race, Saturday 6 PM local", "Grid set by reversing the top 8 from qualifying; Austin and Montreal are the only two 2026 rounds with this extra third race."],
        ["Feature Race, Sunday 12 PM local", "Grid from the full qualifying order -- the last points on offer before the Las Vegas finale."]
      ] }
    ],
    note:"Sources: Motorsport Week ('Alisha Palmowski takes giant leap towards F1 Academy title with Race 1 victory,' Oct 24, 2026) and Dive-Bomb ('Alisha Palmowski steps closer to championship title after Opening Race win in Austin'), cross-checked on the Race 1 podium order and the dropped investigation; f1academy.com and motorsport.com's results pages could not be reached directly from this environment. Updated post-race points totals for Palmowski and Felbermayr were not found in sources checked, so only the pre-weekend 48-point gap (carried over from the Oct 21 entry) is given here." },
  { t:"cota", d:"2026-10-23", s:"carrera", from:"2026-10-24", at:"2026-10-24T18:22:48Z",
    asOf:"Current after Saturday morning's qualifying at COTA (Oct 24). Race 1 follows Saturday afternoon, Race 2 Sunday morning.",
    groups:[
      { h:"Pro: Maxson smashes the COTA record, 29 points up with a title-clinching chance in Race 1", items:[
        ["Tyler Maxson (TOPP Racing, No. 77)", "Took pole for Race 1 and the overall track record with a 2:04.869, well inside Ryan Yardley's previous mark of 2:06.221 from last year -- six drivers beat the old record. The pole's bonus point stretches his championship lead over Aaron Jeansonne to 29 points; a Race 1 win would clinch the Pro title outright, with Sunday's Race 2 still to come either way."],
        ["Janne Stiak (ACI Motorsports, No. 40)", "Qualified second overall and in Pro at 2:05.359."],
        ["Callum Hedge (JDX Racing, No. 9)", "Third at 2:05.573, also inside the old track record."]
      ] },
      { h:"Pro-Am", items:[
        ["James Sofronas (GMG Racing, No. 14)", "Took the Pro-Am pole; Patrick Mulcahy has already clinched the Pro-Am title, so the class result is academic."]
      ] },
      { h:"Masters", items:[
        ["Scott Blind (Ruckus Racing, No. 45)", "Topped the Masters class in qualifying at 2:08.096. Marco Cirone leads the Masters points standings entering the weekend."]
      ] }
    ],
    note:"Sources: Sportscar365 ('Maxson Shatters COTA Record to Claim Race 1 Pole,' Oct 24, 2026, via web search; the site could not be reached directly from this environment), which also reported the 29-point post-qualifying gap over Jeansonne and the Race 1 title-clinch scenario. Sofronas's qualifying time, and the Masters points gap behind Cirone, were not given in sources found." },
  { t:"cota", d:"2026-10-23", s:"f1", from:"2026-10-24", at:"2026-10-24T19:23:10Z",
    asOf:"Current after Saturday morning's Free Practice 3 (12:30 PM local). Qualifying follows at 4 PM local, and the race Sunday at 3 PM local.",
    groups:[
      { h:"FP3: Hamilton goes fastest, track limits bite again", items:[
        ["Lewis Hamilton (Ferrari)", "Topped the final practice session with a 1:34.893."],
        ["Max Verstappen (Red Bull Racing)", "Second, a 1:35.061, 0.168s off Hamilton's pace."],
        ["Charles Leclerc (Ferrari)", "Third, 0.234s back, after a quicker lap was deleted for exceeding track limits (reports differ on the corner, Turn 10 or Turn 12)."],
        ["Kimi Antonelli (Mercedes)", "Fourth, a 1:35.196; he had briefly gone provisionally quickest on a lap that was also deleted for track limits, at Turn 9."],
        ["George Russell (Mercedes)", "Fifth, 0.488s off Hamilton, with Oscar Piastri sixth (+0.638s), Nico Hulkenberg seventh for Audi, Lando Norris eighth, Pierre Gasly ninth for Alpine and Isack Hadjar tenth."],
        ["Track limits", "A theme all weekend: reports put Friday's deleted-lap count at 207, and FIA race director Rui Marques relaxed the limits at several corners for the rest of the event."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points over team-mate George Russell with six races left. Practice times don't change the standings; he can still clinch the title here only by winning while Russell finishes ninth or lower and Hamilton fifth or lower."],
        ["George Russell (Mercedes)", "Second on 238 points. Keeps the title fight alive unless Antonelli wins and he finishes ninth or lower."]
      ] },
      { h:"What to look for Saturday afternoon", items:[
        ["Qualifying, 4 PM local", "No sprint this weekend -- qualifying sets Sunday's grid directly. Hamilton and Ferrari have topped every session so far, with Verstappen closest behind."]
      ] }
    ],
    note:"Sources: Formula1.com's FP3 report, RacingNews365, PlanetF1, GrandPrix247, Grande Premio, ScuderiaFans and Motorsport Week FP3 classifications (all Oct 24, 2026, via web search; the sites could not be reached directly from this environment). Sources disagreed slightly on which corner cost Leclerc his deleted lap; both are noted. Championship standings and title-clinch scenario carried over unchanged from the Oct 16 entry." },
  { t:"cota", d:"2026-10-23", s:"masters", from:"2026-10-24", at:"2026-10-24T19:23:10Z",
    asOf:"Current as of Oct 24, after Race 1 of 2 was due to run Saturday morning: still no 2026 Austin entry list, car count, or results were found in sources checked, despite repeated searches of Masters Historic Racing's own site (including its results-PDF listing) and race-media coverage.",
    groups:[
      { h:"What to expect", items:[
        ["Masters Racing Legends, 1966-85 Formula 1 cars", "A practice, qualifying and two-race weekend for pre-1986 Grand Prix cars, run alongside the United States Grand Prix as in past Austin appearances. Race 1 was scheduled for Saturday morning and Race 2 follows Sunday, but neither an entry list nor any result has turned up in sources checked, so which cars and drivers are racing, and how Race 1 went, isn't confirmed."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page confirms the Oct 23-25 date and format but could not be reached directly from this environment to check for a published entry list or results, and none turned up in further web searches today. Check back once the series or a race report publishes the grid and results." },
  { t:"cota", d:"2026-10-23", s:"carrera", from:"2026-10-24", at:"2026-10-24T21:23:51Z",
    asOf:"Current after Saturday afternoon's Race 1 of 2 at COTA (Oct 24). Race 2, the season finale, is Sunday morning.",
    groups:[
      { h:"Pro: Stiak wins Race 1, but Maxson's third provisionally clinches the title", items:[
        ["Janne Stiak (ACI Motorsports, No. 40)", "Took the lead early from pole-sitter Tyler Maxson and held off a charging Aaron Jeansonne to win Race 1, built on a 1.3-second cushion before two caution periods bunched the field back up."],
        ["Tyler Maxson (TOPP Racing, No. 77)", "Finished third after losing the lead to Stiak and contact with Jeansonne for second; third place provisionally secures him the Pro title with a race to spare, pending the series' official post-race confirmation. Reports gave his lead over Jeansonne entering Race 2 as 28 points."],
        ["Aaron Jeansonne (Kellymoss)", "Passed Callum Hedge and then Maxson to finish second, the best result still open to him in the title fight; not enough to prevent Maxson's provisional clinch."],
        ["Callum Hedge (JDX Racing, No. 9)", "Ran as high as third before Jeansonne and Maxson's contact for position dropped him to fourth at the flag, denying him a podium."],
        ["Two cautions", "The race was slowed once by a last-corner collision between Dan Drohan and Josh Conley, and again later while the lead group was running close together; neither was reported to have drawn a penalty."]
      ] },
      { h:"Pro-Am and Masters", items:[
        ["Patrick Mulcahy (ACI Motorsports) and Marco Cirone (ACI Motorsports)", "Both classes' titles were already clinched before this weekend, so Race 1's class results weren't covered in the sources checked."]
      ] }
    ],
    note:"Sources: VelocityNews ('Hedge narrowly misses podium in Porsche Carrera Cup North America season finale opener at COTA,' Oct 24-25, 2026) via web search; the site could not be reached directly from this environment to read the full report, so this is pieced together from search summaries of it and cross-checked across several searches for consistency. No second outlet's race report was found as of this writing to independently confirm the finishing order or the exact points gap (one earlier Sportscar365 report gave 29 points after qualifying, this one 28 after the race); Maxson's title is described by the source as provisional, pending the series' own confirmation. Pro-Am and Masters Race 1 results were not found in sources checked." },
  { t:"cota", d:"2026-10-23", s:"f1", from:"2026-10-24", at:"2026-10-24T22:23:36Z",
    asOf:"Current after Saturday's qualifying at COTA (4 PM local, Oct 24). The race follows Sunday at 3 PM local.",
    groups:[
      { h:"Qualifying: Antonelli beats the Red Bulls to pole, Ferrari fades", items:[
        ["Kimi Antonelli (Mercedes)", "Took pole with a 1:34.035, set early in Q3, after Ferrari had topped every practice session this weekend. He beat closest title rival George Russell's time by more than four tenths."],
        ["Max Verstappen (Red Bull Racing)", "Second, 0.179s off Antonelli, with Red Bull team-mate Isack Hadjar third (+0.215s)."],
        ["Charles Leclerc (Ferrari)", "Fourth (+0.232s). Ferrari had been fastest in FP1, FP2 and FP3 but lost pace in Q3, with Lewis Hamilton fifth and leaving both Ferraris behind the Antonelli-Verstappen-Hadjar trio."],
        ["George Russell (Mercedes)", "Sixth, behind team-mate Antonelli and Hamilton. The rest of the top 10 is reported inconsistently between outlets checked, so it isn't repeated here -- the McLarens of Lando Norris and Oscar Piastri and rookie Arvid Lindblad filled out the group behind Russell."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 102 points over team-mate Russell with six races left. Starting on pole doesn't change the standings; he can only clinch the title Sunday by winning while Russell finishes the race ninth or lower and Hamilton fifth or lower -- both currently line up ahead of those marks on the grid (Russell 6th, Hamilton 5th), so it would take a result well off their starting spots for the title to be settled here."],
        ["George Russell (Mercedes)", "Sixth on the grid, second in the championship on 238 points. Keeps the title fight alive past Austin unless Antonelli wins and he finishes the race ninth or lower."]
      ] },
      { h:"What to look for Sunday", items:[
        ["Race start, 3 PM local", "Antonelli starts from pole with both Red Bulls alongside and behind him and Ferrari further back than it ran all weekend in practice -- a shuffled grid from how practice pace suggested the weekend would go."]
      ] }
    ],
    note:"Sources: Speedcafe.com and RaceFans ('Antonelli beats Red Bull pair to pole position in Austin,' both Oct 24, 2026, via web search; the sites could not be reached directly from this environment) agree on the pole time and top four. Athlon Sports' and Autosport's grid reports agree through 6th (Russell) but disagree on the order from 7th on, and a GPFans Dutch-language report conflicts with both on Piastri and Norris's positions, so positions below 6th are left unstated rather than guessed. Championship standings and the title-clinch scenario are carried over unchanged from the Oct 16 entry; qualifying positions are from the sources above." },
  { t:"cota", d:"2026-10-23", s:"f1academy", from:"2026-10-24", at:"2026-10-25T00:22:47Z",
    asOf:"Current after Saturday's Reverse Grid Race (Oct 24). The Feature Race follows Sunday at 12 PM local -- the last points of the 2026 season before the Las Vegas finale.",
    groups:[
      { h:"Reverse Grid Race: Palmowski's runner-up finish seals the title", items:[
        ["Alisha Palmowski (Campos Racing)", "Started eighth and finished second, enough on its own to clinch the 2026 F1 Academy championship with the Feature Race still to run -- making her the series' youngest-ever champion. She came into the race having stretched her lead to 63 points over Emma Felbermayr with Friday's Opening Race win."],
        ["Alba Larsen (MP Motorsport)", "Took her maiden F1 Academy win, moving up from fourth on the grid after early leader Rafaela Ferreira made contact with Jade Jacquet and lost the lead."],
        ["Lisa Billard", "Completed the podium in third."]
      ] },
      { h:"What's left at COTA", items:[
        ["Feature Race, Sunday 12 PM local", "The weekend's last points before Las Vegas; grid set by the full qualifying order. The title is now decided, so this one is about the fight for second in the championship and the remaining race wins."]
      ] }
    ],
    note:"Sources: Motorsport Week ('Alisha Palmowski seals F1 Academy title with race to spare in Austin' and its Reverse Grid Race results page, both Oct 25, 2026) and Dive-Bomb ('Alisha Palmowski claims F1 Academy title as Alba Larsen wins Austin Reverse Grid Race'), both via web search (the sites could not be reached directly from this environment) and cross-checked on the finishing order, podium and title clinch. Palmowski's exact post-race points total and new margin over Felbermayr were not found in sources checked, so only the pre-race 63-point gap (carried over from the Oct 24 entry) is given here." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", from:"2026-10-26", at:"2026-10-26T17:32:44Z",
    asOf:"Current after the United States Grand Prix (Oct 25): Kimi Antonelli won from pole at Austin, and the drivers'/constructors' standings are this app's own post-race figures (read Oct 26).",
    groups:[
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "A dominant win from pole at Austin -- more than 13 seconds clear of Charles Leclerc -- while team-mate and title rival George Russell could only manage eighth. The lead is now 123 points with five races left (this one plus four after). The maths means he can wrap up the championship as early as this weekend: the fight only continues past Sunday if Russell wins the race AND Antonelli finishes ninth or lower."],
        ["George Russell (Mercedes)", "Second on 242 points after an eighth-place finish at Austin that barely dented the gap. Needs a big result here, and a poor one for Antonelli, just to keep the fight alive into São Paulo."]
      ] },
      { h:"The chasers", items:[
        ["Lewis Hamilton (Ferrari)", "Third on 241 points after finishing fourth at Austin."],
        ["Max Verstappen (Red Bull Racing)", "Fourth on 236 points; ran second for part of the Austin race before Leclerc got by, settling for third there."],
        ["Charles Leclerc (Ferrari)", "Fifth on 233 points after splitting the Mercedes and Red Bull to finish second at Austin."],
        ["Lando Norris (McLaren)", "Sixth on 211 points after fading onto older tyres to finish fifth at Austin. Won last year's Mexico City GP from pole, leading every lap for his first win at this circuit. McLaren and Red Bull Racing are now level on 355 points apiece for third in the constructors' championship."]
      ] },
      { h:"Checo Perez's home race", items:[
        ["Sergio Perez (Cadillac)", "Back at his home race after missing the 2025 edition, in his first season with Cadillac's debut F1 team alongside Valtteri Bottas; both are still on zero points this year. The weekend doubles as a celebration of his 300th grand prix start -- Cadillac is holding a public show run on Paseo de la Reforma in Mexico City on Wednesday, Oct 28, around 10:00 (registration is requested through Cadillac's official X account; the route and exact times may still change)."]
      ] },
      { h:"What to look for", items:[
        ["Thin air at 2,240 m", "The Autodromo Hermanos Rodriguez is one of the highest circuits on the calendar; the altitude cuts aerodynamic downforce and strains engine cooling, which is why cars run unusually high-drag wings here."],
        ["The stadium section", "The track cuts through the old Foro Sol arena for its final sector -- McLaren's own site calls it one of the loudest sections on the calendar."],
        ["No sprint", "A normal weekend: two practice sessions Friday, one more and qualifying Saturday, race Sunday. Neither of the last two winners here was a Red Bull car -- Carlos Sainz (Ferrari) in 2024, Norris (McLaren) in 2025."]
      ] }
    ],
    note:"Sources: this app's own data/results.js (United States Grand Prix classification, from api.jolpi.ca, the Ergast-compatible mirror of the official FIA results) and data/standings.js (2026 points after that race), cross-checked against silverstone.co.uk's and planetf1.com's Austin race reports via web search (the sites could not be reached directly from this environment; read Oct 26, 2026) for how the race unfolded. mclaren.com for Norris's 2025 Mexico City win, and f1-fansite.com for this weekend's session times (both unchanged from the last entry). riverramayanews.mx and cronica.com.mx for Perez's 300th start and the Oct 28 Reforma show run (unchanged since the last entry)." },
  { t:"mexico-city", d:"2026-10-30", s:"masters", at:"2026-10-29T00:27:24Z",
    asOf:"Current as of this writing: no 2026 Mexico City entry list, driver roster or car count was found in sources checked.",
    groups:[
      { h:"What to expect", items:[
        ["Masters Racing Legends, 1966-85 Formula 1 cars", "A practice, qualifying and two-race weekend for pre-1986 Grand Prix cars (3-litre machines from 1966-85, plus turbo-era F1 cars from 1977-85 under a rule change for 2026), run alongside the Mexico City Grand Prix. Each race is 25 minutes; this year's entry list wasn't published in sources checked, so which cars and drivers make the trip isn't confirmed yet."],
        ["Limited grid, strong demand", "A Historic Motor Racing News report on Masters' expanded 2026 Formula 1 support-race programme (which includes this Mexico City round) describes grid slots as limited with already-significant demand, though it doesn't name who has a seat here."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page (mastershistoricracing.com) confirming the Oct 30-Nov 1 dates at Autodromo Hermanos Rodriguez; Autocosmos (autocosmos.com.mx, Sept 2026) confirming Historic Racing as a Mexico City GP support series; Historic Motor Racing News (historicmotorracingnews.com) on the Masters Racing Legends format (1966-85 F1 cars, now also 1977-85 turbo cars) and the 2026 F1 support-race programme's grid demand, read via web search (the site could not be reached directly from this environment). No 2026 Mexico City entry list was found as of this writing. Check back closer to the weekend." },
  { t:"martinsville", d:"2026-10-30", s:"nascar", at:"2026-10-29T00:27:24Z",
    asOf:"Current after Talladega (Oct 25, 2026): two races remain in the 2026 Chase -- this one and the Nov 8 championship finale at Homestead-Miami.",
    groups:[
      { h:"The championship fight", items:[
        ["Kyle Larson (Hendrick Motorsports)", "Leads the Chase by 73 points over Denny Hamlin after a wild Talladega win -- he was 11th with one lap to go, then passed seven cars in the final quarter-mile in overtime for his first career superspeedway victory. Two races are left before Homestead-Miami decides the title."],
        ["Denny Hamlin (Joe Gibbs Racing)", "Second, 73 points back."],
        ["Christopher Bell (Joe Gibbs Racing)", "Third, 74 points back; briefly led Larson by 5 after Larson's bad day at Phoenix (a blown tire dropped him to 34th), before Larson's Talladega win reopened the gap."],
        ["Chase Briscoe (Joe Gibbs Racing)", "Fourth, about 77-79 points back (outlets differ slightly on the exact gap)."]
      ] },
      { h:"How the 2026 Chase works", items:[
        ["No elimination this year", "NASCAR replaced its 2014-2025 elimination playoff with a new format for 2026: the top 16 drivers after 26 regular-season races get one points reset, then race the final 10 (the Chase) with nobody cut. Whoever has the most points after the last race, Nov 8 at Homestead-Miami, is champion -- so unlike past years, nobody is eliminated at Martinsville."]
      ] },
      { h:"Martinsville Speedway", items:[
        ["The shortest track on the schedule", "A 0.526-mile oval nicknamed 'The Paperclip' for its tight, rounded-rectangle shape and shallow 12-degree banking -- it rewards patience and braking over raw speed, and short-track scrapes are common."],
        ["The grandfather clock", "Martinsville has awarded a grandfather clock as its race trophy since 1964, a tradition track founder H. Clay Earles started after being told he needed to find storage room for conventional trophies. Richard Petty has won more clocks than anyone, with 12."]
      ] }
    ],
    note:"Sources: NASCAR.com's own Talladega Chase race recap and its 'Chase Report' after Phoenix (nascar.com, read Oct 29, 2026), an AP report via tsn.ca on Larson's 73-point lead, Heavy.com's post-Talladega standings table (cross-checked against NASCAR.com's figures, which differ slightly on Briscoe's gap), Sportsnaut's championship-scenarios piece, and an NBC-affiliate explainer on NASCAR's new 2026 Chase format (no elimination rounds, replacing the 2014-2025 system). Martinsville Speedway and grandfather-clock facts from NASCAR.com and frontstretch.com, cross-checked. Note: this track's event name in data/martinsville.js still reads '(Round of 8 finale)', a leftover from the old elimination format -- not repeated here since the 2026 Chase has no such round; worth fixing separately." },
  { t:"interlagos", d:"2026-11-06", s:"f1", at:"2026-10-29T00:27:24Z",
    asOf:"Current on Oct 29, before the Mexico City weekend (Oct 30-Nov 1): the standings are after the United States Grand Prix (Oct 25). Mexico City runs before this one and will likely change these numbers -- they'll be out of date by the time São Paulo starts.",
    groups:[
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads the championship by 123 points over team-mate George Russell with five races left after Austin (Mexico City, this one, then Las Vegas, Qatar and Abu Dhabi). Whether he can already clinch the title by São Paulo depends on what happens at Mexico City five days earlier -- if the gap is still large after that race, this could be the weekend it's settled."],
        ["George Russell (Mercedes)", "Second on 242 points after an eighth-place finish at Austin. Needs a big result at Mexico City just to keep the fight alive into this race."]
      ] },
      { h:"The chasers", items:[
        ["Lewis Hamilton (Ferrari)", "Third on 241 points."],
        ["Max Verstappen (Red Bull Racing)", "Fourth on 236 points."],
        ["Charles Leclerc (Ferrari)", "Fifth on 233 points."],
        ["Lando Norris (McLaren)", "Sixth on 211 points. Won last year's São Paulo GP from pole, leading every lap for his seventh win of 2025."]
      ] },
      { h:"What to look for", items:[
        ["Altitude again", "Interlagos sits about 800m above sea level, the second-highest circuit on the calendar after Mexico City -- back-to-back high-altitude races test engine cooling and aero set-up two weekends running."],
        ["A history of chaos", "Interlagos has decided championships in the rain before -- most famously 2008, when a late downpour let Lewis Hamilton pass Timo Glock at the final corner to take the title by one point. Brazil's unpredictable weather is always part of the story here."],
        ["No sprint", "A normal weekend: three practice sessions, qualifying Saturday, race Sunday -- not one of this year's sprint rounds."]
      ] }
    ],
    note:"Sources: this app's own data/standings.js (2026 points after the United States GP) and data/interlagos.js (confirmed session format: 3 practices, no sprint). racingnews365.com for the post-Austin calendar order (Mexico City, São Paulo, Las Vegas, Qatar, Abu Dhabi) via web search (the site could not be reached directly from this environment; read Oct 29, 2026). crash.net for the 2025 São Paulo GP result (Norris's win from pole, his 7th of the season) via web search. gpdestinations.com and formula1.com for Interlagos's altitude and the 2008 title-decider rain story, both via web search." },
  { t:"homestead-miami", d:"2026-11-06", s:"nascar", at:"2026-10-29T00:27:24Z",
    asOf:"Current as of Oct 29, 2026, after the Talladega race (Oct 25): two of the ten Chase races remain, Martinsville on Nov 1 and this one. Martinsville will decide who arrives here still mathematically alive and by how much -- this entry doesn't guess at that.",
    groups:[
      { h:"A new-old format, decided here", items:[
        ["No more win-take-all finale", "NASCAR scrapped the Championship 4 for 2026 and revived an old name, The Chase: the 16 playoff drivers' points reset once after the regular season, there are no elimination rounds, and the champion is simply whoever has the most points after all ten Chase races -- Talladega, then Martinsville, then this one. Unlike the format NASCAR used from 2014-2025, a big points day elsewhere can't be wiped out by someone else merely winning the last race."],
        ["Homestead's return", "The track crowned NASCAR's champion every year from 2002 to 2019 under earlier points formats, before the finale moved to Phoenix for the Championship 4 era (2020-2025). It's back for 2026 -- and has already been confirmed to host again in 2027 -- backed by a $20 million renovation (a new main entrance, an expanded fan zone, a renovated Ally Champions Club; the racing surface itself wasn't touched)."]
      ] },
      { h:"Where the points stand", items:[
        ["Kyle Larson's lead", "Won the Oct 25 Talladega race and leads the Chase afterward on 2,441 points, 73 ahead of second-placed Denny Hamlin with two races left. Christopher Bell is third (74 back) and Chase Briscoe fourth (about 77-79 back, outlets differ slightly). That's within the roughly 150 points a single race (plus its two stage wins) can swing, so the title is still open -- Martinsville on Nov 1 will set the real picture coming into Homestead."],
        ["The track", "A 1.5-mile oval, last repaved in 2003; Goodyear calls it one of the Cup Series' highest tire-wear tracks, and the aged, abrasive surface lets drivers run multiple grooves, with the fast lane usually drifting up against the outside wall late in a run -- a track that tends to reward whoever manages their tires best."]
      ] }
    ],
    note:"Sources: nascar.com's Jan 12, 2026 format announcement and si.com/onsi/racing-america's summary (The Chase: 16 drivers, one points reset, 10 races, no elimination rounds) via web search. Bleacher Report, racingnews.co, MotorBiscuit and Heavy.com roundups (Oct 25-26, 2026) for the post-Talladega standings and Larson's win -- Briscoe's exact gap to the leader is given as both 77 and 79 points by different outlets, so both are noted. NASCAR.com (May 6, 2025) and racer.com (Aug 18, 2026) for Homestead-Miami hosting 2026 and 2027, and EssentiallySports for the $20M renovation. NASCAR.com/Goodyear reporting for the track's tire-wear and multi-groove reputation. None of these sites could be reached directly from this environment, so all of the above is pieced together from web-search result summaries, cross-checked across multiple independent outlets where possible." },
  { t:"monza", d:"2026-11-06", s:"wec", at:"2026-10-29T00:27:24Z",
    asOf:"Current after the 6 Hours of Barcelona (Oct 16-18): Toyota swept 1-2, which already wrapped up the manufacturers' title, but the drivers' title is still open between the two Toyota crews heading into the season finale.",
    groups:[
      { h:"The drivers' title: Toyota vs Toyota", items:[
        ["#8 Sebastien Buemi, Brendon Hartley, Ryo Hirakawa (Toyota)", "Won at Barcelona, edging their own team-mates in the #7 by just 0.583 seconds, and lead the drivers' standings by 17 points (114 to 97) going into Monza. That Barcelona result already secured Toyota's manufacturers' title."],
        ["#7 Kamui Kobayashi, Mike Conway, Nyck de Vries (Toyota)", "17 points back. A standard WEC race pays 25 points for the win plus 1 for pole, so a maximum 26-point swing is enough to flip a 17-point gap -- the title is still mathematically open, even though it's an all-Toyota fight: the next-best crew, 39 points back on 75, has no realistic path to either of them."]
      ] },
      { h:"LMGT3: Manthey's Porsche chasing TF Sport's Aston Martin", items:[
        ["#33 TF Sport (Aston Martin)", "Leads the LMGT3 teams' standings by 18 points, 92 to 74, over the second-placed Porsche crew below."],
        ["#92 The Bend/Manthey (Porsche)", "Won at Barcelona -- the car's first class win of the 2026 season -- and sits 18 points back, with Monza's maximum 26 points on offer still enough to take the title."]
      ] },
      { h:"What to watch at Monza", items:[
        ["Ferrari's late push", "The #50 499P took third at Barcelona, its best finish in several rounds, but at 69 points (6th, 45 behind the leader) it's out of the Hypercar title fight -- still, a strong run here would be a confidence boost into 2027."],
        ["Monza returns to the calendar", "Replacing the cancelled Qatar and Bahrain rounds, this is WEC's first visit to the Autodromo Nazionale Monza since 2023. The track's banked oval loops, built in 1922 and rebuilt in the mid-1950s, were dropped from use for safety decades ago; the modern road course instead runs through the Lesmo curves and the Parabolica."]
      ] }
    ],
    note:"Sources: Business Day ('Toyota seals World Sports Car title with victory in 6 Hours of Barcelona,' Oct 19, 2026) and Alpinestars' own Barcelona race report for the result, margin and manufacturers'-title clinch; data/standings.js (from fiawec.com, read Oct 26, 2026) for the points gaps; RacingNews365's Barcelona results page for the LMGT3 winner; TotalEnergies' published WEC regulations page for the standard-race points scale (25-18-15-...-1 plus a pole-position point), used to check whether the titles are clinched; Racer.com and Autosport for the Qatar/Bahrain-to-Barcelona/Monza calendar swap and Monza's 2021-23 WEC history; gpfans.com and circuitsofthepast.com for Monza's banked-oval history, all via web search (the sites could not be reached directly from this environment). No 2026 Monza entry list was found as of this writing." },
  { t:"martinsville", d:"2026-10-30", s:"oreilly", at:"2026-10-29T17:37:36Z",
    asOf:"Current after Talladega (Oct 24, 2026): two Chase races remain, this one and the Nov 7 finale at Homestead-Miami.",
    groups:[
      { h:"The championship fight", items:[
        ["Jesse Love (Richard Childress Racing)", "Leads the Chase on 2,401 points after a third-place finish at Talladega -- a day he called \"the most boring, annoying race I've ever ran in my life\" after NASCAR penalized his team for improper fueling on pit road, sending him to the rear before he fought back. He won the previous race at Phoenix."],
        ["Justin Allgaier", "Second, 19 points back."],
        ["Sam Day", "Third, 29 points back."],
        ["Austin Creed", "Fourth, 50 points back."],
        ["Tyler Kvapil", "Close behind in the top five, about 59 points back."]
      ] },
      { h:"How the 2026 Chase works", items:[
        ["No elimination this year", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 12 drivers after the Daytona regular-season finale got one points reset, then race the final 9 with nobody cut. Whoever has the most points after Homestead-Miami on Nov 7 is champion -- so nobody is eliminated at Martinsville, unlike in past seasons. Full-time Cup drivers who race in this series cannot score points toward the title."],
        ["Shorter than Cup's race", "The O'Reilly race here runs 250 laps on Martinsville's tight half-mile, well short of Sunday's Cup race, and goes off Saturday afternoon."]
      ] }
    ],
    note:"Sources: Heavy.com ('NASCAR O'Reilly Series Chase Standings: Where Drivers Rank After Talladega,' Oct 2026) for the post-Talladega points gaps (Love 2,401, Allgaier -19, Day -29, Creed -50, Kvapil -59); Heavy.com ('Why Did NASCAR Hit Jesse Love With Tough Penalty in Today's Talladega Race?') and Sportskeeda for the pit-road fueling penalty and Love's own comments on the race; Jayski and Racer.com (Oct 17, 2026) for Love's Phoenix win and his 36-point lead entering Talladega; this app's own data/series.js for the 2026 Chase format (no elimination, Daytona reset, Homestead finale) and Cup-driver points restriction. All read via web search (the sites could not be reached directly from this environment); the exact remaining gap for lower Chase positions was not independently confirmed." },
  { t:"martinsville", d:"2026-10-30", s:"trucks", at:"2026-10-29T17:37:36Z",
    asOf:"Current after Talladega (Oct 23, 2026): two Chase races remain, this one and the Nov 6 finale at Homestead-Miami.",
    groups:[
      { h:"The championship fight", items:[
        ["Kaden Honeycutt (Tricon Garage)", "Leads the Chase after Talladega, where he ran with the lead pack most of the night before losing position in the final overtime scramble (he said he moved too early, the same mistake he made at Daytona) and finished fifth. He's already been signed to return to Tricon for 2027."],
        ["Layne Riggs", "Closest challenger, 43 points back after finishing eighth at Talladega."],
        ["Ty Majeski", "Further back, about 141 points behind, after leading late but finishing fourth."]
      ] },
      { h:"What happened at Talladega", items:[
        ["Sammy Smith's first win", "Smith took the checkered flag in overtime for his first career Truck Series victory, in a race delayed by an early Lap 17 wreck (Stewart Friesen's truck got loose and was hit by Andres Perez, collecting Layne Riggs among others)."]
      ] },
      { h:"How the 2026 Chase works", items:[
        ["No elimination this year", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 10 drivers after the New Hampshire regular-season finale got one points reset, then race the final 7 from Bristol to Homestead-Miami with nobody cut. Whoever has the most points after Homestead on Nov 6 is champion. Full-time Cup drivers who race in this series cannot race in the postseason."],
        ["Shortest of NASCAR's three series", "Truck races run about 100 to 250 miles in 2026, so there's little time to recover from a bad restart -- this one goes off Friday afternoon at Martinsville's tight half-mile."]
      ] }
    ],
    note:"Sources: NASCAR.com's post-Talladega coverage (Honeycutt and Majeski piece) and Racer.com/Deadspin ('Sammy Smith captures first Truck Series victory as Honeycutt inches closer to championship,' Oct 23, 2026) for the race result, the Lap 17 wreck and the points gaps (Riggs -43, Majeski -141); Jayski.com for the same race recap and Honeycutt's return to Tricon for 2027; this app's own data/series.js for the 2026 Chase format (no elimination, New Hampshire reset, Homestead finale) and Cup-driver postseason restriction. All read via web search (the sites could not be reached directly from this environment)." },
  { t:"homestead-miami", d:"2026-11-06", s:"oreilly", at:"2026-10-29T17:37:36Z",
    asOf:"Current after Talladega (Oct 24, 2026): Martinsville on Oct 31 is the last race before this one decides the title. This entry doesn't guess at who arrives here still in contention.",
    groups:[
      { h:"The championship, decided here", items:[
        ["Jesse Love (Richard Childress Racing)", "Leads the Chase entering the stretch run, on 2,401 points after Talladega -- 19 ahead of Justin Allgaier, 29 ahead of Sam Day, with Austin Creed and Tyler Kvapil also inside the top five. Whoever has the most points after this race is champion; Martinsville will reshuffle these gaps before the season finishes here."],
        ["No more elimination rounds", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 12 drivers after Daytona's regular-season finale got one points reset, then race the final 9 with nobody cut. The champion is simply whoever leads points after this race -- there's no win-and-in finale format."]
      ] },
      { h:"Homestead's return", items:[
        ["Back on the calendar", "The track hosted NASCAR's championship-deciding race every year from 2002 to 2019, before the finale moved to Phoenix for 2020-2025. It's back for the O'Reilly Series title decider in 2026, on a 1.5-mile oval whose aged, abrasive surface is known for heavy tire wear and multiple racing grooves."],
        ["Shorter than Cup's race", "The O'Reilly race here runs 200 laps, shorter than Sunday's Cup finale."]
      ] }
    ],
    note:"Sources: Heavy.com ('NASCAR O'Reilly Series Chase Standings: Where Drivers Rank After Talladega,' Oct 2026) for the post-Talladega points gaps; this app's own data/series.js for the 2026 Chase format (no elimination, Daytona reset, Homestead finale) and the O'Reilly race-distance note; NASCAR.com and si.com/onsi/racing-america reporting (also used for the Cup entry at this track) and Goodyear's tire-wear characterization of Homestead-Miami's track surface, all via web search (the sites could not be reached directly from this environment). Championship picture will change after Martinsville on Oct 31; check back closer to the race." },
  { t:"homestead-miami", d:"2026-11-06", s:"trucks", at:"2026-10-29T17:37:36Z",
    asOf:"Current after Talladega (Oct 23, 2026): Martinsville on Oct 30 is the last race before this one decides the title. This entry doesn't guess at who arrives here still in contention.",
    groups:[
      { h:"The championship, decided here", items:[
        ["Kaden Honeycutt (Tricon Garage)", "Leads the Chase entering the stretch run after Talladega, 43 points ahead of Layne Riggs and about 141 ahead of Ty Majeski. Whoever has the most points after this race is champion; Martinsville will reshuffle these gaps before the season finishes here."],
        ["No more elimination rounds", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 10 drivers after the New Hampshire regular-season finale got one points reset, then race the final 7 from Bristol to Homestead with nobody cut. The champion is simply whoever leads points after this race."]
      ] },
      { h:"Homestead's return", items:[
        ["Back on the calendar", "The track hosted NASCAR's championship-deciding race every year from 2002 to 2019, before the finale moved to Phoenix for 2020-2025. It's back for the Truck Series title decider in 2026, on a 1.5-mile oval whose aged, abrasive surface is known for heavy tire wear and multiple racing grooves."],
        ["Shortest of NASCAR's three series", "Truck races run about 100 to 250 miles in 2026; this one goes off Friday night, the weekend's first championship race."]
      ] }
    ],
    note:"Sources: NASCAR.com and Racer.com/Deadspin reporting on the post-Talladega Truck standings (Honeycutt leading, Riggs -43, Majeski -141); this app's own data/series.js for the 2026 Chase format (no elimination, New Hampshire reset, Homestead finale); NASCAR.com and si.com/onsi/racing-america reporting (also used for the Cup entry at this track) and Goodyear's tire-wear characterization of Homestead-Miami's track surface, all via web search (the sites could not be reached directly from this environment). Championship picture will change after Martinsville on Oct 30; check back closer to the race." },
  { t:"lusail", d:"2026-11-06", s:"motogp", at:"2026-10-29T18:24:06Z",
    asOf:"Current entering the Malaysia weekend (Oct 30-Nov 1) -- the round right before this one: standings are after the Australian Grand Prix at Phillip Island. This entry doesn't guess at how Malaysia changes them.",
    groups:[
      { h:"The title fight", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads Jorge Martin by 10 points, 365 to 355, after a season that swung back and forth -- Martin led by as much as 31 points at Silverstone before Marquez clawed back on top. Three rounds remain after Malaysia (this one, then Portugal and the Valencia finale), each worth up to 37 points, so the gap is still well inside reach either way."],
        ["Jorge Martin (Aprilia Racing)", "Ten points back entering Malaysia, needs a strong weekend there to keep the pressure on heading into Qatar's stretch run."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 315, 50 points off Marquez -- a long shot for the title but still shaping the podium and manufacturers' fights."]
      ] },
      { h:"Also chasing points", items:[
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Fourth on 263."],
        ["Ai Ogura (Trackhouse MotoGP Team)", "Fifth on 259, the highest-placed rookie."],
        ["Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", "Sixth on 252."]
      ] },
      { h:"Lusail, under the lights", items:[
        ["MotoGP's only night race", "Saturday's Sprint and Sunday's Grand Prix both start after dark under Lusail's floodlights (formerly Losail International Circuit) -- the one round on the 2026 calendar run that way."],
        ["Hard on tyres", "Qatar's heat and blowing desert sand have historically made this one of the more abrasive stops on the calendar, pushing teams toward harder, more durable tyre choices than the lap times alone would suggest."],
        ["Back after a reshuffle", "This round was originally scheduled for April 2026 before being postponed; it was rebooked for Nov 6-8 in March, and Qatari organizers confirmed in mid-October that the circuit is preparing to host it on that date."]
      ] }
    ],
    note:"Sources: this app's own data/standings.js (2026 MotoGP riders' standings, automatic update from the series' results service) for the points, cross-checked against statsniper.com's Oct 24, 2026 preview citing the same post-Phillip Island figures (Marquez 365, Martin 355, Bezzecchi 315) via web search; crash.net reporting (via web search) for the Silverstone/Aragon swings in the points lead earlier in the season; this app's own data/series.js for the Sprint/Grand Prix points structure (up to 37 a weekend); Wikipedia and motogp.com/crash.net reporting (via web search) for Lusail's night-race format and tyre-wear characteristics; qna.org.qa ('Lusail circuit prepares to host MotoGP Grand Prix next month,' Oct 13, 2026) and qatar-tribune.com for the event's April-to-November rescheduling and current Nov 6-8 status, via web search (the sites could not be reached directly from this environment). The sprint/race results for Phillip Island itself were not independently confirmed beyond the standings total; Malaysia (Oct 30-Nov 1) will change the numbers above before this race." },
  { t:"sepang", d:"2026-10-30", s:"motogp", at:"2026-10-29T19:24:19Z",
    asOf:"Current entering the Malaysia weekend (Oct 30-Nov 1): standings are after the Australian Grand Prix at Phillip Island (Oct 24-25), where Jorge Martin's sprint crash leaves his participation here in doubt.",
    groups:[
      { h:"The title fight", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads Jorge Martin by 10 points, 365 to 355, after a wild Phillip Island weekend -- he crashed in qualifying but still took pole, then held on to win Saturday's sprint as Martin crashed out of it. Sunday's Grand Prix was cancelled for weather, so the gap carries into Malaysia unchanged."],
        ["Jorge Martin (Aprilia Racing)", "Fractured his right wrist crashing while racing Marquez for that sprint win and sat out Sunday's (cancelled) race. The break is non-displaced and surgery looks unlikely; Aprilia say he's targeting a surprise return here at Sepang, but both he and the team are assessing it day by day, and riding one-handed through this long, physical lap would be a serious ask."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 315, 50 points off Marquez -- still mathematically alive but needs a big result if Martin can't ride at full strength."]
      ] },
      { h:"Also chasing points", items:[
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Fourth on 263, took a top-five finish in the wet Phillip Island sprint."],
        ["Ai Ogura (Trackhouse MotoGP Team)", "Fifth on 259, the highest-placed rookie -- though he and teammate Augusto Fernandez are under investigation for low tyre pressure at Phillip Island."],
        ["Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", "Sixth on 252, part of an all-Ducati sprint podium at Phillip Island alongside both Marquez brothers."]
      ] },
      { h:"Sepang, the long way round", items:[
        ["One of the longest, toughest laps on the calendar", "The 5.543 km circuit's long back straight and the tight Turn 1-2 esses make this one of MotoGP's more physical stops, and Malaysia's heat and humidity add to the toll on riders and tyres alike."],
        ["Marquez calls it one of his worst tracks", "Even leading the championship, Marc Marquez has named Sepang among the circuits he struggles with most. His brother Alex takes the opposite view -- he's won here before and clinched his Moto2 title at this track."],
        ["Locked in through 2031", "Malaysia signed a new deal with MotoGP this year that keeps Sepang on the calendar through the 2031 season."]
      ] }
    ],
    note:"Sources: this app's own data/standings.js (2026 MotoGP riders' standings, automatic update from the series' results service) for the points; crash.net's '2026 Malaysian MotoGP at Sepang: Start times and how to watch' and 'Official: Jorge Martin to try and race in Malaysia MotoGP' / 'Injured Jorge Martin targets surprise Sepang MotoGP return' for the title gap, Martin's wrist fracture and his targeted Sepang return; Autocar India's 'MotoGP 2026: Marc Marquez leads championship with Sprint win at Phillip Island' for the Phillip Island sprint result, podium (Marc Marquez, Alex Marquez, Di Giannantonio), Martin's crash and the cancelled Sunday race; thesun.my's 'Marquez brothers divided on Sepang's brutal MotoGP challenge' for Marc Marquez's and Alex Marquez's views on the circuit; motogp.com's 'Malaysia confirmed on MotoGP calendar from 2027-2031' for the new venue agreement; Sepang's own 5.543 km / 15-turn layout figure from the crash.net preview. All read via web search (the sites could not be reached directly from this environment). Martin's status for this weekend was not yet confirmed as of this writing; check back closer to Friday practice." },
  { t:"sepang", d:"2026-10-30", s:"motogp", from:"2026-10-29", at:"2026-10-30T04:22:05Z",
    asOf:"Current after Friday morning's MotoGP FP1 at Sepang (Oct 30): Jorge Martin passed his medical check and rode through his fractured wrist, Marc Marquez set the pace.",
    groups:[
      { h:"What FP1 showed", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Fastest in the morning session on a 1:58.912, with Marco Bezzecchi (Aprilia) next up on a 1:59.386 -- a close gap between the title leader and the rider third in points."],
        ["Jorge Martin (Aprilia Racing)", "Passed Thursday's medical check and completed the full session -- 12 laps -- on his fractured right wrist, but was 1.835s off Marquez's time and 20th fastest. A tough first look at how competitive he can be this weekend, even with his place on the grid not in doubt."],
        ["Raul Fernandez (Trackhouse MotoGP Team)", "Pulled out after five laps: a right index finger injury is stopping him riding properly, and he is out of this Malaysian Grand Prix altogether."],
        ["A Moto2 crash to watch", "Moto2 points leader Manuel Gonzalez had a fast fall at Turn 6 late in opening practice; no word yet on whether it affects the rest of his weekend."]
      ] },
      { h:"The title fight, unchanged on points", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Still leads Jorge Martin by 10 points, 365 to 355 -- Phillip Island's cancelled Sunday race left the gap exactly where Saturday's sprint set it."],
        ["Jorge Martin (Aprilia Racing)", "Ten points back, and after FP1 it's still an open question how close to full speed he can ride on the broken wrist across the rest of the weekend."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 315 points -- and the quickest rider on track behind Marquez in FP1."]
      ] },
      { h:"Up next", items:[
        ["Friday afternoon's Practice session", "Sets the order for Saturday; worth watching whether Martin finds more pace with a full day on the bike behind him."],
        ["Saturday: qualifying and the Sprint", "Qualifying (late Saturday morning local time) sets the Sprint grid; the Sprint itself is the last data point before Sunday's Grand Prix."]
      ] }
    ],
    note:"Sources: this app's own data/standings.js (2026 MotoGP riders' standings) for the championship points and data/sepang.js for the rest of the weekend's schedule; crash.net's live Friday-practice coverage and FP1 results report ('Sepang MotoGP LIVE: Friday practice updates as Jorge Martin returns' and the accompanying results page) for the FP1 times, Martin's lap count and gap, Raul Fernandez's withdrawal and the Manuel Gonzalez crash, read via web search (the site could not be reached directly from this environment, so these are as summarized by the search results rather than read first-hand off the timesheet). FP1 ended only a few hours before this was written; check back after Friday's afternoon Practice and Saturday's qualifying." },
  { t:"sepang", d:"2026-10-30", s:"motogp", from:"2026-10-29", at:"2026-10-30T08:24:22Z",
    asOf:"Current after Friday's full day of MotoGP running at Sepang (Oct 30): Marc Marquez fastest in both FP1 and the afternoon Practice, Jorge Martin completed Practice on his fractured wrist but ended it last on the time sheet.",
    groups:[
      { h:"What Friday showed", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Topped both of Friday's sessions -- a 1:58.912 in the morning FP1, then quicker again in the afternoon Practice -- setting the pace ahead of Saturday's combined-time cut for direct entry into Q2."],
        ["Alex Marquez (BK8 Gresini Racing MotoGP)", "Right with his brother in the afternoon, about a tenth back -- the closest anyone got to Marc all day."],
        ["Jorge Martin (Aprilia Racing)", "Rode through both sessions on his fractured right wrist and is confirmed to race this weekend, but was well off the pace in Practice -- last on the time sheet, roughly 2.6 seconds off Marquez -- after what reports described as a shortened afternoon run to manage the injury. The group behind Marquez and the Marquez brothers (Acosta, Bezzecchi, Di Giannantonio and others) was tightly bunched, though reports disagree on the exact order."],
        ["Raul Fernandez (Trackhouse MotoGP Team)", "Still out of this Malaysian Grand Prix altogether with the right index finger injury that ended his Friday morning after five laps."]
      ] },
      { h:"The title fight, unchanged on points", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Still leads Jorge Martin by 10 points, 365 to 355, heading into qualifying -- Friday's practice pace was the strongest signal yet that his form hasn't suffered from the injury that's hampering Martin."],
        ["Jorge Martin (Aprilia Racing)", "Ten points back and racing through the wrist fracture; Friday's times suggest a difficult weekend for pace, even with his grid spot not in question."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 315 points, in the mix near the front of Friday's times but, like the rest of the group behind the Marquez brothers, not clearly placed by the available reports."]
      ] },
      { h:"Up next", items:[
        ["Saturday: FP2, qualifying and the Sprint", "A short Saturday-morning Free Practice 2 is followed by Qualifying 1 and 2, then the Sprint -- the last word before Sunday's Grand Prix on whether Martin can convert speed into results on the injured wrist."]
      ] }
    ],
    note:"Sources: this app's own data/standings.js (2026 MotoGP riders' standings) for the championship points and data/sepang.js for the weekend's schedule; crash.net's 'Sepang MotoGP LIVE: Friday Practice updates' live blog and its '2026 Malaysian MotoGP, Sepang - Friday Practice Results' results page, gpblog.com's practice results page, mcnews.com.au's FP1 report and motorsport-total.com's practice report, all read via web search (the sites could not be reached directly from this environment). Marquez's afternoon Practice time and the Marquez-Marquez 0.109s gap are corroborated by two independent reports; the order from 3rd through 10th in Practice is NOT reported consistently between crash.net and gpblog.com and is left out rather than guessed. Check back after Saturday's FP2, qualifying and Sprint." },
  { t:"mexico-city", d:"2026-10-30", s:"masters", from:"2026-10-30", at:"2026-10-30T16:41:19Z",
    asOf:"Current after Friday's practice session at Mexico City (Oct 30): still no 2026 entry list, driver roster, car count or practice times have turned up in sources checked, despite repeated searches of Masters Historic Racing's own site and race-media coverage.",
    groups:[
      { h:"What's known", items:[
        ["Masters Racing Legends, 1966-85 (plus 1977-85 turbo) F1 cars", "Friday's 25-minute practice ran as scheduled alongside the Mexico City Grand Prix weekend at the Autodromo Hermanos Rodriguez; a 25-minute qualifying session and two 25-minute races follow through the rest of the weekend. No entry list, car count or practice times have been found in sources checked, so which cars and drivers are running, and how practice went, isn't confirmed."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page confirms the Oct 30-Nov 1 dates and the one-practice/one-qualifying/two-race weekend format but could not be reached directly from this environment to check for a published entry list, timetable or results; further web searches today (including for a MEX26-style entry-list PDF matching the naming pattern used for other 2026 Masters events) found none. No 2026 Mexico City entry list, car count or practice results were found as of this writing, consistent with the lack of an entry list throughout this series' recent US Grand Prix weekend at COTA. Check back once the series or a race report publishes the grid and times." },
  { t:"martinsville", d:"2026-10-30", s:"trucks", from:"2026-10-30", at:"2026-10-30T19:23:23Z",
    asOf:"Current after Friday's practice and qualifying, ahead of tonight's 6 p.m. ET Black's Tire 200: the Chase picture itself is unchanged from after Talladega, but the grid is now set.",
    groups:[
      { h:"Qualifying: a 16-year-old grabs his first pole", items:[
        ["Tristan McKee (#77 Spire Motorsports Chevrolet)", "Turned a 19.549-second lap for his first career Truck Series pole -- in just his fifth series start. He's 16."],
        ["Layne Riggs (#34 Front Row Motorsports Ford)", "Missed the pole by 0.018 seconds (19.567) and starts second. He's also the Chase's closest challenger to the points leader, so a strong run tonight matters on two fronts."],
        ["Chandler Smith (#38 Front Row Motorsports Ford)", "Starts third (19.584) after also topping final practice."]
      ] },
      { h:"Where the Chase stands going in", items:[
        ["Kaden Honeycutt (#11 Tricon Garage Toyota)", "Still leads on 2,371 points after Talladega, 43 ahead of Riggs, and starts fifth tonight. He can't lock up the title here -- that's still a Nov 6 Homestead-Miami question -- but a strong run would stretch the cushion."],
        ["Ty Majeski (#88 ThorSport Ford)", "Starts sixth, further back in the standings (roughly 141 points off the lead after Talladega) with two Chase races left."],
        ["Five drivers already out of the math", "Gio Ruggiero, Daniel Hemric, Ben Rhodes, Tyler Ankrum and Grant Enfinger are reported mathematically unable to catch the points lead with only this race and Homestead left, even with a maximum run in both -- there's no formal cut in this year's Chase, but the numbers have done the eliminating on their own."]
      ] },
      { h:"From practice", items:[
        ["All 36 trucks passed inspection", "Every entered truck cleared pre-race inspection Thursday -- no late scrambles to fix issues before tonight's green flag."],
        ["Jake Garcia's late crash", "Wrecked in final practice and failed to post a qualifying lap, so he starts 35th; Gavan Boschele also went off the pace chart and starts 36th."]
      ] }
    ],
    note:"Sources: Yahoo Sports/Heavy.com's qualifying-order and starting-lineup reporting (McKee 19.549, Riggs 19.567, Smith 19.584; Honeycutt starting 5th, Majeski starting 6th), cross-checked against Catchfence's and RacingNews.co's own Martinsville qualifying reports; Heavy.com's Martinsville starting-lineup piece for McKee's age and start count, the final-practice order (Smith fastest, McKee second) and the Garcia/Boschele qualifying misses; Yahoo Sports/NASCAR.com's pre-Martinsville Chase-picture reporting for Honeycutt's 2,371-point lead, the 43-point gap to Riggs, and the five drivers reported mathematically eliminated (Ruggiero, Hemric, Rhodes, Ankrum, Enfinger); this app's own prior data/watch.js entry (written after Talladega) for Majeski's roughly 141-point deficit, not independently re-confirmed today. All read via web search; the sites themselves could not be reached directly from this environment. Tonight's Black's Tire 200 result was not yet known at the time of writing -- check back after the race." },
  { t:"martinsville", d:"2026-10-30", s:"oreilly", from:"2026-10-30", at:"2026-10-30T22:25:18Z",
    asOf:"Current after Friday's practice and qualifying at Martinsville: the Chase standings are unchanged from after Talladega (only tonight's race will move them), but the grid is now set.",
    groups:[
      { h:"Qualifying: Carson Kvapil takes his third pole of the season", items:[
        ["Carson Kvapil", "Won the pole, his third of 2026 and third of his O'Reilly career, with Rajah Caruth alongside him on the front row."],
        ["Justin Allgaier", "Third on the grid, with Parker Retzlaff fourth and William Sawalich fifth rounding out the top five."],
        ["Jesse Love (Richard Childress Racing)", "The Chase points leader starts eighth, in a group with Sammy Smith, Sheldon Creed, Corey Day and Taylor Gray."],
        ["Chase drivers further back", "Three more Chase contenders start outside the top ten: Brandon Jones 12th, Sam Mayer 14th and Austin Hill 21st."]
      ] },
      { h:"Where the Chase stands going in", items:[
        ["Jesse Love (Richard Childress Racing)", "Leads on 2,401 points after Talladega, 19 ahead of Justin Allgaier, 29 ahead of Corey Day, with Sheldon Creed (-50) and Carson Kvapil (-59) rounding out the top five. Qualifying doesn't move these numbers -- only tonight's race does."],
        ["No elimination this year", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 12 drivers after Daytona's regular-season finale got one points reset, then race the final 9 with nobody cut. Whoever has the most points after Homestead-Miami on Nov 7 is champion, so nobody is eliminated tonight."]
      ] },
      { h:"Tonight's race", items:[
        ["250 laps on the half-mile", "Shorter than Sunday's Cup race, and goes off this Saturday afternoon on Martinsville's tight, flat oval -- a track where short-track contact is common."]
      ] }
    ],
    note:"Sources: Frontstretch's Martinsville O'Reilly qualifying report ('Carson Kvapil Takes O'Reilly Martinsville Pole'), via web search (the site could not be reached directly from this environment), for the qualifying order (Kvapil, Caruth, Allgaier, Retzlaff, Sawalich up front; Love 8th with Smith/Creed/Day/Gray; Jones 12th, Mayer 14th, Hill 21st). Heavy.com's post-Talladega Chase-standings report for the points gaps, cross-checked against Racer.com's and NASCAR.com's own driver pages, which confirm Sheldon Creed (No. 00 Haas Factory Team, a Darlington and Bristol Chase winner) and Carson Kvapil (an Indianapolis and Iowa winner this season, brother of ARCA/Late Model driver Caden Kvapil) as the actual 4th- and 5th-place Chase drivers -- correcting this app's Oct 29 entry, which had misnamed them 'Austin Creed' and 'Tyler Kvapil'; Corey Day (a 2026 Talladega spring winner) is likewise confirmed over the Oct 29 entry's 'Sam Day'. No published practice-session results (speeds, incidents) were found in sources checked." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", from:"2026-10-30", at:"2026-10-30T22:25:18Z",
    asOf:"Current after Friday's Free Practice 1 at Mexico City (12:30 PM local). Free Practice 2 follows at 4 PM local; FP3 and qualifying are Saturday, the race Sunday at 2 PM local.",
    groups:[
      { h:"FP1: Leclerc fastest as Ferrari's altitude pace shows, Mercedes reserve impresses", items:[
        ["Charles Leclerc (Ferrari)", "Set the pace with a 1:18.128, including three purple sectors -- Ferrari's power unit is expected to suit the thin air at altitude."],
        ["Kimi Antonelli (Mercedes)", "Second, 0.659s off Leclerc. He's the championship leader, in his own car all session."],
        ["Frederik Vesti (Mercedes)", "Third, just 0.074s behind Antonelli, standing in for title contender George Russell for this practice-only session under F1's rookie rule -- Russell is back in the car from FP2 on."],
        ["Ayumu Iwasa (Red Bull Racing)", "Fifth, filling the same kind of rookie seat for Max Verstappen, who also returns for FP2."],
        ["Pierre Gasly (Alpine)", "Sixth."],
        ["Rookie session", "Ten rookies took part this weekend under the rule requiring two per car across the season; Ferrari was the only team that ran both of its regular race drivers all session. Colton Herta was 22nd."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads team-mate George Russell by 123 points with five races left, starting with this one. FP1 times don't change the standings or the title-clinch math for the weekend."],
        ["George Russell (Mercedes)", "Second on 242 points, back in his own car from FP2 after Vesti's rookie outing."]
      ] },
      { h:"What to look for", items:[
        ["FP2, 4 PM local", "The session that actually counts toward Sunday's set-up, with both championship contenders and both Red Bull regulars back in their cars."],
        ["Qualifying, Saturday 3 PM local", "Sets Sunday's grid directly -- no sprint this weekend."]
      ] }
    ],
    note:"Sources: Racer.com's FP1 report ('Leclerc leads opening Mexico City GP practice') and Yahoo Sports/Sky Sports News coverage of the same session, both via web search (the sites could not be reached directly from this environment), for the times, gaps, rookie-session detail and Herta's 22nd place; this app's own data/standings.js (2026 points after the United States Grand Prix) for the unchanged championship gap, carried over from the Oct 26 entry for this weekend. A Formula1.com 'home hero Perez targeting pole' article turned up in search results but was confirmed (via a further search) to be from 2021, not 2026, so nothing from it is repeated here." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", from:"2026-10-30", at:"2026-10-30T23:23:06Z",
    asOf:"Current after Friday's Free Practice 2 at Mexico City (4 PM local), which was interrupted by a red flag. FP3 and qualifying are Saturday, the race Sunday at 2 PM local.",
    groups:[
      { h:"FP2: Leclerc tops a red-flagged session after Verstappen and Lawson make contact", items:[
        ["Charles Leclerc (Ferrari)", "Fastest with a 1:17.827, 0.103s clear of Norris -- Ferrari's altitude pace held up from FP1."],
        ["Lando Norris (McLaren)", "Second, the closest McLaren got to the top all day."],
        ["George Russell (Mercedes)", "Third, back in his own car after Vesti's FP1 outing under the rookie rule."],
        ["Kimi Antonelli (Mercedes)", "Fourth. He's the championship leader; Friday's times don't change the title picture."],
        ["Max Verstappen (Red Bull Racing)", "Fifth despite the damage: he made contact with Liam Lawson's Racing Bulls, which brought out the red flag, and continued after repairs. Both drivers were summoned to the stewards after the session; no decision had been issued at writing."],
        ["Lewis Hamilton (Ferrari)", "Stopped on track with a problem partway through the hour and ended up 11th, his running cut short."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads team-mate George Russell by 123 points with five races left, starting with this one. Friday's practice times don't move the standings."],
        ["George Russell (Mercedes)", "Second on 242 points."]
      ] },
      { h:"What to look for", items:[
        ["Stewards' decision", "Whether Verstappen, Lawson or neither is penalized for the FP2 contact, and how much overnight repair work Red Bull needs."],
        ["Qualifying, Saturday 3 PM local", "Sets Sunday's grid directly -- no sprint this weekend."]
      ] }
    ],
    note:"Sources: PlanetF1 ('2026 Mexican Grand Prix FP2 report'), The Race ('Verstappen collides with Lawson as Leclerc tops Mexico FP2'), Speedcafe.com and Crash.net coverage of the same session, all via web search (the sites could not be reached directly from this environment), for the times, gaps, the Verstappen/Lawson incident and Hamilton's stoppage; this app's own data/standings.js (2026 points after the United States Grand Prix) for the unchanged championship gap. The stewards' ruling on the Verstappen/Lawson contact had not been published at writing." },
  { t:"mexico-city", d:"2026-10-30", s:"masters", from:"2026-10-30", at:"2026-10-31T01:22:38Z",
    asOf:"Current after Friday's qualifying session at Mexico City (Oct 30): still no 2026 entry list, driver roster, car count, practice times or qualifying grid have turned up in sources checked, despite repeated searches of Masters Historic Racing's own site and race-media coverage.",
    groups:[
      { h:"What's known", items:[
        ["Masters Racing Legends, 1966-85 (plus 1977-85 turbo) F1 cars", "Friday's practice and qualifying both ran as scheduled alongside the Mexico City Grand Prix weekend at the Autodromo Hermanos Rodriguez. No entry list, car count, practice times or qualifying order have been found in sources checked, so which cars and drivers are running, and how the session went, isn't confirmed."],
        ["Two races left", "A 30-minute race on Saturday and another on Sunday morning round out the weekend; results for either have not been found yet."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event page for the Oct 30-Nov 1 Mexico City weekend could not be reached directly from this environment to check for a published entry list, timetable or results; further web searches today (for an entry list, pole position, grid or practice times) found none, consistent with the lack of published results throughout this series' recent US Grand Prix weekend at COTA. No 2026 Mexico City entry list, car count or session results were found as of this writing. Check back once the series or a race report publishes the grid and times." },
  { t:"sepang", d:"2026-10-30", s:"motogp", from:"2026-10-30", at:"2026-10-31T04:26:00Z",
    asOf:"Current after Saturday's FP2 and qualifying at Sepang (Oct 31): Jorge Martin has withdrawn from the rest of the Malaysian Grand Prix, and Alex Marquez took pole from his brother Marc.",
    groups:[
      { h:"Martin's weekend is over", items:[
        ["Jorge Martin (Aprilia Racing)", "Rode only eight laps of Saturday morning's FP2 -- ending it last on the combined time sheet -- before walking out of the garage and not returning for Qualifying 1. Aprilia confirmed he has withdrawn from the rest of the Malaysian GP, meaning no Sprint and no Grand Prix start, to keep recovering from the wrist he fractured in last weekend's Phillip Island sprint crash. Team manager Paolo Bonora said he couldn't put any force into the bike in the braking areas."],
        ["Marc Marquez (Ducati Lenovo Team)", "With Martin scoring nothing at all here, Marquez's 10-point championship lead (365 to 355) is guaranteed to grow this weekend no matter what he does himself -- he just has to keep the bike on track."]
      ] },
      { h:"Qualifying: Alex Marquez on pole", items:[
        ["Alex Marquez (BK8 Gresini Racing MotoGP)", "Took pole with a 1:56.493, beating his older brother Marc by just 0.070s -- Alex won last year's Malaysian Grand Prix and goes into today's Sprint as the man to beat."],
        ["Marc Marquez (Ducati Lenovo Team)", "Second on the grid, 0.070s off his brother's time, after topping Friday's practice; Pedro Acosta (Red Bull KTM Factory Racing) completes the front row in third."],
        ["Row two and three", "Ai Ogura (Trackhouse MotoGP Team) qualified fourth and Marco Bezzecchi (Aprilia Racing) fifth -- the top five covered by just 0.175s -- with Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team) sixth. Enea Bastianini (Ducati Lenovo Team), Johann Zarco and Franco Morbidelli make up row three."]
      ] },
      { h:"What FP2 showed", items:[
        ["Enea Bastianini (Ducati Lenovo Team)", "Topped Saturday morning's Free Practice 2 on a late run on fresh soft tyres, with Alex Marquez second on the same strategy -- Marc Marquez, who led both of Friday's sessions, was down in eighth."]
      ] },
      { h:"Up next", items:[
        ["Today's Sprint, 15:00 local (07:00 UTC)", "The last word before Sunday's Grand Prix, run without Martin on the grid at all -- a first for his title challenge this season."]
      ] }
    ],
    note:"Sources: crash.net's 'Alex Marquez snatches Sepang MotoGP pole' and 'Official: Jorge Martin out of Malaysia MotoGP', the-race.com's 'Martin out of Sepang MotoGP weekend, Alex Marquez on pole', motorsport-total.com's 'MotoGP-Qualifying Sepang 2026: Jorge Martin gibt auf, Alex Marquez auf Pole', freemalaysiatoday.com's 'Injured Martin out of Malaysian MotoGP in big title blow' and streamlinefeed.co.ke's report on Martin's FP2/withdrawal, all read via web search (the sites could not be reached directly from this environment); this app's own data/standings.js for the championship points and data/sepang.js for the weekend's schedule. The order from 4th through 9th in FP2 was not found and is left out rather than guessed; check back after today's Sprint." },
  { t:"homestead-miami", d:"2026-11-06", s:"trucks", from:"2026-10-31", at:"2026-10-31T05:22:21Z",
    asOf:"Current after Martinsville (Oct 30, 2026): the Chase is down to two drivers, with Kaden Honeycutt taking a 20-point lead over Layne Riggs into the title-deciding race here.",
    groups:[
      { h:"A two-driver title fight", items:[
        ["Kaden Honeycutt (Tricon Garage)", "Leads the championship on 2,403 points after finishing 14th at Martinsville -- enough to actually grow his cushion despite the quiet night, because the drivers chasing him lost ground too. Whoever has the most points after this race is champion."],
        ["Layne Riggs (Front Row Motorsports)", "Second on 2,383, 20 points back, after finishing third at Martinsville. Riggs has six wins this season and has been the Chase's most dangerous closer, but he opened the round with finishes of 32nd and 19th before this top five -- he needs a big night at Homestead with Honeycutt held to a modest one."],
        ["Everyone else is out", "Chandler Smith (2,300, -103), Ty Majeski (2,275, -128) and Christian Eckes (2,263, -140) are mathematically eliminated: with only one race and its stage points left to gain, none of them can make up that much ground even with a win, so the title comes down to Honeycutt vs. Riggs alone."]
      ] },
      { h:"What happened at Martinsville", items:[
        ["Chandler Smith wins it", "Smith held off a late charge from teammate Riggs and Ben Rhodes to win the Black's Tire 200, his second win of the Chase -- but with the 103-point hole he was already in, it moved him from contention into the \"beaten\" column rather than back into the fight."],
        ["Riggs gained, Honeycutt didn't lose much", "Riggs' third-place run cut Honeycutt's 43-point cushion down to 20, the closest the margin has been all Chase. Honeycutt's 14th was his worst finish of the round, but with Smith, Majeski and Eckes also not scoring title-relevant points, the net change left him still comfortably ahead -- just no longer in cruise control."]
      ] },
      { h:"Homestead's return", items:[
        ["Back on the calendar", "The track hosted NASCAR's championship-deciding race every year from 2002 to 2019, before the finale moved to Phoenix for 2020-2025. It's back for the Truck Series title decider in 2026, on a 1.5-mile oval whose aged, abrasive surface is known for heavy tire wear and multiple racing grooves."],
        ["Shortest of NASCAR's three series", "Truck races run about 100 to 250 miles in 2026; this one goes off Friday night, the weekend's first championship race, decided purely on points -- there's no separate winner-take-all format like Cup or Xfinity use."]
      ] }
    ],
    note:"Sources: Yahoo Sports' post-Martinsville Truck Series points-standings reporting (Honeycutt 2,403, Riggs 2,383 -20, Smith 2,300 -103, Majeski 2,275 -128, Eckes 2,263 -140, after 6 of 7 Chase races; Smith, Majeski and Eckes described as officially eliminated) cross-checked against NASCAR.com's and Speedway Media's own Martinsville Chase race recaps (Smith winning the Black's Tire 200 over Rhodes and Riggs; this app's own data/results.js entry, written from the same race reports, for the finishing order: Smith, Rhodes, Riggs, Majeski, McKee, and for Honeycutt's 14th-place finish and the 20-point lead over Riggs going to Homestead); Front Stretch ('Truckin' Thursdays,' Jun 24, 2026) and NASCAR.com's Kansas/Charlotte/Phoenix Chase coverage for the season-long form noted (Riggs' six wins and rough Chase start of 32nd/19th, Honeycutt's Phoenix win and Charlotte loss to Riggs); this app's own prior data/watch.js entry (written after Talladega) for the Homestead-return and track-characteristic facts, not independently re-confirmed today. All read via web search (the sites could not be reached directly from this environment). The exact math behind Smith/Majeski/Eckes' elimination (maximum points available at Homestead) was reported by Yahoo Sports but not independently recalculated here." },
  { t:"sepang", d:"2026-10-30", s:"motogp", from:"2026-10-30", at:"2026-10-31T08:24:42Z",
    asOf:"Current after Saturday's Sprint at Sepang (Oct 31): Pedro Acosta won it from Marc Marquez, after poleman Alex Marquez crashed out of the lead and Jorge Martin wasn't on the grid at all.",
    groups:[
      { h:"The Sprint: Acosta wins as Alex Marquez crashes from the lead", items:[
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Won the Sprint by 0.578 seconds -- his result came together after pole-sitter Alex Marquez crashed out of the lead partway through."],
        ["Marc Marquez (Ducati Lenovo Team)", "Second. With Jorge Martin not even on the grid, every point he scores here widens his championship cushion regardless of how he rides."],
        ["Marco Bezzecchi (Aprilia Racing)", "Completed the podium in third."],
        ["Ai Ogura (Trackhouse MotoGP Team)", "Fourth, per the one report that gave a fuller order -- the rest of the top ten was not found in sources checked and is left out rather than guessed."],
        ["Alex Marquez (BK8 Gresini Racing MotoGP)", "Crashed out of the lead and scored nothing; no details on the fall itself or his fitness for Sunday's Grand Prix were found."]
      ] },
      { h:"The title fight: Marquez's lead jumps to 19", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Up to 374 points with the Sprint's nine for second place. Jorge Martin's wrist-fracture withdrawal means he scored nothing all weekend, so the lead has grown from 10 points to 19 (374 to 355) with Sunday's race and only one round left after this."],
        ["Jorge Martin (Aprilia Racing)", "Stays on 355, still sidelined for the rest of this Malaysian Grand Prix by the wrist he fractured at Phillip Island."],
        ["Marco Bezzecchi (Aprilia Racing)", "Up to 322 points in third, the Sprint's seven keeping him clear of Pedro Acosta, now fourth on 275."]
      ] },
      { h:"Up next", items:[
        ["Sunday's Malaysian Grand Prix, 3 PM local (7 AM UTC)", "Warm-Up Practice at 10:40 AM local comes first; the race is the last word on how much further Marquez can stretch his lead before the season's final round."]
      ] }
    ],
    note:"Sources: mcnews.com.au's Sepang Sprint report (Acosta's win, Alex Marquez crashing from the lead, Marc Marquez second, Bezzecchi third and Ogura fourth) and gpblog.com's and motogpnews.com's reports of the same Sprint (Acosta's win and Alex Marquez's crash from the lead), all read via web search (the sites could not be reached directly from this environment); the new championship point totals (374, 355, 322) were cross-checked by applying the Sprint's points (12/9/7/6...) to this app's own pre-Sprint data/standings.js (365, 355, 315, Acosta 263) and matched exactly, which is also why Acosta's new total (275) is given even though no source stated it directly. This app's own data/sepang.js for Sunday's schedule. The finishing order from 5th through 9th, the details of Alex Marquez's crash, and any tyre/weather detail were not confirmed in sources checked and are left out rather than guessed." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", from:"2026-10-31", at:"2026-10-31T19:24:48Z",
    asOf:"Current after Saturday morning's Practice 3 at Mexico City (11:30 AM local): Lando Norris edged Kimi Antonelli by 0.001s, and Haas benched Esteban Ocon for the rest of the weekend. Qualifying is at 3 PM local today; the race is Sunday at 2 PM local.",
    groups:[
      { h:"FP3: Norris pips Antonelli by a thousandth as Haas drops Ocon", items:[
        ["Lando Norris (McLaren)", "Topped final practice with a 1:17.600, just 0.001s clear of championship leader Kimi Antonelli -- the tightest session of the weekend. Charles Leclerc was third (+0.117s), Oscar Piastri fourth (+0.195s), Max Verstappen fifth (+0.351s), Lewis Hamilton sixth and George Russell seventh."],
        ["Haas benches Esteban Ocon", "Haas pulled Ocon out of the car before FP3 even started and handed it to reserve driver Ryo Hirakawa for the rest of the weekend -- qualifying and Sunday's race, not just a practice outing. The team said only that it was 'not due to illness' and has not given a reason; some reports point to a heated exchange between Ocon and his race engineer during Friday's FP2, but that has not been confirmed. The FIA approved the one-race swap under the 2026 sporting regulations; Ocon's already-announced departure from Haas at season's end is unaffected, and whether he's back in the car for Sao Paulo isn't known yet."],
        ["Stewards rule on the Verstappen/Lawson clash", "Friday's FP2 contact between Red Bull team-mates Max Verstappen and Liam Lawson through the stadium section, which had brought out a red flag, earned both drivers a one-place grid penalty for Sunday's race plus a penalty point on their licence. The stewards called the move 'unacceptable', citing a warning already given to team managers over similar incidents, and judged both drivers equally at fault."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads team-mate George Russell by 123 points with five races left, starting with this one. Practice times don't move the standings."],
        ["George Russell (Mercedes)", "Second on 242 points, seventh-fastest in FP3."]
      ] },
      { h:"What to look for", items:[
        ["Qualifying, 3 PM local", "Sets Sunday's grid directly -- no sprint this weekend. Verstappen and Lawson's one-place penalties apply to wherever they end up qualifying."],
        ["Hirakawa's race weekend", "His first full race weekend of 2026 (he'd previously only driven an FP1 outing) -- racing qualifying and Sunday's Grand Prix in place of Ocon."]
      ] }
    ],
    note:"Sources: Formula1.com's own FP3 report ('Norris pips Antonelli and Leclerc to top spot in final practice for Mexico City GP') for the session times and order; RacingNews365's FP3 report, Autosport's and Grande Premio's reports on the Ocon/Hirakawa swap (Haas's 'not due to illness' statement, the FIA's one-race approval) and Crash.net's report raising, without confirming, a race-engineer dispute as a possible reason; ESPN ('Max Verstappen and Liam Lawson given one-place grid penalty at Mexico City Grand Prix'), RacingNews365 and Sky Sports for the stewards' ruling on the FP2 Verstappen/Lawson contact; this app's own data/standings.js (2026 points after the United States Grand Prix) for the unchanged championship gap. All read via web search (the sites could not be reached directly from this environment). The exact reason for Ocon's benching and whether he returns at Sao Paulo were not confirmed anywhere checked and are left out rather than guessed." },
  { t:"martinsville", d:"2026-10-30", s:"nascar", from:"2026-10-31", at:"2026-10-31T19:24:48Z",
    asOf:"Current after Saturday's Cup Series qualifying at Martinsville (Oct 31): Denny Hamlin took his second straight pole here. Sunday's Xfinity 500, 2 PM local, is the penultimate race of the 2026 Chase.",
    groups:[
      { h:"Qualifying: Hamlin's second straight Martinsville pole", items:[
        ["Denny Hamlin (Joe Gibbs Racing)", "Won the pole with a 19.226-second lap (98.492 mph) around the half-mile oval, his second consecutive Martinsville pole and a bid for his seventh career win here on Sunday."],
        ["Ty Gibbs (Joe Gibbs Racing)", "Second, just 0.049s off his team-mate, giving Toyota the front row."],
        ["Kyle Larson (Hendrick Motorsports)", "Third -- the Chase points leader starts up front, with Austin Cindric fourth and Joey Logano fifth completing the top five."],
        ["The rest of the top ten", "Ryan Preece, Alex Bowman, William Byron, Chase Elliott and Josh Berry rounded out the top ten; Chase Briscoe starts 11th and Ryan Blaney 13th."]
      ] },
      { h:"The championship fight", items:[
        ["Kyle Larson (Hendrick Motorsports)", "Still leads the Chase by 73 points over Denny Hamlin after Talladega, and starts Sunday's race third on the grid -- one of only two races left before the Nov 8 finale at Homestead-Miami."],
        ["Denny Hamlin (Joe Gibbs Racing)", "Second, 73 points back, starts from pole."],
        ["Chase Briscoe (Joe Gibbs Racing)", "Fourth in the standings, about 77-79 points back (outlets differ slightly on the exact gap); starts 11th on Sunday."]
      ] },
      { h:"What to watch Sunday", items:[
        ["The Xfinity 500, 2 PM local", "250 laps on Martinsville's tight, flat half-mile -- short-track contact is common here, and with no elimination round this year every point still matters for all 16 Chase drivers heading into the Homestead finale."]
      ] }
    ],
    note:"Sources: RotoBaller's and Sportsnaut's NASCAR Cup qualifying reports for Martinsville's fall 2026 race (Hamlin's pole time and margin over Gibbs, the full top-10 starting order, Briscoe 11th and Blaney 13th), cross-checked against an On3/Yahoo Sports 'Official Starting Lineup' report and an Athlon Sports qualifying report, both of which independently confirm Hamlin's 19.226s/98.492mph pole and his 0.049s margin over Gibbs; this app's own prior data/watch.js entry (written after Talladega) for the still-current Chase points gaps (Larson's 73-point lead over Hamlin, Briscoe's 77-79-point gap in fourth), not independently re-confirmed today since no race has run since. All read via web search (the sites could not be reached directly from this environment). No official report on Saturday's Cup practice speeds was found in sources checked, so it is left out rather than guessed; Christopher Bell's exact starting position was likewise not found and is left out." },
  { t:"mexico-city", d:"2026-10-30", s:"f1", from:"2026-10-31", at:"2026-11-01T11:26:58Z",
    asOf:"Current after Saturday's qualifying at Mexico City (Oct 31): Lewis Hamilton took a shock first Ferrari pole, with George Russell just 0.009s behind and Max Verstappen dropping off the front two rows under a grid penalty. Sunday's race is at 2 PM local (8 PM UTC).",
    groups:[
      { h:"Qualifying: Hamilton's shock first Ferrari pole", items:[
        ["Lewis Hamilton (Ferrari)", "Took pole with a 1:16.514, just 0.009s clear of George Russell -- his first pole for Ferrari, and, per the FIA's own report, the oldest polesitter since Mario Andretti in 1982."],
        ["George Russell (Mercedes)", "Second, 0.009s off Hamilton's time, keeping a Mercedes on the front row."],
        ["Charles Leclerc (Ferrari)", "Third in 1:16.633, putting both Ferraris inside the top three."],
        ["Max Verstappen (Red Bull Racing)", "Set the fourth-fastest time but lines up lower on the grid under the one-place penalty (shared with Liam Lawson) already handed down for Friday's FP2 clash through the stadium section, which promotes Kimi Antonelli -- fifth-fastest, 1:16.707 -- ahead of him."],
        ["Lando Norris (McLaren)", "Sixth in 1:16.824. The rest of the top ten was not confirmed in sources checked today and is left out rather than guessed."]
      ] },
      { h:"The title fight: Mercedes", items:[
        ["Kimi Antonelli (Mercedes)", "Leads team-mate Russell by 123 points with five races left; practice and qualifying don't move the standings, and he qualified ahead of Verstappen only because of the Red Bull's grid penalty."],
        ["George Russell (Mercedes)", "Second on 242 points, and starts Sunday from the front row alongside Hamilton."],
        ["Lewis Hamilton (Ferrari)", "Third on 241 points -- just one behind Russell -- and now has a genuine shot at a win from pole."]
      ] },
      { h:"What to watch Sunday", items:[
        ["The race, 2 PM local", "Can Hamilton convert Ferrari's first pole of the year into a win, with Russell alongside and Leclerc right behind? Verstappen and Antonelli's grid swap from the penalty is the other thing to watch into Turn 1."]
      ] }
    ],
    note:"Sources: the FIA's own report ('F1: Hamilton claims first Ferrari pole position in thrilling Mexico City qualifying') and Motorsport.com's qualifying report for Hamilton's pole time and margin over Russell; two independent syntheses of qualifying coverage (including a RacingNews365 'adjusted results' report) that agree on Leclerc third (1:16.633), Antonelli fifth (1:16.707) and Norris sixth (1:16.824); this app's own prior data/watch.js entry (written after Friday's FP2, sourced from ESPN/RacingNews365/Sky Sports) for the already-confirmed Verstappen/Lawson one-place grid penalty; this app's own data/standings.js for the unchanged championship points after the United States Grand Prix. All read via web search (the sites could not be reached directly from this environment), which also surfaced several contradictory and clearly out-of-season 'results' for this event (other drivers credited with pole in different sources); only the claims corroborated by at least two independent, named outlets are kept here. Positions 7 through 10, the exact grid once both Verstappen's and Lawson's penalties are applied, and any detail on Oscar Piastri's session (sources disagreed sharply on his result) were not confirmed and are left out rather than guessed." },
  { t:"mexico-city", d:"2026-10-30", s:"masters", from:"2026-10-31", at:"2026-11-01T11:26:58Z",
    asOf:"Current after Saturday's Race 1 of 2 at Mexico City (Oct 31): still no 2026 entry list, car count or any session result -- practice, qualifying or Race 1 -- has turned up anywhere in sources checked, continuing the total blackout on this weekend's coverage.",
    groups:[
      { h:"What's known", items:[
        ["Masters Racing Legends, 1966-85 (plus 1977-85 turbo) F1 cars", "Race 1 of 2 ran as scheduled on Saturday alongside the Mexico City Grand Prix weekend at the Autodromo Hermanos Rodriguez. No entry list, car count, practice or qualifying times, or a Race 1 classification have been found in sources checked, including the series' own event and race-report pages, so who's racing and how Race 1 went isn't confirmed."],
        ["One race left", "Race 2 of 2 runs Sunday morning; no results for it will be available until after it runs."]
      ] }
    ],
    note:"Sources: Masters Historic Racing's own event and race-report pages for the Oct 30-Nov 1 Mexico City weekend could not be reached directly from this environment to check for a published entry list, timetable or results; further web searches today (for an entry list, pole position, grid, practice times or a Race 1 result) found none -- the only Masters Mexico City race reports that turned up were from 2015 and 2024, not 2026 -- consistent with this app's own prior data/watch.js entries for this same weekend, which likewise found nothing published. No 2026 Mexico City entry list, car count or session results were found as of this writing. Check back once the series or a race report publishes an entry list or results." },
  { t:"sepang", d:"2026-10-30", s:"motogp", from:"2026-10-31", at:"2026-11-01T11:26:58Z",
    asOf:"Current after Sunday morning's Warm-Up Practice at Sepang (Nov 1): Marc Marquez was fastest, with Alex Marquez, Pedro Acosta and Ai Ogura close behind. Today's Malaysian Grand Prix, 3 PM local (7 AM UTC), is the one that matters.",
    groups:[
      { h:"Warm-Up: Marquez tops it late", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Fastest in the 10-minute session on a 1:58.902, set on just three laps after waiting until halfway through to head out."],
        ["Alex Marquez (BK8 Gresini Racing MotoGP)", "Second, 0.486s back -- yesterday's Sprint winner Pedro Acosta was third (+0.503s) and Ai Ogura fourth (+0.669s)."]
      ] },
      { h:"The title fight: a shot at a mathematical head start", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads Jorge Martin 374 to 355 -- a 19-point gap -- heading into today's race. Martin remains sidelined by the wrist he fractured at Phillip Island, so Marquez scores points today no matter where he finishes, while Martin scores none."],
        ["Jorge Martin (Aprilia Racing)", "Stays on 355, still out for the rest of this Malaysian Grand Prix weekend."]
      ] },
      { h:"What to watch today", items:[
        ["The Malaysian Grand Prix, 3 PM local", "The season's penultimate round and the last word on how far Marquez can stretch his lead before a possible title-clinching chance next time out at Qatar."]
      ] }
    ],
    note:"Sources: Crash.net's and Racesport.nl's reports of Sunday's Sepang warm-up (Marc Marquez's 1:58.902 fastest lap taken on three laps after a late start, and the order behind him: Alex Marquez, Pedro Acosta, Ai Ogura), both read via web search (the sites could not be reached directly from this environment); this app's own data/standings.js (374-355, unchanged since Saturday's Sprint) for the championship gap and data/sepang.js for today's schedule. This entry covers only the warm-up and the build-up to today's Grand Prix, which this app's own automatic MotoGP results/standings tooling (tools/motogp_update.py) covers separately once it is run; the race result itself is intentionally left out of this What to watch entry." },
  { t:"homestead-miami", d:"2026-11-06", s:"oreilly", from:"2026-11-01", at:"2026-11-01T12:22:14Z",
    asOf:"Current after Martinsville (Oct 31, 2026), the last race before this one decides the title.",
    groups:[
      { h:"The championship, decided here", items:[
        ["Justin Allgaier (JR Motorsports)", "Took the points lead at Martinsville, finishing a close second to teammate Carson Kvapil, and now leads on 2,436 points. He's also the defending race winner at Homestead."],
        ["Jesse Love (Richard Childress Racing)", "Second, 22 points back, after a tire rub in the second stage at Martinsville turned into a water-line issue; he lost his brakes going into a corner, spun and finished 30th, nine laps down."],
        ["Corey Day (Hendrick Motorsports)", "Third, 23 points back, after finishing third at Martinsville."],
        ["Carson Kvapil (JR Motorsports)", "Fourth, 31 points back, after winning at Martinsville -- his second straight win there. He and his team have said he likely needs to win at Homestead too, since a DNF is close to the only way Allgaier doesn't claim the title outright."],
        ["Sheldon Creed", "Fifth and the last driver mathematically alive, 42 points back."]
      ] },
      { h:"No more elimination rounds", items:[
        ["How the 2026 Chase works", "NASCAR replaced its old elimination playoff with The Chase for 2026: the top 12 drivers after Daytona's regular-season finale got one points reset, then raced the final 9 with nobody cut. The champion is simply whoever leads points after this race -- there's no separate win-and-in finale format, so the five drivers above are the only ones who can still win it mathematically."]
      ] },
      { h:"Homestead's return", items:[
        ["Back on the calendar", "The track hosted NASCAR's championship-deciding race every year from 2002 to 2019, before the finale moved to Phoenix for 2020-2025. It's back for the O'Reilly Series title decider in 2026, on a 1.5-mile oval whose aged, abrasive surface is known for heavy tire wear and multiple racing grooves."],
        ["Shorter than Cup's race", "The O'Reilly race here runs 200 laps, shorter than Sunday's Cup finale."]
      ] }
    ],
    note:"Sources: Yahoo Sports ('Justin Allgaier Takes Championship Lead After Martinsville' and 'NASCAR points standings: O'Reilly Series points update after Martinsville race,' Oct 31, 2026), Racer.com ('Kvapil delivers clutch performance at Martinsville to keep O'Reilly Series championship hopes alive,' Oct 31, 2026) and On3.com ('NASCAR O'Reilly Auto Parts Series Chase standings updated after Martinsville') for the race result, Love's tire-rub/water-line/spin, and the post-Martinsville points (Allgaier 2,436; Love 2,414; Day 2,413; Kvapil 2,405; Creed 2,394), all via web search (the sites could not be reached directly from this environment); this app's own data/results.js (Martinsville race order) for the top finishers; this app's own data/series.js for the 2026 Chase format (no elimination, Daytona reset, Homestead finale); carried over from the previous entry for this event: NASCAR.com/si.com reporting and Goodyear's tire-wear characterization of Homestead-Miami's track surface, and the track's 2002-2019 championship-race history and return in 2026." },
  { t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-01", at:"2026-11-01T14:23:59Z",
    asOf:"Current after Marc Marquez's win at the Malaysian Grand Prix (Sepang, Nov 1, 2026) -- Jorge Martin did not take part, still recovering from the wrist he fractured at Phillip Island.",
    groups:[
      { h:"What Sepang changed", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Won going away, 4.172 seconds clear of Pedro Acosta at the flag -- his 80th premier-class victory. He now leads Jorge Martin by 44 points, 399 to 355, up from a 10-point gap heading into the weekend."],
        ["Jorge Martin (Aprilia Racing)", "Never started: after struggling through Friday practice on the wrist he fractured in last week's Phillip Island sprint crash, he did not take part in qualifying and sat the rest of the weekend out to keep recovering. No date has been confirmed for his return; Qatar is this app's best information but not yet certain."],
        ["Pedro Acosta (Red Bull KTM Factory Racing) and Alex Marquez (BK8 Gresini Racing MotoGP)", "Second and third at Sepang, the race's closest fight -- the podium battle neither Marquez brother or Martin was contesting."]
      ] },
      { h:"The title fight, into Qatar", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads on 399, with three rounds left after Malaysia: this one, then Portimao and the Valencia finale. He can't clinch it here -- even a maximum run of sprint/GP wins (37 a round) still leaves Martin a mathematical shot until the gap passes what's left on the table -- but a strong weekend shrinks that math fast."],
        ["Jorge Martin (Aprilia Racing)", "Stays on 355 if he sits this one out too, 44 points back with two rounds to go after Qatar (up to 74 more available) -- still alive, but needing to be back on the bike soon to use them."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 332, 67 behind Martin -- a long shot that gets longer if Martin can't convert his remaining rounds."],
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Fourth on 295 after his Sepang runner-up finish, mathematically alive but far back."]
      ] },
      { h:"Lusail, under the lights", items:[
        ["MotoGP's only night race", "Saturday's Sprint and Sunday's Grand Prix both start after dark under Lusail's floodlights (formerly Losail International Circuit) -- the one round on the 2026 calendar run that way."],
        ["Hard on tyres", "Qatar's heat and blowing desert sand have historically made this one of the more abrasive stops on the calendar, pushing teams toward harder, more durable tyre choices than the lap times alone would suggest."],
        ["Back after a reshuffle", "This round was originally scheduled for April 2026 before being postponed; it was rebooked for Nov 6-8 in March, and Qatari organizers confirmed in mid-October that the circuit is preparing to host it on that date."]
      ] }
    ],
    note:"Sources: this app's own data/results.js (automatic update from the MotoGP results service, api.pulselive.motogp.com) for the Sepang finishing order, and data/standings.js (same automatic source) for the post-race points; web search of Al Jazeera ('Marquez wins Malaysian Grand Prix to close in on retaining championship,' Nov 1, 2026), BVM Sports ('Marc Marquez Wins Malaysian GP, Sets Up Qatar Title Shot,' Nov 1, 2026) and MCNews.com.au's Malaysian MotoGP 2026 race report for the 80th-win and 4.172-second-margin detail, the 44-point gap, and Martin's withdrawal before qualifying with his wrist still healing (sites not reachable directly from this environment, read via search); this app's own data/series.js for the Sprint/Grand Prix points structure (up to 37 a weekend) used for the clinch arithmetic. Martin's status for Qatar itself was not confirmed by any source found; check back closer to Thursday. Carried over from the previous entry for this event: crash.net and qna.org.qa/qatar-tribune.com reporting for Lusail's night-race format, tyre-wear characteristics and April-to-November rescheduling." },
  { t:"interlagos", d:"2026-11-06", s:"f1", from:"2026-11-02", at:"2026-11-02T11:27:12Z",
    asOf:"Current after the Mexico City Grand Prix (Nov 1): the title is already settled, so this weekend is about who finishes the year as runner-up and the fight further down the order.",
    groups:[
      { h:"It's already decided: Kimi Antonelli is champion", items:[
        ["Kimi Antonelli (Mercedes)", "Clinched the 2026 drivers' title at Mexico City by finishing third -- he only needed ninth or better -- while Max Verstappen won the race and Lewis Hamilton was second. At 20 years and 68 days old, he's the youngest world champion in F1 history, beating Sebastian Vettel's long-standing record, and the first Italian champion since Alberto Ascari in 1953. He did it in just his second full season, having replaced the retiring Hamilton at Mercedes for 2025."],
        ["No more pressure, but no let-up either", "Antonelli heads into São Paulo with the pressure off -- expect him to still race hard; a title-winner's first start as champion always draws attention, and Interlagos' famously unpredictable weather means the race itself doesn't get any easier."]
      ] },
      { h:"The real fight here: second place", items:[
        ["Max Verstappen (Red Bull Racing)", "Jumped to second in the standings on 261 points by winning at Mexico City, just 2 points clear of Lewis Hamilton."],
        ["Lewis Hamilton (Ferrari)", "Third on 259, one place and 2 points off Verstappen, after finishing second at Mexico City."],
        ["George Russell (Mercedes)", "Fourth on 250, 9 points off the podium spot in the standings."],
        ["Charles Leclerc (Ferrari)", "Fifth on 245, 5 further back."],
        ["Lando Norris (McLaren)", "Sixth on 221. Won last year's São Paulo GP from pole, leading every lap for his seventh win of 2025 -- worth watching whether he can repeat it."]
      ] },
      { h:"What to look for", items:[
        ["Altitude again", "Interlagos sits about 800m above sea level, the second-highest circuit on the calendar after Mexico City -- back-to-back high-altitude races test engine cooling and aero set-up two weekends running."],
        ["A history of chaos", "Interlagos has decided championships in the rain before -- most famously 2008, when a late downpour let Lewis Hamilton pass Timo Glock at the final corner to take the title by one point. Brazil's unpredictable weather is always part of the story here, title or no title on the line this time."],
        ["No sprint", "A normal weekend: three practice sessions, qualifying Saturday, race Sunday (71 laps of the 4.309km circuit) -- not one of this year's sprint rounds."]
      ] }
    ],
    note:"Sources: ESPN ('Kimi Antonelli makes F1 history as youngest world champion'), FIA.com ('Antonelli crowned F1's youngest world champion, Verstappen wins Mexico City') and Sky Sports ('Kimi Antonelli crowned 2026 F1 world champion as Max Verstappen wins wild Mexico City Grand Prix from Lewis Hamilton'), all read via web search (the sites could not be reached directly from this environment) and agreeing on the race result, Antonelli's age/record and the Ascari comparison. This app's own data/standings.js (automatic update from api.jolpi.ca, the Ergast-compatible FIA mirror, read 2026-11-02) for the post-Mexico City points. Interlagos race distance/lap count and no-sprint format from search results citing the circuit's own weekend info. Altitude and 2008 rain-decider facts and the no-sprint/three-practice format carried over, re-confirmed, from this app's prior entry for this event (gpdestinations.com, formula1.com, racingnews365.com, crash.net)." },
  { t:"homestead-miami", d:"2026-11-06", s:"nascar", from:"2026-11-02", at:"2026-11-02T11:27:12Z",
    asOf:"Current after the Martinsville race (Nov 1): Kyle Larson did not clinch there, but heads into the finale with a big lead and a very low bar to seal the title.",
    groups:[
      { h:"Martinsville didn't settle it, but came close", items:[
        ["William Byron won", "Byron dominated at Martinsville, leading 362 of 500 laps and beating Hendrick team-mate Chase Elliott by 2.049 seconds for his first win of the season. Ty Gibbs was third, Josh Berry fourth, Shane van Gisbergen fifth."],
        ["Kyle Larson's rough day, salvaged", "Larson had a costly early pit/strategy problem that put him a lap down, but fought back to finish ninth and keep his points lead -- by his own admission afterward, \"it's not a clinch,\" but the result could have been far worse for his championship hopes."]
      ] },
      { h:"Where the Chase stands heading to Homestead", items:[
        ["Kyle Larson leads", "2,469 points, 67 ahead of Christopher Bell in second and 70 ahead of Denny Hamlin in third; Chase Briscoe is fourth, 84 back. Byron's Martinsville win moved him up to ninth in the standings, Elliott to tenth."],
        ["A very low bar to clinch", "Reports after Martinsville put Larson's number at just 9 points to clinch outright at Homestead, or simply finishing 28th or better even without any stage points -- he'll be a heavy favorite to wrap up his third championship (second in a row) on Nov 8, but it isn't mathematically over yet."],
        ["The track", "A 1.5-mile oval, last repaved in 2003; Goodyear calls it one of the Cup Series' highest tire-wear tracks, with the fast lane drifting up against the outside wall late in a run -- a track that tends to reward whoever manages their tires best. Homestead crowned NASCAR's champion every year from 2002-2019 and is back for the finale in 2026 (and already confirmed for 2027) after a $20 million renovation."]
      ] }
    ],
    note:"Sources: NBC Washington/Yahoo Sports search-result summaries of the Nov 1, 2026 Martinsville race and its aftermath (Byron's win margin and laps led, the top five, Larson's ninth-place finish and his own 'it's not a clinch' quote, and the 9-point/28th-or-better clinch threshold for Homestead) and racer.com's 'Larson says Martinsville result could have been a lot worse' (headline only; the article itself could not be reached directly from this environment, read via web search); the exact Chase-standings gaps (67 over Bell, 70 over Hamlin, 84 over Briscoe) came from the same search synthesis and are internally consistent with this app's own data/results.js finishing order (automatic update from cf.nascar.com, which independently confirms Larson finished ninth). Homestead-Miami track and renovation facts carried over, re-confirmed, from this app's prior entry for this event (nascar.com, racer.com, EssentiallySports)." },
  { t:"monza", d:"2026-11-06", s:"wec", from:"2026-11-05", at:"2026-11-06T12:25:53Z",
    asOf:"Current after Free Practice 1 at Monza (Nov 6): run in cold, rain-soaked conditions that dried out late, with three red flags. Qualifying and the title-deciding race are still to come.",
    groups:[
      { h:"The drivers' title: Toyota vs Toyota", items:[
        ["#8 Sebastien Buemi, Brendon Hartley, Ryo Hirakawa (Toyota)", "Lead the Hypercar drivers' standings by 17 points (114 to 97) over their own team-mates in the #7, with Toyota's manufacturers' title already wrapped up. A standard WEC race pays 25 points for the win plus 1 for pole, so the drivers' fight is still mathematically open. Neither Toyota showed up among FP1's fastest times in the wet, so their race-day pace is still a question mark."],
        ["#7 Kamui Kobayashi, Mike Conway, Nyck de Vries (Toyota)", "17 points back with a maximum 26 on offer -- their last realistic shot at catching their team-mates."],
        ["FP1 pace-setters", "Charles Milesi topped a red-flag-interrupted session in the #35 Alpine A424 with a 1:45.862 set late as the track dried, 0.401s clear of Yifei Ye's #83 AF Corse Ferrari 499P (whose co-driver Phil Hanson had led most of the session). Harry Tincknell's #007 Heart of Racing Aston Martin Valkyrie was third, with Alpine's Victor Martins and Ferrari's James Calado rounding out the top five -- none of them realistic Hypercar title contenders, but a reminder the podium at Monza is wide open on raw pace."]
      ] },
      { h:"LMGT3: TF Sport's Corvette vs Manthey's Porsche", items:[
        ["#33 TF Sport (Chevrolet Corvette Z06 GT3.R)", "Leads the LMGT3 teams' standings by 18 points, 92 to 74. Jonny Edgar put the car third-fastest in FP1, behind Tom Fleming's #10 Garage 59 McLaren 720S GT3 Evo (1:57.575) and Giammarco Leverato's #88 Proton Competition Ford Mustang GT3 EVO (+0.330s)."],
        ["#92 The Bend/Manthey (Porsche 911 GT3 R)", "18 points back, with Monza's maximum 26 still enough to take the title -- but this car spent most of FP1 parked with a drivetrain issue, managing only two late laps from Richard Lietz, who is making his 100th WEC start this weekend."],
        ["Manthey's rough session", "The team's other entry, the #91 Porsche, crashed at Lesmo 2 after contact with the #19 Genesis of Mathieu Jaminet, one of three red flags in a session also stopped for Antonio Fuoco's #50 Ferrari going off early and Robin Frijns beaching the #20 BMW at the Ascari exit."]
      ] }
    ],
    note:"Sources: Sportscar365 ('Milesi Leads Wet Free Practice 1 in Monza,' Nov 6, 2026) for the session conditions, Hypercar and LMGT3 FP1 times/gaps, the three red flags and their causes, and the Manthey #92 drivetrain issue; cross-checked against OA Sport's and f1livepulse's same-day FP1 reports (Alpine ahead of Ferrari in the wet), read via web search (the sites could not be reached directly from this environment). data/standings.js (from fiawec.com, read Oct 26, 2026) for the points gaps. TF Sport's Corvette Z06 GT3.R entry (GM Authority, Racer.com, Pit Debrief, Dec 2025-Feb 2026 reports) corrects this app's prior entry for this event, which had mislabeled the #33 as an Aston Martin. Toyota manufacturers'-title clinch and points-scale facts carried over, re-confirmed, from this app's prior entry for this event." },
  { t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-05", at:"2026-11-06T13:26:06Z",
    asOf:"Current after Friday morning's MotoGP FP1 at Qatar (Lusail, Nov 6): Marc Marquez fastest, Jorge Martin back in the top five on his first competitive laps since fracturing his wrist, and the weekend overshadowed by Yamaha boycotting the race over Middle East travel restrictions.",
    groups:[
      { h:"What FP1 showed", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Topped the session on a 1:52.278, with Marco Bezzecchi (Aprilia) 0.110s back in second and Fabio Di Giannantonio (VR46 Ducati) third, 0.413s off."],
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Fourth, 0.677s back, after his bike stopped out on track on his final lap -- reports point to a possible technical problem."],
        ["Jorge Martin (Aprilia Racing)", "Fifth, 0.734s off Marquez's pace, after passing a medical check on Friday morning to make his first start since fracturing his right wrist at Phillip Island on Oct 25. A long way from his pre-injury form, but a far stronger showing than the 20th he managed at Sepang on the same wrist last week."],
        ["A reduced, 18-rider session", "Only 18 of the 22 regular riders were out: Yamaha withdrew its whole four-rider line-up (factory and satellite) from this race (see below), and this app could not confirm which other riders sat out or crashed in FP1 -- check race-weekend coverage for the full list."]
      ] },
      { h:"The story of the weekend: Yamaha's boycott", items:[
        ["Why Yamaha pulled out", "Yamaha withdrew its riders from this Grand Prix entirely, citing its own company-wide travel restrictions to the Middle East amid the regional security situation there, and Japanese government travel advice warning against non-essential trips to Qatar. The team said it saw no grounds to lift that policy for this race."],
        ["Most of the grid didn't want to be here either", "A letter reportedly signed by as many as 19 of the 22 regular riders asked MotoGP's organisers to either take full responsibility for the race going ahead or call it off; the deadline the riders set passed without a response before the weekend began. This app could not confirm which riders, if any, declined to sign."],
        ["MotoGP says the race goes on", "MotoGP said it was disappointed by Yamaha's decision and has reportedly threatened sanctions, possibly including bans from the season's remaining rounds in Portugal and Valencia; it isn't clear those threats are enforceable, and the FIM has not commented. Barring a government travel ban or the organisers cancelling the event, the rest of the grid is racing this weekend as scheduled."]
      ] },
      { h:"The title fight, unchanged on points", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Still leads on 399, with Jorge Martin on 355 (a 44-point gap) and Marco Bezzecchi third on 332 -- Friday practice doesn't change the standings, and he can't clinch the title at this round outright."],
        ["Jorge Martin (Aprilia Racing)", "Needs a big result after missing Sepang entirely, with only two rounds left (Portugal, Valencia) to find the points after this one."]
      ] },
      { h:"Up next", items:[
        ["Friday evening's Practice (19:00 local, under the lights)", "The final hour before Saturday's qualifying -- worth watching whether Martin keeps closing the gap and whether the smaller grid changes the usual form order."],
        ["Saturday: FP2, qualifying and the Sprint", "FP2 and two qualifying segments set the grid for Saturday evening's Sprint (19:00 local), the last data point before Sunday's Grand Prix (19:00 local, also after dark)."]
      ] }
    ],
    note:"Sources: web search summaries of crash.net's and roadracingworld.com's 2026 Qatar MotoGP Friday-practice coverage and grandepremio.com's FP1 report for the lap times/gaps, Martin's return and the 18-rider grid (the sites could not be reached directly from this environment, so these are as summarized by search results rather than read first-hand); web search summaries of thestar.com.my ('Yamaha pull out of Qatar Grand Prix amid regional unrest,' Nov 2, 2026), crash.net ('Yamaha won't race in Qatar MotoGP in serious escalation of standoff with organisers' and 'MotoGP responds to Yamaha's Qatar GP boycott, warns of implications') and the-race.com ('Yamaha pulls out of Qatar GP, MotoGP threatens penalties') for the boycott's reasoning, the riders' letter and MotoGP's response (same access limitation; which four Yamaha riders are out and which riders did or didn't sign the letter were reported with less certainty across sources and are left out or hedged above). data/standings.js (automatic update from the MotoGP results service) for the championship points, unchanged since the last entry for this event. data/lusail.js for the rest of the weekend's published session times. FP1 ended only a short time before this was written; check back after Friday evening's Practice and Saturday's qualifying and Sprint." },
  { t:"interlagos", d:"2026-11-06", s:"f1", from:"2026-11-06", at:"2026-11-06T17:24:02Z",
    asOf:"Current after FP1 at the São Paulo Grand Prix (Interlagos, Nov 6): Lando Norris fastest in an upgraded McLaren, new champion Kimi Antonelli second, and the fight for second overall in the standings still to be settled this weekend.",
    groups:[
      { h:"What FP1 showed", items:[
        ["Lando Norris (McLaren)", "Topped the session on 1:11.717 with a freshly upgraded MCL40, 0.082s clear of Kimi Antonelli."],
        ["Kimi Antonelli (Mercedes)", "Second, 0.082s back, in his first session since being crowned the sport's youngest-ever world champion at Mexico City."],
        ["Max Verstappen (Red Bull Racing)", "Third, 0.236s off Norris's pace, while reporting gearshift and steering-wheel issues during the session."],
        ["Lewis Hamilton (Ferrari), George Russell (Mercedes), Isack Hadjar (Red Bull Racing)", "Fourth, fifth and sixth."],
        ["A session with stand-ins and a red flag", "Charles Leclerc sat the session out, with Dino Beganovic filling in for Ferrari; Gabriele Mini stood in for Pierre Gasly at Alpine. Audi's Freddie Slater, out in a regular FP1 outing, brought out the session's only red flag. Haas rookie Rafael Camara, racing at his home event, was 18th on his FP1 debut."]
      ] },
      { h:"The real fight here: second place", items:[
        ["Max Verstappen (Red Bull Racing)", "Leads the fight for runner-up on 261 points, 2 clear of Lewis Hamilton -- FP1 pace doesn't change the standings."],
        ["Lewis Hamilton (Ferrari)", "Third on 259, one place and 2 points off Verstappen."],
        ["George Russell (Mercedes)", "Fourth on 250, 9 points off the podium spot in the standings."],
        ["Charles Leclerc (Ferrari)", "Fifth on 245, 5 further back -- and missed FP1 entirely."],
        ["Lando Norris (McLaren)", "Sixth on 221. Won last year's São Paulo GP from pole and was fastest in FP1 this time too."]
      ] },
      { h:"Up next", items:[
        ["Friday afternoon: Porsche Carrera Cup Brazil qualifying, Porsche Sprint Challenge Brazil Race 1, and FP2 (16:00 local)", "A packed support-series afternoon around FP2, the last practice before Saturday's qualifying."],
        ["Saturday's qualifying (15:00 local) and Sunday's race (14:00 local, 71 laps)", "A normal weekend -- three practice sessions, no sprint -- at a circuit with a history of deciding championships in the rain, though the title itself is already settled."]
      ] }
    ],
    note:"Sources: web search summaries of Planet F1 ('F1 results: Brazilian Grand Prix 2026 - FP1 (Interlagos)'), Motorsport Week ('F1 2026 Sao Paulo Grand Prix - FP1 Results') and Motorsport.com's live FP1 text, which the search results described as agreeing on the final classification (the sites could not be reached directly from this environment). data/standings.js (automatic update from api.jolpi.ca) for the post-Mexico City points, unchanged since the prior entry for this event. Session times from data/interlagos.js." },
  { t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-06", at:"2026-11-06T17:24:02Z",
    asOf:"Current after Friday evening's Practice at the Qatar Grand Prix (Lusail, Nov 6): Fabio Di Giannantonio set a new outright lap record to top the combined Friday times, championship leader Marc Marquez second, and Jorge Martin a strong seventh on his first full day back from a fractured wrist.",
    groups:[
      { h:"What Friday's Practice showed", items:[
        ["Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", "Set a new Losail circuit lap record, 1:50.406, to top the session and the combined Friday times."],
        ["Marc Marquez (Ducati Lenovo Team)", "Second, 0.142s back, after also topping the morning's FP1."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third, 0.260s off the pace."],
        ["Francesco Bagnaia (Ducati Lenovo Team)", "Fourth, 0.386s back."],
        ["Jorge Martin (Aprilia Racing)", "Seventh, roughly six tenths off the pace -- a clear step up from the 20th he managed in his comeback attempt at Sepang, in his first full day of track time since fracturing his right wrist at Phillip Island on Oct 25."]
      ] },
      { h:"The story of the weekend: Yamaha's boycott", items:[
        ["Still out", "Yamaha's four riders remain withdrawn from this Grand Prix over the team's own Middle East travel restrictions and Japanese government travel advice; this app found no report of the situation changing after Friday's sessions."],
        ["MotoGP vs. the riders", "MotoGP has said the race goes ahead as scheduled and has reportedly threatened sanctions against Yamaha; no further developments were confirmed as of Friday evening."]
      ] },
      { h:"The title fight, unchanged on points", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Still leads on 399, with Jorge Martin on 355 (a 44-point gap) and Marco Bezzecchi third on 332 -- Friday's sessions don't change the standings, and he can't clinch the title at this round outright."],
        ["Jorge Martin (Aprilia Racing)", "Needs a big result after missing Sepang entirely; Friday's pace, on an injured wrist, was a promising sign with only two rounds left after this one."]
      ] },
      { h:"Up next", items:[
        ["Saturday: FP2, two qualifying segments and the Sprint (19:00 local, under the lights)", "Sets the grid order for both the Sprint and Sunday's Grand Prix -- worth watching whether Di Giannantonio's pace or Marquez's and Martin's holds up under qualifying pressure."],
        ["Sunday's Grand Prix (19:00 local, after dark)", "The weekend's main event, run as always at Lusail under floodlights."]
      ] }
    ],
    note:"Sources: web search summaries of roadracingworld.com's and the-race.com's ('Surprise Ducati pace-setter on Qatar MotoGP Friday') coverage of Friday's practice sessions, and gpblog.com's report on Martin's return, for the evening Practice times/gaps and Martin's position (the sites could not be reached directly from this environment, so these are as summarized by search results; some sources gave slightly different gaps for the top positions, and the exact session that produced each FP1 time carried over from the prior entry for this event). data/standings.js (automatic update from the MotoGP results service) for the championship points, unchanged since the prior entry. Yamaha boycott background carried over, re-confirmed as still true, from the prior entry for this event; no new developments were found." },
  { t:"monza", d:"2026-11-06", s:"wec", from:"2026-11-06", at:"2026-11-06T17:24:02Z",
    asOf:"Current after Free Practice 2 at Monza (Nov 6): Robert Kubica fastest for Ferrari in wet conditions, Proton Competition's Fords 1-2 in LMGT3, and both the Hypercar drivers' and LMGT3 teams' titles still to be settled on Sunday.",
    groups:[
      { h:"What FP2 showed", items:[
        ["Robert Kubica, #83 AF Corse (Ferrari 499P)", "Fastest overall in the wet, 1:38.143."],
        ["Harry Tincknell, #007 Heart of Racing (Aston Martin Valkyrie)", "Second, 0.796s back -- the same car that was third-fastest in FP1."],
        ["Where the title-contending Toyotas finished", "This app could not confirm where the #7 and #8 Toyotas, the two crews fighting for the Hypercar drivers' title, classified in FP2 -- check race-weekend coverage for the full order."],
        ["Proton Competition, #10/#22 (Ford Mustang GT3 EVO)", "Locked out the top two spots in LMGT3, Sebastian Priaulx's car just 0.087s ahead of team-mate Logan Sargeant, who is making his WEC debut this season."],
        ["Where the title-contending LMGT3 cars finished", "This app could not confirm where TF Sport's #33 Corvette or Manthey's #92 Porsche, the two cars fighting for the LMGT3 teams' title, classified in FP2."]
      ] },
      { h:"The drivers' title: Toyota vs Toyota", items:[
        ["#8 Sebastien Buemi, Brendon Hartley, Ryo Hirakawa (Toyota)", "Lead the Hypercar drivers' standings by 17 points (114 to 97) over their own team-mates in the #7, with Toyota's manufacturers' title already wrapped up and no team orders planned between the two cars."],
        ["#7 Kamui Kobayashi, Mike Conway, Nyck de Vries (Toyota)", "17 points back with a maximum 26 on offer -- their last realistic shot at catching their team-mates."]
      ] },
      { h:"LMGT3: TF Sport's Corvette vs Manthey's Porsche", items:[
        ["#33 TF Sport (Chevrolet Corvette Z06 GT3.R)", "Leads the LMGT3 teams' standings by 18 points, 92 to 74, heading into the season finale."],
        ["#92 The Bend/Manthey (Porsche 911 GT3 R)", "18 points back, with Monza's maximum 26 still enough to take the title -- the car was hit by a drivetrain issue in FP1; this app could not confirm whether that carried into FP2."]
      ] },
      { h:"Up next", items:[
        ["Saturday: FP3, then LMGT3 and Hypercar qualifying including Hyperpole (afternoon)", "Sets the grid for Sunday's race -- the last data point before the championships are decided."],
        ["Sunday's race (11:00-17:00 local, 6 hours)", "The season finale, deciding both the Hypercar drivers' title between the two Toyota crews and the LMGT3 teams' title between TF Sport and Manthey."]
      ] }
    ],
    note:"Sources: web search summary of racer.com ('Kubica pushes Ferrari to the top in second Monza WEC practice,' Nov 6, 2026) for the FP2 times/gaps and LMGT3 order (the site could not be reached directly from this environment). data/standings.js (from fiawec.com, read Oct 26, 2026) for the points gaps, carried over unchanged from the prior entry for this event. Hypercar and LMGT3 title-fight background and Manthey's FP1 drivetrain issue carried over, re-confirmed as still relevant, from the prior entry for this event." },
  { t:"interlagos", d:"2026-11-06", s:"f1", from:"2026-11-06", at:"2026-11-06T20:23:06Z",
    asOf:"Current after FP2 at the São Paulo Grand Prix (Interlagos, Nov 6): Kimi Antonelli fastest, Lando Norris close behind, and the fight for second overall in the standings still to be settled this weekend.",
    groups:[
      { h:"What FP2 showed", items:[
        ["Kimi Antonelli (Mercedes)", "Topped FP2 with a 1:10.763, after finishing second in the morning's FP1 behind Norris."],
        ["Lando Norris (McLaren)", "Second, 0.253s back on 1:11.016, having been fastest in FP1 himself."],
        ["Max Verstappen (Red Bull Racing)", "Third, 1:11.022, a thousandth of a second off Norris."],
        ["George Russell (Mercedes)", "Fourth, 1:11.036."],
        ["Long runs tell a different story", "Norris posted the quicker average lap time on a long run, though his was a shorter nine-lap stint; Antonelli ran 20 laps on the same set of soft tyres -- one-lap pace and race-pace reading don't fully agree."],
        ["The rest of the order", "This app could not confirm where Lewis Hamilton, Charles Leclerc or Isack Hadjar classified in FP2 -- check race-weekend coverage for the full order."]
      ] },
      { h:"The real fight here: second place", items:[
        ["Max Verstappen (Red Bull Racing)", "Leads the fight for runner-up on 261 points, 2 clear of Lewis Hamilton -- Friday practice doesn't change the standings."],
        ["Lewis Hamilton (Ferrari)", "Third on 259, one place and 2 points off Verstappen."],
        ["George Russell (Mercedes)", "Fourth on 250, 9 points off the podium spot in the standings, and fourth-fastest in FP2 too."],
        ["Charles Leclerc (Ferrari)", "Fifth on 245, 5 further back -- and sat out FP1 entirely for Dino Beganovic."],
        ["Lando Norris (McLaren)", "Sixth on 221, but the pace-setter or close to it in both of Friday's sessions."]
      ] },
      { h:"Up next", items:[
        ["Friday evening: F4 Brazilian Championship qualifying (17:30 local)", "The last on-track action of the day."],
        ["Saturday: FP3 (11:30 local) and qualifying (15:00 local)", "The final practice and the session that sets Sunday's grid -- a normal weekend, no sprint."],
        ["Sunday's race (14:00 local, 71 laps)", "The Grand Prix itself, at a circuit with a history of deciding championships in the rain, though the title itself is already settled this year."]
      ] }
    ],
    note:"Sources: web search summaries of autosport.com's and motorsport.com's live FP2 text for the São Paulo Grand Prix (session classification, gaps and the long-run comparison between Antonelli and Norris; the sites could not be reached directly from this environment). data/standings.js (automatic update from api.jolpi.ca) for the post-Mexico City points, unchanged since the prior entry for this event. Session times from data/interlagos.js. Some search results also described an FP2 incident involving Leclerc and an FIA investigation, and a full FP2 classification beyond fourth place, but this app could not independently confirm those details (search results for this weekend were mixed with reports from past São Paulo/Brazilian GP sessions), so they are left out; where Hamilton, Leclerc and Hadjar finished in FP2 is likewise unconfirmed." },
  { t:"homestead-miami", d:"2026-11-06", s:"trucks", from:"2026-11-06", at:"2026-11-06T21:22:48Z",
    asOf:"Current after Friday qualifying at Homestead-Miami, ahead of tonight's title-deciding Craftsman Truck Series race: the grid is set, and it puts both championship contenders mid-pack rather than up front.",
    groups:[
      { h:"Qualifying: Nick Sanchez grabs the pole, title fight starts fourth and fifth", items:[
        ["Nick Sanchez (#77 Spire Motorsports Chevrolet)", "Topped the session at 164.855 mph (32.756 seconds) for his eighth career Truck Series pole, his second at Homestead and first since Darlington in 2024."],
        ["Chandler Smith (#38 Front Row Motorsports Ford)", "Starts second, just 0.086 seconds off the pole."],
        ["Corey Heim (#1 Tricon Garage Toyota)", "Starts third."],
        ["Layne Riggs (#34 Front Row Motorsports Ford)", "Starts fourth -- not the front-row lap he needed, but still ahead of his title rival."],
        ["Kaden Honeycutt (#11 Tricon Garage Toyota)", "Starts fifth, 0.207 seconds off Sanchez's pole lap (32.963 seconds)."]
      ] },
      { h:"The title fight, one race left", items:[
        ["Kaden Honeycutt", "Leads the championship by 20 points, 2,403 to Riggs' 2,383, after Riggs clawed back 23 points at Martinsville by sweeping both stages there. Stage points tonight could matter as much as the finish."],
        ["Layne Riggs", "Has to outscore Honeycutt by 21-plus points tonight to take the title; a win alone may not be enough if Honeycutt also banks stage points and finishes well, so this is close to must-win for Riggs but not quite winner-take-all."],
        ["Pit trouble for the points leader", "Honeycutt's Tricon Garage team lost its pit-stall selection privilege for tonight's race after a loose-wheel infraction, meaning a worse pit location at a track where position on pit road can cost real time."],
        ["Chandler Smith, Ty Majeski and Christian Eckes", "Still mathematically eliminated after Martinsville -- with only this race left, none of them can make up the points gap to Honeycutt even with a win, so the trophy is a two-truck fight."]
      ] }
    ],
    note:"Sources: web search summaries of Speedway Media's qualifying report (Sanchez's pole speed/time, career/track pole counts, Smith and Heim starting 2nd/3rd) cross-checked against Yahoo Sports' and Racing News' official-starting-lineup reporting (Riggs 4th, Honeycutt 5th at 32.963 seconds, 0.207 off the pole); NASCAR.com's own qualifying-order page returned a conflicting grid (Honeycutt 27th, Riggs 34th) that disagrees with every other source checked and is treated as a data error on that page, not used here. Truck numbers for Sanchez (#77 Spire Motorsports) and Heim (#1 Tricon Garage, confirmed separately from Honeycutt's #11) checked against Jayski's 2026 team chart and Spire Motorsports' own 2026 race coverage. Yahoo Sports' pre-race championship coverage for the 20-point gap (2,403-2,383), Riggs' stage-point gains at Martinsville, and the Tricon Garage pit-selection penalty; this app's own prior data/watch.js entry (written after Martinsville) for the Smith/Majeski/Eckes elimination math, not independently re-confirmed today. The exact tiebreaker/clinching math (what finish guarantees Honeycutt the title regardless of Riggs) was reported in outline by Yahoo Sports but could not be pinned down precisely from sources reachable today, so it is described here only in general terms. All read via web search; the sites themselves could not be reached directly from this environment. Tonight's race result was not yet known at the time of writing -- check back after the race." },
  { t:"homestead-miami", d:"2026-11-06", s:"oreilly", from:"2026-11-06", at:"2026-11-06T23:22:59Z",
    asOf:"Current after Friday's practice at Homestead-Miami, ahead of Saturday's title-deciding O'Reilly Series race: the championship standings are unchanged from after Martinsville -- only tomorrow's race moves them.",
    groups:[
      { h:"Practice: Anthony Alfredo tops the speed chart, Creed and Day the quickest contenders", items:[
        ["Anthony Alfredo", "Fastest in Friday's 50-minute practice at 33.384 seconds (161.754 mph), 0.078s ahead of Jeremy Clements."],
        ["Sam Mayer and Taylor Gray", "Third and fourth, rounding out the top four ahead of the first title contender in the speed chart."],
        ["Sheldon Creed", "Fifth -- the quickest of the five championship contenders, though mathematically the longest shot of the group, 42 points back."],
        ["Corey Day", "Seventh, inside the top 10 and 23 points back in the title fight, with Ryan Sieg between him and Creed in sixth."],
        ["Justin Allgaier, Jesse Love and Carson Kvapil", "Did not appear in the practice speed results found; their practice pace is unconfirmed."]
      ] },
      { h:"The championship, decided tomorrow", items:[
        ["Justin Allgaier (JR Motorsports)", "Leads on 2,436 points after Martinsville and is the defending race winner at Homestead (he won there on March 22, 2025)."],
        ["Jesse Love (Richard Childress Racing)", "Second, 22 points back."],
        ["Corey Day (Hendrick Motorsports)", "Third, 23 points back."],
        ["Carson Kvapil (JR Motorsports)", "Fourth, 31 points back, after winning at Martinsville -- his second straight win there."],
        ["Sheldon Creed", "Fifth and the last driver mathematically alive, 42 points back."],
        ["No elimination this year", "NASCAR replaced its old elimination playoff with The Chase for 2026: the champion is simply whoever leads points after Saturday's race, so these five are the only drivers who can still win the title."]
      ] },
      { h:"Up next", items:[
        ["Saturday: qualifying (1-2 PM ET) and the race (5 PM ET, 200 laps)", "The season's 33rd and final points-paying O'Reilly Series race of 2026, run on Homestead's abrasive, multi-groove 1.5-mile oval."]
      ] }
    ],
    note:"Sources: web search summaries of Yahoo Sports' and Racing News' Homestead O'Reilly Series practice reports (Alfredo's fastest lap and margin over Clements; Mayer, Gray, Creed, Sieg, Day, Retzlaff, Caruth and Hill rounding out the top 10) cross-checked against each other; the sites themselves could not be reached directly from this environment. This app's own prior data/watch.js entry (written after Martinsville, Oct 31) for the unchanged points standings (Allgaier 2,436; Love 2,414; Day 2,413; Kvapil 2,405; Creed 2,394) and Homestead's return to hosting the finale, not independently re-confirmed today. Practice is not points-scored, so a driver's absence from the speed-chart results found (Allgaier, Love, Kvapil) is reported as unconfirmed pace, not a result; no incidents were confirmed in sources checked for this session. Saturday's qualifying and race results were not yet known at the time of writing -- check back after qualifying and after the race." },
  { t:"homestead-miami", d:"2026-11-06", s:"nascar", from:"2026-11-06", at:"2026-11-07T00:22:18Z",
    asOf:"Current after Friday's final Cup practice of the season at Homestead-Miami (Nov 6), with Saturday's qualifying and Sunday's championship race still to come. The Chase standings are unchanged from after Martinsville -- only Sunday's race moves them.",
    groups:[
      { h:"Practice: Briscoe fastest, Larson scrapes the wall, Reddick wrecks", items:[
        ["Chase Briscoe (Joe Gibbs Racing)", "Fastest in Friday's 50-minute session at 32.680 seconds (about 165.24 mph), 0.073s ahead of Austin Cindric; Denny Hamlin was third."],
        ["Christopher Bell, Ryan Blaney, Daniel Suarez, Ty Gibbs, Joey Logano and Michael McDowell", "Filled out the rest of the top 10 on speed."],
        ["Kyle Larson (Hendrick Motorsports)", "Only 10th fastest after scraping the outside wall several times -- the championship leader wasn't quick in practice, though contact with the wall here is routine, not itself a setback."],
        ["Tyler Reddick", "Wrecked during the session and ended up 20th on speed; Ryan Preece was 16th. Ryan Blaney topped the longer 10-to-25-lap average runs, a better read on race pace than one lap."]
      ] },
      { h:"The championship heading into Sunday", items:[
        ["Kyle Larson (Hendrick Motorsports)", "Leads the Chase by 67 points over Christopher Bell and 70 over Denny Hamlin, with Chase Briscoe fourth, 84 back -- unchanged since Martinsville. Outlets differ on the exact clinch number (8-9 points, or any finish of 28th or better), and one report has him able to clinch before the race even reaches Stage 2 with a top-3 finish in Stage 1; either way he needs only a modest result to seal his third Cup title, second in a row."],
        ["Christopher Bell, Denny Hamlin and Chase Briscoe", "The only three drivers who can still catch Larson; each needs a strong run of their own and Larson to fall well short of his usual Homestead pace."],
        ["No elimination this year", "NASCAR replaced the old Championship 4 format with The Chase for 2026: whoever leads points after Sunday's race is champion, so these four are the only drivers who can still win it."]
      ] },
      { h:"Up next", items:[
        ["Saturday: Cup qualifying, 1-2 PM ET", "Sets Sunday's grid; qualifying order and pit-stall selection follow NASCAR's existing Chase procedures."],
        ["Sunday: the championship race, 3 PM ET (NBC, HBO Max, MRN Radio, SiriusXM NASCAR Radio)", "The 2026 champion is decided on Homestead's abrasive, multi-groove 1.5-mile oval."]
      ] }
    ],
    note:"Sources: web-search summaries of Yahoo Sports', Motorsport.com's and Yardbarker's reports on Friday's Cup practice at Homestead-Miami (Briscoe's fastest lap and margin over Cindric, Hamlin third, Larson 10th after wall contact, Reddick's wreck and 20th-place finish, Preece 16th, Blaney's long-run pace); AP/NBC/Heavy.com reporting from Nov 2, 2026 and this app's own prior data/watch.js entry (written after Martinsville) for the unchanged Chase standings (Larson's 67/70/84-point gaps) and the differing reports of the exact clinch number, not independently re-confirmed today since no race has run since Martinsville. None of these sites could be reached directly from this environment; all read via web search." },
  { t:"monza", d:"2026-11-06", s:"wec", from:"2026-11-07", at:"2026-11-07T11:27:35Z",
    asOf:"Current after Free Practice 3 at Monza (Nov 7): Nick Cassidy fastest for Peugeot in the wet, both title-contending Toyotas well down the Hypercar order, and Saturday afternoon's qualifying and Hyperpole next before Sunday's title-deciding race.",
    groups:[
      { h:"What FP3 showed", items:[
        ["Nick Cassidy, #93 Peugeot TotalEnergies", "Fastest in the wet, 1:42.706, with a late flyer as the track improved slightly."],
        ["Victor Martins, #36 Alpine Endurance Team", "Second, 0.040s back."],
        ["Robert Kubica, #83 AF Corse (Ferrari 499P)", "Third, 0.133s off, after topping Friday's FP2."],
        ["#51 Ferrari AF Corse (reigning champions)", "Managed only 7 laps after a brake-by-wire/ECU issue, ending the session 17th and last among Hypercars."],
        ["Incident-filled session", "No red flags, but #83 and #007 Aston Martin (Tom Gamble) collided at the Parabolica -- both continued, with the Aston Martin handed a 10-second stop/go penalty; several other cars (the #20 BMW, #36 Alpine, #17 Genesis, #38 and #12 Cadillacs) ran wide or spun at various corners without major damage."]
      ] },
      { h:"The drivers' title: Toyota vs Toyota", items:[
        ["#8 Sebastien Buemi, Brendon Hartley, Ryo Hirakawa (Toyota)", "Still lead the Hypercar drivers' standings by 17 points (114 to 97) over their own team-mates in the #7, but had a scrappy FP3: 16th of 17 Hypercars, 2.276s off Cassidy's pace, and went off into the gravel at the Ascari chicane (no major damage reported, continued running)."],
        ["#7 Kamui Kobayashi, Mike Conway, Nyck de Vries (Toyota)", "17 points back with a maximum 26 on offer. Classified 10th, 1.144s off the pace -- ahead of their title-rival team-mates on this session but still well off the front. This is reportedly Conway's last race before retiring from top-flight sports car racing."],
        ["Neither Toyota has shown Hypercar-leading pace all weekend", "Both cars were off the front in Friday's FP1 and FP2 too; practice times don't decide the title, but neither crew has yet shown the raw pace of Peugeot, Alpine or Ferrari this weekend."]
      ] },
      { h:"LMGT3: TF Sport's Corvette vs Manthey's Porsche", items:[
        ["#21 Vista AF Corse (Ferrari 296 GT3 Evo)", "Fastest in LMGT3, 1:56.069."],
        ["#33 TF Sport (Chevrolet Corvette Z06 GT3.R)", "Leads the LMGT3 teams' standings by 18 points, 92 to 74, and classified 4th in FP3 behind two Iron Lynx Mercedes-AMGs."],
        ["#92 The Bend/Manthey (Porsche 911 GT3 R)", "18 points back, with Monza's maximum 26 still enough to take the title. This app could not confirm the #92's FP3 result from a source it could verify directly -- it recovered from Friday's FP1 drivetrain issue to run 9th in FP2, but neither its FP3 classification nor whether that issue recurred is confirmed; check race-weekend coverage."]
      ] },
      { h:"Up next", items:[
        ["Saturday afternoon: LMGT3 qualifying (2:20pm) and Hyperpole (2:40pm), Hypercar qualifying (3:00pm) and Hyperpole (3:20pm), local/CET", "Sets Sunday's grid -- the last data point before the championships are decided."],
        ["Sunday's race, 11:00am-5:00pm local (6 hours)", "The 2026 season finale, deciding both the Hypercar drivers' title between the two Toyota crews and the LMGT3 teams' title between TF Sport and Manthey."]
      ] }
    ],
    note:"Sources: fiawec.com's official FP3 results page (raceId=5066&sessionId=8287) and its article 'The Headlines from FP3 at Monza' (Nov 7, 2026) for the Hypercar classification, times/gaps, the #8's Ascari gravel excursion, the #51's brake-by-wire issue, the #83/#007 Parabolica contact and penalty, and the Saturday qualifying/Hyperpole schedule (fiawec.com's own race page); Sportscar365 ('Peugeot's Cassidy Tops Wet Monza FP3') for the same Hypercar result, read directly. LMGT3 top-6 (fastest car and #33's P4) from fiawec.com's FP3 headlines article and Sportscar365, both read directly; the #92's FP3 position is NOT independently confirmed -- a single secondary Italian-language source reported it 16th but could not be verified firsthand, so it is left out above. data/standings.js (from fiawec.com, read Oct 26, 2026) for the points gaps, unchanged since the prior entry for this event. Mike Conway's reported retirement from the #7 Toyota Friday-notebook reporting (Sportscar365), not independently re-confirmed today." },
  { t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-06", at:"2026-11-07T12:23:21Z",
    asOf:"Current after Saturday's Free Practice 2 and Qualifying 1 at the Qatar Grand Prix (Lusail, Nov 7): Marco Bezzecchi led an Aprilia sweep of the top four in FP2, and Pedro Acosta and Fermin Aldeguer both fought out of Q1 to join Fabio Di Giannantonio, Jorge Martin and Friday's other direct qualifiers in Q2.",
    groups:[
      { h:"What FP2 showed", items:[
        ["Marco Bezzecchi (Aprilia Racing)", "Fastest on 1:51.571, leading an Aprilia 1-2-3-4 with Raul Fernandez, Ai Ogura and Jorge Martin filling out the top four."],
        ["Jorge Martin (Aprilia Racing)", "Part of that Aprilia sweep in his second full day back since fracturing his right wrist at Phillip Island on Oct 25 -- a clear step up from Sepang, where the injury kept him out of the top 15."],
        ["Marc Marquez (Ducati Lenovo Team)", "Fifth, 0.427s off Bezzecchi's pace, after topping both of Friday's sessions -- FP2 doesn't set Sunday's grid on its own."]
      ] },
      { h:"Q1: who fought through to Q2", items:[
        ["Pedro Acosta (Red Bull KTM Factory Racing) and Fermin Aldeguer (BK8 Gresini Racing MotoGP)", "Both needed Q1 after missing the direct cut in Friday's combined practice (Acosta 14th, Aldeguer 11th), and both topped the session to take the two spots through to Q2, joining Fabio Di Giannantonio, Marquez, Martin and the rest of Friday's top ten."],
        ["The six who didn't make it", "This app could not confirm the final Q1 times or which of the other six riders in the session (reported to include Franco Morbidelli, Luca Marini and Augusto Fernandez/Lecuona) missed out on the last two Q2 spots -- check race-weekend coverage for the full list."],
        ["A smaller field", "Q1 ran with only 8 of the usual field after Yamaha withdrew its whole four-rider line-up from the race over the team's Middle East travel restrictions; the boycott was still in place after Saturday morning's sessions."]
      ] },
      { h:"The title fight, unchanged on points", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Still leads on 399, with Jorge Martin on 355 (44 points back) and Marco Bezzecchi third on 332 -- Saturday's practice and Q1 don't change the standings."],
        ["What it would take to clinch here", "Pre-weekend analysis (Crash.net, gpblog.com) put the bar for Marquez sealing the title at Lusail at roughly a 74-point championship lead after this race -- a swing Saturday's sessions can't produce on their own, so the fight carries on at least to the Sprint and Sunday's Grand Prix."]
      ] },
      { h:"Up next", items:[
        ["Qualifying 2 (grid-deciding) and the Sprint, 7:00pm local under the lights", "Q2 sets Sunday's grid order from Acosta, Aldeguer and the ten riders who went straight through from Friday; the Sprint hands out the weekend's first championship points."],
        ["Sunday's Grand Prix, 7:00pm local, also after dark", "The weekend's main event -- the only session left that could meaningfully move the title fight."]
      ] }
    ],
    note:"Sources: web search summaries of crash.net's 2026 Qatar MotoGP Saturday-practice results page and its live qualifying/sprint blog, and Cycle News's '2026 Qatar MotoGP News and Results' roundup, for the FP2 classification and gaps (the sites could not be reached directly from this environment, so these are as summarized by search results; one summary briefly conflated the FP2 and Q1 result pages, so the Q1 field/outcome above relies on the live-blog snapshots, which agreed across two independent sources -- crash.net and gpone.com -- that Acosta and Aldeguer topped Q1, though neither had posted a final, named Q1 classification at the time of writing). data/standings.js (automatic update from the MotoGP results service) for the championship points, unchanged since the prior entry. Title-clinch threshold from web search summaries of crash.net ('How Marc Marquez can win the 2026 MotoGP title at the Qatar Grand Prix') and gpblog.com, which gave the bar in slightly different terms (a ~74-75 point lead, or beating Martin by 30 and Bezzecchi by 8) but agreed Saturday's sessions don't settle it. Yamaha boycott background carried over from the prior entry for this event. Q2 had not been reported finished at the time of writing; check back after the Sprint." },
  { t:"monza", d:"2026-11-06", s:"wec", from:"2026-11-06", at:"2026-11-07T14:25:23Z",
    asOf:"Current after LMGT3 Qualifying and Hyperpole at Monza (Nov 7): Akkodis ASP's Lexus takes pole, TF Sport's title-contending Corvette lines up 2nd, and Manthey's title-contending Porsche missed the Hyperpole cut and starts 11th.",
    groups:[
      { h:"What Qualifying and Hyperpole set for Sunday's grid", items:[
        ["#78 Akkodis ASP Team (Lexus RC F LMGT3)", "Fastest in the 10-car Hyperpole shootout, 1:47.523, to take LMGT3 pole."],
        ["#33 TF Sport (Chevrolet Corvette Z06 GT3.R)", "Lines up 2nd, just 0.014s off pole -- a strong grid slot for the team leading the LMGT3 teams' title fight into the season finale."],
        ["#91 Manthey DK Engineering (Porsche 911 GT3 R)", "Made Hyperpole and starts 9th -- this is Manthey's other full-season car, not the one fighting for the title."],
        ["#92 The Bend/Manthey (Porsche 911 GT3 R)", "The title-contending Porsche missed the Hyperpole cut: 11th in Qualifying, just 0.078s shy of the top-10 cutoff. It will start Sunday's race from 11th, a much harder spot to out-score TF Sport from than it looked on Friday."],
        ["#21 Vista AF Corse (Ferrari 296 GT3 Evo)", "Set no lap time in a damp Qualifying session that was briefly stopped after the car was involved in an incident; it did not progress to Hyperpole and starts near the back of the LMGT3 field."]
      ] },
      { h:"The LMGT3 teams' title: TF Sport's grid spot vs Manthey's", items:[
        ["#33 TF Sport", "Leads the LMGT3 teams' standings by 18 points, 92 to 74, and now starts Sunday's season-finale race from 2nd -- about as good a platform as it could have hoped for."],
        ["#92 The Bend/Manthey", "18 points back, with Monza's maximum 26 points still enough to take the title on paper -- but starting 11th after missing Hyperpole makes that considerably harder than a straight points race from the front."]
      ] },
      { h:"Up next", items:[
        ["Saturday afternoon: Hypercar Qualifying (3:00pm) and Hyperpole (3:20pm), local/CET", "Sets the grid for the other title fight -- neither of the two Toyotas chasing the Hypercar drivers' crown has shown front-running pace in any session so far this weekend."],
        ["Sunday's race, 11:00am-5:00pm local (6 hours)", "The 2026 season finale, deciding both the Hypercar drivers' title between the two Toyota crews and the LMGT3 teams' title between TF Sport and Manthey."]
      ] }
    ],
    note:"Sources: fiawec.com's official session results pages for the Monza round (raceId=5066; sessionId=8288 for LMGT3 Qualifying, sessionId=8289 for LMGT3 Hyperpole), read directly, for the classifications, lap times and grid positions, including the #21 Ferrari's no-time result and 0 laps completed in Qualifying. The damp conditions and the session being briefly stopped for the #21 Ferrari's incident are as given by a web-search summary of a race report (the site itself could not be reached directly from this environment) and are not independently confirmed beyond that summary. data/standings.js (from fiawec.com, read Oct 26, 2026) for the points gap, unchanged since the prior entry for this event. Saturday's Hypercar qualifying/Hyperpole schedule from fiawec.com's own Monza race page." },
  { t:"monza", d:"2026-11-06", s:"wec", from:"2026-11-07", at:"2026-11-07T15:25:30Z",
    asOf:"Current after Hypercar Qualifying and Hyperpole at Monza (Nov 7): Antonio Fuoco takes a home pole for Ferrari's #50, and BOTH title-contending Toyotas miss the Hyperpole cut entirely -- they will start Sunday's season-finale race 15th and 16th of 17.",
    groups:[
      { h:"What Hypercar Qualifying and Hyperpole set for Sunday's grid", items:[
        ["#50 Ferrari AF Corse (Antonio Fuoco, Miguel Molina, Nicklas Nielsen)", "Fuoco topped Hyperpole on 1:33.364 for a home pole, Ferrari's third of the season and the #50 crew's first -- this car isn't in the drivers' title fight (6th in the standings), but the pole bonus point still counts for the constructors' table."],
        ["#19 Genesis Magma Racing (Mathieu Jaminet)", "2nd in Hyperpole, just 0.096s off pole."],
        ["#51 Ferrari AF Corse, #38 Cadillac Hertz Team JOTA, #94 Peugeot TotalEnergies, #36 Alpine Endurance Team, #12 Cadillac Hertz Team JOTA, #83 AF Corse, #93 Peugeot TotalEnergies, #20 BMW M Team WRT", "Filled out the rest of the 10-car Hyperpole order, 3rd through 10th, all within about 0.7s of Fuoco's pole time."],
        ["#8 Sebastien Buemi, Brendon Hartley, Ryo Hirakawa (Toyota)", "Missed the Hyperpole cut: 15th of 17 in Qualifying, 1.334s off the fastest time -- the drivers'-championship leader will start the title-deciding race from 15th on the grid."],
        ["#7 Kamui Kobayashi, Mike Conway, Nyck de Vries (Toyota)", "Missed Hyperpole too: 16th of 17, 1.665s off the pace -- one place behind their own title-rival team-mates in the #8."],
        ["Neither Toyota found pace all weekend", "Both cars were off the front in every session from Friday's FP1 through Saturday's Hyperpole; this is now confirmed as their worst qualifying result of the season, at the one race that decides the drivers' title."]
      ] },
      { h:"The drivers' title: both contenders start mid-pack", items:[
        ["#8 Buemi/Hartley/Hirakawa", "Still lead 114 to 97, a 17-point gap, with Monza's maximum 26 on offer -- but starting 15th in a 6-hour race is a much tougher place to manage the title from than the front row."],
        ["#7 Kobayashi/Conway/de Vries", "Needs to beat their team-mates by enough to close the 17-point gap; starting one spot further back (16th vs 15th) makes that even harder, though a 6-hour race still leaves plenty of time for the grid to shuffle."],
        ["The manufacturers' title is already decided", "Toyota clinched the 2026 World Manufacturers' Championship -- its eighth -- with a 1-2 finish at Barcelona in October; only the drivers' title is still open, and only these two Toyota crews can win it."]
      ] },
      { h:"LMGT3: grid unchanged from Saturday afternoon", items:[
        ["#78 Akkodis ASP Team (Lexus RC F LMGT3)", "LMGT3 pole, 1:47.523."],
        ["#33 TF Sport (Chevrolet Corvette Z06 GT3.R)", "2nd, 0.014s off -- leads the LMGT3 teams' title 92 to 74 and starts from a strong spot to defend it."],
        ["#92 The Bend/Manthey (Porsche 911 GT3 R)", "The title-contending Porsche missed Hyperpole and starts 11th, needing a big result from mid-pack to catch TF Sport."]
      ] },
      { h:"Up next", items:[
        ["Sunday's race, 11:00am-5:00pm local (6 hours), CET", "The 2026 season finale, deciding the Hypercar drivers' title between the two Toyota crews and the LMGT3 teams' title between TF Sport and Manthey."]
      ] }
    ],
    note:"Sources: fiawec.com's official results pages for the Monza round (raceId=5066, sessionId=8290 for Hypercar Qualifying and sessionId=8291 for Hyperpole), read directly, for the full classification, lap times and gaps, including both Toyotas' 15th/16th grid slots. Web-search summaries of motorsport.com ('WEC Monza: Antonio Fuoco takes pole for Ferrari') and an Italian-language report, neither reachable directly from this environment, for Fuoco's pole context (his and the #50's season firsts) and confirmation that both Toyotas missed Hyperpole. data/standings.js (from fiawec.com, read Oct 26, 2026) for the 114-97 points gap, unchanged since the prior entry. Toyota's manufacturers'-title clinch at Barcelona from a web-search summary of Toyota's own press release and Autosport/Motorsport Week reporting from October 2026, not previously noted in this app's watch entries for this event." },
  { t:"interlagos", d:"2026-11-06", s:"f1", from:"2026-11-07", at:"2026-11-07T16:22:16Z",
    asOf:"Current after FP3 at the São Paulo Grand Prix (Interlagos, Nov 7): Max Verstappen fastest from Kimi Antonelli and Lando Norris, rain arrived right at the end of the session, and a wave of grid penalties -- Verstappen and Hamilton to the back -- will scramble Sunday's grid order no matter what Saturday's qualifying decides.",
    groups:[
      { h:"What FP3 showed", items:[
        ["Max Verstappen (Red Bull Racing)", "Topped the session on 1:11.622, after running off at Turn 4 during a push for a quicker lap."],
        ["Kimi Antonelli (Mercedes)", "Second, 0.025s back, despite reporting a steering-wheel problem during the session."],
        ["Lando Norris (McLaren)", "Third, 0.131s off the pace."],
        ["George Russell (Mercedes)", "Fourth, 0.184s back."],
        ["Charles Leclerc (Ferrari)", "Fifth, 0.274s off."],
        ["Lewis Hamilton (Ferrari)", "Down in 12th after reporting strange engine vibrations and then smoke in the cockpit; his session ended 25 minutes early."],
        ["Weather cut the session short in effect", "Heavy rain arrived as FP3 ended, after a session most drivers spent waiting out the threat of a storm; qualifying simulations only began about 15 minutes before the chequered flag."]
      ] },
      { h:"Grid penalties scramble Sunday regardless of qualifying", items:[
        ["Max Verstappen (Red Bull Racing)", "Starts from the back of the grid after several power-unit changes -- Friday and Saturday practice pace won't translate into Sunday grid position."],
        ["Lewis Hamilton (Ferrari)", "A 10-place grid drop for an ICE change, on top of Saturday's mechanical trouble; more power-unit changes are possible."],
        ["Charles Leclerc (Ferrari)", "Also a 10-place drop for an ICE change."],
        ["George Russell (Mercedes)", "A five-place drop for an ICE change."]
      ] },
      { h:"The real fight here: second place", items:[
        ["Max Verstappen (Red Bull Racing)", "Leads the fight for runner-up on 261 points, 2 clear of Lewis Hamilton -- but starts Sunday from the back regardless of the points gap."],
        ["Lewis Hamilton (Ferrari)", "Third on 259, one place and 2 points off Verstappen, and also starts well back after his own penalty and FP3 mechanical issue."],
        ["George Russell (Mercedes)", "Fourth on 250, 9 points off the podium spot in the standings, and takes the smallest grid penalty of the four -- fourth-fastest in FP3 too."],
        ["Charles Leclerc (Ferrari)", "Fifth on 245, 5 further back, fastest Ferrari in FP3 but also facing a 10-place drop."],
        ["Lando Norris (McLaren)", "Sixth on 221, third-fastest all weekend and the only one of the top runners racing Sunday with no penalty at all."]
      ] },
      { h:"Up next", items:[
        ["Saturday's qualifying, 3:00-4:00pm local", "Sets the ON-TRACK order, but with Verstappen, Hamilton and Leclerc all dropping places for penalties, the grid that actually lines up Sunday will look very different from the qualifying result."],
        ["Sunday's race, 2:00-4:00pm local, 71 laps", "More rain is possible after Saturday's late shower -- Interlagos has a history of mixed-weather races reshuffling the order."]
      ] }
    ],
    note:"Sources: formula1.com ('FP3: Verstappen fastest from Antonelli and Norris ahead of Sao Paulo Grand Prix', read Nov 7, 2026) for the FP3 classification, gaps, grid penalties, mechanical issues and weather. data/standings.js (automatic update from api.jolpi.ca) for the post-Mexico City points, unchanged since the prior entry for this event. Session times from data/interlagos.js." }
  ,{ t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-07", at:"2026-11-07T17:22:52Z",
    asOf:"Current after Saturday evening's Sprint at the Qatar Grand Prix (Lusail, Nov 7): Marc Marquez won after pole-sitter Marco Bezzecchi crashed out of the lead battle with him, and Marquez can clinch the title in Sunday's Grand Prix.",
    groups:[
      { h:"The Sprint: Marquez wins as Bezzecchi crashes out of the lead", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Won the 10-lap Sprint after Bezzecchi, who started from pole, crashed out of the lead while the two were racing wheel-to-wheel; the stewards investigated the contact between them and handed down no penalty to either rider."],
        ["Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", "Second, 0.862s behind Marquez."],
        ["Jorge Martin (Aprilia Racing)", "Third, 1.519s back -- his first podium since fracturing his wrist at Phillip Island on Oct 25, and a big step up from missing Sepang entirely and Friday's low-15s pace here."],
        ["Marco Bezzecchi (Aprilia Racing)", "Crashed out of the lead fight with Marquez and did not score; this app could not confirm the rest of the Sprint's top 10 from sources checked today."]
      ] },
      { h:"The title fight: Marquez can clinch it Sunday", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Led the championship 399-355-332 over Martin and Bezzecchi heading into the Sprint (data/standings.js, not yet updated for tonight's points); multiple sources report he can now clinch the title in Sunday's Grand Prix if he wins it and Martin fails to score -- this app's own automatic MotoGP standings tool will carry the Sprint's points update."],
        ["Marco Bezzecchi (Aprilia Racing)", "Reported as now mathematically eliminated from the title race as a result of scoring nothing in the Sprint, with two further sprint-and-race weekends (Portugal, Valencia) left after this one."],
        ["Jorge Martin (Aprilia Racing)", "Needs Marquez to stumble and a big result of his own on Sunday to keep the fight alive past this weekend."]
      ] },
      { h:"Yamaha's boycott: unchanged", items:[
        ["Still out", "Yamaha's four riders (its factory bikes and Pramac's) remain withdrawn from the whole Qatar round over the team's Middle East travel restrictions; this app found no report of the situation changing since Saturday morning. Yamaha has said it expects to return at the next round, the Portuguese Grand Prix."],
        ["Possible sanctions", "MotoGP has reportedly threatened Yamaha and its riders with race bans for Portugal and Valencia over the boycott, but the FIM had made no official ruling as of this writing."]
      ] },
      { h:"Up next", items:[
        ["Sunday's Grand Prix, 7:00pm local, after dark", "The weekend's main event and Marquez's first chance to seal the title outright."]
      ] }
    ],
    note:"Sources: web search summaries of crash.net's Sprint race results and its 'Qatar Sprint Race: New 2026 MotoGP World Championship standings' coverage, Yahoo Sports ('MotoGP Qatar Grand Prix: Marc Marquez wins thrilling sprint as Jorge Martin fights to third'), racesport.nl, gp-inside.com and gpblog.com, all agreeing on Marquez's win, Di Giannantonio second (+0.862s) and Martin third (+1.519s), Bezzecchi's pole-to-crash exit from the lead battle with Marquez, the stewards' no-penalty decision, and that Marquez can clinch the title Sunday with a win plus Martin failing to score (none of these sites could be reached directly from this environment, so this is as summarized by search results). Bezzecchi's mathematical elimination reported by the same Yahoo Sports summary; not independently re-derived here. data/standings.js (automatic update from the MotoGP results service) for the pre-Sprint championship points (399-355-332), which the automatic tool will update separately with tonight's result -- this entry does not compute or restate new point totals itself. Yamaha boycott status and its return-at-Portugal statement, and the reported threat of race bans for Portugal/Valencia, from web search summaries of autosport.com's and crash.net's reporting from Nov 1-2, 2026, carried over and re-confirmed as still the latest available as of this writing; no Sunday-specific update was found. The full Sprint top 10 beyond the podium was not confirmed in sources checked and is left out rather than guessed." }
  ,{ t:"homestead-miami", d:"2026-11-06", s:"oreilly", from:"2026-11-07", at:"2026-11-07T20:23:12Z",
    asOf:"Current after Saturday's qualifying for the O'Reilly Series championship race at Homestead-Miami (Nov 7): Sheldon Creed takes the pole in his final start with Haas Factory Team, with title contenders Carson Kvapil and Jesse Love alongside him on the first two rows; the championship standings are unchanged -- only this afternoon's race itself can move them.",
    groups:[
      { h:"Qualifying: Creed takes the pole, three of the five contenders start up front", items:[
        ["Sheldon Creed", "Won the pole at 33.578 seconds (160.820 mph) -- the last O'Reilly Series pole of 2026, in his final start with Haas Factory Team, and the last mathematically-alive long shot in the title fight (42 points back) gets the best possible platform to try to close that gap."],
        ["Austin Hill", "Second, 33.617 seconds (160.633 mph), alongside Creed on the front row; Hill is not a title contender."],
        ["Carson Kvapil", "Third -- the Martinsville race winner starts well up, 31 points back in the standings."],
        ["Jesse Love", "Fourth -- the closest championship challenger to points leader Justin Allgaier starts from the second row."],
        ["Brent Crews and Parker Retzlaff", "Fifth and sixth; neither is in the title fight."],
        ["Corey Day", "Seventh -- the third-placed contender in the standings, 23 points back, starts mid-pack rather than up front."],
        ["Justin Allgaier", "The points leader's starting position was not found in sources checked today; his grid spot for the race that decides the title is unconfirmed here."]
      ] },
      { h:"The championship, decided this afternoon", items:[
        ["Justin Allgaier (JR Motorsports)", "Leads on 2,436 points after Martinsville, unchanged since Friday -- qualifying doesn't score points."],
        ["Jesse Love (Richard Childress Racing)", "Second, 22 points back, and starts fourth -- one of the best grid spots among the four chasers."],
        ["Corey Day (Hendrick Motorsports)", "Third, 23 points back, starting seventh."],
        ["Carson Kvapil (JR Motorsports)", "Fourth, 31 points back, starting third -- the best grid spot of any contender besides Creed."],
        ["Sheldon Creed", "Fifth and the last driver mathematically alive, 42 points back -- but starts from the pole."],
        ["No elimination this year", "NASCAR replaced its old elimination playoff with The Chase for 2026: the champion is simply whoever leads points after this race, so these five are the only drivers who can still win the title."]
      ] },
      { h:"Up next", items:[
        ["The race, 5 PM ET, 200 laps", "The season's 33rd and final points-paying O'Reilly Series race of 2026, run on Homestead's abrasive, multi-groove 1.5-mile oval -- whoever leads points when it ends is champion."]
      ] }
    ],
    note:"Sources: web search summaries of Speedway Media ('Sheldon Creed scores final O'Reilly pole of 2026 at Homestead'), Athlon Sports, Speedway Digest and Yahoo Sports' official-starting-lineup reports for Homestead-Miami, all agreeing on Creed's pole time/speed, Hill's second-place time/speed, and the Kvapil-Love-Crews-Retzlaff-Day order from third through seventh; none of these sites could be reached directly from this environment, so this is as summarized by search results. Allgaier's starting position was not found in any source checked and is left out rather than guessed. This app's own prior data/watch.js entry (written after Friday's practice) for the unchanged points standings (Allgaier 2,436; Love 2,414; Day 2,413; Kvapil 2,405; Creed 2,394), not independently re-confirmed today since qualifying does not score points. Session time from data/homestead-miami.js." }
  ,{ t:"interlagos", d:"2026-11-06", s:"f1", from:"2026-11-07", at:"2026-11-07T21:22:57Z",
    asOf:"Current after qualifying for the São Paulo Grand Prix (Interlagos, Nov 7): Lando Norris took a rain-chaos pole, his third in a row at this circuit, but grid penalties drop Russell, Leclerc, Hamilton, Verstappen and Perez well back for Sunday's race.",
    groups:[
      { h:"Qualifying: Norris on pole in the wet", items:[
        ["Lando Norris (McLaren)", "Pole with a 1:27.470 set late in a rain-delayed, twice red-flagged Q3 -- his third straight pole at Interlagos."],
        ["George Russell (Mercedes)", "Second on the road, 0.204s back, but a five-place grid penalty drops him to 7th for Sunday."],
        ["Kimi Antonelli (Mercedes)", "Third on the road and keeps that grid slot -- no penalty against his name, so he starts Sunday from 2nd."],
        ["A session interrupted twice", "Rain arrived before Q1 and forced a red flag just under three minutes in, restarting on full wets after a long delay; Franco Colapinto and Pierre Gasly crossed the line together and were eliminated alongside Lance Stroll, Valtteri Bottas and Gabriel Bortoleto (who hit the wall). In Q2, Rafael Camara crashed into the barrier with under a minute left for a second red flag, and Arvid Lindblad was told to stop his car."]
      ] },
      { h:"Grid penalties rewrite Sunday's order", items:[
        ["George Russell (Mercedes)", "Qualified 2nd, starts 7th after a five-place penalty."],
        ["Charles Leclerc (Ferrari)", "Qualified 4th, starts 14th after a ten-place penalty."],
        ["Lewis Hamilton (Ferrari) and Max Verstappen (Red Bull Racing)", "Both go to the back of the grid for power-unit changes -- Hamilton didn't set a time in Q2, and Verstappen didn't take part in Q2 at all."],
        ["Sergio Pérez (Cadillac)", "Also goes to the back for a grid penalty, after being eliminated in Q1."],
        ["Kimi Antonelli (Mercedes)", "The only front-row starter with no penalty of any kind -- lines up 2nd behind Norris."]
      ] },
      { h:"The fight for second in the standings", items:[
        ["Max Verstappen (Red Bull Racing)", "Leads the fight for runner-up on 261 points, 2 clear of Hamilton, but starts Sunday from the back of the grid after a power-unit change -- the gap in the standings won't show on track at the start."],
        ["Lewis Hamilton (Ferrari)", "Third on 259, also starts from the back after his own power-unit change and a Q2 that never produced a lap time."],
        ["George Russell (Mercedes)", "Fourth on 250, qualified a strong 2nd but a five-place penalty leaves him 7th on the grid -- the smallest demotion of the group chasing second."],
        ["Charles Leclerc (Ferrari)", "Fifth on 245, qualified 4th but a ten-place penalty drops him to 14th."],
        ["Lando Norris (McLaren)", "Sixth on 221 and the only frontrunner with no penalty at all -- starts Sunday from pole, well clear of this fight but with a clean run at everyone in it."]
      ] },
      { h:"Up next", items:[
        ["Sunday's race, 2:00-4:00pm local, 71 laps", "More rain is possible after a soaked qualifying -- Interlagos has a history of mixed-weather races reshuffling the order, and with Verstappen, Hamilton, Leclerc, Russell and Pérez all starting out of position, overtaking through the field could decide who finishes best among the runner-up contenders."]
      ] }
    ],
    note:"Sources: formula1.com ('Norris beats Russell to pole position in dramatic rain-affected Sao Paolo qualifying', read Nov 7, 2026) for the qualifying times and gaps, the red flags and incidents in Q1/Q2, and the grid-penalty order (Russell -5, Leclerc -10, Hamilton/Verstappen/Pérez to the back); data/standings.js for the pre-weekend drivers' points (261-259-250-245-221), unchanged since Mexico City as qualifying does not score points. Session times from data/interlagos.js." }
  ,{ t:"homestead-miami", d:"2026-11-06", s:"nascar", from:"2026-11-07", at:"2026-11-07T21:22:57Z",
    asOf:"Current after Saturday's qualifying for the Cup Series championship race at Homestead-Miami (Nov 7): Chase Briscoe takes the final Cup pole of 2026, with points leader Kyle Larson starting 4th and the three drivers still chasing him -- Bell, Hamlin and Briscoe himself -- all up front; the championship standings are unchanged -- only Sunday's race can move them.",
    groups:[
      { h:"Qualifying: Briscoe takes the season's final Cup pole", items:[
        ["Chase Briscoe (Joe Gibbs Racing)", "Pole in single-car qualifying at 32.396 seconds (166.687 mph) -- the last Cup pole of 2026."],
        ["Denny Hamlin (Joe Gibbs Racing)", "Briscoe's teammate, second by just 0.017s."],
        ["Tyler Reddick", "Third."],
        ["Kyle Larson (Hendrick Motorsports)", "Fourth -- the championship leader qualifies well up front, though a strong grid spot matters less than usual with 267 laps to come."],
        ["Austin Cindric", "Fifth."],
        ["Christopher Bell", "Sixth."],
        ["Chase Elliott", "Seventh."]
      ] },
      { h:"The championship heading into Sunday", items:[
        ["Kyle Larson (Hendrick Motorsports)", "Leads by 67 points over Christopher Bell and 70 over Denny Hamlin, with Chase Briscoe fourth, 84 back -- unchanged from Friday, since qualifying doesn't score points."],
        ["Christopher Bell, Denny Hamlin and Chase Briscoe", "The only three who can still catch Larson, and all three start Sunday ahead of him on the grid (6th, 2nd and 1st against Larson's 4th) -- though grid position counts for little over a 400-mile race."],
        ["No elimination format", "NASCAR's 2026 Chase is decided purely on points: whoever leads after Sunday's race is champion, so these four are the only drivers who can still win it."]
      ] },
      { h:"Up next", items:[
        ["Sunday's championship race, 267 laps / 400.5 miles, green flag around 2:13pm ET (NBC, HBO Max, MRN Radio, SiriusXM NASCAR Radio)", "The 36th and final points race of 2026 decides the title on Homestead's abrasive, multi-groove 1.5-mile oval."]
      ] }
    ],
    note:"Sources: web search summaries of Racer.com's and Yahoo Sports' reporting on Saturday's Cup qualifying at Homestead-Miami (Briscoe's pole time/speed and 0.017s margin over Hamlin, the Reddick-Larson-Cindric-Bell-Elliott order, the single-car qualifying format, the race's lap/mile count and green-flag time); none of these sites could be reached directly from this environment, so this is as summarized by search results. This app's own prior data/watch.js entry (written after Friday's practice) for the unchanged Chase standings (Larson's 67/70/84-point gaps), not independently re-confirmed today since qualifying does not score points." }
  ,{ t:"lusail", d:"2026-11-06", s:"motogp", from:"2026-11-07", at:"2026-11-08T12:23:42Z",
    asOf:"Current after Sunday morning's Warm-Up at the Qatar Grand Prix (Lusail, Nov 8): Fabio Di Giannantonio tops the session from pole-sitter Marco Bezzecchi, with Marc Marquez fifth -- and Marquez can clinch the title outright tonight with a Grand Prix win if Jorge Martin fails to score.",
    groups:[
      { h:"Warm-up: Di Giannantonio fastest, Marquez fifth", items:[
        ["Fabio Di Giannantonio (Pertamina Enduro VR46 Racing Team)", "Fastest on 1:52.281, on the soft rear tyre -- most of the field ran the medium rear instead, the tyre expected for tonight's 22-lap race."],
        ["Marco Bezzecchi (Aprilia Racing)", "Second, 0.505s back; still starts tonight's race from pole after Saturday's Qualifying 2, unaffected by his Sprint crash."],
        ["Enea Bastianini (Red Bull KTM Tech3)", "Third, 0.523s off."],
        ["Pedro Acosta (Red Bull KTM Factory Racing)", "Fourth, 0.578s back."],
        ["Marc Marquez (Ducati Lenovo Team)", "Fifth, 0.614s off, after a late start to the session -- title rival Jorge Martin also sat out the opening minutes."]
      ] },
      { h:"The title fight: what Marquez needs tonight", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads 411-362 over Jorge Martin after Saturday's Sprint win (a 49-point gap); multiple sources (grandepremio.com, crash.net, via web search) report he can clinch his eighth premier-class title outright in tonight's Grand Prix if he wins it and Martin fails to score -- that leaves Martin's maximum possible gain (25, for a Martin win) exactly matching the current gap, but Marquez is reported to hold the head-to-head countback (most race wins) that settles a tie in his favour. Any other result for Marquez keeps the title fight alive into the next round."],
        ["Jorge Martin (Aprilia Racing)", "Needs Marquez to finish off the podium to keep the fight alive past this weekend; took his first podium since fracturing his wrist at Phillip Island in Saturday's Sprint, third after a last-lap pass, having started 11th on the original grid before a red-flag restart."],
        ["Marco Bezzecchi (Aprilia Racing)", "Crashed out of Saturday's Sprint while battling Marquez for the lead (stewards called it a racing incident, no penalty) and scored nothing; sources disagree on whether that leaves him mathematically eliminated already, but a Marquez win tonight would put the title beyond his reach either way. Still starts from pole after qualifying."]
      ] },
      { h:"Yamaha's boycott: unchanged", items:[
        ["Still out", "Yamaha's four riders remain withdrawn from the whole Qatar round over the team's Middle East travel restrictions; this app found no report of a change since Saturday. Yamaha has said it expects to return at the Portuguese Grand Prix; MotoGP has reportedly threatened race bans for Portugal and Valencia over the boycott, with no official FIM ruling yet."]
      ] },
      { h:"Up next", items:[
        ["Tonight's Grand Prix, 7:00pm local / 4:00pm GMT, after dark, 22 laps", "Marquez's first chance to seal the title outright -- he needs the win, with Martin scoring nothing, to do it tonight."]
      ] }
    ],
    note:"Sources: web search summaries of crash.net's 2026 Qatar MotoGP Lusail Warm-up Results and motosan.es's Spanish-language warm-up report, agreeing on Di Giannantonio's fastest time, the top-five order and gaps, the tyre choices, and Marquez's and Martin's late starts (neither site reachable directly from this environment). Web search summaries of grandepremio.com ('Marc Marquez wins Qatar MotoGP sprint as Martin's last-lap loss sets up title shot' and its companion post-Sprint standings piece) and crash.net ('Marc Marquez wins dramatic Qatar MotoGP sprint after Marco Bezzecchi clash'), both read via search summary, for the Sprint result (Marquez 1st, Martin 3rd after a red-flag restart, Bezzecchi crashed from the lead battle with Marquez, no penalty issued), the resulting 411-362-332 standings, and tonight's exact clinch scenario (win plus Martin scoring zero, resolved in Marquez's favour by the race-wins countback); sources disagreed on whether Bezzecchi is already mathematically out, so that is left uncertain above. data/standings.js for the post-Sprint points (411-362-332), matching the same search summaries. Yamaha boycott status and the Portugal/Valencia ban threat carried over from the prior entry for this event, re-checked and no newer report found. Race start time and lap count from data/lusail.js and the same search summaries." }
  ,{ t:"las-vegas", d:"2026-11-19", s:"f1", at:"2026-11-12T00:25:45Z",
    asOf:"Current after the Brazilian Grand Prix (Nov 8, 2026): Kimi Antonelli already clinched the title at Mexico City three rounds early, and Mercedes sealed the constructors' championship in Brazil -- so Las Vegas is about who finishes where behind the champions.",
    groups:[
      { h:"The title's done -- Antonelli is champion", items:[
        ["Kimi Antonelli (Mercedes)", "Clinched the 2026 Drivers' title at the Mexico City Grand Prix (Nov 1) with a third-place finish, at 20 years and 68 days old becoming F1's youngest-ever world champion and the first Italian champion since Alberto Ascari in 1953. He leads on 390 points with three rounds (Las Vegas, Qatar, Abu Dhabi) left to run -- nothing left for him to decide."],
        ["Mercedes", "Clinched the Constructors' title at the Brazilian Grand Prix -- the team's ninth overall (level with Williams) and first since 2021."]
      ] },
      { h:"What's still live: the fight for second (and third, and fourth...)", items:[
        ["Max Verstappen (Red Bull Racing)", "Second on 279 points after Brazil -- not a title fight, but the best fight left on the grid this weekend."],
        ["George Russell (Mercedes)", "Third on 262, having moved up with a fourth-place finish at Interlagos."],
        ["Lewis Hamilton (Ferrari)", "Fourth on 261, just 1 point behind Russell -- the tightest gap anywhere in the top six."],
        ["Charles Leclerc (Ferrari)", "Fifth on 251, 10 back of his teammate Hamilton -- Ferrari's two drivers are fighting each other as much as Red Bull and Mercedes for the minor places."],
        ["Lando Norris (McLaren)", "Sixth on 246 but arrives in the best form of anyone in this group -- his Interlagos win was McLaren's most recent, after a season that's had more penalties and bad luck than pace problems."]
      ] },
      { h:"Constructors: Ferrari's grip on second isn't bulletproof", items:[
        ["Ferrari", "512 points, a safe-looking second, 97 clear of Red Bull with three rounds (and six cars' worth of points, two per team per round) left to hand out."],
        ["Red Bull Racing", "415 points, mathematically still able to close a 97-point gap in three rounds, but only with a near-maximum run and Ferrari stumbling -- a long shot rather than a live fight."],
        ["McLaren", "398 points, fourth, with its own slim mathematical path back into the picture if results break its way -- more plausible as spoiler than contender."]
      ] },
      { h:"The Strip circuit: cold tyres, long straights, a track that bites back", items:[
        ["Why it's tricky despite the straights", "17 turns and 6.201 km with some of the longest straights on the calendar past the Bellagio, Caesars Palace and the Venetian -- but a night race run in cold desert air starves the tyres of the heat that normally keeps them gripping, leading to the understeer-then-snap-oversteer balance drivers have complained about since the track's 2023 debut."],
        ["Qualifying matters more than the straights suggest", "Tyre preparation here is a known technical challenge with almost no representative running before the event; teams that get the tyres switched on through one lap in qualifying have tended to convert that into a clean getaway on race night, since cold restarts and traffic in the braking zones make overtaking harder than the long straights imply."],
        ["Lap record", "1:33.365, set by Max Verstappen in 2025 -- Red Bull and McLaren have been the fastest cars here in the track's three runnings so far."]
      ] },
      { h:"Up next (all times Las Vegas local, PST)", items:[
        ["Practice 1, Thursday Nov 19, 4:30pm", "First look at the Strip circuit for 2026 -- cold-tyre behaviour is usually the first storyline of the weekend."],
        ["Practice 2, Thursday Nov 19, 8:00pm", "Run under the same lights and temperatures as qualifying and the race -- the session teams actually trust."],
        ["Practice 3, Friday Nov 20, 4:30pm", "Final tuning before qualifying."],
        ["Qualifying, Friday Nov 20, 8:00pm", "Pole matters here -- clean air and a tow down the long straights are both hard to find once the pack bunches up."],
        ["Race, Saturday Nov 21, 8:00pm, 50 laps / 309.958 km", "The championship's settled, but the runner-up fight (Verstappen vs. Russell vs. Hamilton vs. Leclerc) and the constructors' battle for second (Ferrari vs. Red Bull) are both still genuinely in play."]
      ] }
    ],
    note:"Sources: formula1.com's Mexico City Lowdown ('All the key moments as Antonelli secures maiden title...') and racer.com ('Verstappen holds off Hamilton for Mexico win as Antonelli clinches title') for the Mexico City clinch, Antonelli's age/record and finishing position, confirmed by web search summaries agreeing across thescore.com, Al Jazeera and multiple other outlets; gpblog.com's and qatar-tribune.com's post-Brazil coverage for Mercedes' constructors' title in Brazil (ninth title, level with Williams, first since 2021) and the race result (Norris won, Russell 4th, Antonelli 5th); data/standings.js (automatic update from api.jolpi.ca) for the exact point totals (Antonelli 390, Verstappen 279, Russell 262, Hamilton 261, Leclerc 251, Norris 246; Ferrari 512, Red Bull 415, McLaren 398). formula1.com's official 2026 Las Vegas race page (via web search summary) for the circuit length (6.201 km), turn count (17), race distance/lap count (309.958 km / 50 laps) and Verstappen's 1:33.365 lap record. autosport.com and motorsportmagazine.com, via web search summary (neither reachable directly from this environment), for the cold-track/tyre-preparation challenge at this circuit, cross-checked against each other. Session times from data/las-vegas.js, converted to Las Vegas local time (PST, UTC-8)." }
  ,{ t:"las-vegas", d:"2026-11-19", s:"f1academy", at:"2026-11-12T00:25:45Z",
    asOf:"Current after Austin (Oct 23-25), going into the season finale: Alisha Palmowski has already clinched the 2026 title, but the fight for 2nd is still live between Nina Gademan and Emma Felbermayr.",
    groups:[
      { h:"The title: settled; 2nd place isn't", items:[
        ["Alisha Palmowski (Campos Racing)", "Already the 2026 champion -- she clinched it at Austin with races still to run, so the title itself is decided before this finale even starts."],
        ["Nina Gademan (MP Motorsport)", "Moved up to 2nd by winning Austin's Feature Race, her second win of the season, and carries a 6-point edge (119 to 113) into the last two races of the year."],
        ["Emma Felbermayr", "Third on 113, 6 points back of Gademan with only the Reverse Grid Race and Feature Race left to close the gap."]
      ] },
      { h:"Las Vegas storyline: a wild-card debut", items:[
        ["Luna Fluxa Cross", "The 16-year-old Spanish driver and Mercedes-AMG F1 Junior Programme member makes her F1 Academy debut as this round's Wild Card, driving the #10 Visit Las Vegas car run by Hitech -- she was the first female driver to join Mercedes' junior programme, back in 2022."]
      ] },
      { h:"Up next (all times Las Vegas local, PST)", items:[
        ["Practice, Thursday Nov 19, 6:00pm", "The only practice session of the weekend, on the Las Vegas Strip Circuit at night."],
        ["Qualifying, Thursday Nov 19, 9:30pm", "Sets the grid for Friday's Reverse Grid Race."],
        ["Reverse Grid Race, Friday Nov 20, 6:15pm", "Grid set by reversing qualifying's order; sets the grid for Saturday's Feature Race."],
        ["Feature Race, Saturday Nov 21, 4:20pm", "The season's last race, and the only one that can still move the 2nd-place fight between Gademan and Felbermayr."]
      ] }
    ],
    note:"Sources: web search summaries of formula1.com ('F1 ACADEMY: Palmowski crowned 2026 champion as Larsen takes maiden victory in Austin' and 'F1 ACADEMY: Gademan seizes second victory of the season with assured Austin drive') for Palmowski's title clinch and Gademan's Austin Feature Race win moving her ahead of Felbermayr; data/standings.js for the post-Austin points (Palmowski 172 champion, Gademan 119, Felbermayr 113). formula1.com ('Mercedes junior Luna Fluxa Cross to make F1 ACADEMY debut as Las Vegas Wild Card') for the Wild Card entry, her car number/team and junior-programme background. Session times from data/las-vegas.js, converted to Las Vegas local time (PST, UTC-8)." }
  ,{ t:"portimao", d:"2026-11-20", s:"motogp", at:"2026-11-12T00:25:45Z",
    asOf:"Current after the Grand Prix of Qatar (Lusail, Nov 8): Marco Bezzecchi won from start to finish to delay Marc Marquez's title party, but Marquez still leads by 60 points with two rounds left and can clinch the championship this weekend at Portimão.",
    groups:[
      { h:"Qatar, in brief: Bezzecchi denies the title (for now)", items:[
        ["Marco Bezzecchi (Aprilia Racing)", "Led the Qatar Grand Prix from start to finish for the win, after Marquez had already beaten him in Saturday's Sprint."],
        ["Marc Marquez (Ducati Lenovo Team)", "Second, 3.083s behind Bezzecchi -- enough to keep the title alive into Portugal rather than seal it in Qatar."],
        ["Raul Fernandez and Ai Ogura (Trackhouse)", "Third and fourth."],
        ["Jorge Martin (Aprilia Racing)", "Seventh, scoring 9 points just two weeks after fracturing his wrist at Phillip Island (Oct 25) -- his title hopes depend on results like this continuing while Marquez has any kind of off weekend."]
      ] },
      { h:"The title fight heading into Portimão", items:[
        ["Marc Marquez (Ducati Lenovo Team)", "Leads on 431 points, 60 clear of Martin and 74 clear of Bezzecchi, with two rounds (Portimão, then Valencia) left to run."],
        ["Jorge Martin (Aprilia Racing)", "Second on 371. Reports agree that a Marquez Sprint win on Saturday, even if Martin finishes second behind him, would clinch the title outright, regardless of Sunday's race or Valencia -- Martin's maximum possible points left after that would no longer be enough to close the gap."],
        ["Marco Bezzecchi (Aprilia Racing)", "Third on 357, 74 points back with 74 still available across the two remaining rounds -- mathematically alive but needing Marquez to have a very bad weekend here and at Valencia."]
      ] },
      { h:"Yamaha's Qatar boycott: still unresolved heading into Portugal", items:[
        ["Yamaha (factory and Pramac riders)", "Skipped the entire Qatar round over the team's Middle East travel-safety assessment, after a letter opposing the race signed by 19 riders; Yamaha said it expects to return to competition at this Portuguese round."],
        ["Possible sanctions", "MotoGP/the FIM were reported to be considering race bans for Yamaha riders at Portugal and Valencia over the boycott, but no official FIM ruling had been announced as of the most recent reports checked -- whether Yamaha's riders are actually on track this weekend was not confirmed in sources checked today."]
      ] },
      { h:"Sessions this weekend (Algarve International Circuit, Portimão -- local time, WET)", items:[
        ["Friday Nov 20", "Free Practice 1, 10:45am; Practice, 3:00pm."],
        ["Saturday Nov 21", "Free Practice 2, 10:10am; Qualifying 1, 10:50am; Qualifying 2, 11:15am; the Sprint, 3:00pm -- Marquez's first chance to clinch outright."],
        ["Sunday Nov 22", "Warm-Up, 9:40am; the Grand Prix, 1:00pm."]
      ] }
    ],
    note:"Sources: web search summaries of crash.net ('Marc Marquez denied MotoGP title in Qatar as Marco Bezzecchi wins race'), The Race ('Bezzecchi dominates but Marquez on brink of title'), GPBlog ('MotoGP Full Race Results | Marquez title delayed by Bezzecchi' and 'Marc Marquez MotoGP title scenarios: How he can clinch in Portugal') for the Qatar race result, gaps and Martin's wrist-injury context (none reachable directly from this environment, so this is as summarized by search results). data/results.js and data/standings.js (both already updated by this app's automatic MotoGP tools) for the race order and the 431/371/357 points; the Sprint-win clinch scenario checked against those point totals directly (60-point gap plus a 12-point Sprint win swing exceeds the 62 points still available afterward even if Martin finishes second in that Sprint). Yamaha boycott and threatened-ban status from web search summaries of crash.net's reporting on the Qatar boycott and the FIM's response; no newer ruling was found in sources checked today (Nov 12), so this weekend's Yamaha entry status is left unconfirmed. Session times from data/portimao.js." }
];
