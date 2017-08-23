---
layout: notes
title: Visualizing Federal Assistance to States (with R) 
date: 2017-08-23
---

There are often discussions about the approporaite level of funding for the US federal government. Recently, this discussion took on renewed vigor as the Trump administration released a <a href="https://www.whitehouse.gov/sites/whitehouse.gov/files/omb/budget/fy2018/budget.pdf" target="_blank">budget plan</a> that would <a href="http://www.cnn.com/2017/05/23/politics/trump-budget-cuts-programs/index.html" target="_blank">dramatically shrink</a> domestic, non-defense spending. 



<?prettify?>
<pre class="prettyprint lang-r">
require(XML)
require(xml2)
</pre>

#### End Note
In conclusion, this script allows us to download the entire body of the DOepants database and structure it into a single dataframe. With this data in hand, it's possible to link these records with numerous other datasets, such as USPTO records made available through <a href="http://www.patentsview.org/" target="_blank">PatentsView.org</a>. 
