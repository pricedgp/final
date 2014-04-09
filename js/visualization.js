var econData, qualityData, currentSelection = "danceability";

var margin = {top: 10, right: 15, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom,
    musicQualHeight = 300,
    musicQualWidth = 70;
    musicQualRectWidth = 20;
    lyricsWidth = (1024 - musicQualWidth - 300) / 5; // 300 here is space allocated for the lyrics details

var parseDate = d3.time.format("%m/%e/%Y").parse;

// set up scales for data
var x = d3.time.scale().range([0, width-margin.right]),
    x2 = d3.time.scale().range([0, width-margin.right]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]),
    y3 = d3.scale.linear().range([height, 0]),
    qualScale = d3.scale.linear().range([500,0]).domain([0,1]),
    qualScale2 = d3.scale.linear().range([0,70]).domain([0,1]);;

// set up axis scales
var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left"),
    yAxis2 = d3.svg.axis().scale(y3).orient("right");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var unemployLine = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.obs_date); })
    .y0(height)
    .y1(function(d) { return y(d.unemployment); });

var spLine = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.obs_date); })
    .y0(height)
    .y1(function(d) { return y3(d.sp500_pc1); });

var overview = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.obs_date); })
    .y0(height2)
    .y1(function(d) { return y2(d.unemployment); });

var svgGraph = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svgGraph.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", (width-margin.right))
    .attr("height", height);

var focus = svgGraph.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svgGraph.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var danceAveGraph = d3.select("#danceAve").append("svg")
    .attr("width", musicQualWidth)
    .attr("height", musicQualHeight);

var energyAveGraph = d3.select("#energyAve").append("svg")
    .attr("width", musicQualWidth)
    .attr("height", musicQualHeight);

var moodAveGraph = d3.select("#moodAve").append("svg")
    .attr("width", musicQualWidth)
    .attr("height", musicQualHeight);

var moneyCircle = d3.select("#moneyCount").append("svg")
    .attr("width", lyricsWidth)
    .attr("height", musicQualHeight);

var posEmoteCircle = d3.select("#posEmoteCount").append("svg")
    .attr("width", lyricsWidth)
    .attr("height", musicQualHeight);

var posOutCircle = d3.select("#posOutCount").append("svg")
    .attr("width", lyricsWidth)
    .attr("height", musicQualHeight);

var negEmoteCircle = d3.select("#negEmoteCount").append("svg")
    .attr("width", lyricsWidth)
    .attr("height", musicQualHeight);

var negOutCircle = d3.select("#negOutCount").append("svg")
    .attr("width", lyricsWidth)
    .attr("height", musicQualHeight);

/* the following few lines are just for viz test but not interactive */
moneyCircle.append("circle")
    .attr("r",25)
    .attr("transform", "translate(60,60)")
    .attr("class","moneyCircle");

posEmoteCircle.append("circle")
    .attr("r",30)
    .attr("transform", "translate(60,60)")
    .attr("class","positiveCircle");

posOutCircle.append("circle")
    .attr("r",40)
    .attr("transform", "translate(60,60)")
    .attr("class","positiveCircle");

negEmoteCircle.append("circle")
    .attr("r",30)
    .attr("transform", "translate(60,60)")
    .attr("class","negativeCircle");

negOutCircle.append("circle")
    .attr("r",40)
    .attr("transform", "translate(60,60)")
    .attr("class","negativeCircle");

/*********************************************************************/

