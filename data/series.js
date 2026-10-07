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
    id:"weathertech", match:/WeatherTech Championship|Petit Le Mans|Rolex 24|Twelve Hours/i, timing:"https://www.imsa.com/scoring/",
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
    id:"pilot", match:/Pilot Challenge|FOX Factory 120/i, timing:"https://www.imsa.com/scoring/",
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
    id:"carrera", match:/Carrera Cup/i, yt:"UCch613iK0dXuGLlvFSePzwA", timing:"https://www.imsa.com/scoring/",
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
    id:"lambo", match:/Super Trofeo/i, timing:"https://www.imsa.com/scoring/",
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
    id:"indycar", match:/INDYCAR|IndyCar/i, timing:"https://racecontrol.indycar.com/",
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
    id:"gtwca", match:/GT World Challenge America|Texas 8 Hour/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
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
    id:"gtwce", match:/GT World Challenge Europe|24 Hours of Spa/i, yt:"UC-yHapH6mW1ceZ_5PDUf1_g", timing:"https://www.gt-world-challenge-europe.com/watch-live#live-timing",
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
  id:"gt4a", match:/GT4 America/i, timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
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
  id:"tca", match:/TC America/i, timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
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
  id:"grcup", match:/Toyota GR Cup/i, timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
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
  id:"gta", match:/GT America/i, timing:"https://www.gt-world-challenge-america.com/watch-live#live-timing",
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
];

/* Official live-timing pages for series that have event listings but no SERIES guide yet (F1, NASCAR). Matched
   against an event's series name (its `s` field), so a race weekend with no session list still gets a link.
   Only official organizer pages go here, checked directly. The timing content on these pages appears during live
   sessions, the same as the GT World page. Add a row only after checking the page yourself. */
const TIMING_LINKS = [
  { match:/Formula 1/i, name:"Formula 1", url:"https://www.formula1.com/en/timing/f1-live-lite" },
  { match:/NASCAR/i, name:"NASCAR", url:"https://www.nascar.com/followlive/" },
  { match:/IMSA|WeatherTech|Pilot Challenge|VP Racing|MX-5|Carrera Cup|Super Trofeo/i, name:"IMSA", url:"https://www.imsa.com/scoring/" },
  { match:/GT World Challenge Europe|24 Hours of Spa/i, name:"GT World Challenge Europe", url:"https://www.gt-world-challenge-europe.com/watch-live#live-timing" },
  { match:/GT World Challenge America|GT America|GT4 America|TC America|Toyota GR Cup|Intercontinental GT/i, name:"GT World Challenge America", url:"https://www.gt-world-challenge-america.com/watch-live#live-timing" },
  { match:/INDYCAR|IndyCar/i, name:"INDYCAR", url:"https://racecontrol.indycar.com/" }
];
