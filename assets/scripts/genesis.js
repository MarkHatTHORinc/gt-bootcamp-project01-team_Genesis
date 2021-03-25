var newsApiKey = "XXX";
var tickerApiKey = "YYY";
var favoritesArray = [];

// Delete ticker symbol from local storage and favoritesArray
function deleteFavorite(stockTicker) {
    // Remove from Array
    // ..... need code here
    // Sort the favorite ticker symbols so they are alphabetical
    favoritsArray.sort();
    // Store to local storage
    localStorage.removeItem("favoriteStocks");
    localStorage.setItem("favoriteStocks", JSON.stringify(favoritesArray));
    return;
}

// Save ticker symbol to local storage
function saveTicker(stockTicker) {
    // Only store the stock ticker if it hasn't been previously stored
    if (!favoritesArray ||
        favoritesArray.length === 0 ||
        !favoritesArray.includes(stockTicker)) {
        favoritesArray.push(stockTicker);
        // Sort the favorite ticker symbols so they are alphabetical
        favoritsArray.sort();
        // Store to local storage
        localStorage.removeItem("favoriteStocks");
        localStorage.setItem("favoriteStocks", JSON.stringify(favoritesArray));
    }
    return;
}

// Get News Web API Call
function getNews(stockTicker) {
    var newsApiUrl = encodeURI(`https://newsapi.org/v2/everything?q=${stockTicker}&from=2021-03-25&sortBy=popularity&apiKey=${newsApiKey}`);

    fetch(newsApiUrl, {
        method: 'GET', //GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        cache: 'reload'  // Refresh the cache
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Build the Favorites section
            buildNews(data);
        })
        .catch(error => {
            // We need something besides an alert
            // alert('Stock Symbol entered is not valid.');
        });

    return;
}

// Get Favorites Info
function getFavoritesInfo() {
    var storedFavorites = JSON.parse(localStorage.getItem("favoriteStocks"));
    if (storedFavorites) {
        favoritesArray = storedFavorites;
    }
    // need to add each element of the favorites array to the URL below....
    var stockApiUrl = encodeURI(`https://api.twelvedata.com/complex_data?apikey=${tickerApiKey}`);

    fetch(stockApiUrl, {
        method: 'GET', //GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        cache: 'reload'  // Refresh the cache
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Build the Favorites section
            buildFavorites(data);
        })
        .catch(error => {
            // We need something besides an alert
            // alert('Stock Symbol entered is not valid.');
        });
    return;
}

function getTickerInfo(tickerName) {
    var stockApiUrl = encodeURI(`https://api.twelvedata.com/complex_data?apikey=${tickerApiKey}`);
    fetch(stockApiUrl, {
        method: 'GET', //GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Build the Ticker Section
            buildTickerInfo(tickerName, data);
            // Get the news for this ticker symbol
            getNews(data);
        });
    return;
}

// Build the ticker info section
function buildTickerInfo(tickerName, data) {
    // Clear out ticker info for searched ticker symbol
    $("#tickerInfo").empty();

    // Create Elements for ticker information
    // .....
    // .....    

    // Create HTML div to append new elements to render on page....
    var tickerInfoEl = $('<div>');
    tickerInfoEl.append(elementsAbove);
    $("#tickerInfo").html(tickerInfoEl);

    return;
}

// Build the favorites section
function buildFavorites(data) {
    // Clear out any previous favorites html elements
    $("#favorites").empty();
    // create elements for favorites
    // start index at 1 because 0 is current day
    data.forEach(ticker => {
        // Creating ticker div
        var tickerEl = $("<div class='card shadow-lg text-white bg-primary mx-auto mb-10 p-2' style='width: 8.5rem; height: 11rem;'>");

        // Extract values to be displayed
        var tickerSymbol = ticker.symbol;
        var tickerOpeningPrice = ticker.openingPrice;
        var tickerCurrentPrice = ticker.currentPrice;

        // Creating tags with the result items
        var tickerSymbolEl = $("<h5 class='card-title'>").text(tickerSymbol);
        var tickerOpeningPriceEl = $("<p class='card-text'>").text(`Opening Price:  ${tickerOpeningPrice}`);
        var tickerCurrentPriceEl = $("<p class='card-text'>").text(`Current Price:  ${tickerCurrentPrice}`);
        var tickerIconEl = <i class="fas fa-arrow-down"></i>;
        if (tickerOpeningPrice < tickerCurrentPrice) {
            tickerIconEl = <i class="fas fa-arrow-up"></i>;
        }
        tickerIconEl.attr("style", "height: 40px; width: 40px");

        // Append elements to forecastEl
        tickerEl.append(tickerSymbolEl);
        tickerEl.append(tickerOpeningPriceEl);
        tickerEl.append(tickerCurrentPriceEl);
        tickerEl.append(tickerIconEl);
        $("#favorites").append(tickerEl);
    })
    return;
}

// Build the news section
function buildNews(data) {
    // Clear out any previous news html elements
    $("#news").empty();
    // create elements for news
    var newsEl = $("<div class='card shadow-lg text-white bg-primary mx-auto mb-10 p-2'>");
    // .....
    // .....
    // Need to add data to news elements
    // .....
    // .....
    $("#news").append(newsEl);
    return;
}

// Listen for the search button to be clicked
$("#searchTicker").on("click", function (event) {
    // Preventing the button from trying to submit the form......
    event.preventDefault();
    // Get the ticker entereed
    var tickerInput = $("#tickerInput").val().trim();

    //Verify a ticker symbol was entered
    if (tickerInput === "" || tickerInput == "undefined") {
        // We need something besides an alert here
        // alert("Please enter a ticker symbol.")
    } else {
        // Get the ticker info
        getTickerInfo(tickerInput);
    }
});

// Listen for one of the favorites to be clicked
$("#favorites").on('click', '.btn', function (event) {
    event.preventDefault();
    // Need to check and see if they clicked on Delete, News, or Info buttons
    var action = $(this).datasrc("action");
    if (action = "delete") {
        deleteFavorite($(this).text());
        getFavoritesInfo();
    } else if (action = "news") {
        getNews($(this).text);
    } else if (action = "info") {
        buildTickerInfo($(this).text);
    }

});

// Get the Favorites on load and build Favorites section
getFavoritesInfo();
