/**
  Javascript for CSCI E-171 Final Project
  Authors: Glen Barger and David Price

  focus+context graph initial code from: http://bl.ocks.org/mbostock/1667367
*/
var econData, qualityData, econStoriesData, wordData = {}, maxValue, 
    danceRect, energyRect, moodRect, currentWord, 
    currentDetailType = "QualitySort", 
    currentSelection = "danceability",
    sortOrder = 'desc',
    lyricDetailsSelection = "pos",
    maxStoriesCount = 6,
    maxLyricDetails = 15;

var margin = {top: 10, right: 15, bottom: 100, left: 40},
    margin2 = {top: 195, right: 10, bottom: 20, left: 40},
    width = 725 - margin.left - margin.right,
    height = 275 - margin.top - margin.bottom,
    height2 = 275 - margin2.top - margin2.bottom,
    musicQualHeight = 338,
    musicQualWidth = 70,
    musicQualRectWidth = 50,
    defaultTextSize = 8,
    posSize = defaultTextSize,
    negSize = defaultTextSize,
    bodSize = defaultTextSize,
    vioSize = defaultTextSize,
    relaSize = defaultTextSize,
    reliSize = defaultTextSize,
    colorSize = defaultTextSize,
    moneySize = defaultTextSize,
    lyricsWidth = (1024 - musicQualWidth - 300) / 5; // 300 here is space allocated for the lyrics details

var parseDate = d3.time.format("%m/%e/%Y").parse;

// set up scales for data
var x = d3.time.scale().range([0, width-margin.right]),
    x2 = d3.time.scale().range([0, width-margin.right]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]),
    y3 = d3.scale.linear().range([height, 0]),
    y4 = d3.scale.linear().range([height2, 0]),
    qualScale = d3.scale.linear().range([550,0]).domain([0,1]),
    qualScale2 = d3.scale.linear().range([0,70]).domain([0,1]),
    stemCountScale = d3.scale.linear().range([0,70]), 
    lyricScale = d3.scale.linear().range([7,22]); // pt scale

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

var unemployOverview = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.obs_date); })
    .y0(height2)
    .y1(function(d) { return y2(d.unemployment); });

var spOverview = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.obs_date); })
    .y0(height2)
    .y1(function(d) { return  y4(d.sp500_pc1); });

var svgGraph = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right + 13)
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

// "pos", "neg", "bod", "vio", "rela", "color", "reli"

var posText = d3.select("#pos")
    .style("font-size", posSize + "pt");
    
var negText = d3.select("#neg")
    .style("font-size", negSize + "pt");   

var bodText = d3.select("#bod")
    .style("font-size", bodSize + "pt");   

var vioText = d3.select("#vio")
    .style("font-size", vioSize + "pt");   

var relaText = d3.select("#rela")
    .style("font-size", relaSize + "pt");   

var colorText = d3.select("#color")
    .style("font-size", colorSize + "pt");   

var reliText = d3.select("#reli")
    .style("font-size", reliSize + "pt");   

var moneyText = d3.select("#money")
    .style("font-size", moneySize + "pt");     


                                                    
/*********************************************************************/

