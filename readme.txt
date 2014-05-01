Data Creation
=============

One-time Steps
--------------

1. saveUnionTrackIds.html -- Save the tracks for which we can 
produce word counts, prior to grouping. 

Files Needed:
"final_tracks.csv"     		// All Whitburn songs for which we have track IDs
"mxm_all_trackids.csv" 		// track ids from full mxm set

Output file:
"lyricTrackIds.csv"

2. saveReducedMxm.html -- pare down the universe of track data
contained in the MXM dataset (which contains 237K records). Results
in approximately 3800 records.

Files needed:
"mxm_all.txt";           // full mxm data file
"lyricTrackIds.csv";    // track Ids of all Whitburn data we could get 

Output file:
"mxmReduced.json"

NOTE: The "mxmReduced.json" file is the only file needed for further work.

Updating the Stem Groupings
---------------------------

1. Manually edit stemGroupingsNew spreadsheet. Output "stemGroupingsNew.csv".

2. create.html -- puts word stems into groups.

Files Needed:
"stemGroupingsNew.csv"     		

Output File:
"lyricsReference.json"
 
3. lyrics.html -- create the file that's used in the viz.

Files Needed:
"mxmReduced.json"
"lyricsReference.json"

Output File:
"trackMap.json"


