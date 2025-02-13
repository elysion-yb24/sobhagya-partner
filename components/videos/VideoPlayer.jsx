'use client';
import React, { useState, useRef, useEffect } from 'react';
import dynamic from "next/dynamic";

// ✅ Dynamic import to prevent SSR issues
const Hls = dynamic(() => import("hls.js"), { ssr: false });

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const loadStream = (streamUrl) => {
    const url = streamUrl.trim();

    if (Hls && Hls.isSupported()) {
      if (url) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls();
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error('Player error:', data.type, '-', data.details);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('Trying to recover from media error...');
                hls.recoverMediaError();
                break;
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error...');
                break;
              default:
                console.error('Unrecoverable error');
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          videoRef.current.play();
        });
      } else {
        alert('Please enter a valid HLS stream URL.');
      }
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native support
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', function () {
        videoRef.current.play();
      });
    } else {
      alert('HLS is not supported in this browser.');
    }
  };

  useEffect(() => {
    if (!videoUrl) return;
    loadStream(videoUrl);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoUrl]);

  return (
    <div>
      <video ref={videoRef} controls style={{ width: '100%', maxWidth: '80vw', maxHeight: '50vh', margin: '0 auto', display: 'block' }} />
    </div>
  );
};

export default VideoPlayer;