d3.csv("./data/econ_data.csv", econType, function(error, data)
{
  econData = data;

  x.domain(d3.extent(data.map(function(d) { return d.obs_date; })));
  y.domain([0, d3.max(data.map(function(d) { return d.unemployment; }))]);
  y3.domain([d3.min(data.map(function(d) { return d.sp500_pc1; })), d3.max(data.map(function(d) { return d.sp500_pc1; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());
  y4.domain(y3.domain());

  // fill in details graph
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

  focus.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -30)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Unemployment Rate");

    focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);


  focus.append("g")
      .attr("class", "y axis")
      .attr("transform","translate(" + (width-margin.right) + ",0)")
      .call(yAxis2)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "end")
      .attr("dy", ".75em")
      .attr("y", 30)
      .text("S&P 500 % Change");


  // fill in overview graph
  context.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", unemployOverview);

  context.append("path")
      .datum(data)
      .attr("class", "spLine")
      .attr("d", spOverview);

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

    d3.csv("./data/econ_stories.csv", function(data3)
    {
      econStoriesData = data3;

      d3.json("./data/trackMap.json", function(data4) 
      {
        wordData = d3.map(data4);


        var danceHeight = qualScale(d3.mean(data2.map(function(d) { return d.danceability; })));
        var energyHeight = qualScale(d3.mean(data2.map(function(d) { return d.energy; })));
        var moodHeight = qualScale(d3.mean(data2.map(function(d) { return d.mood; })));

        danceRect = danceAveGraph.append("rect")
          .attr("height", danceHeight)
          .attr("y", function() { return musicQualHeight - danceHeight + 7; })
          .attr("width", musicQualRectWidth)
          .attr("x", (musicQualWidth - musicQualRectWidth)/2)
          .attr("class","musicQualDance clickable");

        energyRect = energyAveGraph.append("rect")
          .attr("height", energyHeight)
          .attr("y", function() { return musicQualHeight - energyHeight; })
          .attr("width", musicQualRectWidth)
          .attr("x", (musicQualWidth - musicQualRectWidth)/2)
          .attr("class","musicQualEnergy clickable inactive");

        moodRect = moodAveGraph.append("rect")
          .attr("height", moodHeight)
          .attr("y", function() { return musicQualHeight - moodHeight; })
          .attr("width", musicQualRectWidth)
          .attr("x", (musicQualWidth - musicQualRectWidth)/2)
          .attr("class","musicQualMood clickable inactive");

        danceRect.on("click", function() 
        {
          danceRect.classed("inactive",false);
          energyRect.classed("inactive",true);
          moodRect.classed("inactive",true);
          d3.selectAll("#stemDetails td").classed("lit",false);
          sortOrder = 'desc';
          populateMusicDetailsTable("danceability"); 
        });

        energyRect.on("click", function() 
        {
          danceRect.classed("inactive",true);
          energyRect.classed("inactive",false);
          moodRect.classed("inactive",true);
          d3.selectAll("#stemDetails td").classed("lit",false);
          sortOrder = 'desc';
          populateMusicDetailsTable("energy");
        });

        moodRect.on("click", function() 
        {
          danceRect.classed("inactive",true);
          energyRect.classed("inactive",true);
          moodRect.classed("inactive",false);
          d3.selectAll("#stemDetails td").classed("lit",false);
          sortOrder = 'desc';
          populateMusicDetailsTable("mood");
        });

        d3.select("#MusicPropType h5").on("click", function() {

          if (sortOrder == 'desc')
            sortOrder = 'asc';
          else
            sortOrder = 'desc';

          if (currentDetailType == "WordSort")
            populateMusicDetailsTableWithWord(currentWord);
          else
            populateMusicDetailsTable(currentSelection);

        });

        $("#helpMask").click(function() {
          $("#helpMask").addClass("hide");
          $("#helpInstructions").addClass("hide");
          event.preventDefault();
        });

        $("#helpBtn").click(function() {
          window.scrollTo(0,0);
          $("#helpMask").removeClass("hide");
          $("#helpInstructions").removeClass("hide");
          event.preventDefault();
        });

        $("#helpMask").addClass("hide");
        $("#helpInstructions").addClass("hide");

        brushed();
      });
    });
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

  // loop through categories
  var groupSummary = {};
  var trackData = getTrackSet(qualityData, "date"); // get track set just once

  groups = ["pos", "neg", "bod", "vio", "rela", "color", "reli", "money"];
  var totals = [];
  groups.forEach(function(group) {
    groupSummary[group] = filterLyricsArray(trackData, group);
    totals.push(d3.mean(groupSummary[group]));
  });


  lyricScale.domain(d3.extent(totals));
  var posSize = lyricScale(d3.mean(groupSummary["pos"]));
  var negSize = lyricScale(d3.mean(groupSummary["neg"]));
  var bodSize = lyricScale(d3.mean(groupSummary["bod"]));
  var vioSize = lyricScale(d3.mean(groupSummary["vio"]));
  var relaSize = lyricScale(d3.mean(groupSummary["rela"]));
  var colorSize = lyricScale(d3.mean(groupSummary["color"]));
  var reliSize = lyricScale(d3.mean(groupSummary["reli"]));
  var moneySize = lyricScale(d3.mean(groupSummary["money"]));

  // update details
  populateLyricsDetail(trackData, lyricDetailsSelection);

  posText.style("font-size", posSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "pos");
  });
  negText.style("font-size", negSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "neg");
  });
  bodText.style("font-size", bodSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "bod");
  });
  vioText.style("font-size", vioSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "vio");
  });
  relaText.style("font-size", relaSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "rela");
  });
  colorText.style("font-size", colorSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "color");
  });
  reliText.style("font-size", reliSize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "reli");
  });
  moneyText.style("font-size", moneySize + "pt")
    .on("click", function(){
      populateLyricsDetail(trackData, "money");
  });

  danceAveGraph.select(".musicQualDance")
    .attr("height", danceHeight)
    .attr("y", function() { return musicQualHeight - danceHeight; });

  energyAveGraph.select(".musicQualEnergy")
    .attr("height", energyHeight)
    .attr("y", function() { return musicQualHeight - energyHeight });

  moodAveGraph.select(".musicQualMood")
    .attr("height", moodHeight)
    .attr("y", function() { return musicQualHeight - moodHeight });

  if (currentDetailType == "WordSort")
    populateMusicDetailsTableWithWord(currentWord);
  else
    populateMusicDetailsTable(currentSelection);

  populateStoriesTable();
}

