$(document).ready(function(){
  
  init_document_ready();

});

// - - - - - - - - - - - - - - - - - - - - - - - - - 
/* - - - - - - - - - - - - - - - - - - - - - - - - -
 * Anything that should be run as soon as DOM is 
 * loaded.
 * - - - - - - - - - - - - - - - - - - - - - - - - -
 */
 
function init_document_ready() {

  create_colorSwatch();

}

// - - - - - - - - - - - - - - - - - - - - - - - - -
// for each li.color, grab the hex color value in the item and set is at the background-color 

function create_colorSwatch() {

  $( "li.color" ).each(function() {
    
    var color = $( this ).text();
    $( this ).css( "background-color" , color );
    
    //if the single swatch color is too dark, use a lighter font color to display the hex color value
    
    var c = color.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 85) {
      $( this ).css( "color" , "#f0f0f0" );
    }
    
  });

}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}

// - - - - - - - - - - - - - - - - - - - - - - - - -


