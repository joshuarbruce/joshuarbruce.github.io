---
layout: notes
title: Collecting US Political Party Platform Texts (Using R)
date: 2016-09-01
---

### Getting Started

This post discusses how to collect the full text of every Democratic and Republican political party platform since the 1960 political conventions. The data are readily available, including the full-text of the Democratic and Republican party platforms back to 1864 (and earlier for other parties), from UC Santa Barbara's [American Presidency Project](http://www.presidency.ucsb.edu/platforms.php). 

Full-text of party platform documents from 1960 forward are also available through the [*manifestoR*](https://manifesto-project.wzb.eu/information/documents/manifestoR) package, which I use below. The *manifestoR* package was created by the [Manifesto Project](https://manifesto-project.wzb.eu/) and is supported by the [WZB Berlin Social Science Center](https://www.wzb.eu/en) and the [German Research Foundation](http://www.dfg.de/en/index.jsp). 

In order to use the *manifestoR* package, you'll need to register for an account on the Manifesto Project website and generate an API key. 

To get the API key, do the following:

  * create your Manifesto Project account [here](https://manifesto-project.wzb.eu/signup)
  
  * log in to your account using the email address and password 
  
  * go to your profile (upper right corner of webpage) 
  
  * generate your API key
  
  * Copy the API key into the code below where it reads _YOUR-API-KEY-HERE_. 

```r
require(manifestoR)
mp_setapikey(key = '4b474084a30d9892716f2f6181dfa0bf')
```

```r
# Note, if you do not already have them installed, this script requires the following 
# packages in addition to manifestoR:
    # XML, rvest, stringr

# install.packages('manifestoR')

# Load manifestoR
require(manifestoR)

# Set your own API key like this, and don't forget to delete the pound (#) sign:
# mp_setapikey(key = 'YOUR-API-KEY-HERE')

# Create a corpus of all U.S. documents (since 1960)
my_corpus <- mp_corpus(countryname == 'United States')
```

With the package loaded and the US platform corpus created, we can now look at individual party platforms. Let's take a look at the beginning lines in the Democratic and Republican platforms of 1960.

```r
# Extract first 1,000 characters of the 1960 Democratic party platform
substr(as.character(head(content(my_corpus[['61320_1960']])), stringsAsFactors = F), 1, 1000)
```
<pre class="prettyprint pre-scrollable">
<code>
## [1] "In 1796, in America's first contested national election, our Party, under the leadership of Thomas Jefferson, campaigned on the principles of \"The Rights of Man\". Ever since, these four words have underscored our identity with the plain people of America and the world. In periods of national crises we Democrats have returned to these words for renewed strength. We return to them today. In 1960, \"The Rights of Man\" are still the issue. It is our continuing responsibility to provide an effective instrument of political action for every American who seeks to strengthen these rights everywhere here in America, and everywhere in our 20th Century world. The common danger of mankind is war and the threat of war. Today, three billion human beings live in fear that some rash act or blunder may plunge us all into a nuclear holocaust which will leave only ruined cities, blasted homes, and a poisoned earth and sky. Our objective, however, is not the right to coexist in armed camps on the same plan"
</code>
</pre>

```r
# Extract first 1,000 characters of the 1960 Republican party platform
substr(as.character(head(content(my_corpus[['61620_1960']])), stringsAsFactors = F), 1, 1000)
```
<pre class="prettyprint pre-scrollable">
<code>
## [1] "PREAMBLE The United States is living in an age of profoundest revolution. The lives of men and of nations are undergoing such transformations as history has rarely recorded. The birth of new nations, the impact of new machines, the threat of new weapons, the stirring of new ideas, the ascent into a new dimension of the universe, everywhere the accent falls on the new. At such a time of world upheaval, great perils match great opportunities and hopes, as well as fears, rise in all areas of human life. Such a force as nuclear power symbolizes the greatness of the choice before the United States and mankind. The energy of the atom could bring devastation to humanity. Or it could be made to serve men's hopes for peace and progress to make for all peoples a more healthy and secure and prosperous life than man has ever known. One fact darkens the reasonable hopes of free men, the growing vigor and thrust of Communist imperialism. Everywhere across the earth, this force challenges us to prove"
</code>
</pre>

### Setting Up the Corpus for Analysis 

Now that we know we have the *manifestoR* data for the US and can readily access it, we need to structure it for future analyses. While there are multiple ways of doing this, I set the corpus up as a data frame, which I find most straightforward for things like topic modeling or word count analysis. 

This section of code builds the data frame to store information about the authoring political party and year for each platform document and extracts the platform text from the *manifestoR* package, adding it to the corresponding data frame column and row. 

```r
# Make data frame to store platforms and account for year and party
  # We know to add 30 rows because this covers 15 years for 2 political parties.
  # Adjust the number of rows if adding more years. 
platform_data_frame <- as.data.frame(matrix(nrow = 30, ncol = 4)) 
colnames(platform_data_frame)[1] <- 'year'
colnames(platform_data_frame)[2] <- 'party'
colnames(platform_data_frame)[3] <- 'party_id'
colnames(platform_data_frame)[4] <- 'platform'

# label party affiliation
platform_data_frame$party[1:15] <- 'r' # Republicans
platform_data_frame$party[16:30] <- 'd' # Democrats 

# numeric lookup id's for manifestoR package
platform_data_frame$party_id[1:15] <- '61620' # Republican ID number used in manifestoR
platform_data_frame$party_id[16:30] <- '61320' # Democrat ID number used in manifestoR

# years covered 
years <- c('1960', '1964', '1968', '1972','1976', '1980','1984','1988','1992','1996','2000','2004','2008','2012','2016')

# assign years to rows
for(i in 1:length(years)){
  platform_data_frame$year[i] <- as.character(years[i])
  platform_data_frame$year[(i+15)] <- as.character(years[i])
}

# pull party platforms from manifestoR package and store in data frame
for(i in 1:nrow(platform_data_frame)){
  try(
    platform_data_frame$platform[i] <- as.character(head(content(
    my_corpus[[paste0(platform_data_frame$party_id[i],'_',platform_data_frame$year[i])]]))[1], 
    stringsAsFactors = F)
    )
}
```

When you run this script, you should get two errors that look like the following:

> Error in UseMethod("content", x) : 
  no applicable method for 'content' applied to an object of class "NULL"

