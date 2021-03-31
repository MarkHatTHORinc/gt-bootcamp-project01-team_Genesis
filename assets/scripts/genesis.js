var debug = "false";
// var newsApiKey = "2fa72563c6d8381eb46abd9e77860156";   // David F
var newsApiKey = "8c535f1bf34a3d699312fa51b152d476";      // Mark H
var tickerApiKey = "3553e4e7f6f145e7996a726674defbc4";
var favoritesArray = [];
const topStories = "TOP STORIES";

// Delete ticker symbol from local storage and favoritesArray
// Mark H - completed
function deleteFavorite(stockTicker) {
    // Remove from Array
    // 1. Find the stock ticker in the array
    var index = favoritesArray.indexOf(stockTicker);
    // 2. If found remove it from the array
    if (index !== -1) {
        favoritesArray.splice(index, 1);
    }
    // Sort the favorite ticker symbols so they are alphabetical
    favoritesArray.sort();
    // Store to local storage
    localStorage.removeItem("favoriteStocks");
    localStorage.setItem("favoriteStocks", JSON.stringify(favoritesArray));
    return;
}

// Save ticker symbol to local storage
// Mark H -- completed
function saveTicker(stockTicker) {
    // Only store the stock ticker if it hasn't been previously stored
    stockTicker = stockTicker.toUpperCase();
    if (!favoritesArray ||
        favoritesArray.length === 0 ||
        !favoritesArray.includes(stockTicker)) {
        favoritesArray.push(stockTicker);
        // Sort the favorite ticker symbols so they are alphabetical
        favoritesArray.sort();
        // Store to local storage
        localStorage.removeItem("favoriteStocks");
        localStorage.setItem("favoriteStocks", JSON.stringify(favoritesArray));
    }
    return;
}

// Get News Web API Call
// David Figueroa
function getNews(stockTicker) {
    if (debug === "false") {
        var newsApiUrl = encodeURI(`https://gnews.io/api/v4/search?token=${newsApiKey}&q=${stockTicker}&topic=business&country=us`);
        if (stockTicker === topStories) {
            newsApiUrl = encodeURI(`https://gnews.io/api/v4/top-headlines?token=${newsApiKey}&topic=business&country=us`);
        }
    } else {
        var newsApiUrl = "./assets/testData/gnews.JSON"
    }


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
// Justin Byrd
function getFavoritesInfo() {
    if (favoritesArray.length == 0) {
        //nothing to build
        return;
    }
    var stockApiUrl = encodeURI(`https://api.twelvedata.com/time_series?symbol=${favoritesArray.join(",")}&interval=1day&outputsize=1&apikey=${tickerApiKey}`);

    fetch(stockApiUrl)
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

// Get Ticker Info for left hand side
// Justin B
function getTickerInfo(tickerName) {
    var stockApiUrl = encodeURI(`https://api.twelvedata.com/time_series?symbol=${tickerName}&interval=1day&outputsize=365&apikey=${tickerApiKey}`);
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
            buildTickerInfo(data);
            // Get the news for this ticker symbol
            getNews(tickerName);
        });
    return;
}

