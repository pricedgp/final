var lyricsWeWant;
var lyricGroups;
var trackData;
var trackMap;
var categories;
/*
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
After than
*/
// ==========================================
function createLyricReference() {
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
  d3.tsv("./data/topWordsInOrder.csv", function(error, data) {
    lyricsData = data;

    // manually create a map
    // 
    lyricMap = d3.map();
    lyricsData.forEach(function(e) {
    // the word stem is the key (1st param), the position/rank is the value (2nd)
      lyricMap.set(e.stem, e.key);
    });

    var myArray = [];

    var item, idx;
    lyricsWeWant.forEach(function (e) {
      if ( lyricMap.get(e.stem) ) {
        // find key using stem
        item = lyricMap.get(e.stem);
        myArray.push({"key": +item, "word": e.stem, "group": e.group});
      }
    });

    console.log(myArray.length);
    // saveToFile(myArray, "lyricGroups.csv");
    lyricGroups = myArray;

   
  });
};

// ==========================================
/* Populates categories; depends on lyricGroups.
To make life simpler, this function gets the list of
unique groups ("buckets") that are used to classify the
terms we search.
*/
function getCategories() {

  if (lyricGroups == undefined) {
    createLyricReference();
  }

  lyricGroups.forEach(function(item) {
    if (categories.indexOf(item.group) < 0) {// if not already there
      categories.push(item.group);
    }
  });
}


// ==========================================
function getStemGroups() {
    
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

    d3.csv("./data/lyricGroups.csv", function(error, data) {
      lyricGroups = data;

    });
  }

// =============================================
/* loads trackMap
  This object is loaded from a file containing all of the track-word
  data obtained from Echo Nest. That file is a manual concatenation of the train
  and test files (minus the first row in each, which is the word data)
*/

function loadTrackData() {
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
      myRows.forEach(function(row) {
        var values = [];
        // elements in the row array:
        row.forEach(function(element, i) {
          if (i == 0) {
            trackId = element; // first element is MSD track ID
          }
          if (i > 1) { // skip the keys (0, 1)
            splitStr = element.split(":"); 
            values.push({"stemID": splitStr[0], "count": splitStr[1]});
          }
        }); // finished with element -- add to map
        trackMap.set(trackId, values);

      }); // next row

    });
  }


// =============================================
/*
Returns a WordBag object, which consists of:
Summary: Array of GroupCount objects {"group": groupName, "count": totalCount}
Details: Array of WordDetail object {"stem": wordStem, "count": stemCount}

*/
function getWordBag(trackId) {
  var WordBag = [];
  var Summary = [];
  var Detail = [];
  var trackObject;
  var GroupCount = d3.map();
  var count = 0;
  // make sure source objects are initialized
  // init();

  categories.forEach(function(item) {
    GroupCount.set(item, count);
  })

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

  return WordBag;

}


// =============================================
var init = function() {
  if (trackMap == undefined) {
    // initialize it
    loadTrackData();
  }

  if (lyricGroups == undefined) {
    // initialize it
    createLyricReference();
  }

  if (categories == undefined) {
    getCategories();
  }

}


  var saveToFile = function(object, filename){
    lyricGroups = myArray;

      var blob, blobText;
      blobText = [JSON.stringify(object, '\t')];
      blob = new Blob(blobText, {
          type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename);
  }

