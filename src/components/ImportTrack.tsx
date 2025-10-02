'use client';

import * as mm from 'music-metadata-browser';
import TrackCard from './TrackCard';
import { useState, useRef } from 'react';
import { TrackId } from '@/types/Player.types';

export default function ImportTrack({ onSelect }: { onSelect: (track: TrackId) => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tracks, setTracks] = useState<TrackId[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: TrackId[] = [];

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);

      try {
        const metadata = await mm.parseBlob(file);
        const common = metadata.common;

        // 앨범아트 추출
        let albumArt = '/images/default_img.png';
        if (common.picture?.[0]) {
          const picture = common.picture[0];
          const uint8 = new Uint8Array(picture.data); // 변환
          const blob = new Blob([uint8], { type: picture.format });
          albumArt = URL.createObjectURL(blob);
        }

        newTracks.push({
          id: crypto.randomUUID(),
          title: common.title || file.name.replace(/\.[^/.]+$/, ''),
          artist: common.artist || 'Unknown Artist',
          albumArt,
          previewUrl: url,
        });
      } catch {
        newTracks.push({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Uploaded by User',
          albumArt: '/images/default_img.png',
          previewUrl: url,
        });
      }
    }

    setTracks((prev) => [...prev, ...newTracks]);
  };

  const mockTracks: TrackId[] = [
    {
      id: '1',
      title: 'that.s how we go...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/that.s how we go....mp3',
    },
    {
      id: '2',
      title: 'sun sighing...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/sun sighing....mp3',
    },
    {
      id: '3',
      title: 'smoke and mug...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/smoke and mug....mp3',
    },
    {
      id: '4',
      title: 'abso_ute...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/abso_ute....mp3',
    },
    {
      id: '5',
      title: 'unrise...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/unrise....mp3',
    },
    {
      id: '6',
      title: 'peacan pie...',
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: '/audio/peacan pie....mp3',
    },
    {
      id: '7',
      title: `dream dog's interlude...`,
      artist: '3rdfloorhotel',
      albumArt: '/images/IMG_3445.jpg',
      previewUrl: `/audio/dream dog's interlude....mp3`,
    },
  ];

  return (
    <div className='w-full max-w-md space-y-4'>
      <button
        onClick={() => fileInputRef.current?.click()}
        className='px-6 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600'
      >
        + Upload Track
      </button>
      <input
        type='file'
        accept='audio/*'
        multiple
        ref={fileInputRef}
        onChange={handleUpload}
        className='hidden'
      />

      <ul className='space-y-2'>
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} onSelect={() => onSelect(track)} />
        ))}
        {mockTracks.map((track) => (
          <TrackCard key={track.id} track={track} onSelect={() => onSelect(track)} />
        ))}
      </ul>
    </div>
  );
}
