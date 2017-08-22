---
layout: notes
title: Collecting US Political Party Platform Texts (Using *R*)
date: 2016-09-01
---

## Getting Started

This post discusses how to collect the full text of every Democratic and Republican political party platform since the 1960 political conventions. The data are readily available, including the full-text of the Democratic and Republican party platforms back to 1864 (and earlier for other parties), from UC Santa Barbara's [American Presidency Project](http://www.presidency.ucsb.edu/platforms.php). 

Full-text of party platform documents from 1960 forward are also available through the [*manifestoR*](https://manifesto-project.wzb.eu/information/documents/manifestoR) package, which I use below. The *manifestoR* package was created by the [Manifesto Project](https://manifesto-project.wzb.eu/) and is supported by the [WZB Berlin Social Science Center](https://www.wzb.eu/en) and the [German Research Foundation](http://www.dfg.de/en/index.jsp). 

In order to use the *manifestoR* package, you'll need to register for an account on the Manifesto Project website and generate an API key. 

To get the API key, do the following:

  * create your Manifesto Project account [here](https://manifesto-project.wzb.eu/signup)
  
  * log in to your account using the email address and password 
  
  * go to your profile (upper right corner of webpage) 
  
  * generate your API key
  
  * Copy the API key into the code below where it reads _YOUR-API-KEY-HERE_. 

```{r eval=T, include=F}
require(manifestoR)
mp_setapikey(key = '4b474084a30d9892716f2f6181dfa0bf')
```

```{r eval=TRUE, message=FALSE, results='hide'}
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
