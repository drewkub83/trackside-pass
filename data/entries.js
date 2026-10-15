/* Entry lists for "Pick your podium" (js/app.js). One entry per series per weekend: { t: track id, d: event start day,
   s: series id (SERIES in data/series.js), asOf, classes: [{ h: class (must match the class name used for that race in
   data/results.js), cars: [[car number, team, drivers, car, estimated win chance %, basis, form (0-1, used to rebuild the chances from the live qualifying grid)], ...] }], live?:{round} (the series' round slug: switches on the live results card), note }. Copy the series' OWN published entry list --
   never guess. The last two fields are OUR estimate, written by tools/podium_odds.py from the series' standings (not betting odds). Scoring matches the picked car NUMBER against the "#NN" in data/results.js. */
const ENTRIES = [
  { t:"portimao", d:"2026-10-15", s:"gtwce", live:{round:"portimao"}, oddsAsOf:"Before qualifying: close to even, tilted slightly by this season's Endurance Cup finishes. They sharpen once qualifying is in.", asOf:"Official entry list as published on gt-world-challenge-europe.com (read Oct 14, 2026). Late changes are possible.",
    classes:[
      { h:"Pro", cars:[
        ["2", "Boutsen VDS", "Morris Schuring / Dorian Boccolacci / Alessio Picariello", "Porsche 911 GT3 R (992) EVO", 5.2, "averaged top 46% of class in 4 Endurance Cup races this year", 0.526],
        ["3", "Mercedes - AMG Team Verstappen Racing", "Max Verstappen / Ben Barnicoat / Chris Lulham", "Mercedes-AMG GT3 EVO", 6.7, "averaged top 28% of class in 2 Endurance Cup races this year", 0.612],
        ["7", "Comtoyou Racing", "Mattia Drudi / Nicki Thiim / Ross Gunn", "Aston Martin Vantage AMR GT3 EVO", 10.2, "averaged top 0% of class in 2 Endurance Cup races this year", 0.75],
        ["17", "Mercedes - AMG Team GetSpeed", "Ralf Aron / Maximilian Götz / Fabian Schiller", "Mercedes-AMG GT3 EVO", 6.5, "averaged top 30% of class in 2 Endurance Cup races this year", 0.598],
        ["20", "Team Motopark", "Nikita Mazepin / Dominik Baumann / Philip Ellis", "Mercedes-AMG GT3 EVO", 5.0, "averaged top 45% of class in 1 Endurance Cup race this year", 0.515],
        ["32", "Team WRT", "Kelvin Van Der Linde / Jordan Pepper / Charles Weerts", "BMW M4 GT3 EVO", 4.6, "averaged top 53% of class in 4 Endurance Cup races this year", 0.482],
        ["34", "natural elements by Walkenhorst Motorsport", "Jamie Day / Christian Krognes / Henrique Chaves", "Aston Martin Vantage AMR GT3 EVO", 3.4, "averaged top 69% of class in 3 Endurance Cup races this year", 0.384],
        ["46", "Team WRT", "Neil Verhagen / Max Hesse / Valentino Rossi", "BMW M4 GT3 EVO", 5.0, "averaged top 48% of class in 3 Endurance Cup races this year", 0.511],
        ["48", "Mercedes - AMG Team MANN-FILTER", "Lucas Auer / Luca Stolz / Maro Engel", "Mercedes-AMG GT3 EVO", 10.9, "averaged top 9% of class in 4 Endurance Cup races this year", 0.774],
        ["50", "AF Corse", "Lilou Wadoux / Arthur Leclerc / Albert Costa", "Ferrari 296 GT3 EVO", 3.3, "averaged top 69% of class in 4 Endurance Cup races this year", 0.374],
        ["51", "AF Corse", "Tommaso Mosca / Lorenzo Ferrari / Nicola Lacorte", "Ferrari 296 GT3 EVO", 4.4, "averaged top 55% of class in 3 Endurance Cup races this year", 0.469],
        ["59", "Garage 59", "Joseph Loake / Dean Macdonald / Jack Hawksworth", "McLaren 720S GT3 EVO", 6.2, "averaged top 33% of class in 2 Endurance Cup races this year", 0.587],
        ["60", "JMW Motorsport", "Tba / Tba / Tba", "Ferrari 296 GT3 EVO", 3.9, "averaged top 64% of class in 2 Endurance Cup races this year", 0.431],
        ["63", "TGI Team by GRT", "Franck Perera / Maximilian Paul / Mirko Bortolotti", "Lamborghini Temerario GT3", 3.0, "averaged top 81% of class in 2 Endurance Cup races this year", 0.346],
        ["64", "HRT Ford Racing", "Arjun Maini / Fabio Scherer / Thomas Drouet", "Ford Mustang GT3 EVO", 4.2, "averaged top 58% of class in 2 Endurance Cup races this year", 0.458],
        ["80", "Lionspeed GP", "Ricardo Feller / Thomas Preining / Bastian Buus", "Porsche 911 GT3 R (992) EVO", 6.7, "averaged top 28% of class in 2 Endurance Cup races this year", 0.609],
        ["84", "Eastalent Racing", "Christopher Haase / Simon Reicher / Markus Winkelhock", "Audi R8 LMS GT3 EVO II", 3.5, "averaged top 71% of class in 2 Endurance Cup races this year", 0.393],
        ["96", "Rutronik Racing", "Patric Niederhauser / Marco Mapelli / Luca Engstler", "Lamborghini Temerario GT3", 3.2, "averaged top 73% of class in 3 Endurance Cup races this year", 0.364],
        ["98", "Rowe Racing", "Philipp Eng / Jake Dennis / Marco Wittmann", "BMW M4 GT3 EVO", 4.1, "averaged top 58% of class in 4 Endurance Cup races this year", 0.449]
      ] },
      { h:"Gold", cars:[
        ["4", "Optimum Motorsport", "Adam Smalley / Freddie Tomlinson / Harry George", "McLaren 720S GT3 EVO", 6.6, "averaged top 78% of class in 3 Endurance Cup races this year", 0.333],
        ["10", "Boutsen VDS", "Alessandro Ghiretti / Robin Knutsson / Gilles Magnus", "Porsche 911 GT3 R (992) EVO", 17.9, "averaged top 17% of class in 2 Endurance Cup races this year", 0.667],
        ["24", "Steller Motorsport", "Mikkel Mac / Dennis Lind / Tba", "Corvette Z06 GT3 R", 5.8, "averaged top 81% of class in 4 Endurance Cup races this year", 0.292],
        ["58", "Garage 59", "Thomas Fleming / Louis Prette / Benjamin Goethe", "McLaren 720S GT3 EVO", 13.9, "averaged top 36% of class in 3 Endurance Cup races this year", 0.583],
        ["71", "Selected Car Racing", "Frederik Schandorff / Malte Ebdrup / Simon Birch", "Ferrari 296 GT3 EVO", 15.1, "averaged top 33% of class in 4 Endurance Cup races this year", 0.611],
        ["99", "Tresor Attempto Racing", "Dylan Pereira / Andrea Frassineti / Alex Aka", "Audi R8 LMS GT3 EVO II", 17.9, "averaged top 0% of class in 1 Endurance Cup race this year", 0.667],
        ["111", "CSA Racing", "Arthur Rougier / Simon Gachet / James Kell", "McLaren 720S GT3 EVO", 7.8, "averaged top 67% of class in 4 Endurance Cup races this year", 0.389],
        ["998", "Rowe Racing", "Ugo De Wilde / Tim Tramnitz / Jens Klingmann", "BMW M4 GT3 EVO", 15.1, "averaged top 33% of class in 4 Endurance Cup races this year", 0.611]
      ] },
      { h:"Silver", cars:[
        ["5", "Optimum Motorsport", "Dante Rappange / Guilherme Oliveira / Mikey Porter", "McLaren 720S GT3 EVO", 7.1, "averaged top 27% of class in 1 Endurance Cup race this year", 0.576],
        ["6", "GetSpeed Team Bartone Bros", "Anthony Bartone / Cesar Gazeau / Aurelien Panis", "Mercedes-AMG GT3 EVO", 5.9, "averaged top 47% of class in 4 Endurance Cup races this year", 0.517],
        ["9", "Pure Rxcing", "Max Hofer / Mikkel Pedersen / Aliaksandr Malykhin", "Porsche 911 GT3 R (992) EVO", 6.7, "averaged top 41% of class in 3 Endurance Cup races this year", 0.557],
        ["19", "Team Motopark", "Christian Mansell / Aaron Walker / Rui Andrade", "Mercedes-AMG GT3 EVO", 5.6, "no earlier 2026 Endurance Cup race with this number", 0.5],
        ["21", "Comtoyou Racing", "Oliver Söderström / Sébastien Baud / Kobe Pauwels", "Aston Martin Vantage AMR GT3 EVO", 6.5, "averaged top 42% of class in 3 Endurance Cup races this year", 0.55],
        ["23", "Team RJN", "Maxwell Lynn / Horatio Fitz-Simon / Ben Dörr", "McLaren 720S GT3 EVO", 4.6, "averaged top 61% of class in 4 Endurance Cup races this year", 0.43],
        ["25", "Sainteloc Racing", "Ezequiel Perez Companc / Etienne Cheli / Tba", "Audi R8 LMS GT3 EVO II", 4.1, "averaged top 67% of class in 3 Endurance Cup races this year", 0.397],
        ["30", "Team WRT", "Ignacio Montenegro / Matisse Lismont / Amaury Cordeel", "BMW M4 GT3 EVO", 10.8, "averaged top 17% of class in 4 Endurance Cup races this year", 0.717],
        ["35", "Walkenhorst Motorsport", "Ethan Ischer / Gaspard Simon / Mateo Villagomez", "Aston Martin Vantage AMR GT3 EVO", 3.5, "averaged top 77% of class in 3 Endurance Cup races this year", 0.34],
        ["44", "Greystone GT", "Jayden Kelly / Josh Rattican / Tommy Pintos", "McLaren 720S GT3 EVO", 2.8, "averaged top 95% of class in 2 Endurance Cup races this year", 0.273],
        ["45", "Rinaldi Racing", "Dylan Medler / David Perel / Axcil Jefferies", "Ferrari 296 GT3 EVO", 5.6, "averaged top 50% of class in 3 Endurance Cup races this year", 0.5],
        ["52", "AF Corse", "Matias Zagazeta / Jef Machiels / Gilles Stadsbader", "Ferrari 296 GT3 EVO", 6.6, "averaged top 41% of class in 3 Endurance Cup races this year", 0.555],
        ["54", "Dinamic GT", "Tanart Sathienthirakul / Francesco Simonazzi / Angus Whiteside", "Porsche 911 GT3 R (992) EVO", 4.0, "averaged top 68% of class in 4 Endurance Cup races this year", 0.383],
        ["65", "HRT Ford Racing", "Maxime Oosten / Nicolas Baert / Eduardo Coseteng", "Ford Mustang GT3 EVO", 9.0, "averaged top 24% of class in 3 Endurance Cup races this year", 0.655],
        ["66", "Tresor Attempto Racing", "Sebastian Øgaard / Ariel Levi / Rocco Mazzola", "Audi R8 LMS GT3 EVO II", 7.7, "averaged top 32% of class in 3 Endurance Cup races this year", 0.605],
        ["555", "CSA Racing", "Romain Andriolo / James Higgins / Jean-Baptiste Simmenauer", "McLaren 720S GT3 EVO", 5.3, "averaged top 54% of class in 2 Endurance Cup races this year", 0.479],
        ["992", "Paradine Competition", "Christian Hahn / Josh Rowledge / Tba", "BMW M4 GT3 EVO", 4.1, "averaged top 67% of class in 3 Endurance Cup races this year", 0.397]
      ] },
      { h:"Bronze", cars:[
        ["8", "Car Collection Motorsport", "Reinhold Krahn / Pietro Armanni / Joel Sturm", "Porsche 911 GT3 R (992) EVO", 4.1, "averaged top 80% of class in 1 Endurance Cup race this year", 0.4],
        ["11", "Comtoyou Racing", "Marcelo Tomasoni / Aaron Muss / Tba", "Aston Martin Vantage AMR GT3 EVO", 2.9, "averaged top 85% of class in 3 Endurance Cup races this year", 0.29],
        ["12", "GetSpeed Team Dubai", "Gabriel Rindone / Mikael Grenier / Tom Kalender", "Mercedes-AMG GT3 EVO", 3.8, "averaged top 70% of class in 3 Endurance Cup races this year", 0.38],
        ["41", "Razoon - more than racing", "Marcos Gomes / Alan Hellmeister / Sebastião Malucelli", "Porsche 911 GT3 R (992) EVO", 5.5, "no earlier 2026 Endurance Cup race with this number", 0.5],
        ["42", "Oman Racing by Century Motorsport", "Calan Williams / Javier Sagrera / Ahmad Al Harthy", "BMW M4 GT3 EVO", 7.9, "averaged top 30% of class in 3 Endurance Cup races this year", 0.622],
        ["74", "Kessel Racing", "Lorenzo Patrese / Dennis Marschall / Dustin Blattner", "Ferrari 296 GT3 EVO", 11.7, "averaged top 12% of class in 4 Endurance Cup races this year", 0.752],
        ["77", "KPX Motorsport", "Jop Rappange / Nigel Schoonderwoerd / Yelmer Buurman", "BMW M4 GT3 EVO", 5.5, "no earlier 2026 Endurance Cup race with this number", 0.5],
        ["87", "Winward Racing", "Marvin Dienst / Gabriele Piana / Rinat Salikhov", "Mercedes-AMG GT3 EVO", 8.2, "averaged top 30% of class in 4 Endurance Cup races this year", 0.633],
        ["88", "Tresor Attempto Racing", "Daniele Di Amato / Carrie Schreiner / Gerhard Tweraser", "Audi R8 LMS GT3 EVO II", 4.2, "averaged top 65% of class in 3 Endurance Cup races this year", 0.41],
        ["89", "Lionspeed GP", "Alex Fontana / Bashar Mardini / Patrick Kolb", "Porsche 911 GT3 R (992) EVO", 6.1, "averaged top 44% of class in 3 Endurance Cup races this year", 0.533],
        ["91", "Herberth Motorsport", "Ralf Bohn / Huub van Eijndhoven / Robert Renauer", "Porsche 911 GT3 R (992) EVO", 4.7, "averaged top 57% of class in 4 Endurance Cup races this year", 0.451],
        ["93", "Ziggo Sport Tempesta Racing", "Peter Dempsey / Christopher Froggatt / Eddie Cheever", "Porsche 911 GT3 R (992) EVO", 5.5, "averaged top 50% of class in 3 Endurance Cup races this year", 0.5],
        ["222", "2Seas Motorsport", "Kiern Jewiss / Charles Dawson / Reece Barr", "Mercedes-AMG GT3 EVO", 6.7, "averaged top 40% of class in 4 Endurance Cup races this year", 0.564],
        ["269", "High Class Racing", "Max Moritz / Klaus Bachler / Raphael Rennhofer", "Porsche 911 GT3 R (992) EVO", 5.5, "no earlier 2026 Endurance Cup race with this number", 0.5],
        ["914", "Razoon - more than racing", "Clemens Mühlbacher / Leo Pichler / Max Mutschlechner", "Porsche 911 GT3 R EVO", 3.0, "averaged top 83% of class in 3 Endurance Cup races this year", 0.299],
        ["991", "Paradine Competition", "Darren Leung / James Kellett / Tba", "BMW M4 GT3 EVO", 8.6, "averaged top 28% of class in 4 Endurance Cup races this year", 0.648],
        ["999", "GetSpeed Team PCX Racing", "Patrick Charlaix / Jordan Boisson / Marvin Klein", "Mercedes-AMG GT3 EVO", 6.1, "averaged top 40% of class in 1 Endurance Cup race this year", 0.533]
      ] }
    ],
    note:"Source: gt-world-challenge-europe.com/entry-list/2026/portimao. Classes are the series' own Pro, Gold, Silver and Bronze." }
];
