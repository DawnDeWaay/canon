import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Spotify serves images from many subdomains — track/album art on
    // `i.scdn.co`, mosaic playlist covers on `mosaic.scdn.co`, algorithmic
    // playlists on `newjams-images.scdn.co` / `daily-mix.scdn.co` /
    // `thisis-images.scdn.co`, uploaded covers on `image-cdn-ak.spotifycdn.com`
    // / `image-cdn-fa.spotifycdn.com` / `blend-playlist-covers.spotifycdn.com`,
    // etc. Wildcard both root domains so we don't have to chase new hosts.
    remotePatterns: [
      { protocol: 'https', hostname: '**.scdn.co' },
      { protocol: 'https', hostname: '**.spotifycdn.com' },
    ],
  },
};

export default nextConfig;
