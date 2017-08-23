---
layout: notes
title: Collecting Dept. of Energy-Supported Patents
date: 2017-04-05
---

This short guide illustrates how to collect information on patents supported by the <a href="https://energy.gov/" target="blank">U.S. Department of Energy</a> through government-awarded grants and contracts. The data is available from a freely accessible <a href="https://www.osti.gov/home/XMLServices.html" target = "blank">DoE API</a>. I'm using <a href="https://www.r-project.org/" target="blank">R</a> to download and manipulate this data. 

To begin, you'll need to <code>require</code> the R libraries <a href="https://cran.r-project.org/web/packages/XML/index.html" target = "blank">XML</a> and <a href="https://cran.r-project.org/web/packages/xml2/index.html" target="blank">xml2</a>. 

<?prettify?>
<pre class="prettyprint lang-r">
require(XML)
require(xml2)
</pre>

These packages make it simple to download and reformat the raw <a href="https://en.wikipedia.org/wiki/XML" target="blank">XML files</a> from the DoE API. To get a sense of what this data looks like, we can download and inspect a single record. The base text of the API call is: <code>ht<i></i>tps://ww<i></i>w.osti.g<i></i>ov/doepatents/doepatentsxml?</code>, to which we add <code>nrows=1&page=0</code>, telling the API we only want the first result of however many pages are avaialable. In order to make sense of the results, we will also parse the XML results...

<?prettify?>
<pre class="prettyprint lang-r">
xmlParse(read_xml('https://www.osti.gov/doepatents/doepatentsxml?nrows=1&page=0'))
</pre>

... which returns the following:

<pre class="prettyprint pre-scrollable">
<code>
&lt;?xml version="1.0" encoding="UTF-8"?&rt;
&lt;rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcq="http://purl.org/dc/terms/"&rt;
  &lt;records count="37698" morepages="true" start="1" end="1">
    &lt;record rownumber="1">
      &lt;dc:title>Silicon carbide whisker reinforced ceramic composites and method for making same&lt;/dc:title>
      &lt;dc:creator>Wei, G.C.&lt;/dc:creator&rt;
      &lt;dc:subject>36 MATERIALS SCIENCE; COMPOSITE MATERIALS; FABRICATION; FRACTURE PROPERTIES; SILICON CARBIDES; ALUMINIUM OXIDES; MULLITE; BORON CARBIDES&lt;/dc:subject>
      &lt;dc:subjectRelated/>
      &lt;dc:description>The present invention is directed to the fabrication of ceramic composites which possess improved mechanical properties especially increased fracture toughness. In the formation of these ceramic composites, the single crystal SiC whiskers are mixed with fine ceramic powders of a ceramic material such as Al{sub 2}O{sub 3}, mullite, or B{sub 4}C. The mixtures which contain a homogeneous dispersion of the SiC whiskers are hot pressed at pressures in a range of about 28 to 70 MPa and temperatures in the range of about 1,600 to 1,950 C with pressing times varying from about 0.75 to 2.5 hours. The resulting ceramic composites show an increase in fracture toughness which represents as much as a two-fold increase over that of the matrix material.&lt;/dc:description>
      &lt;dcq:publisher/>
      &lt;dcq:publisherAvailability>Patent and Trademark Office, Box 9, Washington, DC 20232 (United States)&lt;/dcq:publisherAvailability>
      &lt;dcq:publisherResearch>Union Carbide Corporation&lt;/dcq:publisherResearch>
      &lt;dcq:publisherSponsor/>
      &lt;dcq:publisherCountry>United States&lt;/dcq:publisherCountry>
      &lt;dc:date>1989-01-24&lt;/dc:date>
      &lt;dc:language>English&lt;/dc:language>
      &lt;dc:type>Patent&lt;/dc:type>
      &lt;dcq:typeQualifier/>
      &lt;dc:relation>Other Information: DN: Reissue of US Pat. No. 4,543,345, which was issued Sep. 24, 1985; PBD: 24 Jan 1989&lt;/dc:relation>
      &lt;dc:coverage/>
      &lt;dc:format>Medium: X; Size: [10] p.&lt;/dc:format>
      &lt;dc:identifier>OSTI ID: 27688, Legacy ID: OSTI ID: 27688&lt;/dc:identifier>
      &lt;dc:identifierReport>US RE 32,843/E/&lt;/dc:identifierReport>
      &lt;dcq:identifierDOEcontract>W-7405-ENG-26&lt;/dcq:identifierDOEcontract>
      &lt;dc:identifierOther>Other: PAN: US patent application 6-847,961&lt;/dc:identifierOther>
      &lt;dc:doi/>
      &lt;dc:rights>Patent Assignee: Martin Marietta Energy Systems, Inc., Oak Ridge, TN (United States)&lt;/dc:rights>
      &lt;dc:dateEntry>2009-12-14&lt;/dc:dateEntry>
      &lt;dc:dateAdded>1995-04-21&lt;/dc:dateAdded>
      &lt;dc:ostiId>27688&lt;/dc:ostiId>
      &lt;dcq:identifier-purl type=""/>
      &lt;dcq:identifier-citation>http://www.osti.gov/doepatents/biblio/27688&lt;/dcq:identifier-citation>
    &lt;/record>
  &lt;/records>
