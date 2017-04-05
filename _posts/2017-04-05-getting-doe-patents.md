This short guide illustrates how to collect information on patents supported by the <a href="https://energy.gov/" target="blank">U.S. Department of Energy</a> through government-awarded grants and contracts. The data is available from a freely accessible <a href="https://www.osti.gov/home/XMLServices.html" target = "blank">DoE API</a>. I'm using <a href="https://www.r-project.org/" target="blank">R</a> to download and manipulate this data. 

To begin, you'll need to <code>require</code> the R libraries <a href="https://cran.r-project.org/web/packages/XML/index.html" target = "blank">XML</a> and <a href="https://cran.r-project.org/web/packages/xml2/index.html" target="blank">xml2</a>. 

```{r}
require(XML)
require(xml2)
```

These packages make it simple to download and reformat the raw <a href="https://en.wikipedia.org/wiki/XML" target="blank">XML files</a> from the DoE API. To get a sense of what this data looks like, we can download and inspect a single record. The base text of the API call is: <code><a href="#" class="diables">https://www.osti.gov/doepatents/doepatentsxml?</a></code>, to which we add <code>nrows=1&page=0</code>, telling the API we only want the first result of however many pages are avaialable. 
