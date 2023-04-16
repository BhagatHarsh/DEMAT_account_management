// Get all the buttons
var buttons = document.querySelectorAll("button");

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", function () {
    // Get the search string from the URL
    const searchParams = new URLSearchParams(window.location.search);
    // Get the "data" parameter from the search string
    const dataParam = searchParams.get('data');
    // Parse the JSON data into an object
    const user = JSON.parse(decodeURIComponent(dataParam));
    var data = {
      quantity: parseInt(this.getAttribute("data-quantity")),
      symbol: this.getAttribute("data-symbol"),
        user: user
    };
    
    fetch('/approved_stocks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(() => {
        alert(quantity + " shares of " + this.getAttribute("data-symbol") + " approved successfully for " + this.getAttribute("id") + "!");
        insertText = "Request has been sent to " + user.broker_name + " successfully."
        document.getElementById('success-msg').innerHTML = insertText;
        document.getElementById('success-msg').style.display = 'block';
        setTimeout(function () {
          document.getElementById('success-msg').innerHTML = "";
          document.getElementById('success-msg').style.display = 'none';
        }, 5000); // 5000 milliseconds = 5 seconds
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        alert('An error occurred. Please try again later.');
      });
  });
}

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

