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

I next use <code><a href="http://dplyr.tidyverse.org/" target="_blank">dplyr</a></code> to calculate the total funding received by each state. I label this variable <code>state_assistance</code>, which is then used in the next code chunk to map the data.

<?prettify?>
<pre class="prettyprint lang-r">
# calculate state-by-state funding totals
total_state_funding <- state_local_assistance %>% 
    group_by(principal_place_state_code) %>%
        summarise(state_assistance = sum(fed_funding_amount)) 
</pre>

At this point, we can finally start to visualize how federal funds are distributed across the country. I start with a simple map of the fifty states shaded by their total funding amount. You can read more about creating maps in R with <code><a href="http://ggplot2.org/" target="_blank">ggplot2</a></code> and <code>fiftystater</code> <a href="https://cran.r-project.org/web/packages/fiftystater/vignettes/fiftystater.html" target="_blank">on this page</a>. (And for more on the color palette I use, check out the <code><a href="https://cran.r-project.org/web/packages/viridis/vignettes/intro-to-viridis.html" target="_blank">viridis</a></code> package.)

<?prettify?>
<pre class="prettyprint lang-r">
# Load fifty-state shape file from fiftystater package
data('fifty_states')

# Add column to data with lower-case state names rather than abbreviation
total_state_funding$state_id <- ''

# Loop to look up state name; make lower case to match map data
for(i in 1:nrow(total_state_funding)){
    total_state_funding$state_id[i] <-
        tolower(state.name[grep(total_state_funding$principal_place_state_code[i], 
                        state.abb)])
}

# Plot map
ggplot(total_state_funding, aes(map_id = state_id)) + 
    # map points to the fifty_states shape data
    geom_map(aes(fill = state_assistance), map = fifty_states) + 
    expand_limits(x = fifty_states$long, y = fifty_states$lat) +
    coord_map() +
    scale_x_continuous(breaks = NULL) + 
    scale_y_continuous(breaks = NULL) +
    labs(x = "", y = "", title = 'Federal Spending to US States') +
    theme(legend.position = "bottom", 
    panel.background = element_blank()) + 
    fifty_states_inset_boxes() +
    scale_fill_viridis(option = 'viridis')
</pre>

<img class="img-responsive" src="/images/notes/fed_spending_us_states.jpeg"/>

#### Per-capita state spending

Not surprisingly, California, New York, and Texas get the most money. These are also the three most populous states. Thus, a reasonable feature to take into account is population. The next code block calculate per-capita spending by drawing in US Census population estimates for each state.

There are multiple ways to incorporate demographic data into analyses. For example, the Census makes population estimates available for download <a href="https://www.census.gov/data/tables/2016/demo/popest/state-total.html" target="_blank">on its website</a>. However, in the interest of keeping the analysis contained within R, I will use the <code><a href="https://hrecht.github.io/censusapi/index.html" target="_blank">censusapi</a></code> package. Before using this package, you'll need to set up an API key on the Census website, which you can do <a href="http://api.census.gov/data/key_signup.html" target="_blank">here</a>. It's worth spending some time getting to know the <code>censusapi</code> package, starting with the list of available APIs. You can make a table of these with <code>as.data.frame(listCensusApis())</code>. The API I use here is the "Vintage 2016 Population Estimates: Population Estimates," known as 'pep/population' in the API. You can also see the list of variables included in a Census API with the <code>listCensusMetadata()</code> command (in this case, <code>listCensusMetadata(name="pep/population", type = "variables", vintage = 2016)</code>).

<?prettify?>
<pre class="prettyprint lang-r">
# Get population data from censusapi
# Set your Census API key using Sys.setenv(CENSUS_KEY='YOUR_API_KEY')

# Download Census population estimates by state for 2016
population_data <- getCensus(name = 'pep/population', 
                                vars = c('STATE', 'POP'), 
                                region = "state:*", 
                                vintage = 2016)
</pre>

The STATE variable in the population data is the state FIPS code, rather than the state name. We haven't made use of FIPS codes thus far, and so need to convert them to names or abbreviations. Thankfully, the <code><a href="https://cran.r-project.org/web/packages/noncensus/noncensus.pdf" target="_blank">noncensus</a></code> package is here to help. After creating a table with state abbreviations and corresponding FIPS codes, I run a loop to add the abbreviations to the population data frame.

<?prettify?>
<pre class="prettyprint lang-r">
# Load noncensus package 
require(noncensus)
data("counties")

# Use dplyr to create table of states and state FIPS codes 
state_fips <- distinct(select(counties, state, state_fips))

# Make character instead of factor
state_fips$state <- as.character(state_fips$state)
state_fips$state_fips <- as.character(state_fips$state_fips)

# Make columns for state name and abbreviation in population data
# Re-use principal_place_state_code as name for merge later
population_data$principal_place_state_code <- ''

# Loop to match state name and abbreviation to FIPS in population_data
for(i in 1:nrow(population_data)){
    population_data$principal_place_state_code[i] <- 
        state_fips$state[which(state_fips$state_fips ==
                                population_data$STATE[i])]
}

# clean up data frame by only keeping columns with abbreviations and population
population_data <- subset(population_data, 
                            select = c('principal_place_state_code', 'POP'))
</pre>

Now, we can merge the population data with the total state spending data and calculate per-capita spending. 

<?prettify?>
<pre class="prettyprint lang-r">
# Merge population data with total_state_funding data frame
total_state_funding <- left_join(total_state_funding,
                                    population_data,
                                    by = 'principal_place_state_code')

# Divide 2016 spending by estimated 2016 population
total_state_funding$per_capita_funding <- as.numeric(total_state_funding$state_assistance)/
as.numeric(total_state_funding$POP)

# Summarize per-capita funding
summary(total_state_funding$per_capita_funding)
</pre>

<?prettify?>
<pre class="prettyprint lang-r">
##  Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
## 434.7  1211.0  1505.0  1521.0  1824.0  2769.0 
</pre>

As we can see, federal funding to state and local government entities ranged from $434.70/person to $2,769/person in fiscal year 2016. We can now map this using a slightly altered version of the code block above. 

<?prettify?>
<pre class="prettyprint lang-r">
# Plot map - per-capita federal funding in FY 2016
ggplot(total_state_funding, aes(map_id = state_id)) + 
    # map points to the fifty_states shape data
    geom_map(aes(fill = per_capita_funding), map = fifty_states) + 
    expand_limits(x = fifty_states$long, y = fifty_states$lat) +
    coord_map() +
    scale_x_continuous(breaks = NULL) + 
    scale_y_continuous(breaks = NULL) +
    labs(x = "", y = "", title = 'Federal Spending to US States') +
    theme(legend.position = "bottom", 
    panel.background = element_blank()) + 
    fifty_states_inset_boxes() +
    scale_fill_viridis(option = 'viridis')
</pre>

<img class="img-responsive" src="/images/notes/fed_spending_us_states_percapita.jpeg"/>

<?prettify?>
<pre class="prettyprint lang-r">
# Print a rank-ordered table of all 50 states per-capita federal funding
total_state_funding[order(total_state_funding$per_capita_funding, 
                            decreasing = T), 
                    c(3,5)] # columns for state_id and per_capita_funding 
</pre>

