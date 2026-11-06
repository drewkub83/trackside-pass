/* Series guide: what each racing series is and how to tell its cars apart.
   Sessions find their series by name (see `match`). Written for spectators at class level, not car numbers,
   so it stays true all season. WeatherTech class colors are IMSA's official ones; other class colors are our own.
   Sources: IMSA 2026 entry lists and class rules, IMSA/Porsche/Lamborghini series announcements.
   yt (optional): the YouTube channel ID (not handle) that streams this series live and free, so the Race Day
   hub's "Watch live" card can embed https://www.youtube.com/embed/live_stream?channel=<yt> -- that URL always
   shows whatever's actually live on the channel right now, so it needs no per-event upkeep, but ONLY add it
   for a series confirmed to stream complete, free, live coverage of its own races on that exact channel (not
   just highlights or an unrelated channel from the same org). IMSA's own WeatherTech Championship is NOT
   included here on purpose -- it's a Peacock/NBC broadcast, free on YouTube only for occasional select races.
   SRO America's own site (tcamerica.us, "How to watch") says every qualifying session and race of GT World Challenge America, GT America, GT4 America,
   TC America, Toyota GR Cup and McLaren Trophy is streamed live and free on the GTWorld YouTube channel, so those all share one channel id.
   autoResults (optional): this series' race results are imported by the automatic GitHub job (tools/auto_update.py and the
   F1/IndyCar/GTWCA readers) within the hour; every other series' results are written from published race reports by the hourly
   cloud routine (tools/due_updates.js lists them as "results" items), so the hub says so and links to the live timing meanwhile.
   noWatch (optional): a guide-only series (support or vintage): tools/due_updates.js ignores it, so no What to watch preview or results item is ever requested for it.
   timing (optional): the official live timing & scoring page for the sanctioning body that runs this series'
   races, so the Race Day hub's "Live timing" card can link straight out to it while this series is on track.
   It's a link-out, not an embed -- these sites run their own scripts and most refuse to load inside an iframe,
   and each one is already built mobile-first, so opening it in the phone's browser is both the only reliable
   option and the better one. One URL often covers several series here because they share one sanctioning
   body's timing system: IMSA's own scoring.page (imsa.com/scoring) covers every IMSA-sanctioned series
   (WeatherTech, Pilot Challenge, VP Racing, and the support series that race at IMSA weekends -- MX-5 Cup,
   Porsche Carrera Cup, Lamborghini Super Trofeo); SRO Motorsports' GT World Challenge America site covers
   every SRO America series the same way (GT World Challenge America itself, GT4 America, TC America, Toyota
   GR Cup North America, GT America) since they share one event and one timing feed. Checked directly, Oct 5. */
