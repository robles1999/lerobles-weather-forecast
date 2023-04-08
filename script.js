"use strict";
import WEATHER_KEY from "./env-variables.js";

$(document).ready(function () {
  let count = 0;
  let localStorageData;
  loadStorageData();
  showHistory();
  const weatherKey = WEATHER_KEY;
  // const weatherKey = "a660a5b41f50067965e089ee5349ac0e";

  // :::::::::::::: Default location ::::::::::::::::
  getApiData("Orlando");

  // ::::::::: Event listener for search button ::::::::
  $(".btn").on("click", function (e) {
    e.preventDefault();

    // Get value of input field
    const searchCity = $("#city-input").val();

    // Clear input field
    $("#city-input").val("");

    getApiData(searchCity);
  });

  // Load previous data and store it in a set to avoid duplicate history
  function loadStorageData() {
    localStorageData = new Set(JSON.parse(localStorage.getItem("city")) || []);
  }

  // Create a new button for each city in local storage and
  // add an event listener to each
  function showHistory() {
    const historyContainer = $("#search-history");
    historyContainer.empty();

    localStorageData.forEach((data) => {
      const button = $("<button>")
        .addClass("btn-history btn btn-primary mb-3")
        .text(data)
        .attr("data-city", data);

      button.on("click", (e) => {
        e.preventDefault();
        const city = button.data("city");
        getApiData(city);
      });

      historyContainer.append(button);
    });
  }

  function getApiData(city) {
    // API to get weather data
    const forecastData =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city +
      "&appid=" +
      weatherKey +
      "&units=imperial";

    fetch(forecastData)
      .then(function (response) {
        return response.json();
      })
      .then(function (forecastData) {
        console.log(forecastData);
        if (count > 0) {
          // Save searched city to local storage using the name of the city
          // of the API data to display the city name with the correct font
          localStorageData.add(forecastData.city.name);
          localStorage.setItem(
            "city",
            JSON.stringify(Array.from(localStorageData))
          );
        }
        // localStorageData.add(forecastData.city.name);
        // localStorage.setItem(
        //   "city",
        //   JSON.stringify(Array.from(localStorageData))
        // );
        showHistory();
        loadMainWeather(forecastData);
        getFiveDayForecast(forecastData);
        count = 1;
      });
  }

  //::::::::::: Main weather section ::::::::::::
  function loadMainWeather(mainWeather) {
    console.log(mainWeather);
    const now = dayjs().format(" (M/DD/YYYY)");
    const icon = mainWeather.list[0].weather[0].icon;
    const iconLink = "https://openweathermap.org/img/wn/" + icon + ".png";
    $("#city-name").text(mainWeather.city.name + now);

    const iconImage1 = $("<img>").attr(
      "alt",
      mainWeather.list[0].weather[0].description
    );
    iconImage1.attr("src", iconLink);

    $("#city-name").append(iconImage1);
    $("#main-temperature").text(
      "Temperature: " + Math.round(mainWeather.list[0].main.temp)
    );
    $("#main-wind").text("Wind: " + mainWeather.list[0].wind.speed);
    $("#main-humidity").text(
      "Humidity: " + mainWeather.list[0].main.humidity + "%"
    );
  }

  //::::::::::: 5-Day Forecast section :::::::::::::::
  function getFiveDayForecast(forecastData) {
    const dates = [
      dayjs().add(1, "day").format("YYYY-MM-DD 09:00:00"),
      dayjs().add(2, "day").format("YYYY-MM-DD 09:00:00"),
      dayjs().add(3, "day").format("YYYY-MM-DD 09:00:00"),
      dayjs().add(4, "day").format("YYYY-MM-DD 09:00:00"),
      dayjs().add(5, "day").format("YYYY-MM-DD 09:00:00"),
    ];

    let dateIndex = 0;
    // Loop through each forecast data items and each time the
    // date matches the date at the dateIndex, populate forecast card
    // then continue to loop searching for the next date in the array
    for (const e of forecastData.list) {
      if (e.dt_txt === dates[dateIndex]) {
        populateForecastCard(e, `.card-title${dateIndex + 1}`, dateIndex + 1);
        dateIndex++;
        if (dateIndex === 5) {
          break; // Stop looping once all 5 dates have been found
        }
      }
    }
  }

  function populateForecastCard(data, elementClass, num) {
    $(".card-body" + num).empty();
    // Create card header
    const cardHeader = $("<h5>")
      .attr("class", "mt-2 border-0")
      .text(dayjs(data.dt_txt).format("M/DD/YYYY"));
    // Get weather icon
    const icon = data.weather[0].icon;
    const iconLink = "https://openweathermap.org/img/wn/" + icon + ".png";
    const iconImage = $("<img>").attr("alt", data.weather.description);
    iconImage.attr("src", iconLink);
    // Create paragraph elements
    const forecastTemp = $("<p>").text("Temp: " + Math.round(data.main.temp));
    const forecastWind = $("<p>").text("Wind: " + data.wind.speed);
    const forecastHumidity = $("<p>").text("Humidity: " + data.main.humidity);
    // Add elements to the cards
    $(".card-body" + num).append(cardHeader);
    $(".card-body" + num).append(iconImage);
    $(".card-body" + num).append(forecastTemp);
    $(".card-body" + num).append(forecastWind);
    $(".card-body" + num).append(forecastHumidity);
  }
});
