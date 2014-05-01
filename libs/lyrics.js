var lyricsWeWant;
var lyricGroups;
var trackData;
var trackMap;
var categories;
/*
Files needed (manual step): 
  topWordsInOrder.tsv
  stemGroupings.csv
  mxm_sample.txt (for testing -- 500 rows) -- use mxm_full.txt for real

TODO:


Create whitburn.csv (manual step)
Function to get that with d3.csv

Goal of fileoutput: Create a json file that contains, for each track in 
any csv that contains a xxx field:
    - trackID
    - array of stem/count/group objects (what to call this object?)

Will run for either the Whitburn csv or a reduced set of this.
For each track ID in the csv:





Purpose: Create a file that contains the key, stem and group
of each word stem listed in the selectedStems.csv file.
The selectedStems.csv file is manually created. It contains
an arbitrary number of word stem / group pairs, like so:

gray,EmotionNegative
satisfact,EmotionPositive
prize,MoneyHave
free,OutlookPositive

Loop through that file, getting the key from topWordsInOrder.txt,
which was manually extracted from the Echo Nest train file 
(retrieved at http://labrosa.ee.columbia.edu/millionsong/musixmatch).
To extract, take the first row of that file (it's 5000 words), save
it as topWords.txt, and then run the following bash command:
cat topWords.txt | sed s/,/\\n/g > topWordsInOrder.txt

*/


// ==========================================
function createLyricReference() {
  console.log("entering createLyricReference");
// creates the lyricGroups.csv file
// TODO: figure how to put in data directory
// (now must manually copy from downloads directory into data)
// Prerequisite: topWordsInOrder.csv must exist

  var data;
  var lyricsData;
  var lyricMap;
  
  // populate lyricsWeWant
  getStemGroups();
  
  // 5000 words in this file
  // position is the key to each stem
  //d3.tsv("./data/topWordsInOrder.csv", function(error, data) {



d3.tsv("./data/topWordsInOrder.tsv", function(error, data) {
    lyricsData = data;
          
      // do something if needed
    // manually create a map
    // 
    lyricMap = d3.map();
    lyricsData.forEach(function(e) {
    // the word stem is the key (1st param), the position/rank is the value (2nd)
      lyricMap.set(e.stem, e.key);
    });

   var item, idx;
     var lyricGroup = {};
     var myArray = [];

    lyricsWeWant.forEach(function (e) {
      if ( lyricMap.get(e.stem) ) {
        // find key using stem
        item = lyricMap.get(e.stem);
        lyricGroup = {"key": +item, "word": e.stem, "group": e.group};

        myArray.push(lyricGroup);
      }
    });

    console.log(myArray.length);
    saveToFile(myArray, "lyricGroups.json");
    
    
   
  });
  return lyricGroups;
};

// ==========================================
/* Populates categories; depends on lyricGroups.
To make life simpler, this function gets the list of
unique groups ("buckets") that are used to classify the
terms we search.
*/
function getCategories() {
  console.log("entering getCategories");

    lyricGroups.forEach(function(item) {
      if (categories.indexOf(item.group) < 0) {// if not already there
        categories.push(item.group);
      }
    });
}


// ==========================================
function getStemGroups() {
  console.log("entering getStemGroups");
    
    d3.csv("./data/stemGroupings.csv", function(error, data) {
      lyricsWeWant = data;
          
      // do something if needed
    });
    return lyricsWeWant; // don't really need this return
  };

  // ==========================================
  // loads lyricGroups 
  // this is loaded from file created by createLyricReference()
  function loadLyricGroups() {
    console.log("entering loadLyricGroups");

    d3.json("./data/lyricGroups.json", function(error, data) {
      lyricGroups = data;

      console.log("lyricGroups -- ");

    });
  }

// =============================================
/* loads trackMap
  This object is loaded from a file containing all of the track-word
  data obtained from Echo Nest. That file is a manual concatenation of the train
  and test files (minus the first row in each, which is the word data)
*/

