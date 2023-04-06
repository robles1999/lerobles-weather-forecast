"use strict";
$(document).ready(function () {
  let localStorageData;
  loadStorageData();
  if (localStorageData.length > 0) {
    showHistory();
  }
  console.log(localStorageData);
  // const weatherKey = "f2d1d77af028ba0bd220e486c31f55a9";
  const weatherKey = "a660a5b41f50067965e089ee5349ac0e";

  // // todo: remove after we get test data saved to local storage
  // const lsDailyData = JSON.parse(localStorage.getItem("daily-data"));
  // const lsForecastData = JSON.parse(localStorage.getItem("forecast-data"));

  $(".btn").on("click", function (e) {
    e.preventDefault();
    const searchCity = $("#city-input").val();
    localStorageData.push(searchCity);
    localStorage.setItem("city", JSON.stringify(localStorageData))
    getApiData(searchCity);
    showHistory();
  });

  function loadStorageData()
  {
    localStorageData = JSON.parse(localStorage.getItem("city")) || [];
  }

  function showHistory()
  {
    document.querySelector("#search-history").innerHTML = "";
    localStorageData.forEach((e) => {
      $("#search-history").append($("<button>").attr("class", "btn btn-primary mb-3").text(e));
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
        // localStorage.setItem("forecast-data", JSON.stringify(forecastData));
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
    forecastData.list.forEach((e) => {
      // const Today = dayjs().format("YYYY-MM-DD 00:00:00");
      const day1 = dayjs().add(1, "day").format("YYYY-MM-DD 00:00:00");
      const day2 = dayjs().add(2, "day").format("YYYY-MM-DD 00:00:00");
      const day3 = dayjs().add(3, "day").format("YYYY-MM-DD 00:00:00");
      const day4 = dayjs().add(4, "day").format("YYYY-MM-DD 00:00:00");
      const day5 = dayjs().add(5, "day").format("YYYY-MM-DD 00:00:00");

      if (e.dt_txt === day1) {
        populateForecastCard(e, ".card-title1", 1);
      } else if (e.dt_txt === day2) {
        populateForecastCard(e, ".card-title2", 2);
      } else if (e.dt_txt === day3) {
        populateForecastCard(e, ".card-title3", 3);
      } else if (e.dt_txt === day4) {
        populateForecastCard(e, ".card-title4", 4);
      } else if (e.dt_txt === day5) {
        populateForecastCard(e, ".card-title5", 5);
      }
    });
  }

  function populateForecastCard(data, elementClass, num) {
    $(elementClass).text(dayjs(data.dt_txt).format("M/DD/YYYY"));

    // console.log(data);

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
