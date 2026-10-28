/* Championships shown on the home screen, one entry per series.
   region: "na" or "eu" (see REGIONS): the home list groups followed series under region headings once they span more than one.
   match/skip: how a race is found in a track's `events` (by its series text `s`) -- or, for a support series
          (viaSupport:true), by the event's `support` list instead, since it never headlines its own weekend.
   parent: for a support series, the main series whose weekends it races at; Settings groups the support series under it
          ("With <group or name of the parent>").
   optIn: a series that is off by default: either a support series that rides along with a main series, or a niche series
          (HSR) with its own weekends. The fan turns it on in Settings ("Series I follow") if they actually follow it.
          Never shown in the home hero's "X + Y" headline, and it stays off the home screen until turned on.
   stops: venues that are on the series schedule but have no map yet. They show in that series' list as "Map coming soon"
          and disappear from here automatically once a track with the same id is added to data/.
   showAll: also list every other venue in the app as "date to be announced" (IMSA does this).
   Sources: INDYCAR.com (2027 schedule: Phase One Aug 12, Phase Two Oct 23, 2026), IMSA.com, SRO America (provisional 2027 calendar, June 26, 2026),
   GT World Challenge Europe (gt-world-challenge-europe.com calendar, checked Oct 7, 2026). */
/* the day schedules, lists of cars and drivers to watch and support races were last checked (shown in Settings). Update it whenever they are refreshed. */
const DATA_UPDATED = "2026-10-24";
/* categories of the Series tab (tile = the short text on its tile, like a series' tile). Every series carries cat:"<id>". Once you follow 5 or more series
   across 2 or more categories the tab lists categories and opens a category's series inside it; with fewer it stays one plain list. */
