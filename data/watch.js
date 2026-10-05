/* Cars and drivers to watch: one entry per series per race weekend, written after that series' last race so it is accurate.
   t = track id, d = first day of the event, s = series id (matches SERIES in series.js; the Race Day hub shows the entry for
   whichever series is on track), asOf = what it is current as of, groups = [{h: class, items: [[car or driver, why]]}].
   from (optional) = the first day an entry shows. To update a series mid-weekend, add a NEW entry with the same t, d and s and a
   later from (for example after qualifying): the newest entry whose from has arrived replaces the older one. Old entries stay as history.
   Facts are only what published race reports and standings said. Refresh this before each weekend. */
const WATCH = [
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
    note:"Sources: GT World Challenge America's own standings pages (Pro/Pro-Am/Am Teams, checked directly, Oct 5), its Barber race recap (\"AF Corse USA Takes Second Pro Win of Season as Archangel Motorsports Breaks Through at Barber in Pro-Am\"), and Sportscar365's entry-list report (\"29 Entries on Provisional Indy 8H Entry List\"), via web search. Three-time defending Indy 8 Hour champion Team WRT is sitting this one out after BMW reduced factory support for the final IGTC rounds. Driver-to-team pairings are as those sources gave them; the two different car numbers earlier Barber entries used for JMF Motorsports' Pro car weren't consistent between reports, so no car number is given here for any team." }
];
