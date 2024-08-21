import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "*"],
    [[1], "☀️"],
    [[2], "☁️"],
    [[3], "🌧️"],
    [[45, 48], "🌦️"],
    [[51, 56, 61, 66, 80], "🌧️"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌨️"],
    [[72, 74, 76, 78, 83, 84], "🌨️"],
    [[95], "🌩️"],
    [[96, 99], "🌧️"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  return icons.get(arr) || "❓";
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  state = {
    location: "",
    isLoading: false,
    displayLocation: "",
    weather: {},
  };

  fetchWeather = async () => {
    if (this.state.location.length < 2) return this.setState({ weather: {} });

    try {
      this.setState({ isLoading: true });

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results[0];

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&time_zone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );

      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  setLocation = (e) => this.setState({ location: e.target.value });

  componentDidMount() {
    // this.fetchWeather();
    this.setState({ location: localStorage.getItem("location") || "" });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      this.fetchWeather();

      localStorage.setItem("location", this.state.location);
    }
  }

  render() {
    return (
      <div>
        <h1>Classy Weather!</h1>
        <Input
          location={this.state.location}
          onChangeLocation={this.setLocation}
        />
        {/* <button onClick={this.fetchWeather}>Get Weather</button> */}

        {this.state.isLoading && <p>LOADING...</p>}
        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}

export default App;

class Input extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Search from Location..."
          value={this.props.location}
          onChange={this.props.onChangeLocation}
        />
      </div>
    );
  }
}

class Weather extends React.Component {
  componentWillUnmount() {
    console.log("Unmount");
  }
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <div>
        <h1>Weather {this.props.location}</h1>
        <ul>
          {dates.map((date, i) => (
            <Day
              key={date}
              date={date}
              code={codes.at(i)}
              max={max.at(i)}
              min={min.at(i)}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { date, code, max, min } = this.props;
    return (
      <li>
        <span>{getWeatherIcon(code)}</span>
        <p>{formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
        </p>
      </li>
    );
  }
}