function loadTrackData() {
console.log("entering loadTrackData");

  var myRows;
  /*
  Each row looks like this:
  /*
    0: "TRAAAAV128F421A322"
    1: "4623710"
    2: "1:6"
    3: "2:4"
*/
    // mxm_sample.txt contains 500 rows
    // the real file contains 237,000 rows
    d3.text("./data/mxm_sample.txt", function(text) {
      console.log(d3.csv.parseRows(text));
      myRows = d3.csv.parseRows(text);

      trackMap = d3.map(); 

      // create map -- will need to access later by trackId
      // create trackId as key, and values[{"stemID": xx, "count": xx}]
      var splitStr = [];
      var trackId; 
      var trackCount = {};
      myRows.forEach(function(row) {
        var values = [];
        // elements in the row array:
        row.forEach(function(element, i) {
          if (i == 0) {
            trackId = element; // first element is MSD track ID
          }
          if (i > 1) { // skip the keys (0, 1)
            splitStr = element.split(":"); 
            trackCount = {"stemID": splitStr[0], "count": splitStr[1]};
            values.push(trackCount);
          }
        }); // finished with element -- add to map
        trackMap.set(trackId, values);

      }); // next row
      // populate group counts ==============================
      lyricGroups.forEach(function(lg) {
        if (lg.key == trackObject.stemID) {
          count = trackObject.count; 
        }
        else {
          count = 0;
        }
        Details.push({"stem": lg.word, "count": count});
        // Summary
        groupCount = GroupCount.get(lg.group).count + count;
        GroupCount.set(lg.group, groupCount);

      });
      Summary.push(GroupCount.values); 

      WordBag.push({"summary": Summary, "details": Details});

      console.log("Wordbag: " + WordBag)

      return WordBag;
      

    });
  }


// =============================================
/*
Returns a WordBag object, which consists of:
Summary: Array of GroupCount objects {"group": groupName, "count": totalCount}
Details: Array of WordDetail object {"stem": wordStem, "count": stemCount}

*/
function getWordBag(trackId) {
  var WordBag;
  var Summary = [];
  var Detail = [];
  var trackObject;
  var GroupCount = d3.map();
  var count = 0;

  // make sure source objects are initialized
  // this is problematic...
  console.log("calling init from getWordBag");
  init(function() {

    categories.forEach(function(item) {
      GroupCount.set(item, count);
    })

  });


  // get trackMap object
  trackObject = trackMap.get(trackId);
  if (trackObject == undefined) {
    console.log("TrackId " + trackId + " not found!");
    return WordBag;
  }

  /* populate WordDetail objects -- go through lyricGroups
  {"key": item, "word": e.stem, "group": e.group}, and
  for each object, get its key and compare that to the stemID
  in the trackObject
  {"stemID": splitStr[0], "count": splitStr[1]}. 
  If it exists, get the count. If it doesn't exist, set the count to 0.
  Add that WordDetail object to the Detail array.

  populate GroupCount object -- in same loop, update the GroupCount map -- 
  find the key/value pair using the group as key -- update the value by
  adding the count to it. Add that GroupCount object to the Summary array
  */
  lyricGroups.forEach(function(lg) {
    if (lg.key == trackObject.stemID) {
      count = trackObject.count; 
    }
    else {
      count = 0;
    }
    Details.push({"stem": lg.word, "count": count});
    // Summary
    groupCount = GroupCount.get(lg.group).count + count;
    GroupCount.set(lg.group, groupCount);

  });
  Summary.push(GroupCount.values); 

  WordBag.push({"summary": Summary, "details": Details});

  console.log("Wordbag: " + WordBag)

  return WordBag;

}



// =============================================
function init() {
    console.log("entering init function");

  // assume that if categories defined, all else done too
  if (categories == undefined) {
    // 
    loadTrackData(function(){
        console.log("1) calling loadTrackData from init");

      createLyricReference(function() {
        console.log("2) calling createLyricReference from init");

        getCategories(function() {
            console.log("3) calling getCategories from init");

        });
      }); // end createLyricReference
    }); // end getCategories
  } // end if

}


// ===============================================
  var saveToFile = function(object, filename){

      var blob, blobText;
      blobText = [JSON.stringify(object, '\t')];
      blob = new Blob(blobText, {
          type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename);
  }