&lt;/rdf:RDF>
</code>
</pre>

We can thus see what the variables are in this dataset; there are 29 of them total. The value we're most interested in is the <code>identifierReport</code> field, which includes the patent number. I find converting the XML results to a list makes it more easily explorable, which we do with the <code>xmlToList()</code> command.

<?prettify?>
<pre class="prettyprint lang-r">
result_as_list <- xmlToList(xmlParse(read_xml('https://www.osti.gov/doepatents/doepatentsxml?nrows=1&page=0')))
</pre>

Once converted to a list, we can see the number of variables in the first item as follows: <code>length(result_as_list$records[[1]])</code>. 

In addition to this record's information, the results also tell us how many total records there are in the third line of the results, which states: <code>records count="37220"</code>. The entire DoE dataset is 37,698 records (as of August 22, 2017), and it grows continually as the DoE adds new information on old patents it identifies or new patents are issued.

To collect the whole dataset, I begin by constructing a dataframe to hold all of the records.

<?prettify?>
<pre class="prettyprint lang-r">
energy_records <- as.data.frame(matrix(nrow = 37698, ncol = 29))
</pre>

We can then add the variable names from our list to the <code>energy_records</code> dataframe, as follows.

<?prettify?>
<pre class="prettyprint lang-r">
# Add variable names to data frame
for(i in 1:ncol(energy_records)){
  colnames(energy_records)[i] <- names(result_as_list$records[[1]])[i]
}
</pre>

Having created a dataframe to store the whole DoE database (as it exists at the time of data collection), a loop can be used to iteratively call the DoE API, transform the XML results, and place the relevant information in the corresponding columns of the <code>energy_records</code> dataframe. I have broken apart the XML processing steps to better understand any errors that emerge while the loop is running, but this isn't necessary. Note that I have changed the number of records returned per page to 3000, the maximum allowed by the API. Given the 37,000+ records, we need to run the call 13 times to get all results, leading to <code>for(k in 0:12)</code> in the first line of code.

<?prettify?>
<pre class="prettyprint lang-r">
# Loop to get all DoE records 
for(k in 0:12){
  step1 <- read_xml(paste0('https://www.osti.gov/doepatents/doepatentsxml?nrows=3000&page=',k))
  step2 <- xmlParse(step1)
  step3 <- xmlToList(step2)
  closeAllConnections()
  for(i in 1:length(step3$records)){
    for(j in 1:length(step3$records[[1]])){
      if(k == 0){
        try({
          energy_records[i,j] <- step3$records[[i]][[j]][1] },
          silent = TRUE )
      }
      if(k > 0){
        try({
          energy_records[(i+(3001*(k-1))),j] <- step3$records[[i]][[j]][1] },
          silent = TRUE )
      }
    }
    # I print the page and row number as a status marker, but not necessary 
    print(paste0(k,': ', i))
  }
}
</pre>

