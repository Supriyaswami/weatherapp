const apiKey = "2f6277de64499a11e2ecf80b7b5555f0"; // Replace with your OpenWeatherMap API key

// Real-time clock
setInterval(() => {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}, 1000);

const weatherResult = document.getElementById("weatherResult");
const historyList = document.getElementById("historyList");

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name.");
  fetchWeatherByCity(city);
}

async function fetchWeatherByCity(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);
    updateUI(data);
    updateHistory(city);
    updateBackground(data.weather[0].main);
  } catch (err) {
    weatherResult.innerHTML = `<p style="color: red;">❌ ${err.message}</p>`;
  }
}

async function fetchWeatherByLocation(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    updateUI(data);
    updateBackground(data.weather[0].main);
  } catch (err) {
    weatherResult.innerHTML = `<p style="color: red;">❌ ${err.message}</p>`;
  }
}

// 📍 First-time location fetch + save to localStorage
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Save location for reuse
        localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
        fetchWeatherByLocation(latitude, longitude);
      },
      () => alert("Location permission denied.")
    );
  } else {
    alert("Geolocation is not supported.");
  }
}

// ✅ On page load: reuse saved location if exists, prompt only if no location is stored
window.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "on") document.body.classList.add("dark");

  const storedLocation = localStorage.getItem("userLocation");
  if (storedLocation) {
    const { latitude, longitude } = JSON.parse(storedLocation);
    fetchWeatherByLocation(latitude, longitude);
  } else {
    getLocationWeather();
  }

  renderHistory();
});

function updateUI(data) {
  const { name, main, weather, wind, sys } = data;
  const condition = weather[0].main;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();

  weatherResult.innerHTML = `
    <h2>${name}</h2>
    <p>🌡️ Temperature: ${main.temp} °C</p>
    <p>☁️ Condition: ${condition}</p>
  `;

  document.getElementById("humidityCard").innerHTML = `💧 Humidity: ${main.humidity}%`;
  document.getElementById("windCard").innerHTML = `💨 Wind: ${wind.speed} km/h`;
  document.getElementById("sunriseCard").innerHTML = `🌅 Sunrise: ${sunset}`;
  document.getElementById("sunsetCard").innerHTML = `🌇 Sunset: ${sunrise}`;
}

function updateBackground(condition) {
  const body = document.body;
  const c = condition.toLowerCase();

  if (c.includes("clear")) body.style.background = "linear-gradient(to right, #fceabb, #f8b500)";
  else if (c.includes("cloud")) body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  else if (c.includes("rain")) body.style.background = "linear-gradient(to right, #00c6fb, #005bea)";
  else if (c.includes("snow")) body.style.background = "linear-gradient(to right, #e6dada, #274046)";
  else if (c.includes("thunderstorm")) body.style.background = "linear-gradient(to right, #3a6186, #89253e)";
  else body.style.background = "linear-gradient(to right, #56ccf2, #2f80ed)";
}

function updateHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  history = [city, ...history.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 3);
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };
    historyList.appendChild(li);
  });
}

// 🌙 Dark mode toggle
const toggle = document.getElementById("darkModeToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark ? "on" : "off");
});