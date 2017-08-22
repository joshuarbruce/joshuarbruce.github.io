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
```
## [1] "In 1796, in America's first contested national election, our Party, under the leadership of Thomas Jefferson, campaigned on the principles of \"The Rights of Man\". Ever since, these four words have underscored our identity with the plain people of America and the world. In periods of national crises we Democrats have returned to these words for renewed strength. We return to them today. In 1960, \"The Rights of Man\" are still the issue. It is our continuing responsibility to provide an effective instrument of political action for every American who seeks to strengthen these rights everywhere here in America, and everywhere in our 20th Century world. The common danger of mankind is war and the threat of war. Today, three billion human beings live in fear that some rash act or blunder may plunge us all into a nuclear holocaust which will leave only ruined cities, blasted homes, and a poisoned earth and sky. Our objective, however, is not the right to coexist in armed camps on the same plan"
```

```r
# Extract first 1,000 characters of the 1960 Republican party platform
substr(as.character(head(content(my_corpus[['61620_1960']])), stringsAsFactors = F), 1, 1000)
```
```
## [1] "PREAMBLE The United States is living in an age of profoundest revolution. The lives of men and of nations are undergoing such transformations as history has rarely recorded. The birth of new nations, the impact of new machines, the threat of new weapons, the stirring of new ideas, the ascent into a new dimension of the universe, everywhere the accent falls on the new. At such a time of world upheaval, great perils match great opportunities and hopes, as well as fears, rise in all areas of human life. Such a force as nuclear power symbolizes the greatness of the choice before the United States and mankind. The energy of the atom could bring devastation to humanity. Or it could be made to serve men's hopes for peace and progress to make for all peoples a more healthy and secure and prosperous life than man has ever known. One fact darkens the reasonable hopes of free men, the growing vigor and thrust of Communist imperialism. Everywhere across the earth, this force challenges us to prove"
```

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

This is because the *manifestoR* package doesn't (at the time of writing, July 2016) include the 2016 platform texts. We'll address that next, but before going on, make sure to look at your data frame and ensure the text is there for earlier documents. To spot check, let's look at the entire 1992 Democratic platform.

```r
platform_data_frame$platform[which(
  platform_data_frame$year == 1992 & 
    platform_data_frame$party == 'd')]
```
```
## [1] "A New Covenant with the American People"
```

That doesn't look quite right... Turns out, the *manifestoR* package structures some platforms as one long text string, while other years are broken apart by sentence. To see how each is structured, we'll add a column to the platform data frame that tells us how many pieces the original text came in.

```{r}
# make column for length and add to data frame 
platform_data_frame$original_doc_length <- ''

for(i in 1:nrow(platform_data_frame)){
  platform_data_frame$original_doc_length[i] <-
    length(my_corpus[[(paste0(platform_data_frame$party_id[i],'_',platform_data_frame$year[i]))]])
}

## An alternative would be to look at the number of characters in each document in the platform data 
## frame using the 'nchar()' command.
```

```{r}
# Looking at year, party, and number of platform components:
subset(platform_data_frame, select = c(year, party, original_doc_length))
```
```
##    year party original_doc_length
## 1  1960     r                   1
## 2  1964     r                   1
## 3  1968     r                   1
## 4  1972     r                   1
## 5  1976     r                   1
## 6  1980     r                   1
## 7  1984     r                   1
## 8  1988     r                   1
## 9  1992     r                   1
## 10 1996     r                   1
## 11 2000     r                   1
## 12 2004     r                1989
## 13 2008     r                2308
## 14 2012     r                1793
## 15 2016     r                   0
## 16 1960     d                   1
## 17 1964     d                   1
## 18 1968     d                   1
## 19 1972     d                   1
## 20 1976     d                   1
## 21 1980     d                   1
## 22 1984     d                   1
## 23 1988     d                   1
## 24 1992     d                 444
## 25 1996     d                   1
## 26 2000     d                   1
## 27 2004     d                1000
## 28 2008     d                1216
## 29 2012     d                1395
## 30 2016     d                   0
```
Sure enough, while most are single text strings (i.e., the original document is a single piece), the 1992 Democratic platform is in 444 parts. Seven of the 28 platform documents included in the manifestoR package are not single text strings. To correct this, we can make data frames out of each of these seven entries (they include more than just the text of the documents, if you’re curious), collapse the column containing the individual pieces, and add the whole string to our platform data frame.

```r
# Make data frames, collapse text pieces, insert into platform_data_frame
for(i in 1:nrow(platform_data_frame)){
  # loop through every row checking for multi-part docs
  if(platform_data_frame$original_doc_length[i] > 1){ 
    # make data frame for each document record 
    text_pieces <- as.data.frame(my_corpus[[(paste0(
      platform_data_frame$party_id[i],'_',platform_data_frame$year[i]
    ))]])
    platform_data_frame$platform[i] <- paste(c(text_pieces[,1]), collapse = ' ')
    # we collapse the first column because that contains the individual sentences from the platforms
  }
}
```

Rather than print out each individual document (which you should do yourself to really check for completeness), we can instead look at the number of characters in each doc to make sure they are more than just the first sentences.

