import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
  const video = useRef("");
  const [pressKey, setPressKey] = useState([null]);
  const [loader, setLoader] = useState(false);

  const [settings, setSettings] = useState({
    lengthVid: 0,
    play: false,
    currentTime: 0.0,
    volume: 1,
    muted: false,
    full: false
  });

  const setParams = useCallback(
      (key) => {
        return (val) => setSettings({ ...settings, [key]: val });
      },
      [settings]
  );

  function useInterval(callback, delay, last) {
    const savedCallback = useRef();
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (!last && delay !== null) {
        const interval = setInterval(tick, delay);
        return () => clearInterval(interval);
      }
    }, [delay, last]);
  }

  const getReady = (event) => {
    setParams("lengthVid")(event.currentTarget.duration);
    video.current.volume = 1;
  };

  const checkBuffer = () => {
    setLoader(true);
    let bufferLength = video.current.buffered.length;
    let buffer = video.current.buffered;
    for (let i = 0; i < bufferLength; i++) {
      let thisTime = video.current.currentTime;
      if (buffer.start(i) <= thisTime && buffer.end(i) >= thisTime) {
        setLoader(false);
      }
    }
  };
  useInterval(() => checkBuffer(), 100, !loader);

  const PlayPause = () => {
    if (!settings.play) {
      (async function () {
        await video.current.play();
      })().then(() => setParams("play")(!settings.play));
    } else {
      (async function () {
        await video.current.pause();
      })().then(() => setParams("play")(!settings.play));
    }
  };

  useInterval(
      () => setParams("currentTime")(video.current.currentTime),
      500,
      !settings.play
  );

  const Fullscreen = () => {
    setParams("full")(!settings.full);

    //это фуллскрин нативными средствами
    // if (video.current.requestFullScreen) {
    //   video.current.requestFullScreen();
    // } else if (video.current.webkitRequestFullScreen) {
    //   video.current.webkitRequestFullScreen();
    // } else if (video.current.mozRequestFullScreen) {
    //   video.current.mozRequestFullScreen();
    // } else {
    //   alert("Полноэкранный режим не поддерживается данным браузером!");
    // }
  };

  const setTime = (val) => {
    video.current.currentTime = val;
    setParams("currentTime")(video.current.currentTime);
    checkBuffer();
  };

  const setVolume = (val) => {
    video.current.volume = val;
    setParams("volume")(video.current.volume);
  };

  const changingTime = (action, val) => {
    if (action === "+") {
      video.current.currentTime += val;
    } else if (video.current.currentTime > 10.0) {
      video.current.currentTime -= val;
    } else {
      video.current.currentTime = 0.1;
    }
    setParams("currentTime")(video.current.currentTime);
    checkBuffer();
  };

  const endedVideo = () => {
    video.current.currentTime = 0;
    setSettings({ ...settings, play: false, currentTime: 0 });
  };

  const keyHandler = () => {
    switch (pressKey[0]) {
      case 13:
        PlayPause();
        break;
      case 32:
        PlayPause();
        break;
      case 39:
        changingTime("+", 10);
        break;
      case 37:
        changingTime("-", 10);
        break;
      case 27:
        settings.full && setParams("full")(!settings.full);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    keyHandler();
  }, [pressKey]);

  const onMute = () => {
    video.current.muted = !settings.muted;
    setParams("muted")(!settings.muted);
  };

  useEffect(() => {
    const handleEvent = (key) => {
      setPressKey([key.keyCode]);
    };

    window.addEventListener("keyup", handleEvent);
    return () => {
      window.removeEventListener("keyup", handleEvent);
    };
  }, []);

  return (
      <div className="App">
        <div className={"player" + (settings.full ? " full" : "")}>
          <video
              className="player__video"
              ref={video}
              onLoadedMetadata={(event) => getReady(event)}
              onEnded={() => endedVideo()}
          >
            <source
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
                type="video/mp4"
            />
          </video>
          {loader && (
              <img
                  className="loader"
                  src="https://i.ya-webdesign.com/images/loading-animated-png-7.gif"
              />
          )}
          <div className="player__nav">
            <button onClick={() => PlayPause()}>
              {!settings.play ? "►" : "||"}
            </button>
            <button onClick={() => changingTime("-", 10)}> {"<<"} </button>
            <button onClick={() => changingTime("+", 10)}>{">>"}</button>
            <input
                type="range"
                className="time_range"
                onChange={(val) => setTime(val.target.value)}
                value={settings.currentTime}
                step={0.1}
                min={0.1}
                max={settings.lengthVid}
            />
            <input
                style={{ width: 50 }}
                type="range"
                onChange={(val) => setVolume(val.target.value)}
                value={settings.volume}
                step={0.1}
                min={0}
                max={1}
            />
            <button onClick={() => onMute()}>
              {!settings.muted ? `🔊` : `🔇`}
            </button>
            <button onClick={() => Fullscreen()}>⎚</button>
          </div>
        </div>
      </div>
  );
};

export default App;