// Build the ticker info section
// Justin B
function buildTickerInfo(data) {
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
// Justin B
function buildFavorites(data) {
    // Clear out any previous favorites html elements
    $("#favorites").empty();
    // create elements for favorites
    Object.values(data).forEach(ticker => {
        // Creating ticker div
        var tickerEl = $("<div class='card shadow-lg text-white bg-primary mx-auto mb-10 p-2' style='width: 10.5rem; height: 12rem;'>");
        // Extract values to be displayed
        var tickerSymbol = ticker.meta.symbol;
        var tickerOpeningPrice = parseFloat(ticker.values[0].open);
        var tickerCurrentPrice = parseFloat(ticker.values[0].close);
        percentChange = (tickerCurrentPrice/tickerOpeningPrice) * 100 - 100;

        // Set decimal places
        tickerOpeningPrice = tickerOpeningPrice.toFixed(2);
        tickerCurrentPrice = tickerCurrentPrice.toFixed(2);
        percentChange = percentChange.toFixed(2);

        // Creating tags with the result items
        var tickerSymbolEl = $("<h5 class='card-title'>").text(tickerSymbol);
        var tickerOpeningPriceEl = $("<p class='card-text'>").text(`Opening Price:  $${tickerOpeningPrice}`);
        var tickerCurrentPriceEl = $("<p class='card-text'>").text(`Current Price:  $${tickerCurrentPrice}`);
        var tickerPercentChangeEl = $("<p class='card-text'>").text(`Percent Change:  ${percentChange}%`);
        
        // Append elements to forecastEl
        tickerEl.append(tickerSymbolEl);
        tickerEl.append(tickerOpeningPriceEl);
        tickerEl.append(tickerCurrentPriceEl);
        tickerEl.append(tickerPercentChangeEl);
        $("#favorites").append(tickerEl);
    });
    return;
}

// Build the news section
// David F
function buildNews(data) {
    // Clear out any previous news html elements
    $("#container-news").empty();
    // make sure we have at least three articles
    var articleCount = data.totalArticles;
    if (articleCount > 3) {
        articleCount = 3;
    }


    for (var i = 0; i < articleCount; i++) {
            // create elements for news
    var newsEl = $("<div>");
    var headLineEl = $("<h5>");
    var sourceEl = $("<b>");
    var descriptionEl = $("<i>");
    var newsLinkEl = $("<a>");
        headLineEl.text(data.articles[i].title);
        newsLinkEl.attr("href", data.articles[i].url);
        newsLinkEl.append(headLineEl);
        sourceEl.text(`Source: ${data.articles[i].source.name}`);
        // sourceEl.attr("src", data.articles[i].source.name);
        // sourceEl.attr("style", "height: 120px; width: 80px");
        descriptionEl.text(`    ${data.articles[i].content}`);
        
        newsEl.append(newsEl, newsLinkEl, sourceEl, descriptionEl);
        $("#container-news").append(newsEl);
    }
    return;
}

// Display modal for bad ticker symbol entered
function displayModal(message) {
    var modal = $("#modalWindow");
    var modalMessage = $("#modalMessage");
    modalMessage.text(message);
    modal.modal('show');
    return;
}

// When the user clicks on <span> (x), close the modal
$("#closeModal").on("click", function (event) {
    modal.style.display = "none";
});

// Listen for the search button to be clicked
// Mark H - completed
$("#searchTicker").on("click", function (event) {
    // Preventing the button from trying to submit the form......
    event.preventDefault();
    // Get the ticker entereed
    var tickerInput = $("#tickerInput").val().trim();

    //Verify a ticker symbol was entered
    if (tickerInput === "" || tickerInput == "undefined") {
        // Put a message of invalid input in the input box
        tickerInput.value = `Enter a valid symbol.`;
        displayModal("Enter a valid symbol.");
    } else {
        // Get the ticker info
        getTickerInfo(tickerInput);
    }
});

// Listen for one of the favorites to be clicked
// Mark H - completed
$("#favorites").on('click', '.btn', function (event) {
    event.preventDefault();
    // Need to check and see if they clicked on Delete, News, or Info buttons
    let action = event.target.dataset.action;
    let stockTicker = event.dataset.ticker;
    if (action = "delete") {
        deleteFavorite(stockTicker);
        getFavoritesInfo();
    } else if (action = "news") {
        getNews(stockTicker);
    } else if (action = "info") {
        getTickerInfo(stockTicker);
    }

});

// See if we are in debug mode - make debug=false the default
debug = localStorage.getItem("debug");
if (debug !== "true") {
    debug = "false";
}
// Load favorites array from local storage
favoritesArray = JSON.parse(localStorage.getItem("favoriteStocks"));
// Get the Favorites on load and build Favorites section
getFavoritesInfo();
// Get the top news stories on load and build news section
getNews(topStories);
