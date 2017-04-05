This short guide illustrates how to collect information on patents supported by the <a href="https://energy.gov/" target="blank">U.S. Department of Energy</a> through government-awarded grants and contracts. The data is available from a freely accessible <a href="https://www.osti.gov/home/XMLServices.html" target = "blank">DoE API</a>. I'm using <a href="https://www.r-project.org/" target="blank">R</a> to download and manipulate this data. 

To begin, you'll need to <code>require</code> the R libraries <a href="https://cran.r-project.org/web/packages/XML/index.html" target = "blank">XML</a> and <a href="https://cran.r-project.org/web/packages/xml2/index.html" target="blank">xml2</a>. 

```{r}
require(XML)
require(xml2)
```

These packages make it simple to download and reformat the raw <a href="https://en.wikipedia.org/wiki/XML" target="blank">XML files</a> from the DoE API. To get a sense of what this data looks like, we can download and inspect a single record. The base text of the API call is: <code>ht<i></i>tps://ww<i></i>w.osti.g<i></i>ov/doepatents/doepatentsxml?</code>, to which we add <code>nrows=1&page=0</code>, telling the API we only want the first result of however many pages are avaialable. In order to make sense of the results, we will also parse the XML results.

```{r}
xmlParse(read_xml('https://www.osti.gov/doepatents/doepatentsxml?nrows=1&page=0'))
```
<pre class="prettyprint pre-scrollable"><code>
<div>
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcq="http://purl.org/dc/terms/">
  <records count="37220" morepages="true" start="1" end="1">
    <record rownumber="1">
      <dc:title>Silicon carbide whisker reinforced ceramic composites and method for making same</dc:title>
      <dc:creator>Wei, G.C.</dc:creator>
      <dc:subject>36 MATERIALS SCIENCE; COMPOSITE MATERIALS; FABRICATION; FRACTURE PROPERTIES; SILICON CARBIDES; ALUMINIUM OXIDES; MULLITE; BORON CARBIDES</dc:subject>
      <dc:subjectRelated/>
      <dc:description>The present invention is directed to the fabrication of ceramic composites which possess improved mechanical properties especially increased fracture toughness. In the formation of these ceramic composites, the single crystal SiC whiskers are mixed with fine ceramic powders of a ceramic material such as Al{sub 2}O{sub 3}, mullite, or B{sub 4}C. The mixtures which contain a homogeneous dispersion of the SiC whiskers are hot pressed at pressures in a range of about 28 to 70 MPa and temperatures in the range of about 1,600 to 1,950 C with pressing times varying from about 0.75 to 2.5 hours. The resulting ceramic composites show an increase in fracture toughness which represents as much as a two-fold increase over that of the matrix material.</dc:description>
      <dcq:publisher/>
      <dcq:publisherAvailability>Patent and Trademark Office, Box 9, Washington, DC 20232 (United States)</dcq:publisherAvailability>
      <dcq:publisherResearch>Union Carbide Corporation</dcq:publisherResearch>
      <dcq:publisherSponsor/>
      <dcq:publisherCountry>United States</dcq:publisherCountry>
      <dc:date>1989-01-24</dc:date>
      <dc:language>English</dc:language>
      <dc:type>Patent</dc:type>
      <dcq:typeQualifier/>
      <dc:relation>Other Information: DN: Reissue of US Pat. No. 4,543,345, which was issued Sep. 24, 1985; PBD: 24 Jan 1989</dc:relation>
      <dc:coverage/>
      <dc:format>Medium: X; Size: [10] p.</dc:format>
      <dc:identifier>OSTI ID: 27688, Legacy ID: OSTI ID: 27688</dc:identifier>
      <dc:identifierReport>US RE 32,843/E/</dc:identifierReport>
      <dcq:identifierDOEcontract>W-7405-ENG-26</dcq:identifierDOEcontract>
      <dc:identifierOther>Other: PAN: US patent application 6-847,961</dc:identifierOther>
      <dc:doi/>
      <dc:rights>Patent Assignee: Martin Marietta Energy Systems, Inc., Oak Ridge, TN (United States)</dc:rights>
      <dc:dateEntry>2009-12-14</dc:dateEntry>
      <dc:dateAdded>1995-04-21</dc:dateAdded>
      <dc:ostiId>27688</dc:ostiId>
      <dcq:identifier-purl type=""/>
      <dcq:identifier-citation>http://www.osti.gov/doepatents/biblio/27688</dcq:identifier-citation>
    </record>
  </records>
</rdf:RDF>
</div>
</code>
</pre>
