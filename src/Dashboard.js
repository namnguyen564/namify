import React, { useState, useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import SearchResults from "./SearchResults";
import ArtistSearchResults from "./ArtistSearchResults";
import Player from "./Player";
import Playlists from "./Playlists";
import AddSong from "./AddSong";
import AddArtist from "./AddArtist";
import Recommendations from "./Recommendations";

const spotifyApi = new SpotifyWebApi({
  clientId: "c08f355b3fe744f8ae7bb97dc1de955b",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSongsSearchResults] = useState([]);
  const [searchArtistsResults, setArtistsSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState("");
  const [userName, setName] = useState();
  const [userPhoto, setUserPhoto] = useState("");
  const [userId, setUserId] = useState("");
  const [displayUserPlaylists, setUserPlaylists] = useState([]);
  const [playlistState, setPlaylistState] = useState(true);
  const [playlistSongs, setDisplayPlayListSongs] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [currentSearchChoice, setCurrentSearchChoice] = useState("songs");
  const [songList, setSongList] = useState([]);
  const [artistList, setArtistList] = useState([]);
  const [recommendations, setRecommendation] = useState([]);
  const [recommendationState, setRecommendationState] = useState(true);
  const [currentRecommendationLength, setCurrentRecommendationLength] =
    useState(0);
  const [libraryState, setLibraryState] = useState(true);
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedState, setLikedSongsState] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    console.log("user detail called!");
    console.log(accessToken);
    spotifyApi.getMe().then(
      function (data) {
        console.log("Some information about the authenticated user", data.body);
        console.log("UserId is: ", data.body.id);
        setUserId(data.body.id);
        setName(data.body.display_name);
        setUserPhoto(data.body.images[0].url);

        // setDetails(data.body)
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    console.log("user playlist called!");
    spotifyApi.getUserPlaylists(userId).then(
      function (data) {
        console.log("Retrieved playlists", data.body.items);

        setUserPlaylists(
          data.body.items.map((eachPlaylist) => {
            const url = eachPlaylist.tracks.href;
            let playlistId = url.split("playlists/")[1].split("/")[0];
            console.log(playlistId);

            return {
              playlistName: eachPlaylist.name,
              playlistImage: eachPlaylist.images[0].url,
              playlistId: playlistId,
            };
          })
        );
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [userId]);

  useEffect(() => {
    spotifyApi
      .getMySavedTracks({
        limit: 10,
        offset: 1,
      })
      .then(
        function (data) {
          console.log("Done!");
          console.log(data.body);
          setLikedSongs(
            data.body.items.map((eachSong) => {
              const biggestAlbumImage = eachSong.track.album.images.reduce(
                (biggest, image) => {
                  if (image.height > biggest.height) return image;
                  return biggest;
                },
                eachSong.track.album.images[0]
              );

              return {
                artist: eachSong.track.artists[0].name,
                title: eachSong.track.name,
                uri: eachSong.track.uri,
                albumUrl: biggestAlbumImage.url,
                id: eachSong.track.id,
              };
            })
          );
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
  }, [userId]);

  function chooseTrack(track) {
    setPlayingTrack(track);
    // setSearch("")
  }

  function getPlaylistsSongs(playlistId) {
    spotifyApi.getPlaylist(playlistId).then(
      function (data) {
        console.log("Some information about this playlist", data.body);
        console.log(data.body.name);
        setPlaylistState(false);
        setPlaylistName(data.body.name);
        setDisplayPlayListSongs(
          data.body.tracks.items.map((eachSong) => {
            // const biggestAlbumImage = eachSong.track.album.images.reduce(
            //   (biggest, image) => {
            //     if (image.height > biggest.height) return image
            //     return biggest
            //   },
            //   eachSong.album.images[0]
            // )

            return {
              artist: eachSong.track.artists[0].name,
              title: eachSong.track.name,
              uri: eachSong.track.uri,
              albumUrl: eachSong.track.album.images[0].url,
              id: eachSong.track.id,
              // albumUrl: biggestAlbumImage.url,
            };
          })
        );
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }

  function getRecommendations() {
    const artistListArray = artistList.map((artist) => artist.id);
    const songListArray = songList.map((song) => song.id);

    setRecommendationState(false);
    spotifyApi
      .getRecommendations({
        min_energy: 0.4,
        seed_artists: [artistListArray],
        seed_tracks: [songListArray],
        min_popularity: 50,
      })
      .then(
        function (data) {
          let recommendations = data.body;
          console.log(recommendations);

          setRecommendation(
            data.body.tracks.map((eachSong) => {
              return {
                artist: eachSong.artists[0].name,
                title: eachSong.name,
                uri: eachSong.uri,
                albumUrl: eachSong.album.images[0].url,
                // albumUrl: biggestAlbumImage.url,
              };
            })
          );
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
  }

  // Searching for Songs
  useEffect(() => {
    console.log("searching Songs");
    if (!search) return setSongsSearchResults([]);
    if (!accessToken) return;

    console.log(accessToken);
    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      console.log(res.body.tracks.items);
      if (cancel) return;
      setSongsSearchResults(
        res.body.tracks.items.map((track) => {
          const biggestAlbumImage = track.album.images.reduce(
            (biggest, image) => {
              if (image.height > biggest.height) return image;
              return biggest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: biggestAlbumImage.url,
            id: track.id,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  //Searching for Artists

  useEffect(() => {
    if (!search) return setArtistsSearchResults([]);
    if (!accessToken) return;
    if (currentSearchChoice == "songs") return;

    console.log(accessToken);
    let cancel = false;
    spotifyApi.searchArtists(search).then((res) => {
      console.log("Search artists", res.body);
      if (cancel) return;
      setArtistsSearchResults(
        res.body.artists.items.map((artist) => {
          const biggestArtistImage = artist.images.reduce(
            (biggest, image) => {
              if (image.height > biggest.height) return image;
              return biggest;
            },

            artist.images[0]
          );

          return {
            artistName: artist.name,
            artistImage: biggestArtistImage.url,
            artistId: artist.id,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken, currentSearchChoice]);

  const handleSwitchToggle = () => {
    console.log(recommendationState);
    if (currentSearchChoice === "songs") {
      setCurrentSearchChoice("artists");
    } else {
      setCurrentSearchChoice("songs");
    }
  };

  function addSong(song) {
    console.log(song);
    console.log("tryna add song");

    setSongList([
      ...songList,
      {
        id: song.id,
        name: song.title,
        artist: song.artist,
        image: song.albumUrl,
      },
    ]);
    console.log(songList);
    console.log(currentRecommendationLength);
  }

  function addArtist(artist) {
    console.log(artist);

    // let trackId = song.uri.substring(song.uri.indexOf("track:") + 6);
    console.log("tryna add artist");
    setArtistList([
      ...artistList,
      {
        id: artist.artistId,
        artistName: artist.artistName,
        artistImage: artist.artistImage,
      },
    ]);
    // setSongList([...artistList, { id: trackId, name: song.title }]);
    console.log(artistList);
  }

  function removeSong(index) {
    setSongList((prevSongList) => prevSongList.filter((_, i) => i !== index));
  }

  function removeArtist(index) {
    setArtistList((prevArtistList) =>
      prevArtistList.filter((_, i) => i !== index)
    );
  }

  useEffect(() => {
    setCurrentRecommendationLength(songList.length + artistList.length);
  }, [songList, artistList]);

  return (
    <div className="flex flex-col h-screen ">
      <div
        className="flex bg-gray-100"
        // className="flex justify-center items-center bg-gray-100"
        id="topbar"
        style={{
          height: "10vh",

          alignItems: "center",
        }}
      >
        <img
          src={process.env.PUBLIC_URL + "/" + "My project-1 (11).png"}
          style={{ height: "80px", width: "300px", marginLeft: "20px" }}
        ></img>
        {/* this is the search and check div */}

        <div
          className="border border-gray-300 rounded px-4 py-2 w-80 bg-white "
          style={{
            // height: "67%",
            // position: "relative",
            // left: "70px",
            width: "32%",
            position: "absolute",
            left: "50%",
            // top: "50%",
            transform: "translate(-50%)",
          }}
        >
          <input
            className="flex-grow outline-none pr-4 text-lg font-semibold text-gray-700 mx-auto"
            type="text"
            placeholder={`Search for ${currentSearchChoice}`}
            value={search}
            style={{
              height: "40px",
              width: "100%",
              fontSize: "130%",
            }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ position: "relative" }}>
          <label
            class="inline-flex items-center"
            style={{
              // position: "absolute",
              // left: "calc(100% + 0px)",

              // marginLeft: "51vw",
              // transform: "translateY(-50%)",
              width: "30px",
            }}
          >
            <input
              type="checkbox"
              class="form-checkbox h-5 w-5 text-indigo-600"
              onClick={handleSwitchToggle}
            />
            <span class="ml-2 text-white font-bold">
              {currentSearchChoice === "songs"
                ? "Search Artists"
                : "Search Artists"}
            </span>
          </label>
        </div>

        {/* <div className="flex items-center bg-gray-400  p-2 h-14 rounded-lg" id="profile"> */}

        <img
          src={userPhoto}
          className="object-contain mr-4 border border-white"
          id="userphoto"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            height: "60px",
            width: "60px",
            display: "flex",
            // left: "200px",
            marginRight: "0px",
            marginLeft: "auto",

            // marginLeft: "60px",

            // marginLeft: "30px",
          }}
        ></img>

        <div
          className="font-bold text-white "
          id="username"
          style={{ position: "relative", right: "150px", width: "20px" }}
        >
          {userName}
        </div>
        {/* </div> */}
      </div>

      <div
        className="flex-grow bg-gradient-to-r from-purple-200 to-red-300 "
        id="background"
      >
        <div className="flex" style={{ height: "78vh" }}>
          <div
            className=" rounded-lg overflow-y-scroll p-2 space-y-2 bg-gray-300"
            id="container-background"
            style={{
              marginBottom: "150px",
              height: "98%",
              marginTop: "10px",
              marginLeft: "10px",
              width: "33%",
            }}
          >
            <div className="flex items-center bg-gray-300 " id="catergory">
              {!playlistState && (
                <svg
                  className=" cursor-pointer w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setPlaylistState(true)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              )}
              <h3
                class="font-bold text-center border-b-2 border-gray-500 mx-auto text-2xl"
                id="playlist"
                style={{ fontSize: "160%" }}
              >
                {playlistState ? "Playlists:" : playlistName}
              </h3>
            </div>
            {playlistState
              ? displayUserPlaylists.map((eachPlaylist) => (
                  <Playlists
                    playlist={eachPlaylist}
                    getPlaylistsSongs={getPlaylistsSongs}
                    addSong={addSong}
                  />
                ))
              : playlistSongs.map((eachSong) => (
                  <SearchResults
                    track={eachSong}
                    chooseTrack={chooseTrack}
                    addSong={addSong}
                    currentRecommendationLength={currentRecommendationLength}
                  />
                ))}
          </div>

          <div
            className=" rounded-lg overflow-y-scroll p-2 bg-gray-300 space-y-2"
            style={{
              marginBottom: "150px",
              height: "98%",
              marginTop: "10px",
              marginRight: "10px",
              marginLeft: "10px",
              paddingTop: "25px",
              width: "33%",
            }}
          >
            <h3
              className="font-bold text-center  mx-auto"
              style={{
                position: "relative",
                top: "10px ",
                right: "43px",
                bottom: "40px",
                marginBottom: "26px",
              }}
            >
              <span
                className="font-bold border-b-2 text-2xl inline-block border-b-2 border-gray-500 "
                style={{
                  position: "absolute",
                  bottom: "-0.4em",
                  fontSize: "160%",
                }}
                id="search"
              >
                Search:
              </span>
            </h3>

            {currentSearchChoice === "songs" &&
              searchResults.map((track) => (
                <SearchResults
                  track={track}
                  chooseTrack={chooseTrack}
                  addSong={addSong}
                  currentRecommendationLength={currentRecommendationLength}
                />
              ))}
            {currentSearchChoice === "artists" &&
              searchArtistsResults.map((artist) => (
                <ArtistSearchResults
                  artist={artist}
                  addArtist={addArtist}
                  currentRecommendationLength={currentRecommendationLength}
                />
              ))}
          </div>

          <div
            className=" rounded-lg overflow-y-scroll p-2 bg-gray-300 flex flex-col relative"
            style={{
              marginBottom: "150px",
              height: "98%",
              marginTop: "10px",
              marginRight: "10px",
              width: "33%",
            }}
          >
            <div className="flex items-center bg-gray-300 " id="catergory">
              {!recommendationState && (
                <svg
                  className=" cursor-pointer w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setRecommendationState(true)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              )}
              <h3
                class="font-bold text-center border-b-2 border-gray-500  mx-auto text-2xl"
                id="search"
                style={{ fontSize: "160%" }}
              >
                {recommendationState
                  ? "Recommendation:"
                  : "Your Recommendation"}
              </h3>
            </div>
            {currentRecommendationLength === 0 && (
              <div
                className="text-center font-bold bg-orange-400 text-white py-4 rounded "
                style={{
                  // marginLeft: "40px",
                  width: "80%",
                  height: "9%",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  fontSize: "110%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                Select up to 5 items (Songs or Artists)
              </div>
            )}

            {recommendationState ? (
              <div className="flex-grow">
                <h3 className="font-bold text-center pb-2 mx-auto"></h3>
                {songList.map((song, index) => (
                  <AddSong
                    key={index}
                    song={song}
                    chooseTrack={chooseTrack}
                    removeSong={() => removeSong(index)}
                  />
                ))}
                {artistList.map((artist, index) => (
                  <AddArtist
                    key={index}
                    artist={artist}
                    removeArtist={() => removeArtist(index)}
                  />
                ))}
                <button
                  className={`bg-${
                    currentRecommendationLength >= 1
                      ? "gradient-to-r from-purple-500 to-red-500 "
                      : "gray-400"
                  } text-white font-bold py-2 px-4 rounded absolute bottom-0  `}
                  style={{
                    position: "absolute",
                    fontSize: "110%",
                    height: "9%",
                    width: "60%",
                    left: "50%",
                    // top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={getRecommendations}
                  disabled={currentRecommendationLength < 1}
                >
                  Get Recommendation
                </button>
              </div>
            ) : (
              recommendations.map((eachSong) => (
                <Recommendations
                  style={{ paddingTop: "40px" }}
                  song={eachSong}
                  chooseTrack={chooseTrack}
                  addSong={addSong}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full">
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </div>
  );
}
