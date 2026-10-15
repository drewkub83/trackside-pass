/* Entry lists for "Pick your podium" (js/app.js). One entry per series per weekend: { t: track id, d: event start day,
   s: series id (SERIES in data/series.js), asOf, classes: [{ h: class (must match the class name used for that race in
   data/results.js), cars: [[car number, team, drivers, car], ...] }], note }. Copy the series' OWN published entry list --
   never guess. Scoring matches the picked car NUMBER against the "#NN" in data/results.js. */
const ENTRIES = [
  { t:"portimao", d:"2026-10-15", s:"gtwce", asOf:"Official entry list as published on gt-world-challenge-europe.com (read Oct 14, 2026). Late changes are possible.",
    classes:[
      { h:"Pro", cars:[
        ["2", "Boutsen VDS", "Morris Schuring / Dorian Boccolacci / Alessio Picariello", "Porsche 911 GT3 R (992) EVO"],
        ["3", "Mercedes - AMG Team Verstappen Racing", "Max Verstappen / Ben Barnicoat / Chris Lulham", "Mercedes-AMG GT3 EVO"],
        ["7", "Comtoyou Racing", "Mattia Drudi / Nicki Thiim / Ross Gunn", "Aston Martin Vantage AMR GT3 EVO"],
        ["17", "Mercedes - AMG Team GetSpeed", "Ralf Aron / Maximilian Götz / Fabian Schiller", "Mercedes-AMG GT3 EVO"],
        ["20", "Team Motopark", "Nikita Mazepin / Dominik Baumann / Philip Ellis", "Mercedes-AMG GT3 EVO"],
        ["32", "Team WRT", "Kelvin Van Der Linde / Jordan Pepper / Charles Weerts", "BMW M4 GT3 EVO"],
        ["34", "natural elements by Walkenhorst Motorsport", "Jamie Day / Christian Krognes / Henrique Chaves", "Aston Martin Vantage AMR GT3 EVO"],
        ["46", "Team WRT", "Neil Verhagen / Max Hesse / Valentino Rossi", "BMW M4 GT3 EVO"],
        ["48", "Mercedes - AMG Team MANN-FILTER", "Lucas Auer / Luca Stolz / Maro Engel", "Mercedes-AMG GT3 EVO"],
        ["50", "AF Corse", "Lilou Wadoux / Arthur Leclerc / Albert Costa", "Ferrari 296 GT3 EVO"],
        ["51", "AF Corse", "Tommaso Mosca / Lorenzo Ferrari / Nicola Lacorte", "Ferrari 296 GT3 EVO"],
        ["59", "Garage 59", "Joseph Loake / Dean Macdonald / Jack Hawksworth", "McLaren 720S GT3 EVO"],
        ["60", "JMW Motorsport", "Tba / Tba / Tba", "Ferrari 296 GT3 EVO"],
        ["63", "TGI Team by GRT", "Franck Perera / Maximilian Paul / Mirko Bortolotti", "Lamborghini Temerario GT3"],
        ["64", "HRT Ford Racing", "Arjun Maini / Fabio Scherer / Thomas Drouet", "Ford Mustang GT3 EVO"],
        ["80", "Lionspeed GP", "Ricardo Feller / Thomas Preining / Bastian Buus", "Porsche 911 GT3 R (992) EVO"],
        ["84", "Eastalent Racing", "Christopher Haase / Simon Reicher / Markus Winkelhock", "Audi R8 LMS GT3 EVO II"],
        ["96", "Rutronik Racing", "Patric Niederhauser / Marco Mapelli / Luca Engstler", "Lamborghini Temerario GT3"],
        ["98", "Rowe Racing", "Philipp Eng / Jake Dennis / Marco Wittmann", "BMW M4 GT3 EVO"]
      ] },
      { h:"Gold", cars:[
        ["4", "Optimum Motorsport", "Adam Smalley / Freddie Tomlinson / Harry George", "McLaren 720S GT3 EVO"],
        ["10", "Boutsen VDS", "Alessandro Ghiretti / Robin Knutsson / Gilles Magnus", "Porsche 911 GT3 R (992) EVO"],
        ["24", "Steller Motorsport", "Mikkel Mac / Dennis Lind / Tba", "Corvette Z06 GT3 R"],
        ["58", "Garage 59", "Thomas Fleming / Louis Prette / Benjamin Goethe", "McLaren 720S GT3 EVO"],
        ["71", "Selected Car Racing", "Frederik Schandorff / Malte Ebdrup / Simon Birch", "Ferrari 296 GT3 EVO"],
        ["99", "Tresor Attempto Racing", "Dylan Pereira / Andrea Frassineti / Alex Aka", "Audi R8 LMS GT3 EVO II"],
        ["111", "CSA Racing", "Arthur Rougier / Simon Gachet / James Kell", "McLaren 720S GT3 EVO"],
        ["998", "Rowe Racing", "Ugo De Wilde / Tim Tramnitz / Jens Klingmann", "BMW M4 GT3 EVO"]
      ] },
      { h:"Silver", cars:[
        ["5", "Optimum Motorsport", "Dante Rappange / Guilherme Oliveira / Mikey Porter", "McLaren 720S GT3 EVO"],
        ["6", "GetSpeed Team Bartone Bros", "Anthony Bartone / Cesar Gazeau / Aurelien Panis", "Mercedes-AMG GT3 EVO"],
        ["9", "Pure Rxcing", "Max Hofer / Mikkel Pedersen / Aliaksandr Malykhin", "Porsche 911 GT3 R (992) EVO"],
        ["19", "Team Motopark", "Christian Mansell / Aaron Walker / Rui Andrade", "Mercedes-AMG GT3 EVO"],
        ["21", "Comtoyou Racing", "Oliver Söderström / Sébastien Baud / Kobe Pauwels", "Aston Martin Vantage AMR GT3 EVO"],
        ["23", "Team RJN", "Maxwell Lynn / Horatio Fitz-Simon / Ben Dörr", "McLaren 720S GT3 EVO"],
        ["25", "Sainteloc Racing", "Ezequiel Perez Companc / Etienne Cheli / Tba", "Audi R8 LMS GT3 EVO II"],
        ["30", "Team WRT", "Ignacio Montenegro / Matisse Lismont / Amaury Cordeel", "BMW M4 GT3 EVO"],
        ["35", "Walkenhorst Motorsport", "Ethan Ischer / Gaspard Simon / Mateo Villagomez", "Aston Martin Vantage AMR GT3 EVO"],
        ["44", "Greystone GT", "Jayden Kelly / Josh Rattican / Tommy Pintos", "McLaren 720S GT3 EVO"],
        ["45", "Rinaldi Racing", "Dylan Medler / David Perel / Axcil Jefferies", "Ferrari 296 GT3 EVO"],
        ["52", "AF Corse", "Matias Zagazeta / Jef Machiels / Gilles Stadsbader", "Ferrari 296 GT3 EVO"],
        ["54", "Dinamic GT", "Tanart Sathienthirakul / Francesco Simonazzi / Angus Whiteside", "Porsche 911 GT3 R (992) EVO"],
        ["65", "HRT Ford Racing", "Maxime Oosten / Nicolas Baert / Eduardo Coseteng", "Ford Mustang GT3 EVO"],
        ["66", "Tresor Attempto Racing", "Sebastian Øgaard / Ariel Levi / Rocco Mazzola", "Audi R8 LMS GT3 EVO II"],
        ["555", "CSA Racing", "Romain Andriolo / James Higgins / Jean-Baptiste Simmenauer", "McLaren 720S GT3 EVO"],
        ["992", "Paradine Competition", "Christian Hahn / Josh Rowledge / Tba", "BMW M4 GT3 EVO"]
      ] },
      { h:"Bronze", cars:[
        ["8", "Car Collection Motorsport", "Reinhold Krahn / Pietro Armanni / Joel Sturm", "Porsche 911 GT3 R (992) EVO"],
        ["11", "Comtoyou Racing", "Marcelo Tomasoni / Aaron Muss / Tba", "Aston Martin Vantage AMR GT3 EVO"],
        ["12", "GetSpeed Team Dubai", "Gabriel Rindone / Mikael Grenier / Tom Kalender", "Mercedes-AMG GT3 EVO"],
        ["41", "Razoon - more than racing", "Marcos Gomes / Alan Hellmeister / Sebastião Malucelli", "Porsche 911 GT3 R (992) EVO"],
        ["42", "Oman Racing by Century Motorsport", "Calan Williams / Javier Sagrera / Ahmad Al Harthy", "BMW M4 GT3 EVO"],
        ["74", "Kessel Racing", "Lorenzo Patrese / Dennis Marschall / Dustin Blattner", "Ferrari 296 GT3 EVO"],
        ["77", "KPX Motorsport", "Jop Rappange / Nigel Schoonderwoerd / Yelmer Buurman", "BMW M4 GT3 EVO"],
        ["87", "Winward Racing", "Marvin Dienst / Gabriele Piana / Rinat Salikhov", "Mercedes-AMG GT3 EVO"],
        ["88", "Tresor Attempto Racing", "Daniele Di Amato / Carrie Schreiner / Gerhard Tweraser", "Audi R8 LMS GT3 EVO II"],
        ["89", "Lionspeed GP", "Alex Fontana / Bashar Mardini / Patrick Kolb", "Porsche 911 GT3 R (992) EVO"],
        ["91", "Herberth Motorsport", "Ralf Bohn / Huub van Eijndhoven / Robert Renauer", "Porsche 911 GT3 R (992) EVO"],
        ["93", "Ziggo Sport Tempesta Racing", "Peter Dempsey / Christopher Froggatt / Eddie Cheever", "Porsche 911 GT3 R (992) EVO"],
        ["222", "2Seas Motorsport", "Kiern Jewiss / Charles Dawson / Reece Barr", "Mercedes-AMG GT3 EVO"],
        ["269", "High Class Racing", "Max Moritz / Klaus Bachler / Raphael Rennhofer", "Porsche 911 GT3 R (992) EVO"],
        ["914", "Razoon - more than racing", "Clemens Mühlbacher / Leo Pichler / Max Mutschlechner", "Porsche 911 GT3 R EVO"],
        ["991", "Paradine Competition", "Darren Leung / James Kellett / Tba", "BMW M4 GT3 EVO"],
        ["999", "GetSpeed Team PCX Racing", "Patrick Charlaix / Jordan Boisson / Marvin Klein", "Mercedes-AMG GT3 EVO"]
      ] }
    ],
    note:"Source: gt-world-challenge-europe.com/entry-list/2026/portimao. Classes are the series' own Pro, Gold, Silver and Bronze." }
];
