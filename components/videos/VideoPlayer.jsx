'use client'
import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({videoUrl}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const handleInputChange = (event) => {
    setStreamUrl(event.target.value);
  };

  const loadStream = (streamUrl) => {
    const url = streamUrl.trim();

    if (Hls.isSupported()) {
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
                handleMediaError(hls);
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
        hls.on(Hls.Events.FRAG_PARSING_METADATA, handleTimedMetadata);
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

  const handleMediaError = (hls) => {
    console.warn('Trying to recover from media error...');
    hls.recoverMediaError();
  };

  const handleTimedMetadata = (event, data) => {
    for (let i = 0; i < data.samples.length; i++) {
      const pts = data.samples[i].pts;
      const str = new TextDecoder('utf-8').decode(data.samples[i].data.subarray(22));
    //   console.log(`Metadata ${str} at ${pts}s`);
    }
  };

  
  
  useEffect(()=>{
      console.log("StreamUrl inside ueff",videoUrl);
      if(!videoUrl) return;
      loadStream(videoUrl);
      
    // Clean up HLS instance on component unmount
    return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
  },[videoUrl])

//   useEffect(()=>{
//     console.log('videourl changed',videoUrl)
//     if (hlsRef.current) {
//         hlsRef.current.destroy();
//     }
//     setStreamUrl(videoUrl);
//     if(streamUrl) loadStream();
//   },[videoUrl]);


  return (
    <div>
      {/* <div className="controls" style={{ textAlign: 'center', margin: '20px 0' }}> */}
        {/* <input
          type="text"
          value={streamUrl}
          onChange={handleInputChange}
          placeholder="Enter HLS stream URL"
          style={{ width: '60%', padding: '10px', fontSize: '16px' }}
        />
        <button onClick={loadStream} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Play Stream
        </button> */}
      {/* </div> */}
      <video ref={videoRef} controls style={{ width: '100%', maxWidth: '80vw', maxHeight: '50vh', margin: '0 auto', display: 'block' }} />
    </div>
  );
};

export default VideoPlayer;
