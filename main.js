/* 
Use "d3-pre ovamsterdam.html" to pre-render the d3 visualization.

TODO
  -clip extent
  -dubbele lijnen voor meerdere tram/metro lijnen
    -functie voor lijnen tekenen
  -split stationsnamen
  -stationsnamen on top
*/

var margin = {top: 40, right: 40, bottom: 40, left: 40};

var svg = d3.select("#map"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    format = d3.format(",d");

// Should really change this to 'clipExtent' instead of center
var projection = d3.geoAlbers() 
  .center([4.9, 52.366667])
  .parallels([51.5, 51.49])
  .rotate(120)
  .scale(250000)
  .translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);

var stadsdeel = {"A": "Centrum","B": "Westpoort", "E": "West", "M": "Oost", "K": "Zuid", "F": "Nieuw west", "N": "Noord", "T": "Zuidoost"}

// var lijnen = ["1", "2", "3", "4", "5", "7", "8", "9", "10", "12", "13", "14", "17", "24", "26", "50", "51", "52", "53", "54"]

var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
    colorStadsdelen = d3.scaleOrdinal(d3.schemePastel2); //d3.schemeGreys

/* 
one functie voor lijnen, een functie voor cirkels

+startpunt

function svgItem(shape, mode, width, color, n) {
  svg.append(shape)
  .attr("class", mode)
  .attr("stroke", color)
  .attr("stroke-width", 7)
  .attr("x1", 5 + n * 50)
  .attr("x2", 50 + n * 50);
  .attr("y1", n * 20)
  .attr("y2", n * 20)
}
*/

svg.append("text")
  .attr("x", 0)
  .attr("y", 15)
  .attr("font-size", "large")
  .attr("text-decoration", "underline")
  .attr("font-weight", "bold")
  .text("Legenda");

var y0 = 30;
var spacingy = 20
var x0 = 5
var spacingx = 55

svg.append("line")
  .attr("class", "tram")
  .attr("stroke", colorScale(1))
  .attr("stroke-width", 7)
  .attr("y1", y0)
  .attr("y2", y0)
  .attr("x1", x0)
  .attr("x2", spacingx);
svg.append("text")
  .attr("x", spacingx + 5)
  .attr("y", y0 + 5)
  .attr("class", "label")
  .text("Tramlijn");

svg.append("line")
  .attr("class", "metro")
  .attr("stroke", colorScale())
  .attr("stroke-width", 7)
  .attr("y1", y0 + spacingy )
  .attr("y2", y0 + spacingy )
  .attr("x1", x0)
  .attr("x2", spacingx);
svg.append("text")
  .attr("x", spacingx + 5)
  .attr("y", y0 + spacingy + 5)
  .attr("class", "label")
  .text("Metrolijn");

svg.append("line")
  .attr("class", "train")
  .attr("y1", y0 + spacingy * 2)
  .attr("y2", y0 + spacingy * 2)
  .attr("x1", x0)
  .attr("x2", 50);
svg.append("text")
  .attr("x", spacingx + 5)
  .attr("y", y0 + spacingy * 2+ 5)
  .attr("class", "label")
  .text("Treinspoor");

svg.append("circle")
  .attr("class", "station")
  .attr("cx", x0 + 22)
  .attr("cy", y0 + spacingy * 3);
svg.append("text")
  .attr("class", "label")
  .attr("x", spacingx + 5)
  .attr("y", y0 + spacingy * 3 + 5)
  .text("Treinstation");

svg.append("circle")
  .attr("fill", "white")
  .attr("stroke", "black")
  .attr("r", "1.5")
  .attr("cx", x0 + 22)
  .attr("cy", y0 + spacingy * 4);
svg.append("text")
  .attr("class", "label")
  .attr("x", spacingx + 5)
  .attr("y", y0 + spacingy * 4 + 5)
  .text("Tram/metro halte");

d3.queue()
    .defer(d3.json, "buurten.json")
    .defer(d3.json, "trammetro.json")
    .defer(d3.json, "trammetrostations.geojson")
    .defer(d3.json, "spoor.geojson")
    .defer(d3.csv,  "treinstations.csv")
    .await(ready);

