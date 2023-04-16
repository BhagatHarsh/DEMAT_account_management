// Get the search bar
var searchbar = document.getElementById("search-bar");

// Add a keyup event listener to the search bar
searchbar.addEventListener("keyup", function () {
  // Get all the dynamic tables
  var tables = document.querySelectorAll(".dynamic-table");

  // Get the search query
  var query = searchbar.value.toLowerCase();

  // Loop through each table and row and hide/show based on search query
  for (var i = 0; i < tables.length; i++) {
    var rows = tables[i].getElementsByTagName("tr");

    for (var j = 1; j < rows.length; j++) {
      var symbol = rows[j].getElementsByTagName("td")[0].textContent.toLowerCase();
      var demat_id = rows[j].getElementsByTagName("td")[1].textContent.toLowerCase();
      var quantity = rows[j].getElementsByTagName("td")[2].textContent.toLowerCase();
      var price = rows[j].getElementsByTagName("td")[3].textContent.toLowerCase();
      if (symbol.includes(query) || demat_id.includes(query) || quantity.includes(query) || price.includes(query)) {
        rows[j].style.display = "";
      } else {
        rows[j].style.display = "none";
      }
    }
  }
});

