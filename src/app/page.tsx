// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Track } from '@/types/Player.types';
import ImportTrack from '@/components/ImportTrack';
import LPPlayer from '@/components/LPPlayer';

export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState<Track>();

  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 text-white flex items-center justify-center'>
      <div className='flex flex-col w-full gap-12 p-10 justify-between lg:flex-row'>
        {/* LP 플레이어 */}
        <div className='flex-1 flex items-center justify-center'>
          <LPPlayer currentTrack={currentTrack} onDropTrack={setCurrentTrack} />
        </div>

        {/* 추천곡 리스트 */}
        <div className='flex-1 max-w-md space-y-4'>
          <ImportTrack onSelect={(track) => setCurrentTrack(track)} />\
        </div>
      </div>
    </main>
  );
}
