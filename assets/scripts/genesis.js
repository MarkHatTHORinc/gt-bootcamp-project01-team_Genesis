var debug = "false";  // debug=true will cause news api to read local file
var favoritesArray = [];     // Used to order & display favorite stock tickers
const newsApiKey = "2fa72563c6d8381eb46abd9e77860156";   // David F
// const newsApiKey = "8c535f1bf34a3d699312fa51b152d476";      // Mark H
const tickerApiKey = "3553e4e7f6f145e7996a726674defbc4";
const topStories = "TOP STORIES";   // Used on page load to get top news stories

// Delete ticker symbol from local storage and favoritesArray
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
function getNews(stockTicker) {
    // If not in debug mode make api call for news
    if (debug === "false") {
        var newsApiUrl = encodeURI(`https://gnews.io/api/v4/search?token=${newsApiKey}&q=${stockTicker}&topic=business&country=us`);
        if (stockTicker === topStories) {
            newsApiUrl = encodeURI(`https://gnews.io/api/v4/top-headlines?token=${newsApiKey}&topic=business&country=us`);
        }
    } else {   // If in debug mode use the locally stored file for new
        var newsApiUrl = "./assets/testData/gnews.JSON"
    }


    fetch(newsApiUrl, {
        method: 'GET',              // GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow',         // manual, *follow, error
        cache: 'reload'             // Refresh the cache
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Build the News section
            buildNews(data);
        })
        .catch(error => {
            $("#container-news").empty();
            var newsEl = $("<div>");
            var headLineEl = $("<h5>");
            headLineEl.text("News is Not Currently Available");
            newsEl.append(headLineEl);
            $("#container-news").append(newsEl);
            if (debut === "true") {
                console.log(error);
            }
        });
    return;
}

// Get Favorites Info
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
function getTickerInfo(tickerName) {
    var stockApiUrl = encodeURI(`https://api.twelvedata.com/time_series?symbol=${tickerName}&interval=1day&outputsize=100&apikey=${tickerApiKey}`);
    fetch(stockApiUrl, {
        method: 'GET',              // GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow',         // manual, *follow, error
        cache: 'reload'             // Refresh the cache
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

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

// Build the ticker info section
function buildTickerInfo(data) {
    // Clear out ticker info for searched ticker symbol
    var tickerDivEl = $("#tickerInfo");
    tickerDivEl.empty();

    var symbolOpen = parseFloat(data.values[0].open);
    var symbolClose = parseFloat(data.values[0].close);

    var percentChange = symbolClose / symbolOpen * 100 - 100;
    percentChange = percentChange.toFixed(2);

    symbolOpen = symbolOpen.toFixed(2);
    symbolOpen = formatter.format(symbolOpen);

    var symbolHigh = parseFloat(data.values[0].high);
    symbolHigh = symbolHigh.toFixed(2);
    symbolHigh = formatter.format(symbolHigh);

    var symbolLow = parseFloat(data.values[0].low);
    symbolLow = symbolLow.toFixed(2);
    symbolLow = formatter.format(symbolLow);
 
    symbolClose = symbolClose.toFixed(2);
    symbolClose = formatter.format(symbolClose);

    var symbolVolume = data.values[0].volume;

    // Create Elements for ticker information
    var symbolHeadingEl = $('<span>').text(data.meta.symbol);
    var symbolExchangeEl = $('<p>').text(`Exchange: ${data.meta.exchange}`);
    var symbolOpenEl = $('<p>').text(`Open: ${symbolOpen}`);
    var symbolHighEl = $('<p>').text(`High: ${symbolHigh}`);
    var symbolLowEl = $('<p>').text(`Low: ${symbolLow}`);
    var symbolCloseEl = $('<p>').text(`Close: ${symbolClose}`);
    var percentChangeEl = $('<p>').text(`Change: ${percentChange}%`);
    var symbolVolumeEl = $('<p>').text(`Volume: ${symbolVolume}`);

    // Add to favorites button
    var saveToFavBtnEl = `<button class="btn btn-warning" type="button" id="btnAddFavorite" data-ticker="${data.meta.symbol}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                        </button>`;

    // Create HTML div to append new elements to render on page....
    tickerDivEl.append(symbolHeadingEl);
    tickerDivEl.append(saveToFavBtnEl);
    tickerDivEl.append(symbolExchangeEl);
    tickerDivEl.append(symbolOpenEl);
    tickerDivEl.append(symbolHighEl);
    tickerDivEl.append(symbolLowEl);
    tickerDivEl.append(symbolCloseEl);
    tickerDivEl.append(percentChangeEl);
    tickerDivEl.append(symbolVolumeEl);
    

    return;
}

// Build the favorites section
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
        percentChange = (tickerCurrentPrice / tickerOpeningPrice) * 100 - 100;

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
function buildNews(data) {
    // Clear out any previous news html elements
    $("#container-news").empty();
    // Make sure we have at max three articles
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
        newsLinkEl.attr("href",data.articles[i].url);
        newsLinkEl.attr("target", "_blank");
        newsLinkEl.append(headLineEl);
        sourceEl.text(`Source: ${data.articles[i].source.name}`);
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

// Listen for the favorites button to be clicked, add to favorites
$("#btnAddFavorite").on("click", function (event) {
    event.preventDefault();
    let stockTicker = event.dataset.ticker;
    saveTicker(stockTicker);
});

// Listen for the <span> (x) to be clicked, close the modal
$("#closeModal").on("click", function (event) {
    event.preventDefault();
    modal.style.display = "none";
});

// Listen for the search button to be clicked
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

// See if we are in debug mode - default: debug=false 
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
