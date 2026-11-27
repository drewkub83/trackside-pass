/* Breaking news pop-up (js/app.js: maybeNews). One row per story, newest last. Written by the "What to watch dispatcher" routine (or by hand) ONLY for big, certain news:
   a title clinched, a driver or team announcing retirement or a move, a race or session cancelled, postponed or abandoned, a major rule or points ruling.
   { id: unique slug, at: "YYYY-MM-DDTHH:MM:SSZ" (when we wrote it), s: champ id in data/champs.js (the pop-up shows only to people who follow it), h: headline (10-90 chars),
     b: one or two plain sentences (30-240 chars) of facts that the source states, u: https link to a story from a reliable source that is FREE to read (the series' own site first; no paywall, no login), src: the site's name }.
   A story shows once per phone, for 3 days after `at`. Never invent facts; take them from the linked story. */
const NEWS = [
  { id:"motogp-marquez-retires-2026-11-27", at:"2026-11-27T11:30:00Z", s:"motogp",
    h:"Marc Marquez announces his retirement from MotoGP",
    b:"The reigning champion, an eight-time world champion, announced in the Ducati Lenovo Team box at the start of Valencia FP1 that 2026 is his last season. MotoGP describes this Valencia weekend as his final one.",
    u:"https://www.motogp.com/en/news/2026/11/27/marc-marquez-announces-retirement-from-motogp/1268528", src:"MotoGP.com" }
];