function populateMusicDetailsTable(valueProperty)
{
  var tracks = sortByProperty(qualityData, valueProperty);
  currentSelection = valueProperty;
  currentDetailType = 'QualitySort';

  var tableHTML = "";

  for (var i = 0; i < tracks.length; i++)
  {
    tableHTML += "<tr>" + 
                    "<td>" + (i+1) + "</td>" + 
                    "<td>" + tracks[i].track + "</td>" + 
                    "<td>" + tracks[i].artist + "</td>" + 
                    '<td><svg width="' + musicQualWidth + '" height="25px" ><rect width="' + 
                      qualScale2(tracks[i][valueProperty]) + '" height="15px" ' + 
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
    d3.select("#MusicPropType h5").html('<img alt="sort descending" src="./images/sort_' + sortOrder + '.png">Danceability');
  else if (valueProperty == "energy")
    d3.select("#MusicPropType h5").html('<img alt="sort descending" src="./images/sort_' + sortOrder + '.png">Energy');
  else if (valueProperty == "mood")
    d3.select("#MusicPropType h5").html('<img alt="sort descending" src="./images/sort_' + sortOrder + '.png">Mood');

  d3.select("#musicDetailsTable tbody").html(tableHTML);
}

function populateMusicDetailsTableWithWord(word)
{
  d3.selectAll("#stemDetails td").classed("lit",false);
  d3.select("#" + word).classed("lit",true);

  currentWord = word;
  currentDetailType = 'WordSort';

  var unsortedTracks = [];
  var tracks = [];

  // get the track IDs in the current range
  var trackSet = getTrackSet(qualityData, "date");
  // get the tracks in the range that contain this word
  trackStems = getTracksWithWord(trackSet, word);

  danceRect.classed("inactive",true);
  energyRect.classed("inactive",true);
  moodRect.classed("inactive",true);

  // get the track data from qualityData
  qualityData.forEach(function(track){
    trackStems.forEach(function(trackStem) {
      var t = trackStem.track_id;
      if (track.track_id == t) {
      // create new obj
      var obj = {"artist": track.artist, "track": track.track, 
        "track_id": track.track_id, "stem": trackStem.stem, "count": trackStem.cnt, "date": track.date};
        unsortedTracks.push(obj);
      }
    });
  });
  tracks = sortByProperty(unsortedTracks, "count");
  
  if (maxValue == null)
    maxValue = 1;

  stemCountScale.domain([0,maxValue]);

  currentSelection = word;

  
  var tableHTML = "";

  for (var i = 0; i < tracks.length; i++)
  {
    tableHTML += "<tr>" + 
                    "<td>" + (i+1) + "</td>" + 
                    "<td>" + tracks[i].track + "</td>" + 
                    "<td>" + tracks[i].artist + "</td>" + 
                    '<td><svg width="' + musicQualWidth + '" height="25px" ><rect width="' + 
                    stemCountScale(tracks[i].count) + '" height="15px" class="lit" ></rect>' + 
                    "</svg></td></tr>";

  }

  d3.select("#MusicPropType h5").html('<img alt="sort descending" src="./images/sort_' + sortOrder + '.png">' + word);

  d3.select("#musicDetailsTable tbody").html(tableHTML);
}

function populateStoriesTable()
{
  var minDate = brush.extent()[0];
  var maxDate = brush.extent()[1];
  var storiesCount = 0;

  var storiesHTML = "";

  for (var i = 0; i < econStoriesData.length; i++)
  {
    var d = econStoriesData[i];

    if ((d.year >= minDate.getFullYear() && d.year <= maxDate.getFullYear()) || minDate.getTime() === maxDate.getTime())
    {
      storiesHTML += "<tr><td>" + d.year + "</td><td>" + d.story + "</td>";
      storiesCount++;

      if (storiesCount == maxStoriesCount)
        break;
    }
  }

  d3.select("#storyTable tbody").html(storiesHTML);
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

function getTrackSet(array,dateProperty)
{
  var trackArray = [];
  var minDate = brush.extent()[0];
  var maxDate = brush.extent()[1];
  
  // get list of track IDs for this date range
  for (var i = 0; i < array.length; i++)
  {
    var d = array[i];
    var thisDate = d[dateProperty];

    if ((thisDate >= minDate && thisDate <= maxDate) || minDate.getTime()  === maxDate.getTime())
        trackArray.push(d["track_id"]);
        
  }
 
  return trackArray;

 }

 function filterLyricsArray(tracks, group) {
  var returnArray = [];

  tracks.forEach(function(track){
    if (wordData.has(track)) {
      var vals = wordData.get(track);
      vals.forEach(function(v) { 
        if (v[0].grp == group) {
          returnArray.push(+v[0].sum);
        }
      });
    }
  });
  return returnArray;
 }

function populateLyricsDetail(tracks, group)
{
  var stemData = d3.map();
  var cnt = 0;

  lyricDetailsSelection = group;
  // turn all off first
  d3.selectAll("#lyricQualities td").classed("lit", false)
  // now turn this one on
  d3.select("#" + group).classed("lit", true);

  // retrieve the track from wordData if it's there
  tracks.forEach(function(track){
    if (wordData.has(track)) {
      var vals = wordData.get(track);
      // look for the group
      vals.forEach(function(v) { 
        if (v[0].grp == group) {
          // get stems
          var stems = v[0].stems;
          // go thru stems array 
          // each stemObj has stem, cnt
          stems.forEach(function(stemObj){
            if (stemData.has(stemObj.stem)) {
              // update its count
              cnt = stemData.get(stemObj.stem) + stemObj.cnt;
              stemData.set(stemObj.stem, cnt);
            }
            else {
              // create it
              stemData.set(stemObj.stem, stemObj.cnt);
            }
          }); // end stems
        }
      }); // end vals
    }
  }); // end tracks

  formatLyricsDetail(stemData);
}

function formatLyricsDetail(stemMap) {
  var lyricDetailsCount = 0;

  var tempSortList = [];
  var sortList = [];
  for (var stem in stemMap)
    tempSortList.push([stem, stemMap[stem]]);

  tempSortList.sort(function(a, b) {return b[1] - a[1]});

  sortList = tempSortList.slice(0, maxLyricDetails);


  var lyricsHTML = "";
  
  for (var i = 0; i < sortList.length; i++)
  {
    var d = sortList[i];

    // hack
    var stem = d[0].substr(1, d[0].length);

    lyricsHTML += "<tr><td class='clickable' id='" + stem + "' onclick=\"populateMusicDetailsTableWithWord('" + stem + "')\"><ul><li>" + stem + " (" + d[1] + ")</li></ul></td></tr>";
    lyricDetailsCount++;

    if (lyricDetailsCount == maxLyricDetails)
      break;
  }

  d3.select("#stemDetails").html(lyricsHTML);

}

function getTracksWithWord(tracks, stem) {

  var cnt = 0;
  var hasStem;
  var tracksWithWord = [];

 // retrieve the track from wordData if it's there
  tracks.forEach(function(track){
    hasStem = false;
    if (wordData.has(track)) {
      var vals = wordData.get(track);
        // for each group
      vals.forEach(function(v) { 
          // get stems
          var stems = v[0].stems;
          // go thru stems array 
          // each stemObj has stem, cnt
          stems.forEach(function(stemObj){
            if (stemObj.stem == stem) {
              // update its count -- there will be only 0-1 match
              cnt = stemObj.cnt;
              hasStem = true;
            }
          }); // end stems
      if (hasStem) {
        tracksWithWord.push({"track_id": track, "stem": stem, "cnt": cnt});
        hasStem = false;
      }
        
      }); // end vals

    }
  }); // end tracks

  return tracksWithWord; 
}


function sortByProperty(array, valueProperty)
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

  tempArray.sort(function (a,b)
  {
    if (a[valueProperty] > b[valueProperty])
    {
      if (sortOrder == 'desc')
        return -1;
      else
        return 1;
    }
    else if (a[valueProperty] < b[valueProperty])
      if (sortOrder == 'desc')
        return 1;
      else
        return -1;
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

  if (sortOrder == 'desc')
    maxValue = tempArray[0][valueProperty];
  else
    maxValue = tempArray[tempArray.length-1][valueProperty];

  for (i = 0; i < tempArray.length; i++)
  {
    returnArray.push(tempArray[i]);

    if (i == 9)
      break;
  }

  return returnArray;
}