d3.csv("./data/econ_data.csv", econType, function(error, data)
{
  econData = data;

  x.domain(d3.extent(data.map(function(d) { return d.obs_date; })));
  y.domain([0, d3.max(data.map(function(d) { return d.unemployment; }))]);
  y3.domain([d3.min(data.map(function(d) { return d.sp500_pc1; })), d3.max(data.map(function(d) { return d.sp500_pc1; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", unemployLine);

  focus.append("path")
      .datum(data)
      .attr("class","spLine")
      .attr("d", spLine);

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  focus.append("g")
      .attr("class", "y axis")
      .attr("transform","translate(" + (width-margin.right) + ",0)")
      .call(yAxis2);

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", overview);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);

  d3.csv("./data/whitburn_echonest_data.csv", musicQualType, function(data2)
  {
    qualityData = data2;

    var danceHeight = qualScale(d3.mean(data2.map(function(d) { return d.danceability; })));
    var energyHeight = qualScale(d3.mean(data2.map(function(d) { return d.energy; })));
    var moodHeight = qualScale(d3.mean(data2.map(function(d) { return d.mood; })));

    var danceRect = danceAveGraph.append("rect")
      .attr("height", danceHeight)
      .attr("y", function() { return musicQualHeight - danceHeight; })
      .attr("width", musicQualRectWidth)
      .attr("x", (musicQualWidth - musicQualRectWidth)/2)
      .attr("class","musicQualDance");

    var energyRect = energyAveGraph.append("rect")
      .attr("height", energyHeight)
      .attr("y", function() { return musicQualHeight - energyHeight; })
      .attr("width", musicQualRectWidth)
      .attr("x", (musicQualWidth - musicQualRectWidth)/2)
      .attr("class","musicQualEnergy");

    var moodRect = moodAveGraph.append("rect")
      .attr("height", moodHeight)
      .attr("y", function() { return musicQualHeight - moodHeight; })
      .attr("width", musicQualRectWidth)
      .attr("x", (musicQualWidth - musicQualRectWidth)/2)
      .attr("class","musicQualMood");

    danceRect.on("click", function() { populateMusicDetailsTable("danceability"); });
    energyRect.on("click", function() { populateMusicDetailsTable("energy"); });
    moodRect.on("click", function() { populateMusicDetailsTable("mood"); });

    populateMusicDetailsTable("danceability");
  });
});

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select(".line").attr("d", unemployLine);
  focus.select(".spLine").attr("d", spLine);
  focus.select(".x.axis").call(xAxis);

  var danceHeight = qualScale(d3.mean(filterArray(qualityData,"danceability","date")));
  var energyHeight = qualScale(d3.mean(filterArray(qualityData,"energy","date")));
  var moodHeight = qualScale(d3.mean(filterArray(qualityData,"mood","date")));

  danceAveGraph.select(".musicQualDance")
    .attr("height", danceHeight)
    .attr("y", function() { return musicQualHeight - danceHeight; });

  energyAveGraph.select(".musicQualEnergy")
    .attr("height", energyHeight)
    .attr("y", function() { return musicQualHeight - energyHeight });

  moodAveGraph.select(".musicQualMood")
    .attr("height", moodHeight)
    .attr("y", function() { return musicQualHeight - moodHeight });

    populateMusicDetailsTable(currentSelection);
}

function populateMusicDetailsTable(valueProperty)
{
  var topTracks = getTopByProperty(qualityData, valueProperty);
  currentSelection = valueProperty;

  var tableHTML = "";

  for (var i = 0; i < topTracks.length; i++)
  {
    tableHTML += "<tr>" + 
                    "<td>" + (i+1) + "</td>" + 
                    "<td>" + topTracks[i].track + "</td>" + 
                    "<td>" + topTracks[i].artist + "</td>" + 
                    '<td><svg width="' + musicQualWidth + '" height="25px" ><rect width="' + 
                      qualScale2(topTracks[i][valueProperty]) + '" height="15px" ' + 
                      ' class="'

    if (valueProperty == "danceability")
      tableHTML += "musicQualDance";
    else if (valueProperty == "energy")
      tableHTML += "musicQualEnergy";
    else if (valueProperty == "mood")
      tableHTML += "musicQualMood";

    tableHTML += '" y="5px" ></rect></svg></td></tr>';
  }

  if (valueProperty == "danceability")
    d3.select("#MusicPropType h5").html("Danceability");
  else if (valueProperty == "energy")
    d3.select("#MusicPropType h5").html("Energy");
  else if (valueProperty == "mood")
    d3.select("#MusicPropType h5").html("Mood");

  d3.select("#musicDetailsTable tbody").html(tableHTML);
}

// ensure data elements are cast in their proper types
function econType(d)
{
  d.obs_date = parseDate(d.obs_date);
  d.unemployment = +d.unemployment;
  d.sp500_pc1 = +d.sp500_pc1;
  return d;
}

function musicQualType(d)
{
  d.date = parseDate(d.date);
  d.danceability = +d.danceability;
  d.energy = +d.energy;
  d.mood = d.mood;
  return d;
}

function filterArray(array,valueProperty,dateProperty)
{
  var returnArray = new Array();
  var minDate = brush.extent()[0];
  var maxDate = brush.extent()[1];
  
  for (var i = 0; i < array.length; i++)
  {
    var d = array[i];
    var thisDate = d[dateProperty];

    if ((thisDate >= minDate && thisDate <= maxDate) || minDate.getTime()  === maxDate.getTime())
        returnArray.push(d[valueProperty]);
  }

  return returnArray;
}

function getTopByProperty(array, valueProperty)
{
  var returnArray = new Array();
  var tempArray = new Array();

  var minDate = brush.extent()[0];
  var maxDate = brush.extent()[1];

  for (var i = 0; i < array.length; i++)
  {
    var d = array[i];
    var thisDate = d.date;

    if ((thisDate >= minDate && thisDate <= maxDate) || minDate.getTime() === maxDate.getTime())
    {
      tempArray.push(d);
    }
  }

  tempArray.sort(function (a,b) {
    if (a[valueProperty] > b[valueProperty])
      return -1;
    else if (a[valueProperty] < b[valueProperty])
      return 1;
    else
    {
      if (a.track < b.track)
        return -1
      else if (a.track > b.track)
        return 1
      else
        return 0;
    }
  });

  for (i = 0; i < tempArray.length; i++)
  {
    returnArray.push(tempArray[i]);

    if (i == 9)
      break;
  }

  return returnArray;
}