/* Entry lists for "Pick your podium" (js/app.js). One entry per series per weekend: { t: track id, d: event start day,
   s: series id (SERIES in data/series.js), asOf, classes: [{ h: class (must match the class name used for that race in
   data/results.js), cars: [[car number, team, drivers, car, estimated win chance %, basis], ...] }], note }. Copy the series' OWN published entry list --
   never guess. The last two fields are OUR estimate, written by tools/podium_odds.py from the series' standings (not betting odds). Scoring matches the picked car NUMBER against the "#NN" in data/results.js. */
const ENTRIES = [
  { t:"portimao", d:"2026-10-15", s:"gtwce", asOf:"Official entry list as published on gt-world-challenge-europe.com (read Oct 14, 2026). Late changes are possible.",
    classes:[
      { h:"Pro", cars:[
        ["2", "Boutsen VDS", "Morris Schuring / Dorian Boccolacci / Alessio Picariello", "Porsche 911 GT3 R (992) EVO", 4.6, "Best driver has 19 Endurance Cup points"],
        ["3", "Mercedes - AMG Team Verstappen Racing", "Max Verstappen / Ben Barnicoat / Chris Lulham", "Mercedes-AMG GT3 EVO", 4.8, "Best driver has 21 Endurance Cup points"],
        ["7", "Comtoyou Racing", "Mattia Drudi / Nicki Thiim / Ross Gunn", "Aston Martin Vantage AMR GT3 EVO", 9.8, "Best driver has 59 Endurance Cup points"],
        ["17", "Mercedes - AMG Team GetSpeed", "Ralf Aron / Maximilian Götz / Fabian Schiller", "Mercedes-AMG GT3 EVO", 4.4, "Best driver has 16 Endurance Cup points"],
        ["20", "Team Motopark", "Nikita Mazepin / Dominik Baumann / Philip Ellis", "Mercedes-AMG GT3 EVO", 3.3, "No Endurance Cup points this season"],
        ["32", "Team WRT", "Kelvin Van Der Linde / Jordan Pepper / Charles Weerts", "BMW M4 GT3 EVO", 7.1, "Best driver has 42 Endurance Cup points"],
        ["34", "natural elements by Walkenhorst Motorsport", "Jamie Day / Christian Krognes / Henrique Chaves", "Aston Martin Vantage AMR GT3 EVO", 3.7, "Best driver has 7 Endurance Cup points"],
        ["46", "Team WRT", "Neil Verhagen / Max Hesse / Valentino Rossi", "BMW M4 GT3 EVO", 4.1, "Best driver has 13 Endurance Cup points"],
        ["48", "Mercedes - AMG Team MANN-FILTER", "Lucas Auer / Luca Stolz / Maro Engel", "Mercedes-AMG GT3 EVO", 16.1, "Best driver has 86 Endurance Cup points"],
        ["50", "AF Corse", "Lilou Wadoux / Arthur Leclerc / Albert Costa", "Ferrari 296 GT3 EVO", 3.9, "Best driver has 10 Endurance Cup points"],
        ["51", "AF Corse", "Tommaso Mosca / Lorenzo Ferrari / Nicola Lacorte", "Ferrari 296 GT3 EVO", 4.4, "Best driver has 16 Endurance Cup points"],
        ["59", "Garage 59", "Joseph Loake / Dean Macdonald / Jack Hawksworth", "McLaren 720S GT3 EVO", 4.1, "Best driver has 13 Endurance Cup points"],
        ["60", "JMW Motorsport", "Tba / Tba / Tba", "Ferrari 296 GT3 EVO", 3.3, "No Endurance Cup points this season"],
        ["63", "TGI Team by GRT", "Franck Perera / Maximilian Paul / Mirko Bortolotti", "Lamborghini Temerario GT3", 3.3, "No Endurance Cup points this season"],
        ["64", "HRT Ford Racing", "Arjun Maini / Fabio Scherer / Thomas Drouet", "Ford Mustang GT3 EVO", 4.4, "Best driver has 16 Endurance Cup points"],
        ["80", "Lionspeed GP", "Ricardo Feller / Thomas Preining / Bastian Buus", "Porsche 911 GT3 R (992) EVO", 5.7, "Best driver has 30 Endurance Cup points"],
        ["84", "Eastalent Racing", "Christopher Haase / Simon Reicher / Markus Winkelhock", "Audi R8 LMS GT3 EVO II", 4.1, "Best driver has 12 Endurance Cup points"],
        ["96", "Rutronik Racing", "Patric Niederhauser / Marco Mapelli / Luca Engstler", "Lamborghini Temerario GT3", 3.6, "Best driver has 6 Endurance Cup points"],
        ["98", "Rowe Racing", "Philipp Eng / Jake Dennis / Marco Wittmann", "BMW M4 GT3 EVO", 5.3, "Best driver has 26 Endurance Cup points"]
      ] },
      { h:"Gold", cars:[
        ["4", "Optimum Motorsport", "Adam Smalley / Freddie Tomlinson / Harry George", "McLaren 720S GT3 EVO", 7.6, "Best driver has 36 Endurance Cup points"],
        ["10", "Boutsen VDS", "Alessandro Ghiretti / Robin Knutsson / Gilles Magnus", "Porsche 911 GT3 R (992) EVO", 9.5, "Best driver has 48 Endurance Cup points"],
        ["24", "Steller Motorsport", "Mikkel Mac / Dennis Lind / Tba", "Corvette Z06 GT3 R", 8.7, "Best driver has 43 Endurance Cup points"],
        ["58", "Garage 59", "Thomas Fleming / Louis Prette / Benjamin Goethe", "McLaren 720S GT3 EVO", 18.7, "Best driver has 86 Endurance Cup points"],
        ["71", "Selected Car Racing", "Frederik Schandorff / Malte Ebdrup / Simon Birch", "Ferrari 296 GT3 EVO", 16.2, "Best driver has 78 Endurance Cup points"],
        ["99", "Tresor Attempto Racing", "Dylan Pereira / Andrea Frassineti / Alex Aka", "Audi R8 LMS GT3 EVO II", 6.9, "Best driver has 30 Endurance Cup points"],
        ["111", "CSA Racing", "Arthur Rougier / Simon Gachet / James Kell", "McLaren 720S GT3 EVO", 12.6, "Best driver has 64 Endurance Cup points"],
        ["998", "Rowe Racing", "Ugo De Wilde / Tim Tramnitz / Jens Klingmann", "BMW M4 GT3 EVO", 19.8, "Best driver has 89 Endurance Cup points"]
      ] },
      { h:"Silver", cars:[
        ["5", "Optimum Motorsport", "Dante Rappange / Guilherme Oliveira / Mikey Porter", "McLaren 720S GT3 EVO", 5.2, "Best driver has 29 Endurance Cup points"],
        ["6", "GetSpeed Team Bartone Bros", "Anthony Bartone / Cesar Gazeau / Aurelien Panis", "Mercedes-AMG GT3 EVO", 6.4, "Best driver has 40 Endurance Cup points"],
        ["9", "Pure Rxcing", "Max Hofer / Mikkel Pedersen / Aliaksandr Malykhin", "Porsche 911 GT3 R (992) EVO", 7.5, "Best driver has 49 Endurance Cup points"],
        ["19", "Team Motopark", "Christian Mansell / Aaron Walker / Rui Andrade", "Mercedes-AMG GT3 EVO", 3.6, "Best driver has 9 Endurance Cup points"],
        ["21", "Comtoyou Racing", "Oliver Söderström / Sébastien Baud / Kobe Pauwels", "Aston Martin Vantage AMR GT3 EVO", 6.1, "Best driver has 38 Endurance Cup points"],
        ["23", "Team RJN", "Maxwell Lynn / Horatio Fitz-Simon / Ben Dörr", "McLaren 720S GT3 EVO", 4.6, "Best driver has 22 Endurance Cup points"],
        ["25", "Sainteloc Racing", "Ezequiel Perez Companc / Etienne Cheli / Tba", "Audi R8 LMS GT3 EVO II", 4.4, "Best driver has 20 Endurance Cup points"],
        ["30", "Team WRT", "Ignacio Montenegro / Matisse Lismont / Amaury Cordeel", "BMW M4 GT3 EVO", 15.1, "Best driver has 87 Endurance Cup points"],
        ["35", "Walkenhorst Motorsport", "Ethan Ischer / Gaspard Simon / Mateo Villagomez", "Aston Martin Vantage AMR GT3 EVO", 3.4, "Best driver has 6 Endurance Cup points"],
        ["44", "Greystone GT", "Jayden Kelly / Josh Rattican / Tommy Pintos", "McLaren 720S GT3 EVO", 3.2, "Best driver has 2 Endurance Cup points"],
        ["45", "Rinaldi Racing", "Dylan Medler / David Perel / Axcil Jefferies", "Ferrari 296 GT3 EVO", 5.8, "Best driver has 35 Endurance Cup points"],
        ["52", "AF Corse", "Matias Zagazeta / Jef Machiels / Gilles Stadsbader", "Ferrari 296 GT3 EVO", 7.0, "Best driver has 45 Endurance Cup points"],
        ["54", "Dinamic GT", "Tanart Sathienthirakul / Francesco Simonazzi / Angus Whiteside", "Porsche 911 GT3 R (992) EVO", 4.4, "Best driver has 20 Endurance Cup points"],
        ["65", "HRT Ford Racing", "Maxime Oosten / Nicolas Baert / Eduardo Coseteng", "Ford Mustang GT3 EVO", 8.5, "Best driver has 56 Endurance Cup points"],
        ["66", "Tresor Attempto Racing", "Sebastian Øgaard / Ariel Levi / Rocco Mazzola", "Audi R8 LMS GT3 EVO II", 6.9, "Best driver has 44 Endurance Cup points"],
        ["555", "CSA Racing", "Romain Andriolo / James Higgins / Jean-Baptiste Simmenauer", "McLaren 720S GT3 EVO", 4.5, "Best driver has 21 Endurance Cup points"],
        ["992", "Paradine Competition", "Christian Hahn / Josh Rowledge / Tba", "BMW M4 GT3 EVO", 3.5, "Best driver has 7 Endurance Cup points"]
      ] },
      { h:"Bronze", cars:[
        ["8", "Car Collection Motorsport", "Reinhold Krahn / Pietro Armanni / Joel Sturm", "Porsche 911 GT3 R (992) EVO", 3.5, "No Endurance Cup points this season"],
        ["11", "Comtoyou Racing", "Marcelo Tomasoni / Aaron Muss / Tba", "Aston Martin Vantage AMR GT3 EVO", 3.5, "Best driver has 1 Endurance Cup points"],
        ["12", "GetSpeed Team Dubai", "Gabriel Rindone / Mikael Grenier / Tom Kalender", "Mercedes-AMG GT3 EVO", 4.5, "Best driver has 16 Endurance Cup points"],
        ["41", "Razoon - more than racing", "Marcos Gomes / Alan Hellmeister / Sebastião Malucelli", "Porsche 911 GT3 R (992) EVO", 3.5, "No Endurance Cup points this season"],
        ["42", "Oman Racing by Century Motorsport", "Calan Williams / Javier Sagrera / Ahmad Al Harthy", "BMW M4 GT3 EVO", 5.9, "Best driver has 34 Endurance Cup points"],
        ["74", "Kessel Racing", "Lorenzo Patrese / Dennis Marschall / Dustin Blattner", "Ferrari 296 GT3 EVO", 17.2, "Best driver has 102 Endurance Cup points"],
        ["77", "KPX Motorsport", "Jop Rappange / Nigel Schoonderwoerd / Yelmer Buurman", "BMW M4 GT3 EVO", 3.5, "No Endurance Cup points this season"],
        ["87", "Winward Racing", "Marvin Dienst / Gabriele Piana / Rinat Salikhov", "Mercedes-AMG GT3 EVO", 8.6, "Best driver has 58 Endurance Cup points"],
        ["88", "Tresor Attempto Racing", "Daniele Di Amato / Carrie Schreiner / Gerhard Tweraser", "Audi R8 LMS GT3 EVO II", 3.9, "Best driver has 8 Endurance Cup points"],
        ["89", "Lionspeed GP", "Alex Fontana / Bashar Mardini / Patrick Kolb", "Porsche 911 GT3 R (992) EVO", 5.7, "Best driver has 31 Endurance Cup points"],
        ["91", "Herberth Motorsport", "Ralf Bohn / Huub van Eijndhoven / Robert Renauer", "Porsche 911 GT3 R (992) EVO", 5.0, "Best driver has 23 Endurance Cup points"],
        ["93", "Ziggo Sport Tempesta Racing", "Peter Dempsey / Christopher Froggatt / Eddie Cheever", "Porsche 911 GT3 R (992) EVO", 5.7, "Best driver has 31 Endurance Cup points"],
        ["222", "2Seas Motorsport", "Kiern Jewiss / Charles Dawson / Reece Barr", "Mercedes-AMG GT3 EVO", 8.5, "Best driver has 57 Endurance Cup points"],
        ["269", "High Class Racing", "Max Moritz / Klaus Bachler / Raphael Rennhofer", "Porsche 911 GT3 R (992) EVO", 3.5, "No Endurance Cup points this season"],
        ["914", "Razoon - more than racing", "Clemens Mühlbacher / Leo Pichler / Max Mutschlechner", "Porsche 911 GT3 R EVO", 3.5, "No Endurance Cup points this season"],
        ["991", "Paradine Competition", "Darren Leung / James Kellett / Tba", "BMW M4 GT3 EVO", 10.6, "Best driver has 71 Endurance Cup points"],
        ["999", "GetSpeed Team PCX Racing", "Patrick Charlaix / Jordan Boisson / Marvin Klein", "Mercedes-AMG GT3 EVO", 3.5, "No Endurance Cup points this season"]
      ] }
    ],
    note:"Source: gt-world-challenge-europe.com/entry-list/2026/portimao. Classes are the series' own Pro, Gold, Silver and Bronze." }
];