const SERIES = [
  {
    id:"weathertech", gameManual:true, match:/WeatherTech Championship|Petit Le Mans|Rolex 24|Twelve Hours/i, timing:"https://www.imsa.com/scoring/",
    name:"IMSA WeatherTech SportsCar Championship", tag:"4 classes on track at once",
    blurb:"IMSA's top series and the headline act. Four classes of cars race together on the same track at the same time, so faster cars are always lapping slower ones. Each class has its own winner, so pick a class to follow instead of only watching who is first overall.",
    cars:[
      {n:"GTP", full:"Grand Touring Prototype", type:"Hybrid prototypes", c:"#FFFFFF", fg:"#1B1D21", pace:"Fastest",
       text:"The top class. Purpose-built prototypes with a hybrid system, closed cockpit and lots of aerodynamics. 2026 brings Acura, BMW, Cadillac, Porsche and Aston Martin. Combined power is capped at roughly 700 hp.",
       spot:"Sleek, low and wide with complicated bodywork. White number panels."},
      {n:"LMP2", full:"Le Mans Prototype 2", type:"Prototypes", c:"#2F62C9", fg:"#FFFFFF", pace:"Very fast",
       text:"Closed-cockpit prototypes from approved constructors. The same cars race at Le Mans and in the World Endurance Championship. No hybrid: they run on V8 power.",
       spot:"Prototype shape like GTP but plainer. Blue number panels."},
      {n:"GTD PRO", full:"GT Daytona Pro", type:"GT3 race cars", c:"#C93A3A", fg:"#FFFFFF", pace:"Fast",
       text:"Race versions of supercars built to FIA GT3 rules, roughly 500 to 600 hp. Many are factory-backed, with all-professional driver lineups. Think Corvette, Mustang, Ferrari, Porsche 911, Lamborghini, McLaren and Mercedes-AMG.",
       spot:"Looks like a road car with a big wing. Red number panels and red windshield edges."},
      {n:"GTD", full:"GT Daytona", type:"GT3 race cars", c:"#2E9A5B", fg:"#FFFFFF", pace:"Fast (same cars as GTD PRO)",
       text:"The same kind of GT3 cars as GTD PRO, but with pro-am lineups: a professional paired with an amateur driver. It is the biggest class on the grid.",
       spot:"Looks identical to GTD PRO. Green number panels and green windshield edges."}
    ],
    rule:"There are two shapes: sleek, purpose-built prototypes (GTP and LMP2) and GT cars that look like road cars (GTD PRO and GTD). Then check the number panel color: white is GTP, blue is LMP2, red is GTD PRO, green is GTD. At night those colors light up on the car.",
    watch:{
      qualifying:"Classes usually get their own short qualifying run, so you see one class at a time going for a fast lap. It sets the starting order.",
      race:"Each class has its own winner, so follow your class. Traffic between classes creates passes all race long, and pit stops and driver changes are where races are won."
    },
    specials:[
      {match:/Petit Le Mans/i, title:"Petit Le Mans", text:"A 10-hour endurance race that runs from midday into the night, or 1,000 miles, whichever comes first. Drivers share the car, and pit stops and night running shape the result. It is a Michelin Endurance Cup round, so extra endurance-only entries join the field (up to 54 cars on IMSA's 2026 entry list)."},
      {match:/night/i, title:"Night session", text:"Cars run under the lights. Class colors glow on the number panels and windshield edges, which makes it a good time to learn to tell the classes apart."},
      {match:/Rolex 24/i, title:"Rolex 24", text:"A round-the-clock endurance race that opens the season. Drivers swap through the night while teams try to keep the car running."}
    ]
  },
  {
    id:"pilot", yt:"UC58em84jwiyM20qR-iqBDZw", match:/Pilot Challenge|FOX Factory 120/i, timing:"https://www.imsa.com/scoring/",
    name:"Michelin Pilot Challenge", tag:"2 classes: GS and TCR",
    blurb:"IMSA's second-tier series: production-based race cars in two classes, driven by two-driver crews who swap during pit stops. Expect tight, door-to-door racing. Most races run two hours, with four-hour races at Daytona and Mid-Ohio.",
    cars:[
      {n:"GS", full:"Grand Sport", type:"GT4-spec race cars", c:"#5F86A6", fg:"#FFFFFF", pace:"Faster class",
       text:"Race versions of sports cars such as the BMW M4, Ford Mustang, Porsche 718 Cayman, Aston Martin Vantage, Toyota GR Supra, Mercedes-AMG and McLaren. It is the bigger class in the field.",
       spot:"Low, wide cars with big rear wings that look like their road versions."},
      {n:"TCR", full:"Touring Car", type:"Front-wheel-drive touring cars", c:"#B08A5A", fg:"#FFFFFF", pace:"Slower class",
       text:"Turbocharged four-cylinder sedans and hatchbacks, such as the Honda Civic Type R and Hyundai Elantra N.",
       spot:"Look like everyday compact cars with race wings and stripes."}
    ],
    rule:"GS cars are bigger, lower and more powerful. TCR cars look like the compact cars you see in any parking lot. Because the GS cars are quicker, they keep lapping the TCR cars.",
    watch:{ race:"GS and TCR race together, so the quicker GS cars lap the TCR cars. Crews of two drivers swap during pit stops." },
    specials:[
      {match:/FOX Factory 120/i, title:"Season finale", text:"The FOX Factory 120 is a two-hour race that closes the Pilot Challenge season at Road Atlanta."}
    ]
  },
  {
    id:"vp", match:/VP Racing/i, timing:"https://www.imsa.com/scoring/",
    name:"IMSA VP Racing SportsCar Challenge", tag:"Sprint races: LMP3, GTDX and GSX",
    blurb:"IMSA's sprint series: prototypes and GT cars in short, flat-out races. Each weekend has two 45-minute races, and every car has a single driver, so there are no driver changes.",
    cars:[
      {n:"LMP3", full:"Le Mans Prototype 3", type:"Entry-level prototypes", c:"#7A6FB0", fg:"#FFFFFF", pace:"Fastest here",
       text:"Closed-cockpit prototypes, one step below LMP2 and usually several seconds a lap slower. 2026 brings the new third-generation cars.",
       spot:"Low prototype shape with a closed cockpit."},
      {n:"GTDX", full:"GT Daytona X", type:"GT3 race cars", c:"#C7735B", fg:"#FFFFFF", pace:"Fast",
       text:"Race cars built to FIA GT3 rules, tuned to about 500 hp with top speeds over 170 mph.",
       spot:"Big, wide road-car shapes with large wings."},
      {n:"GSX", full:"Grand Sport X", type:"GT4 race cars", c:"#5E9A62", fg:"#FFFFFF", pace:"Slower",
       text:"GT4-spec cars such as the Toyota GR Supra, Porsche 718 Cayman, Aston Martin Vantage, BMW M4 and Ford Mustang. GTDX and GSX race only on the sprint weekends.",
       spot:"Road-car shapes, a step smaller and less powerful than GTDX."}
    ],
    rule:"LMP3 cars are the sleek closed-cockpit prototypes. The road-car shapes are GT cars, and the more powerful GTDX (GT3) cars pull away from the GSX (GT4) cars on the straights.",
    watch:{ race:"Two short sprint races with a single driver in each car: no pit stops for driver changes, so it is flat-out from the start. Prototypes and GT cars share the track." }
  },
  {
    id:"mx5", match:/MX-5/i, yt:"UCg1o8Hezzo9Mx7ATxCyu__w", timing:"https://www.imsa.com/scoring/",
    name:"Whelen Mazda MX-5 Cup", tag:"One car, one class",
    blurb:"Every driver races the identical Mazda MX-5 Cup car, prepared by Flis Performance, so the drivers, not the cars, decide the race. Expect big packs, drafting and constant position changes.",
    cars:[
      {n:"MX-5", full:"Mazda MX-5 Cup car", type:"Spec race car", c:"#5F86A6", fg:"#FFFFFF",
       text:"A race-prepared Mazda MX-5 with the same parts and setup rules for everyone. Two races each weekend.",
       spot:"They all look alike. Tell them apart by number and livery."}
    ],
    rule:"With identical cars there are no classes to sort out. Just watch the draft: packs swap places on the straights.",
    watch:{ race:"Every car is identical, so watch the draft. Packs of cars swap places on the straights, and the finish is often decided in the last corner." }
  },
  {
    id:"carrera", sess:"carrera", match:/Carrera Cup(?! Brazil)/i, yt:"UCch613iK0dXuGLlvFSePzwA", timing:"https://racing.porsche.com/en-US/live-timing/carrera-cup-north-america",
    name:"Porsche Carrera Cup North America", tag:"One car, driver classes",
    blurb:"Every car is a Porsche 911 GT3 Cup, so it is the driver that makes the difference. The classes are for drivers, not cars, so Pro, Pro-Am and Masters drivers race in the same pack.",
    cars:[
      {n:"911 Cup", full:"Porsche 911 GT3 Cup (992.2)", type:"Spec race car", c:"#4F7F94", fg:"#FFFFFF",
       text:"About 520 hp from a naturally aspirated 4.0-liter flat-six. Driver classes: Pro is the top drivers, Pro-Am is for drivers 35 and older, and Masters is for drivers 50 and older.",
       spot:"All identical in shape. Look at the number and sponsor colors."}
    ],
    rule:"With one car there are no car classes to sort out. The class is about the driver, not the car.",
    watch:{ race:"The same car for everyone means close packs. Pro, Pro-Am and Masters drivers are mixed in one pack, each racing for their own class result." }
  },
  {
    id:"lambo", yt:"UC58em84jwiyM20qR-iqBDZw", match:/Super Trofeo/i, timing:"https://www.imsa.com/scoring/",
    name:"Lamborghini Super Trofeo North America", tag:"One car, driver classes",
    blurb:"Single-make racing in the Lamborghini Huracan Super Trofeo Evo2, with Pro, ProAm, Am and Lamborghini Cup (LB Cup) driver classes racing together. Races run about 50 minutes.",
    cars:[
      {n:"Huracan", full:"Lamborghini Huracan Super Trofeo Evo2", type:"Spec race car", c:"#C7735B", fg:"#FFFFFF",
       text:"Every car is the same Huracan race car. The four classes are about driver experience, not the car.",
       spot:"All identical in shape. Look at the number and livery."}
    ],
    rule:"With one car there are no car classes to sort out.",
    watch:{ race:"Same car for everyone, with four driver classes racing in one field. Each class has its own winner." }
  }
  ,{
    id:"indycar", sess:"indycar", autoResults:true, match:/INDYCAR|IndyCar/i, timing:"https://racecontrol.indycar.com/",
    name:"NTT INDYCAR SERIES", tag:"One car, three kinds of track",
    blurb:"North America's top open-wheel series. Every team runs the same Dallara chassis with the same aero kit, powered by a Chevrolet or Honda engine, so results come down to drivers, teams and strategy. The season mixes street circuits, permanent road courses and ovals, and it builds to the Indianapolis 500.",
    cars:[
      {n:"IR-18", full:"Dallara IR-18", type:"Open-wheel, one car for everyone", c:"#1B1D21", fg:"#FFFFFF", pace:"Very fast",
       text:"Every car is the same Dallara chassis with a universal aero kit, set up one of three ways: high downforce for road and street courses, balanced for short ovals and low drag for the big superspeedways. The 2.2-litre twin-turbo V6 from Chevrolet or Honda makes more than 700 hp, and a hybrid system that stores and reuses energy was added in 2024. There is no power steering, so drivers muscle the car through every corner.",
       spot:"Open wheels and a single seat with the driver's helmet in the open. The cars carry Chevrolet or Honda branding, and team colors and numbers are what set them apart."}
    ],
    rule:"With one car for everyone there are no classes to sort out. Follow your driver or team, and watch who is on which tires and how many push-to-pass boosts are left.",
    watch:{
      practice:"Teams learn the track and tune the setup. Street circuits change a lot as rubber goes down, so lap times fall all weekend.",
      qualifying:"On road and street courses qualifying is knockout style, in rounds that end with the six fastest cars fighting for pole. On ovals each car runs alone against the clock.",
      race:"Strategy decides a lot of races: fuel, tires and pit stops. On road and street courses drivers can use a limited number of push-to-pass boosts that add horsepower for passing, and Firestone's softer alternate tires have red sidewalls. Cautions bunch the field up, and restarts are where the passing happens."
    },
    specials:[
      {match:/Indianapolis 500/i, title:"The Indianapolis 500", text:"The biggest race in the series: 200 laps of the 2.5-mile oval at Indianapolis Motor Speedway, 500 miles, with 33 cars on the grid. Cars run wheel to wheel at well over 200 mph, drafting and swapping the lead."}
    ],
    fine:"A spectator summary based on INDYCAR's published car facts. For official details, see INDYCAR.com."
  }
  ,{
    id:"gtwca", autoResults:true, match:/GT World Challenge America|Texas 8 Hour/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
    name:"GT World Challenge America Powered by AWS", tag:"GT3 supercars, sprint racing",
    blurb:"North America's home for GT3 racing, run by SRO Motorsports Group. The cars are race versions of well-known sports cars, built to the same FIA GT3 rules used at the Spa 24 Hours and around the world, so many makes race on equal terms. Weekends are short sprint races instead of endurance events, with one exception in 2027: the Texas 8 Hour.",
    cars:[
      {n:"GT3", full:"FIA GT3 race cars", type:"Race versions of supercars", c:"#C93A3A", fg:"#FFFFFF", pace:"Fast",
       text:"Ferrari, Porsche, Mercedes-AMG, BMW, Lamborghini, McLaren, Aston Martin, Audi, Corvette and others build GT3 cars. Performance is balanced by the rules, so no make can simply out-power the rest, and the racing comes down to drivers, strategy and tires. They are the same kind of cars that race in IMSA's GTD PRO and GTD classes.",
       spot:"Looks like a road car with a big rear wing and race stripes. Team colors, not the make, are what stand out."}
    ],
    rule:"Every car is a GT3 car, so they look alike in shape and speed. The classes are about the drivers, not the car: Pro (professionals), Pro-Am (a professional paired with an amateur) and Am (amateurs). Each class has its own winner, so follow your favorite team or class on the timing screens.",
    watch:{
      qualifying:"Cars go out to set their fastest lap, and the result sets the starting grid for the race.",
      race:"Sprint races are shorter than IMSA endurance events, so the action starts early and passing happens from the first lap. Pit stops and traffic between classes decide a lot."
    },
    specials:[
      {match:/Texas 8 Hour/i, title:"Texas 8 Hour", text:"An 8-hour endurance race at Circuit of the Americas, new for 2027, that replaces the Indianapolis 8 Hour as the flagship endurance event. Drivers share the car, and pit stops, tires and night running shape the result."}
    ],
    fine:"A spectator summary of GT3 racing and GT World Challenge America. For official details, see GT-World-Challenge-America.com."
  },
  {
    id:"gtwce", autoResults:true, match:/GT World Challenge Europe|24 Hours of Spa/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-europe.com/watch-live#live-timing",
    name:"GT World Challenge Europe Powered by AWS", tag:"GT3 supercars, Sprint and Endurance Cups",
    blurb:"Europe's top GT3 championship, run by SRO Motorsports Group. It is open to cars built to the FIA GT3 rules and balanced by SRO's Balance of Performance, the same rules used at GT World Challenge America. The season has ten rounds, split evenly between the Sprint Cup and the Endurance Cup, and it includes the CrowdStrike 24 Hours of Spa, the biggest GT race in the world.",
    cars:[
      {n:"GT3", full:"FIA GT3 race cars", type:"Race versions of supercars", c:"#1F6FB5", fg:"#FFFFFF", pace:"Fast",
       text:"Race versions of road cars from makes such as Ferrari, Porsche, Mercedes-AMG, BMW, Lamborghini, McLaren, Aston Martin, Audi and others, all built to the same FIA GT3 rules. Balance of Performance keeps the makes close, so the racing comes down to drivers, strategy and tyres. Pirelli is the series' official tyre supplier.",
       spot:"Looks like a road car with a big rear wing and race stripes. Team liveries, not the make, are what stand out."}
    ],
    rule:"Every car is a GT3 car, so they look alike in shape and speed. Drivers fall into four classes: Pro, Gold, Silver and Bronze, based on their ratings, and each class has its own winner as well as the overall result. Teams' and drivers' titles are awarded in each cup, and the points from both cups are combined for the full-season champions.",
    watch:{
      qualifying:"Cars go out to set their fastest laps, and the result sets the starting grid for the race.",
      race:"Sprint Cup weekends have a pair of 60-minute races, so the action starts on lap one. Endurance Cup weekends have one long race, from three hours up to the 24 Hours of Spa, where pit stops, driver changes and the night hours decide a lot."
    },
    specials:[
      {match:/24 Hours of Spa/i, title:"CrowdStrike 24 Hours of Spa", text:"The marquee event of the season: a full day and night of GT3 racing at Spa-Francorchamps in Belgium. The 2027 race is the 79th edition. Drivers share each car, and cars run through the night, so strategy, pit stops and staying out of trouble matter as much as raw speed."}
    ],
    fine:"A spectator summary of GT3 racing and GT World Challenge Europe, based on the series' own published information. For official details, see GT-World-Challenge-Europe.com."
  }
,{
  id:"gt4a", match:/GT4 America/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
  name:"Pirelli GT4 America", tag:"Production-based GT4 cars",
  blurb:"SRO America’s GT4 series. The cars are race versions of road-going sports cars such as the Ford Mustang, Aston Martin Vantage, BMW M4, Porsche Cayman and Toyota GR Supra, built to GT4 rules, with less power and less aero than the GT3 cars of GT World Challenge America.",
  cars:[
    {n:"GT4", full:"GT4 race cars", type:"Production-based sports cars", c:"#3E7CB1", fg:"#FFFFFF", pace:"Quick, slower than GT3",
     text:"Built from road cars with limited changes, so they look familiar. Because they are slower than the GT3 cars, they run in their own races.",
     spot:"Looks like a road car with a smaller wing than a GT3. Team colors and numbers are what set them apart."}
  ],
  rule:"Every car in this series is a GT4 car, so follow your favorite team or driver.",
  fine:"A short spectator summary of the series. For official details, see GT4-America.com."
}
,{
  id:"tca", match:/TC America/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
  name:"TC America powered by Skip Barber", tag:"Touring cars",
  blurb:"Touring-car racing on SRO America weekends, with production-based four-door and hatchback cars built for racing. Close, door-to-door racing is the appeal.",
  cars:[
    {n:"TC", full:"Touring cars", type:"Production-based race cars", c:"#8A6FB5", fg:"#FFFFFF", pace:"Quick",
     text:"Small production-based cars turned into race cars. Because they are close in speed, the packs run tight and passes are frequent.",
     spot:"Compact cars that look like ones on the road, with racing liveries."}
  ],
  rule:"Cars in different classes can be on track together, so follow your favorite team or driver.",
  fine:"A short spectator summary of the series. For official details, see the SRO America website."
}
,{
  id:"grcup", match:/Toyota GR Cup/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
  name:"Toyota GR Cup North America", tag:"One car for everyone",
  blurb:"A single-make series: every car is the same Toyota GR86 race car, so the result comes down to the driver and the racecraft.",
  cars:[
    {n:"GR86", full:"Toyota GR86", type:"Single-make race car", c:"#D0342C", fg:"#FFFFFF", pace:"Quick",
     text:"The same car for every driver, with team liveries setting them apart. Identical cars mean tight packs and lots of passing.",
     spot:"A compact Toyota sports coupe in a team livery."}
  ],
  rule:"With one car for everyone there are no car classes to sort out. Follow your favorite driver or team.",
  fine:"A short spectator summary of the series. For official details, see the SRO America website."
}
,{
  id:"gta", match:/GT America/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
  name:"GT America powered by AWS", tag:"GT3 cars, SRO America weekends",
  blurb:"A companion GT series on SRO America weekends, racing alongside GT World Challenge America at many rounds. Look for GT-style race cars from well-known makes.",
  cars:[
    {n:"GT", full:"GT race cars", type:"Race versions of sports cars", c:"#C7735B", fg:"#FFFFFF", pace:"Fast",
     text:"Race cars from familiar sports-car makes. It runs on the same weekends as GT World Challenge America, with its own races and its own winners.",
     spot:"Looks like a road car with a big rear wing and race stripes."}
  ],
  rule:"Follow your favorite team or driver, and check the timing screens for results in this series.",
  fine:"A short spectator summary of the series. For official details, see GTAmerica.us."
}
  ,{
    id:"f1", autoResults:true, sess:"f1", match:/Formula 1/i, timing:"https://www.formula1.com/en/timing/f1-live-lite",
    name:"Formula 1", tag:"The top of single-seater racing",
    blurb:"The FIA Formula One World Championship, the highest level of single-seater racing. Eleven teams run two cars each at Grands Prix on circuits around the world, and every team designs and builds its own car, so the pace of the car matters as much as the driver. There are two titles: drivers and constructors (teams). 2026 brought a new generation of cars and two new teams, Audi and Cadillac.",
    cars:[
      {n:"F1", full:"Formula 1 car", type:"Open-wheel, built by each team", c:"#E10600", fg:"#FFFFFF", pace:"Fastest",
       text:"Each team designs and builds its own car within the FIA's technical rules, and the teams use power units from a handful of manufacturers. The cars are the fastest circuit racing cars in the world, with very high cornering speeds from their wings and tires.",
       spot:"Open wheels, a single seat with the driver's helmet visible, and large front and rear wings. Team colors and the driver numbers are how you tell them apart."}
    ],
    rule:"There are no classes to sort out: all 22 cars race for the same result. Follow your driver or team, and note that the teams' two cars score points for both the driver standings and the constructors' championship.",
    watch:{
      practice:"Teams learn the track and try tires and settings. On a normal weekend there are three practice sessions; on a sprint weekend there is only one. Lap times matter less than what the teams are testing.",
      qualifying:"A knockout in three parts that cuts the slowest cars after each, ending with the fastest ten fighting for pole position. It sets the grid for the race, and passing is hard at many circuits, so it matters.",
      race:"About 300 km on a normal weekend. Tire choice and pit stops usually decide the order, and a safety car can reshuffle everything. The winner gets 25 points."
    },
    specials:[
      {match:/Sprint/i, title:"Sprint weekend", text:"A short race of about 100 km on Saturday with points for the top eight. A sprint weekend has a compressed schedule, with one practice session and a separate sprint qualifying, and the usual qualifying and Grand Prix still follow."}
    ],
    fine:"A spectator summary based on Formula 1's published rules. For official details, see formula1.com."
  },
  {
    id:"wec", sess:"wec", autoResults:true, match:/FIA WEC|World Endurance/i,
    name:"FIA World Endurance Championship", tag:"Hypercars and GT cars racing for hours",
    blurb:"The FIA World Endurance Championship (WEC) races long-distance sports cars around the world, with the 24 Hours of Le Mans as its centrepiece. Two classes share the track: Hypercars at the front and LMGT3 production-based GT cars behind them, and each class has its own result. Most rounds are six hours long.",
    cars:[
      {n:"Hypercar", full:"Hypercar", type:"Top class: prototype sports cars built by manufacturers", c:"#B03A2E", fg:"#FFFFFF", pace:"Fastest",
       text:"The fastest cars in the championship, entered by car makers. The provisional entry for the 2026 finale at Monza lists 17 Hypercars from eight makes: Alpine, Aston Martin, BMW, Cadillac, Ferrari, Genesis, Peugeot and Toyota. The series balances the cars (Balance of Performance) so the different makes stay close.",
       spot:"Low, wide prototypes with closed cockpits and covered wheels, built to a different design by each maker. Tell them apart by number and colours: the entry list pairs each team's two or three cars."},
      {n:"LMGT3", full:"LMGT3", type:"GT cars based on road cars", c:"#2E7D6B", fg:"#FFFFFF", pace:"Quick",
       text:"Production-based GT cars run by teams. The Monza entry lists 18 cars from nine makes: Aston Martin, BMW, Chevrolet Corvette, Ferrari, Ford, Lexus, McLaren, Mercedes-AMG and Porsche.",
       spot:"They look like road cars with racing wings and run slower than the Hypercars, so the fast cars lap them again and again. Watch the different classes race separately within the same race."}
    ],
    rule:"Each car has three drivers who share it. Every driver is rated Platinum, Gold, Silver or Bronze (P, G, S or B on the entry list): in the Monza entry list every LMGT3 crew includes a Bronze-rated driver.",
    watch:{
      practice:"Three free practice sessions: two on Friday and one on Saturday at Monza.",
      qualifying:"Qualifying is run separately for LMGT3 and for Hypercar, each followed by a Hyperpole session that sets the front of that class's grid.",
      race:"A long race (six hours at Monza, 11:00 to 17:00 local time). Cars from both classes are on track together, each class has its own winner, and the drivers change during pit stops."
    },
    fine:"A spectator summary from fiawec.com and the Monza provisional entry list (version 1, Oct 20, 2026). For official details, see fiawec.com."
  },
  {
    id:"motogp", autoResults:true, match:/MotoGP/i, timing:"https://www.motogp.com/en/live",
    name:"MotoGP", tag:"Motorcycle road racing's top class",
    blurb:"MotoGP is the world championship of motorcycle road racing: purpose-built prototype bikes (nothing you can buy) ridden by about 22 of the fastest riders on earth, on permanent road circuits and a few street tracks. Every weekend has two races, a short Sprint on Saturday and the full-distance Grand Prix on Sunday, and both score championship points. Moto2 and Moto3, the two smaller classes, race at the same events.",
    cars:[
      {n:"MotoGP", full:"MotoGP class", type:"Prototype motorcycles from Ducati, Aprilia, KTM, Honda and Yamaha", c:"#E0143C", fg:"#FFFFFF", pace:"Fastest class",
       text:"Five manufacturers build the bikes: Ducati, Aprilia, KTM, Honda and Yamaha. Teams run two riders each, and both riders in a team are on the same make (the factory teams and the satellite teams that lease their bikes). Today's bikes have 1000cc four-stroke engines; from 2027 the rules change to 850cc engines, a ban on ride-height devices, smaller front aerodynamics and new Pirelli tyres in place of Michelin.",
       spot:"Tell the makes apart by the logo on the nose and the shape of the fairing, and the riders by the number on the nose and the name on the tail. The team name is on the side of the fairing."}
    ],
    rule:"Saturday's Sprint is half the distance of the Sunday Grand Prix and scores half the points: 12, 9, 7, 6, 5, 4, 3, 2, 1 for the top nine. The Sunday race scores 25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 for the top 15, so a rider can take up to 37 points in one weekend. The Sprint does not set the Sunday grid: that comes from Saturday's qualifying.",
    watch:{
      practice:"Friday has two practice sessions: the timed afternoon session ranks the riders, and the ten fastest over Friday and Saturday skip Q1 and go straight to Q2. Saturday morning has one more practice.",
      qualifying:"Qualifying is in two parts on Saturday. Riders outside the top ten of practice fight in Q1 for two spots in Q2; Q2 decides pole and the first four rows of the grid, and Q1 sets the grid from 13th back.",
      race:"Two races a weekend: the Sprint on Saturday afternoon and the Grand Prix on Sunday. Both start from the grid qualifying set and are decided on laps of a few minutes, so a bad first corner matters. Sunday morning has a short warm-up session before the Grand Prix."
    },
    fine:"A spectator summary from motogp.com (what a race weekend looks like, the Sprint and points explainers, the 2027 regulations announcement) and the series' own results service (the five manufacturers and the Sprint and race points). For official details, see motogp.com."
  },
  {
    id:"nascar", autoResults:true, match:/NASCAR/i, timing:"https://www.nascar.com/followlive/",
    name:"NASCAR Cup Series", tag:"Stock cars, ovals and a few road courses",
    blurb:"The NASCAR Cup Series is American stock car racing's top series: up to 40 identical-looking cars racing wheel to wheel, mostly on oval tracks from short bullrings to the huge Daytona and Talladega superspeedways, plus a few road courses. The 2027 season has 36 points races from the Daytona 500 in February to the Championship at Homestead-Miami in November, with the non-points Clash and All-Star Race on top.",
    cars:[
      {n:"Next Gen", full:"NASCAR Next Gen car", type:"One class: Chevrolet, Ford and Toyota stock cars", c:"#C28A00", fg:"#1B1B1B", pace:"Very fast",
       text:"Every team races the same Next Gen car design: a chassis from one supplier (Technique Chassis), carbon-composite bodies, 18-inch aluminum wheels and a V8 engine. Chevrolet (Camaro), Ford (Mustang) and Toyota (Camry) supply the bodies and engines. Power is about 670 horsepower at most tracks and 510 at the superspeedways (Daytona and Talladega); from 2026 it is 750 at road courses and at ovals shorter than 1.5 miles.",
       spot:"The cars look like a Camaro, Mustang or Camry but are all built to the same rules, so tell them apart by number, sponsor colors and the manufacturer on the nose. Up to 40 cars start each race and they race as one pack."}
    ],
    rule:"Each race is split into three stages with a caution at the end of the first two. Stage results and the finish earn points: the winner gets 55, and the top 10 at the end of each of the first two stages get 10 down to 1. After 26 regular-season races the top 16 drivers in points start The Chase (10 races, one points reset), and the one with the most points at the Homestead-Miami finale is the champion. There are no more eliminations.",
    watch:{
      practice:"Practice and qualifying times change from track to track (some weekends have little or no practice), so check the weekend's schedule once NASCAR publishes it.",
      qualifying:"Qualifying sets the starting grid, run as single cars or in short groups depending on the track.",
      race:"Races last 2 to 4 hours (the Coca-Cola 600 is 600 miles) and are run on Sundays, with a few Saturday-night races. Most weekends also include the O'Reilly Auto Parts Series and Craftsman Truck Series."
    },
    fine:"A spectator summary based on NASCAR's 2027 schedule release (Aug 26, 2026) and published reports of the Next Gen car and the 2026 Chase format. For official details, see nascar.com."
  },
  {
    id:"oreilly", match:/O'Reilly Auto Parts/i, timing:"https://www.nascar.com/followlive/",
    name:"NASCAR O'Reilly Auto Parts Series", tag:"Stock cars, one step below the Cup Series",
    blurb:"NASCAR's second-tier national series (it used to be called the Xfinity Series): about 38 stock cars racing wheel to wheel, usually at the same tracks and on the same weekends as the Cup Series, often on Saturday. Many drivers are young talent on their way up, mixed with veterans and a few Cup stars. The 2026 season has 33 races and ends with the championship race at Homestead-Miami on Nov 7.",
    cars:[
      {n:"Stock car", full:"NASCAR O'Reilly Auto Parts Series car", type:"One class: Chevrolet Camaro, Ford Mustang and Toyota Supra", c:"#2E8B57", fg:"#FFFFFF", pace:"Fast",
       text:"Every team races the same kind of stock car, with Chevrolet (Camaro), Ford (Mustang) and Toyota (Supra) bodies. About 38 cars start each race.",
       spot:"Chevrolet is by far the most common badge in the field; Toyota is next and Ford the rarest, so a Mustang stands out. Tell the cars apart by number and sponsor colors, and remember a Cup star can be in any of them."}
    ],
    rule:"Each race is split into stages with a caution at the end of the first stages, and the winner earns 55 points. In 2026 NASCAR replaced the elimination playoff with The Chase: after the regular-season finale at Daytona the top 12 drivers in points are reseeded (the first seed starts with 2,100 points, 25 more than second), race the final 9 races with nobody cut, and the driver with the most points after Homestead-Miami is champion. Full-time Cup drivers who race here (up to 10 times a season in 2026) cannot score points or race in the finale or postseason.",
    watch:{
      practice:"Practice and qualifying are short and change from track to track, and are often held the day before the race.",
      qualifying:"Qualifying sets the starting grid, run in single cars or short groups depending on the track.",
      race:"Races are shorter than the Cup Series' (for example 250 laps at Martinsville and 200 at Homestead) and usually run on Saturday, with stage cautions that bunch the field up."
    },
    fine:"A spectator summary from NASCAR's own race data (nascar.com, read Oct 29, 2026: 2026 calendar, field sizes and car makes), the 2026 Chase format announcement and NASCAR's November 2025 rule release. For official details, see nascar.com."
  },
  {
    id:"trucks", match:/Craftsman Truck/i, timing:"https://www.nascar.com/followlive/",
    name:"NASCAR Craftsman Truck Series", tag:"Pickup-truck racing",
    blurb:"NASCAR's truck series: about 36 race-prepared pickup trucks, often the weekend's first race. The 2026 season has 25 races and ends with the championship race at Homestead-Miami on Nov 6.",
    cars:[
      {n:"Truck", full:"NASCAR Craftsman Truck Series truck", type:"One class: Chevrolet Silverado, Ford F-150, Toyota Tundra and RAM 1500", c:"#B5651D", fg:"#FFFFFF", pace:"Fast",
       text:"All teams race purpose-built pickup trucks with bodies shaped like Chevrolet Silverados, Ford F-150s, Toyota Tundras and RAM 1500s. About 36 trucks start each race.",
       spot:"They look like pickups, so the badge on the front is the easiest tell: Chevrolet and Ford are the most common, then Toyota, with RAM the rarest."}
    ],
    rule:"Races are split into stages, and points go to stage finishers and the race result. In 2026 NASCAR replaced the elimination playoff with The Chase: the top 10 drivers in points after the regular-season finale at New Hampshire are reseeded (the first seed starts with 2,100 points, 25 more than second), race the final 7 races from Bristol to Homestead-Miami with nobody cut, and the driver with the most points after Homestead is champion. Full-time Cup drivers who race here (up to 8 times a season in 2026) cannot race in the regular-season finale or the postseason.",
    watch:{
      practice:"Practice and qualifying are short and change from track to track, often on the day before the race.",
      qualifying:"Qualifying sets the starting grid, run in single trucks or short groups depending on the track.",
      race:"Truck races are the shortest of NASCAR's three national series (about 100 to 250 miles in 2026), so there is little time to recover from a bad restart."
    },
    fine:"A spectator summary from NASCAR's own race data (nascar.com, read Oct 29, 2026: 2026 calendar, field sizes and truck makes), the 2026 Chase format announcement and NASCAR's November 2025 rule release. For official details, see nascar.com."
  },
  {
    id:"f1academy", sess:"f1academy", yt:"UCNtiHO5dvgowvZScesaKUqA", match:/F1 Academy/i, timing:"https://www.f1academy.com/About/Live-Timing",
    name:"F1 Academy", tag:"All-female, one car for everyone",
    blurb:"A single-seater series for young women, run by Formula 1 as a step up from karting. Every driver has the same car, so results come down to the driver and the team. It races on Formula 1 weekends, and many of its cars carry the colours of Formula 1 teams.",
    cars:[
      {n:"T421-F1A", full:"Tatuus T421-F1A", type:"Formula 4-level single-seater, one car for everyone", c:"#C2457A", fg:"#FFFFFF", pace:"Fast",
       text:"A Tatuus chassis with modified front and rear wings and a 1.4-liter turbocharged Autotecnica engine making 174 hp, on 13-inch Pirelli tires. Top speed is up to 150 mph. There are no required pit stops: a car only pits after damage or to change tires for changing conditions.",
       spot:"All 18 cars are the same shape, so tell them apart by number and livery. Six teams (PREMA, Campos, MP Motorsport, Rodin, ART Grand Prix and HITECH) run three cars each."}
    ],
    rule:"Drivers must be 16 to 25 at their first race weekend of the season. The grid is 18 cars: 17 full-time drivers plus one wild card at each round. There are no classes, so everyone races for the same result.",
    watch:{
      practice:"Up to two free practice sessions of up to 40 minutes each.",
      qualifying:"A 30-minute session that sets the starting grids.",
      race:"Each race lasts up to 30 minutes (13 laps at Austin). A weekend has two or three races, described below."
    },
    specials:[
      {match:/Opening Race/i, title:"Opening Race", text:"An extra race run at the Montreal and Austin rounds, before the other two. The grid is set by each driver's second-fastest qualifying lap. The winner gets 25 points."},
      {match:/Reverse Grid/i, title:"Reverse Grid Race", text:"The top eight qualifiers start in reverse order; ninth to eighteenth start where they qualified. The winner gets 10 points, down to 1 point for eighth."},
      {match:/Feature/i, title:"Feature Race", text:"The main race of the weekend. The grid is set by fastest laps, and the pole sitter gets 2 points. The winner gets 25 points, then 18, 15, 12, 10, 8, 6, 4, 2 and 1 for tenth."}
    ],
    fine:"A spectator summary based on F1 Academy's own 2026 beginner's guide (f1academy.com). For official details, see f1academy.com."
  },
  {
    id:"f2", sess:"f2", match:/Formula 2/i, timing:"https://www.fiaformula2.com/livetiming/index.html",
    name:"Formula 2", tag:"The last step before Formula 1",
    blurb:"The FIA Formula 2 Championship races on Formula 1 weekends and is the last step on the ladder before Formula 1. Every team runs the same car, so results come down to the drivers and the teams. A weekend has practice, qualifying, a Sprint Race and a Feature Race.",
    cars:[
      {n:"F2 2024", full:"Dallara F2 2024", type:"Formula 2 single-seater, one car for everyone", c:"#2F5D8C", fg:"#FFFFFF", pace:"Very fast",
       text:"A Dallara chassis with a 3.4-liter turbocharged V6 from Mecachrome, rated at 620 hp and limited to 8,750 rpm. Pirelli supplies the tires, and the car runs on Aramco's advanced sustainable fuel.",
       spot:"All the cars are the same shape, so tell them apart by number and team colours. The Monza round in 2026 had 22 cars on the grid."}
    ],
    watch:{
      practice:"A practice session on the first day, before qualifying.",
      qualifying:"Qualifying on the first day decides the starting order for the weekend.",
      race:"Two races: the Sprint Race on Saturday and the Feature Race, the main race, on Sunday."
    },
    fine:"A spectator summary from fiaformula2.com and the published specifications of Dallara and Mecachrome. For official details, see fiaformula2.com."
  },
  {
    id:"f3", sess:"f3", match:/Formula 3/i, timing:"https://www.fiaformula3.com/livetiming/index.html",
    name:"Formula 3", tag:"The step below Formula 2",
    blurb:"The FIA Formula 3 Championship races only on Formula 1 weekends and is the step below Formula 2. Every team runs the same car. A weekend has practice, qualifying in two groups, a Sprint Race and a Feature Race.",
    cars:[
      {n:"F3 2025", full:"Dallara F3 2025", type:"Formula 3 single-seater, one car for everyone", c:"#3F7F6B", fg:"#FFFFFF", pace:"Fast",
       text:"A Dallara chassis with a 3.4-liter naturally aspirated V6 from Mecachrome, making 380 hp at 8,000 rpm. Pirelli supplies the tires, on 16-inch wheels, and the top speed is around 300 km/h (186 mph).",
       spot:"All the cars are the same shape, so tell them apart by number and team colours. The Monza round in 2026 had 30 cars on the grid."}
    ],
    watch:{
      practice:"A practice session on the first day, before qualifying.",
      qualifying:"The field is split into two groups for qualifying, Group A and Group B, and the times decide the starting order.",
      race:"Two races: the Sprint Race on Saturday and the Feature Race, the main race, on Sunday."
    },
    fine:"A spectator summary from fiaformula3.com, the FIA's 2026 Formula 3 technical regulations and the published specifications of Dallara and Mecachrome. For official details, see fiaformula3.com."
  },
  {
    id:"masters", match:/Masters Historic/i,
    name:"Masters Historic Racing", tag:"Classic Formula 1 cars, 1966 to 1985",
    blurb:"Historic Formula 1 cars racing again. At the United States Grand Prix the featured series is Masters Racing Legends, for 3-litre Formula 1 cars from 1966 to 1985, the era when the Cosworth DFV engine powered much of the grid. For 2026 the series also welcomes turbo-engined Formula 1 cars from 1977 to 1985.",
    cars:[
      {n:"1966-85 F1", full:"Formula 1 cars, 1966 to 1985", type:"Historic Grand Prix cars", c:"#8A6B3F", fg:"#FFFFFF", pace:"Fast",
       text:"Real Formula 1 cars from that period, many with the 3.0-liter naturally aspirated Cosworth DFV engine. A weekend is one 25-minute practice, one 25-minute qualifying and two 25-minute races.",
       spot:"Different makes and shapes all in one field. At the 2024 Austin round the entry included March, Williams (FW07C), Tyrrell, Lotus 91, Arrows, Penske and Shadow cars, and a separate Formula Atlantic class raced with them (Chevron cars)."}
    ],
    rule:"Cars from many different years race together for one overall result in each race. Safety car periods can bunch the field, which makes the finish close.",
    watch:{
      practice:"A 25-minute session for the drivers to get used to old cars on a modern track.",
      qualifying:"A 25-minute session that sets the grid for the two races.",
      race:"Two 25-minute races, one on Saturday and one on Sunday at Austin. Old Grand Prix cars from different eras race wheel to wheel, so expect a mixed field and close battles."
    },
    fine:"A spectator summary based on Masters Historic Racing's 2026 event and series pages and its 2024 Austin race report (mastershistoricracing.com), and Formula 1's timetable. For official details, see mastershistoricracing.com."
  },
  {
    "id": "hsr", "noWatch": true,
    "match": /\bHSR\b/,
    "name": "HSR, Historic Sportscar Racing",
    "tag": "Vintage and historic race cars, by era",
    "blurb": "Historic Sportscar Racing runs vintage, historic and early modern race cars at tracks such as Daytona, Sebring, Road Atlanta and Watkins Glen. A weekend is split into run groups, each a family of cars from similar eras or types, and each gets its own practice, qualifying and races. At the Classic 24 Hour at Daytona the cars are also sorted into groups A to G and P by era, and those groups race around the clock.",
    "cars": [
    {
      "n": "VC",
      "full": "Vintage Cup presented by SascoSports",
      "type": "Run group: Groups 2 and 3",
      "c": "#8A6B3F",
      "fg": "#FFFFFF",
      "text": "Vintage and historic production cars and sports racers, through about 1985. Its two groups are listed below.",
      "m": "Vintage Cup"
    },
    {
      "n": "2",
      "full": "Group 2: Vintage Production",
      "type": "Part of the Vintage Cup",
      "c": "#A07F4E",
      "fg": "#FFFFFF",
      "text": "Features 1950s and 1960s production sports cars and early sports racing models. Common entries include the Porsche 356, Jaguar XK120, MGA, MGB and Austin-Healey Sprites.",
      "m": "Vintage Cup"
    },
    {
      "n": "3",
      "full": "Group 3: Vintage/Historic Production",
      "type": "Part of the Vintage Cup",
      "c": "#7C5E34",
      "fg": "#FFFFFF",
      "text": "Small-to-mid displacement sports cars and sedans from the mid-1960s through the early 1980s: non-big-bore classics like the standard Porsche 911, Triumph and MGB V8 variants.",
      "m": "Vintage Cup"
    },
    {
      "n": "GP",
      "full": "Grand Prix Classics",
      "type": "Run group: Group 4 (4A, 4B, 4C)",
      "c": "#B5443B",
      "fg": "#FFFFFF",
      "text": "Vintage and historic open-wheel Formula cars, in three groups by era.",
      "m": "Grand Prix Classics"
    },
    {
      "n": "4A",
      "full": "Group 4A: Classic Monoposto",
      "type": "Part of Grand Prix Classics",
      "c": "#C45A50",
      "fg": "#FFFFFF",
      "text": "Early, small-bore open-wheel cars built before 1972, without wings or slicks, such as vintage Formula Fords.",
      "m": "Grand Prix Classics"
    },
    {
      "n": "4B",
      "full": "Group 4B: Monoposto Formula 70",
      "type": "Part of Grand Prix Classics",
      "c": "#9C3A32",
      "fg": "#FFFFFF",
      "text": "1970s-era open-wheel race cars with aerodynamics and slick tires, notably Formula Atlantic, Formula 2 and Formula 5000.",
      "m": "Grand Prix Classics"
    },
    {
      "n": "4C",
      "full": "Group 4C: Modern Era Formula",
      "type": "Part of Grand Prix Classics",
      "c": "#7E2D27",
      "fg": "#FFFFFF",
      "text": "Top-tier, large-bore modern open-wheel racers, including historically significant Formula 1 cars, Indy Cars and Indy Lights.",
      "m": "Grand Prix Classics"
    },
    {
      "n": "LR",
      "full": "Legacy Racers",
      "type": "Run group: Groups 5, 8 and 11",
      "c": "#C27A1E",
      "fg": "#FFFFFF",
      "text": "Historic production cars and classic big-bore cars, historic stock cars, and early modern GT3 and TCR cars (HSR's group guide). Its three groups are listed below.",
      "m": "Legacy Racers"
    },
    {
      "n": "5",
      "full": "Group 5: Historic Big-Bore Production",
      "type": "Part of Legacy Racers",
      "c": "#D68A2B",
      "fg": "#FFFFFF",
      "text": "High-displacement, aggressive American V8s and powerful international GT cars from 1960 to 1974, such as the Shelby Cobra, Chevrolet Camaro, Boss 302 Mustang, Corvette C2/C3 and Porsche 911 RSRs.",
      "m": "Legacy Racers"
    },
    {
      "n": "8",
      "full": "Group 8: Historic Stock Cars",
      "type": "Part of Legacy Racers",
      "c": "#A8661A",
      "fg": "#FFFFFF",
      "text": "Purpose-built oval stock cars retired from professional series such as the NASCAR Winston Cup, Nextel Cup and Busch Series.",
      "m": "Legacy Racers"
    },
    {
      "n": "11",
      "full": "Group 11: Select FIA/IMSA GT",
      "type": "Part of Legacy Racers",
      "c": "#8E5614",
      "fg": "#FFFFFF",
      "text": "Specific modern professional GT cars matching distinct historical sportscar eras.",
      "m": "Legacy Racers"
    },
    {
      "n": "HT",
      "full": "Historic Trophy presented by WeatherTech",
      "type": "Run group: Groups 6 and 7",
      "c": "#2F6DB5",
      "fg": "#FFFFFF",
      "text": "Historic prototypes and sports racers, up to modern sports racers. Its two groups are listed below.",
      "m": "Historic Trophy"
    },
    {
      "n": "6",
      "full": "Group 6: Racing Prototypes",
      "type": "Part of the Historic Trophy",
      "c": "#3F7FC8",
      "fg": "#FFFFFF",
      "text": "High-downforce icons of endurance racing: original IMSA GTP, Camel Lights, FIA Group C and C2, and early LMP machinery like the Porsche 962.",
      "m": "Historic Trophy"
    },
    {
      "n": "7",
      "full": "Group 7: Historic & Modern Sports Racers",
      "type": "Part of the Historic Trophy",
      "c": "#255A9A",
      "fg": "#FFFFFF",
      "text": "Pure-bred racing chassis on slick tires: legendary Can-Am cars, early Sports 2000 platforms (Lola, Swift) and older chassis like the Ford GT40.",
      "m": "Historic Trophy"
    },
    {
      "n": "GT",
      "full": "Mission GT Challenge presented by Pirelli",
      "type": "Run group: Groups 9 and 10",
      "c": "#1F8A5B",
      "fg": "#FFFFFF",
      "text": "The early modern era of GT cars (GT1, GT2, GT3 and GT4, from the 2000s through the 2020s). Has sprint races and a one-hour enduro with a required pit stop. Its two groups are listed below.",
      "m": "Mission GT"
    },
    {
      "n": "9",
      "full": "Group 9: Post-Historic GT",
      "type": "Part of the Mission GT Challenge",
      "c": "#2A9C6A",
      "fg": "#FFFFFF",
      "text": "High-performance endurance sports cars from past eras of professional GT racing, including FIA GT1, GT2 and GT3 specifications and classic Trans-Am entries.",
      "m": "Mission GT"
    },
    {
      "n": "10",
      "full": "Group 10: Modern Global GT Cup",
      "type": "Part of the Mission GT Challenge",
      "c": "#177A4D",
      "fg": "#FFFFFF",
      "text": "Contemporary, production-based spec series race cars and modern track packages, mainly FIA GT4, Porsche Carrera Cup, Ferrari Challenge and BMW M3 race cars.",
      "m": "Mission GT"
    },
    {
      "n": "PC",
      "full": "Prototype Challenge presented by Michelin",
      "type": "Run group",
      "c": "#6B4FBB",
      "fg": "#FFFFFF",
      "text": "Early modern prototypes, from the 2000s to the 2020s. Has sprint races and a longer enduro with two required pit stops.",
      "m": "Prototype Challenge",
      "spot": "Closed-cockpit and open prototypes, the type you see at the top of IMSA and Le Mans."
    },
    {
      "n": "NC",
      "full": "NASCAR Classic presented by Goodyear",
      "type": "Run group",
      "c": "#D6A100",
      "fg": "#1A1A1A",
      "text": "Historic and early modern NASCAR and oval stock cars and trucks.",
      "m": "NASCAR Classic",
      "spot": "Stock cars with big stock-car body shapes."
    },
    {
      "n": "CE",
      "full": "Classic Endurance Championship presented by Mission Foods",
      "type": "The 24-hour-style race, run in groups A to G and P",
      "c": "#C8102E",
      "fg": "#FFFFFF",
      "text": "Four iconic IMSA endurance races recreated with vintage, historic and early modern prototypes, sports racers and GT and production cars. At Daytona it is the Classic 24 Hour: each group races four times over the weekend, with the groups running in turn around the clock. The result is based on the greatest number of laps completed in the least total time over the four races combined.",
      "m": "Classic 24 Hour|Sixties Endurance"
    },
    {
      "n": "A",
      "full": "Group A: Early FIA / SCCA era",
      "type": "Classic 24 group, before 1972",
      "c": "#7A5C3A",
      "fg": "#FFFFFF",
      "text": "Pre-1972 FIA prototype sports cars, World Sportscar Championship cars through 1968, FIA Grand Touring, Trans-Am and SCCA cars and touring cars under 2.0 liters.",
      "m": "Classic 24 Hour Group A/B"
    },
    {
      "n": "B",
      "full": "Group B: Early IMSA era",
      "type": "Classic 24 group, 1973 to 1982",
      "c": "#9C6B2E",
      "fg": "#FFFFFF",
      "text": "FIA sports racing cars, Can-Am and similar, IMSA and SCCA Trans-Am, IMSA GTO and GTU cars, FIA GT3 and World Challenge cars, and IMSA RS cars.",
      "m": "Classic 24 Hour Group A/B"
    },
    {
      "n": "C",
      "full": "Group C: Late IMSA GT / GTP era",
      "type": "Classic 24 group, 1983 to 1993",
      "c": "#B03A2E",
      "fg": "#FFFFFF",
      "text": "IMSA GTP and FIA Group C prototypes, GTP Lights and Group C2, plus IMSA GTX, GTO and GTU cars.",
      "m": "Classic 24 Hour Group C/D"
    },
    {
      "n": "D",
      "full": "Group D: Early Grand-Am / GT era",
      "type": "Classic 24 group, 1994 to 2003",
      "c": "#2F6DB5",
      "fg": "#FFFFFF",
      "text": "Grand-Am sports racers, first-generation Daytona Prototypes, IMSA and FIA World Sportscar cars, and Grand Touring Supreme cars including GT1, GT2 and GT3.",
      "m": "Classic 24 Hour Group C/D"
    },
    {
      "n": "E",
      "full": "Group E: Modern era GT",
      "type": "Classic 24 group, 2004 to 2021 homologations",
      "c": "#1F8A5B",
      "fg": "#FFFFFF",
      "text": "FIA and IMSA GT1, GTLM, DTM and GTE cars, GT2 and GTD cars, and current-era FIA, IMSA and SRO GT3 cars. Cars are placed in the group by HSR.",
      "m": "Classic 24 Hour Group E"
    },
    {
      "n": "F",
      "full": "Group F: Modern era prototypes",
      "type": "Classic 24 group, through 2021 homologations",
      "c": "#6B4FBB",
      "fg": "#FFFFFF",
      "text": "LMP1 and Daytona Prototype International (DPi) cars, LMP2 and LMPC, LMP3 and P3, and Gen 2 and Gen 3 Daytona Prototypes.",
      "m": "Classic 24 Hour Group F"
    },
    {
      "n": "G",
      "full": "Group G: Modern GT3 / GT4 and Cup cars",
      "type": "Classic 24 group",
      "c": "#0E8E9E",
      "fg": "#FFFFFF",
      "text": "FIA, IMSA and SRO GT4, early Cup and Challenge-style cars, and IMSA and SRO TCR cars.",
      "m": "Classic 24 Hour Group G"
    },
    {
      "n": "P",
      "full": "Group P: Peter Auto Sixties Endurance",
      "type": "Classic 24 group, Peter Auto",
      "c": "#5E6A77",
      "fg": "#FFFFFF",
      "text": "The Peter Auto group, called Sixties Endurance by Peter Auto in the schedule. It races four times alongside the other groups.",
      "m": "Sixties Endurance"
    }
  ],
  "rule": "Look for the group in the session name. Run groups (Vintage Cup, Grand Prix Classics, Legacy Racers, Historic Trophy, Mission GT Challenge, Prototype Challenge, NASCAR Classic) are the daytime sprint-race families. The Classic 24 groups (A to G and P) are sorted by the era the car raced in, so A to E run roughly from the oldest cars to the newest GT cars, and F (prototypes) and G (modern GT3/GT4) are the modern groups. The time listed for a group is when it leaves the grid, not when to arrive.",
    "watch": {
      "practice": "Groups take short turns on track, so the schedule moves quickly. Walk the paddock and see the cars up close.",
      "qualifying": "Short sessions that set each group's grid. Some enduros use the times from the earlier qualifying sessions.",
      "race": "Short sprint races for each run group, and at Daytona the Classic 24 Hour: each group runs four races, one after another around the clock, with the overall result based on laps completed and total time."
    },
    "fine": "A spectator summary based on HSR's official schedule and supplemental regulations for the 2026 Daytona Classic 24 Hour (10/27/2026) and its group overview. The run-group descriptions match HSR's one-page group guide (3/9/2026); the numbered group descriptions (Groups 2 to 11) are HSR's group definitions as supplied to us, so check hsrrace.com for the exact class lists. The Classic endurance groups are set per event and change from year to year: the 2025 Classic 6 Hour at Watkins Glen used three groups (A early era, B historic era, C modern era), while the 2026 Daytona Classic 24 uses A to G and P as listed here. For official details, see hsrrace.com."
  },
  {
    "id": "supercup", "noWatch": true,
    "match": /Supercup/i,
    "name": "Porsche Mobil 1 Supercup",
    "tag": "One-make Porsche 911 Cup cars at Formula 1 weekends",
    "blurb": "A one-make series: every driver races the same Porsche 911 Cup car, so the result comes down to the driver and the team. It has run since 1993, is organised by Porsche, and every race supports a Formula 1 weekend. 2026 is the first season with the completely newly developed 911 Cup, whose brakes now have racing ABS.",
    "cars": [
      {
        "n": "911",
        "full": "Porsche 911 Cup",
        "type": "One-make race car",
        "c": "#C8102E",
        "fg": "#FFFFFF",
        "text": "The same car for the whole grid. In 2026 there are 28 permanent entries shared between ten teams, and guest drivers can join most races (not Monaco, where the street circuit limits the field to 28). The series runs on fuel with a high eFuel content.",
        "spot": "All identical Porsche 911 shapes, so follow the team liveries and car numbers."
      }
    ],
    "rule": "Every car is the same, so there are no classes to tell apart. Watch the battles between teams and between the series' young drivers.",
    "watch": {
      "practice": "All cars are identical, so this is about drivers finding the limit on a track they will share with Formula 1.",
      "qualifying": "Qualifying sets the grid for the weekend's race.",
      "race": "One-make racing: every car is the same, so the field runs close together."
    },
    "fine": "A spectator summary based on Porsche's 2026 Supercup season preview (newsroom.porsche.com, May 28 2026). For official details, see racing.porsche.com."
  },
  {
    "id": "moto2", "noWatch": true,
    "match": /Moto2/i,
    "name": "Moto2",
    "tag": "The middle class of Grand Prix motorcycle racing",
    "blurb": "Moto2 is the intermediate class of the MotoGP world championship, between Moto3 and MotoGP. It was formed in 2010 to replace the 250cc class. Every bike uses the same Triumph 765cc three-cylinder engine, with each team's own chassis around it, so the riders and the chassis make the difference.",
    "cars": [
      {
        "n": "M2",
        "full": "Moto2 bike",
        "type": "Triumph 765cc triple",
        "c": "#1F8A5B",
        "fg": "#FFFFFF",
        "text": "765cc three-cylinder engine, the same for every team and supplied by Triumph, with about 138 hp and 6 gears. Minimum weight is 217 kg for bike and rider together. Top speed is over 300 km/h.",
        "spot": "Every bike has the same engine sound. The chassis and team colors are what differ."
      }
    ],
    "rule": "Moto2 sits between the other two classes: bigger than Moto3's 250cc single and smaller than MotoGP's 1000cc four-cylinder prototypes. Moto2 and Moto3 both use standard throttle electronics.",
    "watch": {
      "practice": "Riders and teams set up the bikes for the weekend.",
      "qualifying": "Qualifying sets the grid. With one engine for everyone, the difference is the riders and the chassis.",
      "race": "Every bike has the same engine, so the riders and the chassis decide the race."
    },
    "fine": "A spectator summary based on MotoGP.com's class guide (What is the difference between MotoGP, Moto2 and Moto3, April 2025). Figures are from that guide. For official details, see motogp.com."
  },
  {
    "id": "moto3", "noWatch": true,
    "match": /Moto3/i,
    "name": "Moto3",
    "tag": "The entry class of Grand Prix motorcycle racing",
    "blurb": "Moto3 is the lightweight entry class of the MotoGP world championship, started in 2012 to replace the 125cc class. The focus is on developing young talent: the bikes are small and light, so the racing is tight, with big groups slipstreaming each other lap after lap.",
    "cars": [
      {
        "n": "M3",
        "full": "Moto3 bike",
        "type": "250cc single-cylinder prototype",
        "c": "#6B4FBB",
        "fg": "#FFFFFF",
        "text": "250cc single-cylinder engine with about 60 hp and 6 gears. Minimum weight is 152 kg for bike and rider together. Top speed is about 245 km/h. The engines and chassis are prototypes, with narrow tyres.",
        "spot": "The smallest bikes on the MotoGP weekend, with narrow tyres."
      }
    ],
    "rule": "The normal path to MotoGP is Moto3, then Moto2, then MotoGP. Moto3 bikes are the smallest and lightest of the three classes.",
    "watch": {
      "practice": "Riders learn the track and set up their bikes.",
      "qualifying": "Qualifying sets the grid for the race.",
      "race": "Small, light bikes racing close together, where slipstreaming matters a lot."
    },
    "fine": "A spectator summary based on MotoGP.com's class guide (What is the difference between MotoGP, Moto2 and Moto3, April 2025). Figures are from that guide. For official details, see motogp.com."
  },
  {
    "id": "gt2europe", "noWatch": true,
    "match": /GT2 European/i,
    "name": "GT2 European Series powered by Pirelli",
    "tag": "Powerful, simpler GT cars built for amateur drivers",
    "blurb": "Run by SRO, the GT2 European Series is built to bring amateur drivers back to the centre of GT racing, with world-class cars run by professional teams. A GT2 car makes more outright power than a GT3 but depends less on aerodynamics for its lap time, which makes it friendlier for an amateur to drive. It sits between GT4 and GT3 and races at GT World Challenge Europe weekends.",
    "cars": [
      {
        "n": "S",
        "full": "Silver",
        "type": "Class (new in 2026)",
        "c": "#8C96A3",
        "fg": "#1A1A1A",
        "text": "The class created for 2026 for drivers one step up from the amateur classes."
      },
      {
        "n": "PA",
        "full": "Pro-Am",
        "type": "Class",
        "c": "#C27A1E",
        "fg": "#FFFFFF",
        "text": "An amateur driver (FIA Bronze or SRO Bronze Plus) shares the car with a professional, which lets the amateur learn from the pro."
      },
      {
        "n": "M",
        "full": "Masters",
        "type": "Class (formerly Am)",
        "c": "#2F6DB5",
        "fg": "#FFFFFF",
        "text": "The amateur class. A scale of handicap weight is applied to Bronze Plus drivers or pairings."
      }
    ],
    "rule": "The classes are about the drivers, not the cars: several makes race together, including Audi, Brabham, Ginetta, KTM, Lamborghini, Maserati, Mercedes-AMG and Porsche for 2026. Cars are of different shapes and brands, so use the class letter on the timing screens.",
    "watch": {
      "practice": "Teams and amateur drivers get track time, and pro drivers coach in Pro-Am cars.",
      "qualifying": "Sets the grid for the two races of the weekend.",
      "race": "Powerful cars with a mix of professional and amateur drivers, and a mandatory pit stop. Each class has its own winner."
    },
    "fine": "A spectator summary based on SRO's series page and the series' 2026 announcement (sro-motorsports.com, gt2europeanseries.com). Classes and rules are set each season. For official details, see gt2europeanseries.com."
  },
  {
    "id": "gt4europe", "noWatch": true,
    "match": /GT4 European/i,
    "name": "GT4 European Series",
    "tag": "Production-based GT cars, a stepping stone to GT3",
    "blurb": "Run by SRO, the GT4 European Series offers value for money to professional and amateur drivers alike. It is a stepping stone towards GT3 for young drivers, while amateurs can race on some of Europe's best tracks. SRO sets the Balance of Performance so cars from many brands race fairly, and the races use rolling starts. It runs on GT World Challenge Europe weekends.",
    "cars": [
      {
        "n": "S",
        "full": "Silver Cup",
        "type": "Class",
        "c": "#8C96A3",
        "fg": "#1A1A1A",
        "text": "The Silver driver-grade class, listed first on the 2026 entry list."
      },
      {
        "n": "PA",
        "full": "Pro-Am Cup",
        "type": "Class",
        "c": "#C27A1E",
        "fg": "#FFFFFF",
        "text": "A mixed pairing of professional and amateur drivers."
      },
      {
        "n": "A",
        "full": "Am Cup",
        "type": "Class",
        "c": "#2F6DB5",
        "fg": "#FFFFFF",
        "text": "The amateur class."
      }
    ],
    "rule": "All cars are GT4 cars from many manufacturers, balanced by SRO, and they race together. The classes are set by driver rating (Silver, Pro-Am, Am), not by car.",
    "watch": {
      "practice": "GT4 cars from many manufacturers on track together.",
      "qualifying": "Sets the grid for the weekend's races.",
      "race": "Cars from many brands racing together, with the result also counted by class."
    },
    "fine": "A spectator summary based on SRO's series page (sro-motorsports.com) and the series' 2026 entry list as reported by Daily Sportscar. Race lengths and pairing rules are not stated here: see gt4europeanseries.com."
  },
  {
    "id": "mclarentrophy", "noWatch": true,
    "match": /McLaren Trophy Europe/i,
    "name": "McLaren Trophy Europe",
    "tag": "One-make McLaren Artura race cars",
    "blurb": "A one-make championship organised by SRO in which every driver races an identical McLaren Artura Trophy Evo, designed to put driving talent first. The 2026 championship is ten races over five weekends, each race lasting 50 minutes. It runs at SRO Europe weekends.",
    "cars": [
      {
        "n": "PRO",
        "full": "Pro",
        "type": "Class",
        "c": "#E85D04",
        "fg": "#FFFFFF",
        "text": "Professional drivers racing for the overall result."
      },
      {
        "n": "PA",
        "full": "Pro-Am",
        "type": "Class",
        "c": "#C27A1E",
        "fg": "#FFFFFF",
        "text": "A professional paired with an amateur."
      },
      {
        "n": "AM",
        "full": "Am",
        "type": "Class",
        "c": "#2F6DB5",
        "fg": "#FFFFFF",
        "text": "Amateur drivers only."
      }
    ],
    "rule": "Every car is an identical McLaren Artura Trophy Evo, so classes are about the drivers, not the cars. The Evo has more aero and wider tyres than before, and a push-to-pass system that lifts power from 585 PS to 620 PS when used.",
    "watch": {
      "practice": "Identical cars, so teams and drivers focus on setup and finding the limit.",
      "qualifying": "Sets the grid for the weekend's two races.",
      "race": "Fifty minutes with identical cars, so overtaking and push-to-pass timing decide the result."
    },
    "fine": "A spectator summary based on McLaren's 2026 Trophy Europe championship brochure and SRO. For official details, see the McLaren Trophy Europe website."
  },
  {
    "id": "gt3revival", "noWatch": true,
    "match": /GT3 Revival/i,
    "name": "GT3 Revival Series",
    "tag": "The first generation of GT3 cars, 2006 to 2013",
    "blurb": "A series run by Peter Auto and SRO, reserved for the first wave of FIA GT3 cars homologated from 2006 through 2013. 2026 marks the 20th anniversary of GT3, which now underpins every major GT and endurance championship. At the 2026 24 Hours of Spa weekend it was announced as part of the 2027 support programme.",
    "cars": [
      {
        "n": "GT3",
        "full": "First-generation GT3",
        "type": "FIA GT3 cars, 2006 to 2013",
        "c": "#1F8A5B",
        "fg": "#FFFFFF",
        "text": "The earliest GT3 cars, now historic. Cars from many manufacturers, from the first generation of the GT3 rules.",
        "spot": "GT3 race cars of the early generation."
      }
    ],
    "rule": "Only the first wave of GT3 cars is allowed (homologated 2006 to 2013), so expect a mixed field of earlier-generation cars from many brands.",
    "watch": {
      "practice": "A chance to see the cars that started the GT3 era.",
      "qualifying": "Sets the grid for the races.",
      "race": "Early GT3 cars from many manufacturers racing together."
    },
    "fine": "A spectator summary based on SRO's announcement of the GT3 Revival Series (sro-motorsports.com). For official details, see the series' pages on SRO."
  }
];

