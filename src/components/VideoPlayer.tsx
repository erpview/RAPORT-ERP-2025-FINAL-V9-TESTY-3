import { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export default function VideoPlayer({ url, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    // Clean up previous player instance
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Create container for the video
    const container = document.createElement('div');
    videoRef.current.innerHTML = '';
    videoRef.current.appendChild(container);

    // Get video ID and provider
    let provider: 'youtube' | 'vimeo' = 'youtube';
    let videoId = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      provider = 'youtube';
      const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
      if (match) videoId = match[1];
    } else if (url.includes('vimeo.com')) {
      provider = 'vimeo';
      const match = url.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/);
      if (match) videoId = match[1];
    }

    if (videoId) {
      container.setAttribute('data-plyr-provider', provider);
      container.setAttribute('data-plyr-embed-id', videoId);

      // Create new player instance
      playerRef.current = new Plyr(container, {
        hideControls: false,
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'fullscreen'
        ],
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        },
        vimeo: {
          byline: false,
          portrait: false,
          title: false,
          speed: true,
          transparent: false
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  return <div ref={videoRef} className={className} />;
}
