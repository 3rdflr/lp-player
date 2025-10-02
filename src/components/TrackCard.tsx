'use client';

import { useDrag } from 'react-dnd';
import { TrackCardProps } from '@/types/Player.types';

export default function TrackCard({ track, onSelect }: TrackCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'track',
    item: track,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onClick={onSelect}
      className={`cursor-pointer flex items-center space-x-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <img src={track.albumArt} alt={track.title} className='w-16 h-16 rounded-lg shadow-md' />
      <div>
        <h3 className='font-semibold text-white'>{track.title}</h3>
        <p className='text-sm text-gray-400'>{track.artist}</p>
      </div>
    </div>
  );
}
