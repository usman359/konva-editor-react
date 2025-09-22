import { Dialog } from "@blueprintjs/core";
import React from "react";

const HTML5VideoPlayer = ({ isOpen, onClose }) => {
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [showControls, setShowControls] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(true);
  const controlsTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen && videoRef.current) {
      // Auto-play the video when modal opens
      videoRef.current.play().catch(console.error);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Hide controls after 3 seconds of inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Handle video click for play/pause
  const handleVideoClick = (e) => {
    e.preventDefault();
    handlePlayPause();
  };

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "KeyM":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "KeyF":
          e.preventDefault();
          handleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, currentTime, duration, volume]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      resetControlsTimeout();
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      resetControlsTimeout();
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
      resetControlsTimeout();
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      resetControlsTimeout();
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      resetControlsTimeout();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Video Player"
      style={{
        width: "800px",
        height: "500px",
        maxWidth: "90vw",
        maxHeight: "80vh",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "0",
          margin: "0",
          position: "relative",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          src="/vidoes/video.mp4"
          loop
          muted={isMuted}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            cursor: "pointer",
          }}
          onClick={handleVideoClick}
          onMouseMove={handleMouseMove}
          onError={(e) => console.error("Video error:", e)}
          onLoadStart={() => console.log("Video: loadstart")}
          onLoadedData={() => console.log("Video: loadeddata")}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => console.log("Video: canplay")}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Custom Controls Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: showControls ? "auto" : "none",
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "2px",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={(e) => {
              if (videoRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newTime = duration * percentage;
                handleSeek(newTime);
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                background: "#007bff",
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                borderRadius: "2px",
              }}
            />
          </div>

          {/* Control Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            {/* Left Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "35px",
                  height: "35px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              {/* Backward 2s Button */}
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 2))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "35px",
                  height: "35px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                ⏪
              </button>

              {/* Forward 2s Button */}
              <button
                onClick={() => handleSeek(Math.min(duration, currentTime + 2))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "35px",
                  height: "35px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                ⏩
              </button>

              {/* Time Display */}
              <span
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  minWidth: "100px",
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Mute Button */}
              <button
                onClick={handleMuteToggle}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "35px",
                  height: "35px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                {isMuted ? "🔇" : "🔊"}
              </button>

              {/* Volume Control */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  style={{
                    width: "60px",
                    height: "4px",
                    background: "rgba(255,255,255,0.3)",
                    outline: "none",
                    borderRadius: "2px",
                  }}
                />
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "35px",
                  height: "35px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default HTML5VideoPlayer;