const CATS = [
  { id:"openwheel", name:"Open-wheel", tile:"OPEN" },
  { id:"endurance", name:"Endurance", tile:"ENDU" },
  { id:"gt", name:"GT", tile:"GT" },
  { id:"onemake", name:"One-make and touring", tile:"ONE" },
  { id:"historic", name:"Historic", tile:"HIST" },
  { id:"stock", name:"Stock car", tile:"STOCK" }
];
const REGIONS = { na:"North America", eu:"Europe", world:"Worldwide" };   /* add a key here (and region:"…" on its series) when a new part of the world is added */
const CHAMPS = [
  { id:"imsa", cat:"endurance", region:"na", name:"IMSA", tile:"IMSA", full:"WeatherTech SportsCar Championship", match:/IMSA/i, skip:/test/i, guide:"weathertech",
    note:"Every venue on the 2027 IMSA WeatherTech schedule, including the Long Beach and Detroit street circuits and Canadian Tire Motorsport Park, plus Mid-Ohio." },
  { id:"indycar", cat:"openwheel", region:"na", name:"IndyCar", tile:"INDY", full:"NTT INDYCAR SERIES", match:/INDYCAR/i, guide:"indycar",
    note:"The full 2027 season: 17 races, announced in two phases (Aug 12 and Oct 23, 2026). Race weekends run Friday to Sunday (Milwaukee has a race on both Saturday and Sunday). Session times come once INDYCAR publishes them; venues without a map show Map coming soon.",
    stops:[
      { id:"st-petersburg", short:"St. Petersburg", place:"St. Petersburg, Florida", kind:"Street circuit", e:"Firestone Grand Prix of St. Petersburg", d:"2027-03-05", t:3 },
      { id:"arlington",     short:"Arlington",      place:"Arlington, Texas",        kind:"Street circuit", e:"Java House Grand Prix of Arlington",     d:"2027-03-19", t:3 },
      { id:"wwt-raceway",    short:"WWT Raceway",    place:"Madison, Illinois",       kind:"Oval",           e:"NTT INDYCAR SERIES at World Wide Technology Raceway", d:"2027-06-11", t:3 },
      { id:"portland",       short:"Portland",       place:"Portland, Oregon",        kind:"Road course",    e:"NTT INDYCAR SERIES at Portland International Raceway", d:"2027-07-30", t:3 },
      { id:"markham",        short:"Markham",        place:"Markham, Ontario",        kind:"Street circuit", e:"NTT INDYCAR SERIES: Streets of Markham", d:"2027-08-13", t:3 },
      { id:"milwaukee-mile", short:"Milwaukee Mile", place:"West Allis, Wisconsin",   kind:"Oval",           e:"NTT INDYCAR SERIES at the Milwaukee Mile (races on Saturday and Sunday)", d:"2027-08-27", t:3 }
    ] },
  { id:"gtwca", cat:"gt", region:"na", name:"GT World America", group:"GT World America", tile:"GTWA", full:"GT World Challenge America Powered by AWS", match:/GT World Challenge America|Texas 8 Hour/i, guide:"gtwca",
    note:"Barber (Sep 25-27) and the Indianapolis 8 Hour (Oct 9-11) finish the 2026 season. Then the provisional 2027 calendar: seven rounds, including the first Texas 8 Hour at Circuit of the Americas and the return of Watkins Glen. Dates can still change.",
    stops:[
      { id:"sonoma", short:"Sonoma", place:"Sonoma, California", kind:"Road course", e:"GT World Challenge America", d:"2027-04-02", t:3 },
      { id:"cota",   short:"COTA", place:"Austin, Texas", kind:"Road course", e:"Texas 8 Hour", d:"2027-05-07", t:3 }
    ] },
  { id:"gtwce", cat:"gt", region:"eu", name:"GT World Europe", tile:"GTWE", full:"GT World Challenge Europe Powered by AWS", match:/GT World Challenge Europe|24 Hours of Spa/i, guide:"gtwce",
    note:"Portimão finishes the 2026 season (Oct 15-18). The 2027 calendar is ten rounds across Europe, five Endurance Cup and five Sprint Cup, with the CrowdStrike 24 Hours of Spa as the marquee event. Dates come from GT World's published calendar. Circuits show Map coming soon until their maps are added.",
    stops:[
      { id:"portimao",            short:"Portimão",          place:"Portimão, Portugal",            kind:"Road course", e:"GT World Challenge Europe: Portimão (Endurance Cup finale)", d:"2026-10-15", t:4 },
      { id:"paul-ricard",         short:"Paul Ricard",       place:"Le Castellet, France",          kind:"Road course", e:"GT World Challenge Europe: Paul Ricard (Endurance Cup)",     d:"2027-04-15", t:4 },
      { id:"brands-hatch",        short:"Brands Hatch",      place:"Kent, England",                 kind:"Road course", e:"GT World Challenge Europe: Brands Hatch (Sprint Cup)",       d:"2027-05-01", t:2 },
      { id:"imola",               short:"Imola",             place:"Imola, Italy",                  kind:"Road course", e:"GT World Challenge Europe: Imola (Endurance Cup)",           d:"2027-05-21", t:3 },
      { id:"spa-francorchamps",   short:"Spa-Francorchamps", place:"Stavelot, Belgium",             kind:"Road course", e:"CrowdStrike 24 Hours of Spa",                                d:"2027-06-24", t:4 },
      { id:"misano",              short:"Misano",            place:"Misano Adriatico, Italy",       kind:"Road course", e:"GT World Challenge Europe: Misano (Sprint Cup)",             d:"2027-07-16", t:3 },
      { id:"magny-cours",         short:"Magny-Cours",       place:"Magny-Cours, France",           kind:"Road course", e:"GT World Challenge Europe: Magny-Cours (Sprint Cup)",        d:"2027-07-30", t:3 },
      { id:"nurburgring",         short:"Nürburgring",       place:"Nürburg, Germany",              kind:"Road course", e:"GT World Challenge Europe: Nürburgring (Endurance Cup)",     d:"2027-08-27", t:3 },
      { id:"zandvoort",           short:"Zandvoort",         place:"Zandvoort, Netherlands",        kind:"Road course", e:"GT World Challenge Europe: Zandvoort (Sprint Cup)",          d:"2027-09-17", t:3 },
      { id:"hungaroring",         short:"Hungaroring",       place:"Budapest, Hungary",             kind:"Road course", e:"GT World Challenge Europe: Budapest (Sprint Cup)",           d:"2027-10-01", t:3 },
      { id:"barcelona-catalunya", short:"Barcelona",         place:"Montmeló, Spain",               kind:"Road course", e:"GT World Challenge Europe: Barcelona (Endurance Cup)",       d:"2027-10-22", t:3 }
    ] },
  { id:"carreracup", cat:"onemake", region:"na", name:"Porsche Carrera Cup", tile:"CARR", full:"Porsche Carrera Cup North America", match:/Porsche Carrera Cup/i, viaSupport:true, optIn:true, parent:"imsa", guide:"carrera",
    note:"Races as a support series at IMSA WeatherTech weekends. Its own dates and venues follow that weekend's schedule." },
  { id:"pilotchallenge", cat:"onemake", region:"na", name:"Pilot Challenge", tile:"PILOT", full:"Michelin Pilot Challenge", match:/Michelin Pilot Challenge/i, viaSupport:true, optIn:true, parent:"imsa", guide:"pilot",
    note:"Races as a support series at IMSA WeatherTech weekends. Its own dates and venues follow that weekend's schedule." },
  { id:"vpracing", cat:"endurance", region:"na", name:"VP Racing SportsCar Challenge", tile:"VP", full:"IMSA VP Racing SportsCar Challenge", match:/VP Racing/i, viaSupport:true, optIn:true, parent:"imsa", guide:"vp",
    note:"IMSA's LMP3 and GT4 series. 2027 (sportscar365.com, new format): Mid-Ohio Jun 11-13 and Lime Rock Sep 23-25 with Pilot Challenge, plus Watkins Glen Jul 2-4 and Road Atlanta Sep 10-12, which have no event in the app yet; a Road America date is still to be confirmed." },
  { id:"mx5", cat:"onemake", region:"na", name:"Mazda MX-5 Cup", tile:"MX-5", full:"Whelen Mazda MX-5 Cup", match:/MX-5/i, viaSupport:true, optIn:true, parent:"imsa", guide:"mx5",
    note:"Races at IMSA weekends. The 2027 schedule has not been published yet." },
  { id:"lambo", cat:"onemake", region:"na", name:"Lamborghini Super Trofeo", tile:"LAMBO", full:"Lamborghini Super Trofeo North America", match:/Super Trofeo/i, viaSupport:true, optIn:true, parent:"imsa", guide:"lambo",
    note:"Races at IMSA WeatherTech weekends. 2027 (IMSA, Sep 24, 2026): Sebring, Laguna Seca, Watkins Glen, Road America and Indianapolis, then the World Finals (venue to be announced)." },
  { id:"gtamerica", cat:"gt", region:"na", name:"GT America", tile:"GTA", full:"GT America powered by AWS", match:/(^|\| )GT America/i, viaSupport:true, optIn:true, parent:"gtwca", guide:"gta",
    note:"SRO America series that races at GT World Challenge America weekends. Which 2027 rounds it joins has not been published round by round yet." },
  { id:"gt4america", cat:"gt", region:"na", name:"GT4 America", tile:"GT4", full:"Pirelli GT4 America", match:/GT4 America/i, viaSupport:true, optIn:true, parent:"gtwca", guide:"gt4a",
    note:"SRO America series that races at GT World Challenge America weekends. Which 2027 rounds it joins has not been published round by round yet." },
  { id:"tcamerica", cat:"onemake", region:"na", name:"TC America", tile:"TCA", full:"TC America powered by Skip Barber", match:/TC America/i, viaSupport:true, optIn:true, parent:"gtwca", guide:"tca",
    note:"SRO America touring-car series at GT World Challenge America weekends. Which 2027 rounds it joins has not been published round by round yet." },
  { id:"grcup", cat:"onemake", region:"na", name:"Toyota GR Cup", tile:"GR", full:"Toyota GR Cup North America", match:/GR Cup/i, viaSupport:true, optIn:true, parent:"gtwca", guide:"grcup",
    note:"One-make Toyota GR86 series, mostly at GT World Challenge America weekends. 2027 (Toyota Gazoo Racing, June 26, 2026): seven weekends: Arlington (with IndyCar), Sonoma, COTA, Watkins Glen (its first visit), Road Atlanta, Road America and Indianapolis, the finale." },
  { id:"gt2europe", cat:"gt", region:"eu", name:"GT2 European Series", tile:"GT2", full:"GT2 European Series powered by Pirelli", match:/GT2 European/i, viaSupport:true, optIn:true, parent:"gtwce",
    note:"2027 (gt2europeanseries.com): five weekends with GT World Challenge Europe: Paul Ricard, Imola, Misano, Nürburgring and the Hungaroring finale." },
  { id:"gt4europe", cat:"gt", region:"eu", name:"GT4 European Series", tile:"GT4E", full:"GT4 European Series", match:/GT4 European/i, viaSupport:true, optIn:true, parent:"gtwce",
    note:"Races at GT World Challenge Europe weekends. Only the 2027 Paul Ricard opener and the 24 Hours of Spa are confirmed so far." },
  { id:"mclarentrophy", cat:"gt", region:"eu", name:"McLaren Trophy Europe", tile:"MCL", full:"McLaren Trophy Europe", match:/McLaren Trophy Europe/i, viaSupport:true, optIn:true, parent:"gtwce",
    note:"One-make McLaren Artura series at SRO Europe weekends. Its full 2027 calendar has not been published (two rounds will support the 24 Hours of Le Mans, which is not in the app)." },
  { id:"gt3revival", cat:"historic", region:"eu", name:"GT3 Revival Series", tile:"REV", full:"GT3 Revival Series", match:/GT3 Revival/i, viaSupport:true, optIn:true, parent:"gtwce",
    note:"GT3 cars from the 2006-2014 era, at the 24 Hours of Spa weekend." },
  { id:"f2", cat:"openwheel", region:"world", name:"Formula 2", tile:"F2", full:"FIA Formula 2 Championship", match:/Formula 2/i, viaSupport:true, optIn:true, parent:"f1", guide:"f2",
    note:"The last step before Formula 1, at 14 Grand Prix weekends. 2026 ends at Qatar and Abu Dhabi. 2027 (FIA, Oct 2026): Bahrain, Jeddah, Melbourne, Montreal (subject to contract), Monaco, Silverstone, Spielberg, Monza, Madrid, Baku, Istanbul, Mexico City, Qatar and Abu Dhabi." },
  { id:"f3", cat:"openwheel", region:"world", name:"Formula 3", tile:"F3", full:"FIA Formula 3 Championship", match:/Formula 3/i, viaSupport:true, optIn:true, parent:"f1", guide:"f3",
    note:"2027 (FIA, Oct 2026): 10 Grand Prix weekends, Bahrain to an Istanbul finale (Istanbul subject to circuit homologation). The 2026 season is over." },
  { id:"supercup", cat:"onemake", region:"world", name:"Porsche Supercup", tile:"SUPR", full:"Porsche Mobil 1 Supercup", match:/Supercup/i, viaSupport:true, optIn:true, parent:"f1",
    note:"Porsche 911 GT3 Cup cars at European Grand Prix weekends. The 2027 calendar is preliminary: Monaco, Portimão, Spielberg, Spa, Budapest, Monza, Istanbul and a Madrid finale. The 2026 season is over." },
  { id:"f1academy", cat:"openwheel", region:"world", name:"F1 Academy", tile:"F1A", full:"F1 Academy", match:/F1 Academy/i, viaSupport:true, optIn:true, parent:"f1", guide:"f1academy",
    note:"Formula 1's all-women series. 2026 ends at Austin and Las Vegas; the 2027 calendar has not been published yet." },
  { id:"masters", cat:"historic", region:"world", name:"Masters Historic", tile:"HIST", full:"Masters Historic Racing", match:/Masters Historic/i, viaSupport:true, optIn:true, parent:"f1", guide:"masters",
    note:"Historic Formula 1 cars at selected Grand Prix weekends." },
  { id:"hsr", cat:"historic", region:"na", name:"HSR", tile:"HSR", full:"Historic Sportscar Racing", match:/HSR/i, optIn:true,
    note:"Vintage and historic sports and race cars, with its own race weekends at Daytona, Sebring, Road Atlanta and Watkins Glen. Dates come from HSR's published schedule; several are still provisional and can change." }
  ,{ id:"wec", cat:"endurance", region:"world", name:"WEC", tile:"WEC", full:"FIA World Endurance Championship", match:/FIA WEC|World Endurance/i, guide:"wec",
    note:"The 2026 season ends at Monza (Nov 6-8). The 2027 calendar has nine rounds, from the Qatar 1812km (Mar 25-27) to the 8 Hours of Bahrain (Nov 4-6), with the 24 Hours of Le Mans in June. Dates and venues come from fiawec.com (checked Oct 26, 2026); the 2027 session times are not published yet. Le Mans and Fuji show Map coming soon until their maps are added.",
    stops:[
      { id:"le-mans", short:"Le Mans", place:"Le Mans, France", kind:"Road course", e:"24 Hours of Le Mans", d:"2027-06-12", t:2 },
      { id:"fuji", short:"Fuji", place:"Oyama, Shizuoka, Japan", kind:"Road course", e:"6 Hours of Fuji", d:"2027-09-24", t:3 }
    ] }
  ,{ id:"f1", cat:"openwheel", region:"world", name:"Formula 1", tile:"F1", full:"FIA Formula One World Championship", match:/Formula 1/i, guide:"f1",
    note:"The 2026 season has six races left, starting at Austin (Oct 23-25), where Mercedes' Kimi Antonelli leads the drivers' championship by 102 points. The 2027 calendar, announced Sep 16, 2026, has 24 Grands Prix from Bahrain (Mar 12-14) to Abu Dhabi (Dec 10-12), with Portimão returning and Spain moving to Madrid. Dates in the Middle East can still change. Circuits show Map coming soon until their maps are added.",
    stops:[
      { id:"mexico-city", short:"Mexico City", place:"Mexico City, Mexico", kind:"Road course", e:"Mexico City Grand Prix", d:"2026-10-30", t:3 },
      { id:"interlagos", short:"São Paulo", place:"São Paulo, Brazil", kind:"Road course", e:"São Paulo Grand Prix", d:"2026-11-06", t:3 },
      { id:"las-vegas", short:"Las Vegas", place:"Las Vegas, Nevada", kind:"Street circuit", e:"Las Vegas Grand Prix", d:"2026-11-19", t:3 },
      { id:"lusail", short:"Qatar", place:"Lusail, Qatar", kind:"Road course", e:"Qatar Grand Prix", d:"2026-11-27", t:3 },
      { id:"yas-marina", short:"Abu Dhabi", place:"Abu Dhabi, UAE", kind:"Road course", e:"Abu Dhabi Grand Prix", d:"2026-12-04", t:3 },
      { id:"bahrain", short:"Bahrain", place:"Sakhir, Bahrain", kind:"Road course", e:"Bahrain Grand Prix", d:"2027-03-12", t:3 },
      { id:"jeddah", short:"Saudi Arabia", place:"Jeddah, Saudi Arabia", kind:"Street circuit", e:"Saudi Arabian Grand Prix", d:"2027-03-19", t:3 },
      { id:"melbourne", short:"Australia", place:"Melbourne, Australia", kind:"Street circuit", e:"Australian Grand Prix", d:"2027-04-02", t:3 },
      { id:"suzuka", short:"Japan", place:"Suzuka, Japan", kind:"Road course", e:"Japanese Grand Prix", d:"2027-04-09", t:3 },
      { id:"shanghai", short:"China", place:"Shanghai, China", kind:"Road course", e:"Chinese Grand Prix", d:"2027-04-16", t:3 },
      { id:"miami", short:"Miami", place:"Miami Gardens, Florida", kind:"Road course", e:"Miami Grand Prix", d:"2027-04-30", t:3 },
      { id:"montreal", short:"Canada", place:"Montréal, Canada", kind:"Road course", e:"Canadian Grand Prix", d:"2027-05-21", t:3 },
      { id:"monaco", short:"Monaco", place:"Monte Carlo, Monaco", kind:"Street circuit", e:"Monaco Grand Prix", d:"2027-06-04", t:3 },
      { id:"silverstone", short:"Great Britain", place:"Silverstone, England", kind:"Road course", e:"British Grand Prix", d:"2027-07-02", t:3 },
      { id:"red-bull-ring", short:"Austria", place:"Spielberg, Austria", kind:"Road course", e:"Austrian Grand Prix", d:"2027-07-09", t:3 },
      { id:"monza", short:"Italy", place:"Monza, Italy", kind:"Road course", e:"Italian Grand Prix", d:"2027-09-03", t:3 },
      { id:"madrid", short:"Spain", place:"Madrid, Spain", kind:"Street circuit", e:"Spanish Grand Prix", d:"2027-09-10", t:3 },
      { id:"baku", short:"Azerbaijan", place:"Baku, Azerbaijan", kind:"Street circuit", e:"Azerbaijan Grand Prix", d:"2027-09-24", t:3 },
      { id:"istanbul", short:"Turkey", place:"Istanbul, Turkey", kind:"Road course", e:"Turkish Grand Prix", d:"2027-10-01", t:3 },
      { id:"marina-bay", short:"Singapore", place:"Singapore", kind:"Street circuit", e:"Singapore Grand Prix", d:"2027-10-08", t:3 }
    ] }
  ,{ id:"nascar", cat:"stock", region:"na", name:"NASCAR", tile:"NASCAR", full:"NASCAR Cup Series", match:/NASCAR/i, guide:"nascar",
    note:"NASCAR's 2027 Cup Series schedule (36 points races plus the Clash and the All-Star Race) was released on Aug 26, 2026; the 2026 season ends at Martinsville (Nov 1) and the Championship at Homestead-Miami (Nov 8). Venues without a map show Map coming soon; session times come once NASCAR publishes them.",
    stops:[
      { id:"homestead-miami", short:"Homestead-Miami", place:"Homestead, Florida", kind:"Oval", e:"NASCAR Championship", d:"2026-11-06", t:3 },
      { id:"north-wilkesboro", short:"North Wilkesboro", place:"North Wilkesboro, North Carolina", kind:"Oval", e:"NASCAR All-Star Race", d:"2027-05-21", t:3 },
      { id:"naval-base-coronado", short:"San Diego", place:"Coronado, California", kind:"Street circuit", e:"NASCAR San Diego", d:"2027-07-30", t:3 },
      { id:"homestead-miami", short:"Homestead-Miami", place:"Homestead, Florida", kind:"Oval", e:"NASCAR Championship", d:"2027-11-12", t:3 }    ] }
];