```r
as.data.frame(nchar(platform_data_frame$platform[1:30]))
```
```
##    nchar(platform_data_frame$platform[1:30])
## 1                                      69857
## 2                                      57608
## 3                                      66688
## 4                                     156434
## 5                                     132209
## 6                                     225417
## 7                                     179817
## 8                                     232544
## 9                                     183804
## 10                                    177839
## 11                                    225012
## 12                                    267806
## 13                                    299979
## 14                                    203194
## 15                                        NA
## 16                                    104733
## 17                                     32946
## 18                                    107881
## 19                                    165890
## 20                                    139585
## 21                                    250128
## 22                                    280974
## 23                                     31431
## 24                                     54845
## 25                                    100932
## 26                                    150167
## 27                                    111150
## 28                                    164626
## 29                                    160726
## 30                                        NA
```
Looks like everything worked well! Now we can turn to getting the 2016 platform texts...

#### Getting 2016 Platform Text

As noted above, the 2016 platforms are not yet included in the *manifestoR* package. However, they are both available from the UC Santa Barbara American Presidency Project website. 

```r
# load packages
require(rvest)
require(XML)
```
##### Republican Platform

```r
# Get HTML from the UCSB American Presidency webiste with 2016 Republican platform
ucsb_gop_2016_platform_url <- read_html('http://www.presidency.ucsb.edu/ws/index.php?pid=117718')

# parse HTML
ucsb_gop_2016_platform_parsed <- htmlParse(ucsb_gop_2016_platform_url)

# extract portion with the text 
text_gop_2016_platform <- xpathSApply(ucsb_gop_2016_platform_parsed, '//table', xmlValue)[1]

# look at the beginning of the text 
substr(text_gop_2016_platform, 1, 1000)
```
```
## [1] " \r\n\t\t\r\n        \n        \n        \n        \n        \n        \n        \n        \n      \n  \n  \n        \n        \n        \n        \n        \n        \n        \n      \n  \r\n\t\t\r\n\t\t \r\n\t\r\n\t\t\r\n\t\t\r\n      \r\n      Document Archive\r\n      • Public Papers of the Presidents\r\n      • State of the Union\r\n          Addresses & Messages\r\n      • Inaugural Addresses\r\n      • Weekly  Addresses\r\n      • Fireside Chats\r\n      • News Conferences\r\n      • Executive Orders\r\n      • Proclamations\r\n      • Signing Statements\r\n      • Press Briefings \r\n      • Statements of\r\n           Administration Policy\r\n      • Economic Report of the President\r\n      • Debates\r\n      • Convention Speeches\r\n      • Party Platforms\r\n      • 2016 Election Documents\r\n      • 2012 Election Documents \r\n      • 2008 Election Documents \r\n      • 2004 Election Documents \r\n      • 1960 Election Documents \r\n      • 2009 Transition\r\n      • 2001 Transition\r\n      Data Archive \r\n      Data Index\r\n      Media Archive\r\n      Audio/Video Index"
```
As we can see, the text is a mess because we scraped more than just the platform contents. (I tried narrowing it down using a more precise XML path, but no luck.) Thankfully, we can easily see locations in the text where we can delete everything before and after to reduce the text to just the platform document.

```r
# First, lets get rid of everything before the Preamble
text_gop_2016_platform <- gsub(".*Preamble", "", text_gop_2016_platform)

# Taking a look, it seems like this cleared out everything at the beginning. 
# However, the end of the file is still a mess.
substr(text_gop_2016_platform, 1, 1000)
```
```
## [1] "With this platform, we the Republican Party reaffirm the principles that unite us in a common purpose.We believe in American exceptionalism.We believe the United States of America is unlike any other nation on earth.We believe America is exceptional because of our historic role — first as refuge, then as defender, and now as exemplar of liberty for the world to see.We affirm — as did the Declaration of Independence: that all are created equal, endowed by their Creator with inalienable rights of life, liberty, and the pursuit of happiness.We believe in the Constitution as our founding document.We believe the Constitution was written not as a flexible document, but as our enduring covenant. We believe our constitutional system — limited government, separation of powers, federalism, and the rights of the people — must be preserved uncompromised for future generations.We believe political freedom and economic freedom are indivisible.When political freedom and economic freedom are separated"
```

```r
# To clear up the end of the file, this deletes everything after the phrase "The Platform Committee," 
# which includes all of the signatories to the platform as well as any text following it.
text_gop_2016_platform <- gsub("The Platform Committee.*", "", text_gop_2016_platform)

# Take a look at the last 1,000 characters of the platform text now
require(stringr)
str_sub(text_gop_2016_platform, -1000)
```
```
## [1] "technology must become a national priority in light of the way authoritarian governments such as China, Cuba, and Iran restrict free press and isolate their people limiting political, cultural, and religious freedom. Leaders of authoritarian governments argue that governments have the same legal right to control internet access as they do to control migrant access. A focus on internet freedom is a cost-effective means of peacefully advancing fundamental freedoms in closed and authoritarian societies. But it is also an important economic interest, as censorship constitutes a trade barrier for U.S. companies operating in societies like China with advanced firewall protection policies. A Republican administration will champion an open and free internet based on principles of free expression and universal values and will pursue policies to empower citizens and U.S. companies operating in authoritarian countries to circumvent internet firewalls and gain accurate news and information online."
```
```r
# You can see the whole document now contains only the corrected text.
# text_gop_2016_platform
```

Finally, add the full, cleaned text of the 2016 GOP platform to the data frame we created earlier. Make sure you look up the correct row index number for the 2016 Republican platform if you changed anything in the preceding code.

```{r}
platform_data_frame$platform[15] <- text_gop_2016_platform

# make sure the correct text was loaded
substr(platform_data_frame$platform[15], 1, 100)
```
```
## [1] "With this platform, we the Republican Party reaffirm the principles that unite us in a common purpos"
```



