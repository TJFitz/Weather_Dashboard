// Variable declaration

var cityName = "atlanta";
var lat;
var lon;
var historyArray = JSON.parse(localStorage.getItem("history"));

// Display for current date in header

var m = moment();
$("#dateDisplay").text(m.format("dddd MMM DD YYYY"));

// History display and local storage

localStorage.setItem("history", JSON.stringify(historyArray));
var storedHistory = JSON.parse(localStorage.getItem("history"));

if (storedHistory === null) {
  historyArray = ["Atlanta"];
}

function historyList() {
  $("#historyDiv").empty();
  for (var i = 0; i < historyArray.length; i++) {
    var newP = $("<p>").text(historyArray[i]);
    newP.addClass("blockquote", "mb-0");
    $("#historyDiv").prepend($("<blockquote>").html(newP));
  }
  localStorage.setItem("history", JSON.stringify(historyArray));
  cityName = $("#historyDiv:first").children().children()[0].innerHTML;
  displayWeather();
}

historyList();

// Keydown for submitting a new city

$("#citySearch").keydown(function (e) {
  if (e.keyCode === 13) {
    historyArray.push($("#citySearch").val());
    historyList();
    $("#citySearch").empty() = "";
  }
});

// Click handler for displaying previously visited city

$(document).on("click", ".blockquote", function () {
  cityName = $(this).text();
  displayWeather();
});

// Function for retrieving weather information for currently selected city

function displayWeather() {
  // AJAX for getting the currently selected locations weather

  $.ajax({
    url:
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=d0d2b00dccaebb4d584a0bf35826a088",
    method: "GET",
  }).then(function (response) {
    lat = response.coord.lat;
    lon = response.coord.lon;
    var iconCode = response.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
    $("#currentIcon").html("<img src='" + iconUrl + "'>");
    $("#selectedDate").text(
      response.name + " " + moment().format("MM/DD/YYYY") + " "
    );
    $("#currentTemp").text(" " + parseInt(response.main.temp - 273.15) + "C");
    $("#currentHum").text(" " + response.main.humidity + "%");
    $("#currentWind").text(" " + parseInt(response.wind.speed * 2.237) + "mph");

    // AJAX for getting UV index

    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=d0d2b00dccaebb4d584a0bf35826a088&lat=" +
        lat +
        "&lon=" +
        lon,
      method: "GET",
    }).then(function (response) {
      $("#currentUV").text(" " + response[0].value + " ");
      if (response[0].value < 4) {
        $("#currentUV").addClass("good");
      } else if (response[0].value > 8) {
        $("#currentUV").addClass("severe");
      } else {
        $("#currentUV").addClass("moderate");
      }
    });
  });

  // AJAX for getting the currently selected locations 5 day forecast

  $.ajax({
    url:
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      cityName +
      "&appid=d0d2b00dccaebb4d584a0bf35826a088",
    method: "GET",
  }).then(function (response) {
    // dynamic creation of fiveday elements

    function displayFiveday(response) {
      $("#fiveday").empty();
      for (var i = 0; i < 5; i++) {
        var curDay = 4 + i * 8;
        var curIconCode = response.list[curDay].weather[0].icon;
        var curIconUrl =
          "http://openweathermap.org/img/w/" + curIconCode + ".png";
        var dateVar = moment
          .unix(response.list[curDay].dt)
          .format("MM/DD/YYYY");
        var newCard = $("<div>").addClass("fivedayCard");
        var dateDiv = $("<div>").append($("<h6>").text("Date: " + dateVar));
        var iconDiv = $("<div>").append(
          $("<h6>").html("<img src='" + curIconUrl + "'>")
        );
        var tempDiv = $("<div>").append(
          $("<h6>").text(
            "Temperature: " +
              parseInt(response.list[curDay].main.temp - 273.15) +
              "C"
          )
        );
        var humDiv = $("<div>").append(
          $("<h6>").text("Humidity: " + response.list[curDay].main.humidity)
        );
        newCard.append(dateDiv, iconDiv, tempDiv, humDiv);
        $("#fiveday").append(newCard);
      }
    }
    displayFiveday(response);
  });
}

displayWeather();
