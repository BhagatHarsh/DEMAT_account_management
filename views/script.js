// Get all the buttons
var buttons = document.querySelectorAll("button");

// Loop through each button and add a click event listener
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", function() {
    var quantity = prompt("Enter quantity:");
    console.log(quantity); // Replace this with your desired code
  });
}

// Get the search bar
var searchbar = document.getElementById("search-bar");

// Add a keyup event listener to the search bar
searchbar.addEventListener("keyup", function() {
  // Get the table and table rows
  var table = document.getElementById("stocks-table");
  var rows = table.getElementsByTagName("tr");

  // Get the search query
  var query = searchbar.value.toLowerCase();

  // Loop through each row and hide/show based on search query
  for (var i = 1; i < rows.length; i++) {
    var symbol = rows[i].getElementsByTagName("td")[0].textContent.toLowerCase();
    var instrumentName = rows[i].getElementsByTagName("td")[1].textContent.toLowerCase();
    var price = rows[i].getElementsByTagName("td")[2].textContent.toLowerCase();
    if (symbol.includes(query) || instrumentName.includes(query) || price.includes(query)) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
});
