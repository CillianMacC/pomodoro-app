import YouTube, { type YouTubeProps, type YouTubePlayer } from 'react-youtube';
import { useRef, useEffect } from 'react';

interface YouTubeBackgroundProps {
  videoId: string;
  volume: number;
  isMuted: boolean;
}

export function YouTubeBackground({ videoId, volume, isMuted }: YouTubeBackgroundProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
      event.target.setVolume(volume);
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // If video ends (state 0), seek to beginning and play again (manual loop just in case playlist parameter fails)
    if (event.data === 0) {
      event.target.seekTo(0);
      event.target.playVideo();
    }
  };

  useEffect(() => {
    if (playerRef.current) {
       if (isMuted) {
         playerRef.current.mute();
       } else {
         playerRef.current.unMute();
         playerRef.current.setVolume(volume);
       }
    }
  }, [volume, isMuted]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playlist: videoId, // Required to loop a single video
      loop: 1,
      iv_load_policy: 3,
      rel: 0,
      showinfo: 0,
    },
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      <div className="absolute inset-x-0 w-[120vw] h-[120vh] -top-[10vh] -left-[10vw]">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full pointer-events-none"
          iframeClassName="w-full h-full object-cover scale-[1.2] opacity-60 pointer-events-none" 
        />
      </div>
      <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[2px] pointer-events-none"></div>
    </div>
  );
}
