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
    note:"Sources: Porsche Motorsport North America and Sportscar365 race reports from Indianapolis. Four races remain: two at Road Atlanta and two at Circuit of the Americas." }
];
