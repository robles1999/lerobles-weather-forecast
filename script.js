"use strict";
$(document).ready(function () {
  let localStorageData;
  loadStorageData();
  getCurrentCity();
  function getCurrentCity() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Make a request to a geocoding API to get the city name from lat/lon coordinates
          const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
          fetch(geocodingUrl)
          .then((response) => response.json())
          .then((data) => {
            const cityName = data.address.city;
            console.log(`You are in ${cityName}`);
          })
          .catch((error) => {
            console.error("Error retrieving city name:", error);
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  showHistory();

  // if (localStorageData.length > 0) {
  //   showHistory();
  // }
  console.log(localStorageData);
  // const weatherKey = "f2d1d77af028ba0bd220e486c31f55a9";
  const weatherKey = "a660a5b41f50067965e089ee5349ac0e";

  // // todo: remove after we get test data saved to local storage
  // const lsDailyData = JSON.parse(localStorage.getItem("daily-data"));
  // const lsForecastData = JSON.parse(localStorage.getItem("forecast-data"));

  $(".btn").on("click", function (e) {
    e.preventDefault();
    const searchCity = $("#city-input").val();
    // localStorageData.push(searchCity);
    localStorageData.add(searchCity);
    // localStorage.setItem("city", JSON.stringify(localStorageData))
    localStorage.setItem("city", JSON.stringify(Array.from(localStorageData)));
    getApiData(searchCity);
    showHistory();
  });

  function loadStorageData() {
    localStorageData = new Set(JSON.parse(localStorage.getItem("city")) || []);
    // localStorageData = JSON.parse(localStorage.getItem("city")) || [];
  }

  function showHistory() {
    // function showHistory() {
    const historyContainer = $("#search-history");
    historyContainer.empty();

    localStorageData.forEach((data) => {
      const button = $("<button>")
        .addClass("btn-history btn btn-primary mb-3")
        .text(data)
        .attr("data-city", data);

      button.on("click", () => {
        // e.preventDefault()
        const city = button.data("city");
        console.log(city);
        getApiData(city);
        // Add code here to load the forecast data for the selected city
      });

      historyContainer.append(button);
    });
  }

  function getApiData(city) {
    // API to get weather data
    const forecastData =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city +
      "&cnt=50&appid=" +
      weatherKey +
      "&units=imperial";

    fetch(forecastData)
      .then(function (response) {
        return response.json();
      })
      .then(function (forecastData) {
        loadMainWeather(forecastData);
        getFiveDayForecast(forecastData);
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
      "Temperature: " + mainWeather.list[0].main.temp
    );
    $("#main-wind").text("Wind: " + mainWeather.list[0].wind.speed);
    $("#main-humidity").text(
      "Humidity: " + mainWeather.list[0].main.humidity + "%"
    );
  }

  //::::::::::: 5-Day Forecast section :::::::::::::::
  function getFiveDayForecast(forecastData) {
    const dates = [
      dayjs().add(1, "day").format("YYYY-MM-DD 12:00:00"),
      dayjs().add(2, "day").format("YYYY-MM-DD 12:00:00"),
      dayjs().add(3, "day").format("YYYY-MM-DD 12:00:00"),
      dayjs().add(4, "day").format("YYYY-MM-DD 12:00:00"),
      dayjs().add(5, "day").format("YYYY-MM-DD 12:00:00"),
    ];

    let dateIndex = 0;

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
    $(elementClass).text(dayjs(data.dt_txt).format("M/DD/YYYY"));

    const icon = data.weather[0].icon;
    const iconLink = "https://openweathermap.org/img/wn/" + icon + ".png";
    const iconImage = $("<img>").attr("alt", data.weather.description);
    iconImage.attr("src", iconLink);

    const forecastTemp = $("<p>").text("Temp: " + data.main.temp);
    const forecastWind = $("<p>").text("Wind: " + data.wind.speed);
    const forecastHumidity = $("<p>").text("Humidity: " + data.main.humidity);
    $(".card-body" + num).append(iconImage);
    $(".card-body" + num).append(forecastTemp);
    $(".card-body" + num).append(forecastWind);
    $(".card-body" + num).append(forecastHumidity);
  }
});
