import React from "react";
import ReactDOM from "react-dom";

import Spotify from "spotify-web-api-js";

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      devices: [],
      songs: [],
      search: "",
      currentDevice: ""
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {
    if (window.location.hash) {
      // Remove the "#"
      const queryString = window.location.hash.substring(1);
      // Parse the access_token out
      const accessToken = new URLSearchParams(queryString).get("access_token");
      this.spotifyClient = new Spotify();
      this.spotifyClient.setAccessToken(accessToken);

      const { devices } = await this.spotifyClient.getMyDevices();
      // const devices = Object.keys(devicesResp).map(key => devicesResp[key]);
      this.setState({
        authenticated: true,
        devices,
        currentDevice: devices[0].id
      });
    }
  }

  async startPlayback(songId) {
    await this.spotifyClient.play({
      device_id: this.state.currentDevice,
      uris: [`spotify:track:${songId}`]
    });
  }

  async onSubmit(ev) {
    ev.preventDefault();
    const {
      tracks: { items: songs }
    } = await this.spotifyClient.searchTracks(this.state.search, {
      market: "us"
    });
    this.setState({ songs });
  }

  render() {
    if (!this.state.authenticated) {
      return (
        <a
          href={`https://accounts.spotify.com/authorize/?client_id=8cd26c63ef1a43529fa5ff13fc7dcb09&response_type=token&redirect_uri=${window
            .location.origin +
            window.location
              .pathname}&scope=user-read-playback-state user-modify-playback-state user-top-read user-read-private`}
        >
          Login with Spotify
        </a>
      );
    }
    return (
      <div className="ui container">
        <form className="ui form" onSubmit={this.onSubmit}>
          <input
            type="text"
            onChange={e => this.setState({ search: e.target.value })}
          />
          <input type="submit" value="Search" />
        </form>
        <div className="ui container six column grid">
          {this.state.songs.map(song => (
            <div
              className="ui one column card"
              key={song.id}
              onClick={e => this.startPlayback(song.id)}
            >
              <div className="image">
                <img src={song.album.images[0].url} />
              </div>
              <div className="content">
                <p className="header">{song.name}</p>
                <div className="meta">
                  <span className="date">
                    {song.artists.map(artist => artist.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <select
          className="ui dropdown"
          onChange={e => this.setState({ currentDevice: e.target.value })}
        >
          {this.state.devices.map(device => (
            <option value={device.id}>{device.name}</option>
          ))}
        </select>
      </div>
    );
  }
}

export default App;