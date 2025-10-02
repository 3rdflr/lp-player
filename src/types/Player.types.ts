export interface Track {
  title: string;
  artist: string;
  previewUrl: string;
  albumArt: string | undefined;
}

export interface TrackId extends Track {
  id: string;
}

export interface LPPlayerProps {
  currentTrack?: Track;
  onDropTrack: (track: Track) => void;
}

export interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

export interface TrackCardProps {
  track: Track;
  onSelect: () => void;
}
