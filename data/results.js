/* How it finished, one entry per completed race weekend. Written after official results are posted.
   t = track id, d = first day of the event that just finished, event = its name, groups = [{h: class or
   series, winner: "car/team, drivers", gap: margin or note, podium: ["2nd", "3rd", ...]}].
   Shown in place of the pre-race "cars to watch" list once an event is over. Facts are only what
   published race reports said -- never guessed or inferred from standings. */
const RESULTS = [
  { t:"indianapolis", d:"2026-09-18", event:"TireRack.com Battle on the Bricks",
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
    note:"Source: IMSA.com race report, Sportscar365 and Daily Sportscar post-race notebooks, motorsport.com." }
];
