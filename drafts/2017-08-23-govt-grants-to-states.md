---
layout: notes
title: Visualizing Federal Financial Assistance to States and Universities (with R) 
date: 2017-08-23
---

There are often discussions about the appropriate level of funding for the US federal government. Recently, this discussion took on renewed vigor as the Trump administration released a <a href="https://www.whitehouse.gov/sites/whitehouse.gov/files/omb/budget/fy2018/budget.pdf" target="_blank">budget plan</a> that would <a href="http://www.cnn.com/2017/05/23/politics/trump-budget-cuts-programs/index.html" target="_blank">dramatically shrink</a> domestic, non-defense spending. 

As someone who does research on federal expenditures, and who is generally interested in politics, I wanted to know more about this debate. It's also an excuse to play around with maps in R, which can be tricky but very satisfying. Hence, this post - a look at federal financial assistance to state and local governments from the US federal government. I start by looking at broad funding levels, and then dig a little deeper on the EPA and funding to colleges and universities. 

The data here are only for fiscal year 2016 (i.e., Oct. 1, 2015 - Sept. 30, 2016), but could easily be expanded back to at least FY 2000. The data are available from <a href="https://www.usaspending.gov" target="_blank">USASpending.gov</a>, a repository of all spending on contracts, grants, and other forms of assistance provided by the federal government. I specifically look at <a href="https://www.grants.gov/web/grants/learn-grants/grants-101.html" target="_blank">grants</a>, not contracts, which include most forms of non-contractual assistance from the government to non-federal entities, such as food stamps and research grants. 

### Get the data

To download the data, which I call <code>govt_assistance_2016</code> in the code below, proceed to the "Download Center" tab on the USASpending website. Select all agencies and fiscal year 2016. After you submit the request, it will generate the dataset, which may take a few minutes. Save this .csv file in your working directory. USASpending also provides a <a href="https://www.usaspending.gov/DownloadCenter/Documents/USAspending.govDownloadsDataDictionary.pdf" target="_blank">codebook</a> for the data available; Section 4 of the codebook pertains to grants. The following analysis also requires a variety of R packages, listed below.

<?prettify?>
<pre class="prettyprint lang-r">
# Loading data and required packages for visualizing federal spending data
setwd('~/My Working Directory')
require(stringr)
require(ggplot2)
require(rgdal)
require(maps)
require(maptools)
require(mapproj)
require(viridis)
require(rgeos)
require(dplyr)
require(fiftystater)
require(plyr)

govt_assistance <- read.csv('fed_assistance_fy_2016.csv', stringsAsFactors = F)
</pre>

Having loaded the data, we can now start to see where funding goes. Fist, by using <code>length(table(govt_assistance$principal_place_state_code))</code>, we can see there are 60 types of "states" that receive funding, indicating that non-state entities are included. I'm specifically interested in the 50 states, so I want to create a new data frame of just those records (I prefer to create new data frames rather than drop rows incase I make a mistake).

To begin, I make a table of the places where federal funds go. This is a count of grants, of which there are several sub-types, to each of the 60 state entities. This table is useful in part because it tells us states are identified by all-caps, two-letter abbreviations, which we can use to extract the records we want using R's built-in list of state abbreviations.    

<?prettify?>
<pre class="prettyprint lang-r">
# Create a table of grant frequency by state entity
table_of_state_grants <- as.data.frame(table(
    govt_assistance$principal_place_state_code),
    stringsAsFactors = F)
</pre>

<?prettify?>
<pre class="prettyprint lang-r">
# Look at top six rows from table_of_state_grants
head(table_of_state_grants)
</pre>

<?prettify?>
<pre class="prettyprint lang-r">
##   Var1  Freq
## 1      75527
## 2   00    98
## 3   AK  6373
## 4   AL  7990
## 5   AR  5042
## 6   AS   487
</pre>

This table tells us not only how many grants went to entities in each state, but also that the states are identified by two-letter, all-caps abbreviations. The next section of code subsets the data to only the 50 US states.

<?prettify?>
<pre class="prettyprint lang-r">
# Create data frame of only grants that went to the 50 US states
govt_assistance_states <- govt_assistance[which(
    govt_assistance$principal_place_state_code
    %in% as.list(toupper(state.abb))), ]
</pre>

### Grant recipients
Having subset the data, we can now look at what types of entities in each state were receiving grants, according to the classification in the USASpending data.

<?prettify?>
<pre class="prettyprint lang-r">
# Make a data frame of grant recipient types 
grant_recipient_types <- as.data.frame(table(govt_assistance_states$recipient_type), 
                                        stringsAsFactors = F)
print(grant_recipient_types)
</pre>
<?prettify?>
<pre class="prettyprint lang-r">
##                                                    Var1   Freq
## 1                                  00: State government 365575
## 2                                 01: County government   5988
## 3                       02: City or township government   8778
## 4                       04: Special district government   2254
## 5                       05: Independent school district  13153
## 6  06: State controlled institution of higher education  68415
## 7                                      11: Indian tribe  13819
## 8                                   12: Other nonprofit  45113
## 9                          20: Private higher education  31154
## 10                                       21: Individual  11738
## 11                              22: Profit organization   3633
## 12                                   23: Small business   8007
## 13                                        25: All other   8777
</pre>

In this case, I'm interested in funding that went to a state or lower-level governmental unit, which are the first five types of entities listed in the table. As such, I'll now make a new data frame that includes only these five types of recipients.

<?prettify?>
<pre class="prettyprint lang-r">
state_local_assistance <- govt_assistance_states[which(
    govt_assistance_states$recipient_type %in% grant_recipient_types[c(1:5),1]),]
</pre>

### Types of assistance 

Within the federal assistance data, there are a number of variables that tell us about each grant. One of the most important for understanding funding levels is to look at new and continuing grants (rather than a funding adjustment or revision to a previous grant). The *action_type* variable identifies whether a grant is new, continuing, revised, or adjusted. I'm interested in only the new and continuing grant disbursements, so I subset to just those records.

<?prettify?>
<pre class="prettyprint lang-r">
# create subset data frame of new and continuing funding
state_local_assistance <- state_local_assistance[which(
    state_local_assistance$action_type == 'A: New assistance action' |
        state_local_assistance$action_type == 'B: Continuation (funding in succeeding budget period which stemmed from prior agreement to fund amount of the current action)'),]
</pre>

We're left with 107,177 records, totaling over $476 billion in domestic assistance from the federal government to state and local entities.

### State-by-state federal funds

I next use <code><a href="http://dplyr.tidyverse.org/" target="_blank">dplyr</a></code> to calculate the total funding received by each state. 

<?prettify?>
<pre class="prettyprint lang-r">
# create state-by-state funding totals
total_state_funding <- state_local_assistance %>% 
    group_by(principal_place_state_code) %>%
        summarise(state_assistance = sum(fed_funding_amount)) 
</pre>

At this point, we can finally start to visualize how federal funds are distributed across the country. To do so, let's start with a simple map of the fifty states shaded by their total funding amount. You can read more about creating maps in R with the packages <code><a href="http://ggplot2.org/" target="_blank">ggplot2</a></code> and <code>fiftystater</code> <a href="https://cran.r-project.org/web/packages/fiftystater/vignettes/fiftystater.html" target="_blank">on this page</a>. (And for more on the color palette I use, check out the <code><a href="https://cran.r-project.org/web/packages/viridis/vignettes/intro-to-viridis.html" target="_blank">viridis</a></code> package.)



