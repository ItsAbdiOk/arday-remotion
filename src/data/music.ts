/**
 * Background music tracks for Word of the Day videos.
 *
 * To add a new track:
 * 1. Drop the MP3 in public/music/
 * 2. Add an entry below with a unique `id`
 * 3. Add the `id` to the "background-music" test variants in ab-config.ts
 *
 * All tracks must be royalty-free / licensed for commercial social media use.
 */

export interface MusicTrack {
  id: string;
  file: string;
  label: string;
  vibe: "ambient" | "electronic" | "hiphop" | "pop" | "acoustic";
}

export const musicTracks: MusicTrack[] = [
  {
    id: "ambient",
    file: "bg-loop.mp3",
    label: "Free Ambient Music — PulseBox",
    vibe: "ambient",
  },
  {
    id: "electronic",
    file: "promo-beat.mp3",
    label: "Creator Intro Modern YouTube Opener",
    vibe: "electronic",
  },
];

export function getTrackById(id: string): MusicTrack {
  return musicTracks.find((t) => t.id === id) || musicTracks[0];
}

// Default track used when no A/B test is active
export const DEFAULT_TRACK_ID = "electronic";
