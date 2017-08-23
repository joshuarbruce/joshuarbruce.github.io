---
layout: notes
title: Visualizing Federal Financial Assistance to States and Universities (with R) 
date: 2017-08-23
---

There are often discussions about the appropriate level of funding for the US federal government. Recently, this discussion took on renewed vigor as the Trump administration released a <a href="https://www.whitehouse.gov/sites/whitehouse.gov/files/omb/budget/fy2018/budget.pdf" target="_blank">budget plan</a> that would <a href="http://www.cnn.com/2017/05/23/politics/trump-budget-cuts-programs/index.html" target="_blank">dramatically shrink</a> domestic, non-defense spending. 

As someone who does research on federal expenditures, and who is generally interested in politics, I wanted to know more about this debate. It's also an excuse to play around with maps in R, which can be tricky but very satisfying. Hence, this post - a look at federal financial assistance to state and local governments from the US federal government. I start by looking at broad funding levels, and then dig a little deeper on the EPA and funding to colleges and universities. 

The data here are only for fiscal year 2016 (i.e., Oct. 1, 2015 - Sept. 30, 2016), but could easily be expanded back to at least FY 2000. The data are available from <a href="https://www.usaspending.gov" target="_blank">USASpending.gov</a>, a repository of all spending on contracts, grants, and other forms of assistance provided by the federal government. I specifically look at <a href="https://www.grants.gov/web/grants/learn-grants/grants-101.html" target="_blank">grants</a>, not contracts, which include most forms of non-contractual assistance from the government to non-federal entities, such as food stamps and research grants. 

To download the data, which I call <code>govt_assistance_2016</code> in the code below, proceed to the "Download Center" tab on the USASpending website. Select all agencies and fiscal year 2016. After you submit the request, it will generate the dataset, which may take a few minutes. Save this .csv file in your working directory. The following analysis also requires a variety of R packages, listed below.

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