/* Official live-timing pages for series that have event listings but no SERIES guide yet (F1, NASCAR). Matched
   against an event's series name (its `s` field), so a race weekend with no session list still gets a link.
   Only official organizer pages go here, checked directly. The timing content on these pages appears during live
   sessions, the same as the GT World page. Add a row only after checking the page yourself. */
const TIMING_LINKS = [
  /* support series first: their sessions run on Formula 1 weekends, and each has its own timing (F1's covers only F1).
     Matched against the session on track, so the card switches when another series takes over. Checked Oct 23, 2026;
     Formula 3's exact timing address could not be confirmed, so it opens the F3 site, whose menu has Live Timing. */
  { match:/F1 Academy/i, name:"F1 Academy", url:"https://www.f1academy.com/About/Live-Timing" },
  { match:/Formula 2|\bF2\b/i, name:"Formula 2", url:"https://www.fiaformula2.com/livetiming/index.html" },
  { match:/Formula 3|\bF3\b/i, name:"Formula 3", url:"https://www.fiaformula3.com/" },
  { match:/Supercup/i, name:"Porsche Supercup", url:"https://racing.porsche.com/mobil-1-supercup/live-timing" },
  { match:/Formula 1/i, name:"Formula 1", url:"https://www.formula1.com/en/timing/f1-live-lite" },
  { match:/NASCAR/i, name:"NASCAR", url:"https://www.nascar.com/followlive/" },
  { match:/Carrera Cup/i, name:"Porsche Carrera Cup North America", url:"https://racing.porsche.com/en-US/live-timing/carrera-cup-north-america" },
  { match:/IMSA|WeatherTech|Pilot Challenge|VP Racing|MX-5|Super Trofeo/i, name:"IMSA", url:"https://www.imsa.com/scoring/" },
  { match:/GT World Challenge Europe|24 Hours of Spa/i, name:"GT World Challenge Europe", url:"https://www.gt-world-challenge-europe.com/watch-live#live-timing" },
  { match:/GT World Challenge America|GT America|GT4 America|TC America|Toyota GR Cup|Intercontinental GT/i, name:"GT World Challenge America", url:"https://www.gt-world-challenge-america.com/watch-live#live-timing" },
  { match:/INDYCAR|IndyCar/i, name:"INDYCAR", url:"https://racecontrol.indycar.com/" }
];
