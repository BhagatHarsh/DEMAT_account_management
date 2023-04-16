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
      symbol: this.getAttribute("data-symbol"),
      quantity: parseInt(this.getAttribute("data-quantity")),
      exchange_name: this.id,
      demat_id: user.demat_id,
      user: user
    };
    fetch('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(() => {
        alert(data.quantity + " shares of " + data.symbol + " have been sent for approval to " + user.broker_name + "!");
        insertText = "Request has been sent to " + user.broker_name + " successfully."
        document.getElementById('success-msg').innerHTML = insertText;
        document.getElementById('success-msg').style.display = 'block';
        setTimeout(function () {
          document.getElementById('success-msg').innerHTML = "";
          document.getElementById('success-msg').style.display = 'none';
        }, 5000); // 5000 milliseconds = 5 seconds
        location.reload();
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
  // Get the table and table rows
  var table = document.getElementById("stocks");
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