function ready(error, buurten, trammetro, trammetrostations, spoor, treinstations) {
  if (error) throw error;

  /* Areas */

  // Draw the buurten
  svg.selectAll(".buurt")
      .data(topojson.feature(buurten, buurten.objects.buurten).features)
    .enter().insert("g")
      .append("path")
        .attr("class", "buurt")
        .attr("d", path)
        .attr("fill", function(d) { return colorStadsdelen(d.properties.Stadsdeel_code[0]) })
      .append("title")
        .text(function(d) { return stadsdeel[d.properties.Stadsdeel_code] + ": " + d.properties.Buurtcombinatie });

  // Draw borders around buurten
  svg.append("path")
      .attr("class", "buurt-borders")
      .attr("d", path(topojson.mesh(buurten, buurten.objects.buurten, function(a, b) { return a !== b; })));

  // Draw borders around stadsdelen
  svg.append("path")
      .attr("class", "stadsdeel-borders")
      .attr("d", path(topojson.mesh(buurten, buurten.objects.buurten, function(a, b) { return stadsdeel[a.properties.Stadsdeel_code] !== stadsdeel[b.properties.Stadsdeel_code]; })));

  /* Lines */

  // UNFINISHED: Check how long lijnen array is, draw path that many times
  /* for n in lijnen.length:
      draw path, twee keer zo breed
        path.color = colorScale(n)
  */

  // function drawline(numberoflines, path) {

  // }

  // Draw the tram/metro tracks
  svg.selectAll(".trammetro")
      .data(topojson.feature(trammetro, trammetro.objects.trammetro).features)
    .enter().insert("g")
      // .attr("aantalLijnen", function(d) { return d.properties.Lijn.split(/ \| /g).length})
      // .attr("lijnNummers", function(d) { return d.properties.Lijn.split(/ \| /g) })
      // .attr("lijnNummers2", function(d) {
      //       var lijnNummers = d.properties.Lijn.split(/ \| /g)

      //       lijnNummers.forEach(function(e) {
      //         // console.log(e)
      //         //Append een path met kleur
      //         // d3.append("path")
      //         //   .attr("d", path)
      //         //   .attr("class", "tram spoor")
      //         //   .attr("stroke", colorScale(e))

      //       })
      //   })
      .append("path")
        .attr("d", path)
        .attr("stroke-width", function(d) { return 1.5 * d.properties.Lijn.split(/ \| /g).length  })
        .attr("stroke", function(d) { return (colorScale(d.properties.Lijn.split(/ \| /g)[0]) ) })
        .attr("d", path)
        .attr("class", function(d) { return "spoor " + d.properties.Modaliteit.toLowerCase() })
        .append("title")
          .text(function(d) { return ((d.properties.Lijn).length == 1 ? "Lijn: " : "Lijnen: ") + d.properties.Lijn });

  // Draw the train tracks
  svg.selectAll(".train")
      .data(spoor.features)
    .enter().insert("path")
        .attr("class", "spoor train")
        .attr("d", path)
      .append("title")
          .text("Treinspoor");;

  /* Points */
  
  // Draw the points for the stations
  var station = svg.selectAll(".treinstations")
    .data(treinstations)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + projection([d["0"], d["1"]]) + ")"; })
      .attr("class", "station");
  
  // Draw name next to station point    
  svg.selectAll(".stationnaam")
      .data(treinstations)
      .enter().append("text")
        .text(function(d) { return d.name; }) //.split(" ")
        .attr("class", "stationnaam")
        .attr("x", function(d) { return projection([d["0"], d["1"]])[0] - d.name.length/3})
        .attr("y", function(d) { return projection([d["0"], d["1"]])[1] - 7})

  // Draw the points for the stations
  svg.selectAll(".trammetrostations")
    .data(trammetrostations.features)
    .enter().append("circle")
      .attr("transform", function (d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .attr("class", function (d) { return "halte " + d.properties.Modaliteit.toLowerCase() });

};