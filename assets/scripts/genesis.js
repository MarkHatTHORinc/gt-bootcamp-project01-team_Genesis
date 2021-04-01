var debugWeather = "false";  // debug=true will cause news api to read local file
var debugFavorites = "false";  // debug=true will cause news api to read local file
var debugStock = "false";  // debug=true will cause news api to read local file
var favoritesArray = [];     // Used to order & display favorite stock tickers
const newsApiKey = "2fa72563c6d8381eb46abd9e77860156";   // David F
// const newsApiKey = "8c535f1bf34a3d699312fa51b152d476";      // Mark H
const tickerApiKey = "b84c9659f3944589a5147c448c52a1e3";    // David F
// const tickerApiKey = "3553e4e7f6f145e7996a726674defbc4";    // Justin B
// const tickerApiKey = "f7965dfc06b54da79a51cf9966e8bcca";    // Mark H
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
        getFavoritesInfo();
    }
    return;
}
 
// Get News Web API Call
function getNews(stockTicker) {
    // If not in debug mode make api call for news
    if (debugWeather === "false") {
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
    if (debugFavorites === "false") {
        var stockApiUrl = encodeURI(`https://api.twelvedata.com/time_series?symbol=${favoritesArray.join(",")}&interval=1day&outputsize=1&apikey=${tickerApiKey}`);
    } else {   // If in debug mode use the locally stored file for new
        var stockApiUrl = "./assets/testData/twelveFavorites.JSON"
    }

    fetch(stockApiUrl)
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Build the Favorites section
            buildFavorites(data);
        })
        .catch(error => {
            $("#favorites").empty();
            var favoritesEl = $("<div>");
            var headLineEl = $("<h5>");
            headLineEl.text("Stock Info is Not Currently Available");
            favoritesEl.append(headLineEl);
            $("#favorites").append(favoritesEl);
            if (debugFavorites === "true") {
                console.log(error);
            }
        });
    return;
}
 
// Get Ticker Info for left hand side
function getTickerInfo(tickerName) {
    if (debugStock === "false") {
        var stockApiUrl = encodeURI(`https://api.twelvedata.com/time_series?symbol=${tickerName}&interval=1day&outputsize=100&apikey=${tickerApiKey}`);
    } else {   // If in debug mode use the locally stored file for new
        if (tickerName == '1234') {
            var stockApiUrl = "./assets/testData/twelveBad.JSON"
        } else {
            var stockApiUrl = "./assets/testData/twelveHP.JSON";
        }
    }
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
        })
        .catch(error => {
            tickerDivEl.empty();
            var tickerEl = $("<div>");
            var headLineEl = $("<h5>");
            headLineEl.text("Stock Info is Not Currently Available");
            tickerEl.append(headLineEl);
            if (debugStock === "true") {
                console.log(error);
            }
        });
    return;
}
 
const formatCurrency = new Intl.NumberFormat('en-US', {
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
    symbolOpen = formatCurrency.format(symbolOpen);
 
    var symbolHigh = parseFloat(data.values[0].high);
    symbolHigh = symbolHigh.toFixed(2);
    symbolHigh = formatCurrency.format(symbolHigh);
 
    var symbolLow = parseFloat(data.values[0].low);
    symbolLow = symbolLow.toFixed(2);
    symbolLow = formatCurrency.format(symbolLow);

    symbolClose = symbolClose.toFixed(2);
    symbolClose = formatCurrency.format(symbolClose);
 
    var symbolVolume = parseInt(data.values[0].volume, 10);
    symbolVolume = symbolVolume.toLocaleString('en-US');
 
    // Create Elements for ticker information
    var symbolHeadingEl = $('<span>').text(data.meta.symbol);
    var symbolExchangeEl = $('<p>').text(`Exchange: ${data.meta.exchange}`);
    var symbolOpenEl = $('<p>').text(`Open: ${symbolOpen}`);
    var symbolHighEl = $('<p>').text(`High: ${symbolHigh}`);
    var symbolLowEl = $('<p>').text(`Low: ${symbolLow}`);
    var symbolCloseEl = $('<p>').text(`Close: ${symbolClose}`);
    var percentChangeEl = $('<p>').text(`Change: ${percentChange}%`);
    if (percentChange < 0) {
        percentChangeEl.addClass("loser");
    } else {
        percentChangeEl.addClass("winner");
    }
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
        var tickerPercentChangeEl = $("<p >").text(`Percent Change:  ${percentChange}%`);
        if (percentChange < 0) {
            tickerPercentChangeEl.addClass("card-text-loser");
        } else {
            tickerPercentChangeEl.addClass("card-text-winner");
        }
 
        // Action buttons
        var btnHTML = `<button class="btn btn-primary savebtn1info" type="button" data-ticker="${tickerSymbol}" data-action="info">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                            </svg>
                        </button>
                        <button class="btn btn-warning savebtn1news" type="button" data-ticker="${tickerSymbol}" data-action="news">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-newspaper" viewBox="0 0 16 16">
                                <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z"/>
                                <path d="M2 3h10v2H2V3zm0 3h4v3H2V6zm0 4h4v1H2v-1zm0 2h4v1H2v-1zm5-6h2v1H7V6zm3 0h2v1h-2V6zM7 8h2v1H7V8zm3 0h2v1h-2V8zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1z"/>
                            </svg>
                        </button>
                        <button class="btn btn-danger savebtn1del" type="button" data-ticker="${tickerSymbol}" data-action="delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>`;
 
        // Append elements to forecastEl
        tickerEl.append(tickerSymbolEl);
        tickerEl.append(tickerOpeningPriceEl);
        tickerEl.append(tickerCurrentPriceEl);
        tickerEl.append(tickerPercentChangeEl);
        tickerEl.append(btnHTML);
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
        newsLinkEl.attr("href", data.articles[i].url);
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
$("#tickerInfo").on("click", ".btn", function (event) {
    event.preventDefault();
    let stockTicker = event.target.parentElement.parentElement.dataset.ticker;
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
    let action = event.target.closest("button").dataset.action;
    let stockTicker = event.target.closest("button").dataset.ticker;
    if (action == "delete") {
        deleteFavorite(stockTicker);
        getFavoritesInfo();
    } else if (action == "news") {
        getNews(stockTicker);
    } else if (action == "info") {
        getTickerInfo(stockTicker);
    }
});
 
// See if we are in debug mode - default: debug=false 
debugWeather = localStorage.getItem("debugWeather");
if (debugWeather !== "true") {
    debugWeather = "false";
}
debugFavorites = localStorage.getItem("debugFavorites");
if (debugFavorites !== "true") {
    debugFavorites = "false";
}
debugStock = localStorage.getItem("debugStock");
if (debugStock !== "true") {
    debugStock = "false";
}
// Load favorites array from local storage
favoritesArray = JSON.parse(localStorage.getItem("favoriteStocks"));
// Get the Favorites on load and build Favorites section
getFavoritesInfo();
// Get the top news stories on load and build news section
getNews(topStories);
 

