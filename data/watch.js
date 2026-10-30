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
    note:"Sources: this app's own data/standings.js (2026 MotoGP riders' standings) for the championship points and data/sepang.js for the weekend's schedule; crash.net's 'Sepang MotoGP LIVE: Friday Practice updates' live blog and its '2026 Malaysian MotoGP, Sepang - Friday Practice Results' results page, gpblog.com's practice results page, mcnews.com.au's FP1 report and motorsport-total.com's practice report, all read via web search (the sites could not be reached directly from this environment). Marquez's afternoon Practice time and the Marquez-Marquez 0.109s gap are corroborated by two independent reports; the order from 3rd through 10th in Practice is NOT reported consistently between crash.net and gpblog.com and is left out rather than guessed. Check back after Saturday's FP2, qualifying and Sprint." }
];
