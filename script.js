// Main function to fetch weather based on city input
let timeInterval = null; // Global interval tracker

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherApiKey = "YziBoc6aF9Jzh4sFFZczZwYhXOmq6FzQ";
  const geocodeApiKey = "3e4285cc32ba48dbaf3a7628d924a86d";

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  try {
    const coordinates = await getCoordinates(city, geocodeApiKey);
    if (!coordinates) {
      displayMessage("❌ Could not find that city.");
      return;
    }

    const { lat, lon, timezoneOffset } = coordinates;
    const weatherData = await fetchWeather(lat, lon, weatherApiKey);

    if (!weatherData || !weatherData.data || !weatherData.data.values) {
      displayMessage("⚠️ Could not fetch weather.");
      return;
    }

    const temp = weatherData.data.values.temperature;
    const descCode = weatherData.data.values.weatherCode;
    const desc = getWeatherDescription(descCode);

    updateUI(city, temp, desc, timezoneOffset);
  } catch (error) {
    console.error("Error:", error);
    displayMessage("Something went wrong.");
  }
}

async function getCoordinates(city, apiKey) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.results || data.results.length === 0) return null;

  const result = data.results[0];
  const lat = result.geometry.lat;
  const lon = result.geometry.lng;
  const timezoneOffset = result.annotations.timezone.offset_sec;

  return { lat, lon, timezoneOffset };
}

async function fetchWeather(lat, lon, apiKey) {
  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function getWeatherDescription(code) {
  const codes = {
    0: "Unknown",
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    2000: "Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6001: "Freezing Rain",
    6200: "Light Freezing Rain",
    6201: "Heavy Freezing Rain"
  };
  return codes[code] || "Unknown";
}

function updateUI(city, temp, desc, timezoneOffset) {
  const weatherResult = document.getElementById("weatherResult");
  const weatherIcon = getWeatherIcon(desc);

  if (timeInterval) clearInterval(timeInterval);

  weatherResult.innerHTML = `
    <div style="font-size: 40px;">${weatherIcon}</div>
    <div>🌆 <strong>${city}</strong></div>
    <div>🌡️ ${temp}°C</div>
    <div>🌥️ ${desc}</div>
    <div id="localTime">🕒 Local Time: ${getLocalTime(timezoneOffset)}</div>
  `;

  timeInterval = setInterval(() => {
    document.getElementById("localTime").innerText = `🕒 Local Time: ${getLocalTime(timezoneOffset)}`;
  }, 1000);

  changeBackground(desc);
}

function displayMessage(msg) {
  document.getElementById("weatherResult").innerText = msg;
}

function getWeatherIcon(desc) {
  desc = desc.toLowerCase();
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("fog")) return "🌫️";
  if (desc.includes("drizzle")) return "🌦️";
  if (desc.includes("freezing")) return "🥶";
  return "❓";
}

function changeBackground(desc) {
  const body = document.body;
  desc = desc.toLowerCase();

  if (desc.includes("rain")) {
    body.style.background = "linear-gradient(to right, #373B44, #4286f4)";
  } else if (desc.includes("cloud")) {
    body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  } else if (desc.includes("clear")) {
    body.style.background = "linear-gradient(to right, #56ccf2, #2f80ed)";
  } else if (desc.includes("snow")) {
    body.style.background = "linear-gradient(to right, #e0eafc, #cfdef3)";
  } else {
    body.style.background = "linear-gradient(to right, #4facfe, #00f2fe)";
  }
}

function getLocalTime(offsetSec) {
  const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
  const localTime = new Date(nowUTC.getTime() + offsetSec * 1000);
  return localTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

document.getElementById("modeToggle").addEventListener("change", function () {
  document.body.classList.toggle("dark");
});
