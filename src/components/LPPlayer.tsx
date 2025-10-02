// src/components/LPPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Track, LPPlayerProps } from '@/types/Player.types';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

export default function LPPlayer({ currentTrack, onDropTrack }: LPPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lpRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [rotation, setRotation] = useState(0);

  // 애니메이션 관련 refs
  const velocityRef = useRef(0);
  const targetVelocityRef = useRef(0);
  const rotationRef = useRef(0);
  const lastAngleRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const lastMoveSpeedRef = useRef(0);

  // ---------- tunables ----------
  const rotationSpeed = 2.5; // 기본 회전 속도
  // scratching
  // (이 값들을 조정하여 스크래칭 감도를 변경할 수 있습니다)
  const scratchFactor = 0.8; // 마우스 움직임 -> 시각적 회전 변환 비율
  const audioDegToSec = 0.1; // 시각적 회전(deg) -> 오디오 재생 시간(sec) 변환 비율
  // animation loop
  // (이 값들을 조정하여 관성 및 감속 효과를 변경할 수 있습니다)
  const friction = 1; // 감속 계수 (1 = 없음, 0 = 즉시 정지)
  const easeToTarget = 0.1; // 목표 속도로 부드럽게 전환하는 정도 (0-1)
  // -------------------------------

  const { play: audioPlay, stop: audioStop, setVelocity, fade } = useAudioPlayer(currentTrack);

  // 애니메이션 loop (회전 및 속도 업데이트)
  useEffect(() => {
    rotationRef.current = rotation;
    let raf = 0;
    const loop = () => {
      const v = velocityRef.current;
      const tv = targetVelocityRef.current;
      velocityRef.current += (tv - v) * easeToTarget;

      if (!isScratching && Math.abs(velocityRef.current) > 1e-5) {
        velocityRef.current *= friction;
      }

      rotationRef.current += velocityRef.current;
      setRotation(rotationRef.current);

      // 오디오 속도 매핑
      setVelocity(velocityRef.current, rotationSpeed);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isScratching, setVelocity]);

  // 드래그 앤 드랍
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'track',
    drop: (item: Track) => {
      onDropTrack(item);
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
        } catch {}
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        targetVelocityRef.current = rotationSpeed;
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  // play / pause
  const handlePlay = () => {
    setIsPlaying(true);
    targetVelocityRef.current = rotationSpeed;
    if (Math.abs(velocityRef.current) < 0.02) velocityRef.current = rotationSpeed * 0.25;

    audioPlay();
    fade(1, 0.9);
  };

  const handlePause = () => {
    setIsPlaying(false);
    targetVelocityRef.current = 0;
    fade(0, 0.5);
    setTimeout(() => audioStop(), 600);
  };

  // LP 중심 계산
  const calcCenter = () => {
    const el = lpRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    centerRef.current.x = r.left + r.width / 2;
    centerRef.current.y = r.top + r.height / 2;
  };

  // 스크래칭 시작
  const startScratch = (clientX: number, clientY: number) => {
    if (!audioRef.current || !lpRef.current) return;
    // LP 중심 계산
    calcCenter();

    // 스크래칭 중에는 오디오 일시정지
    audioRef.current.pause();

    setIsScratching(true);

    // 현재 각도 저장
    const cx = centerRef.current.x;
    const cy = centerRef.current.y;
    const a = Math.atan2(clientY - cy, clientX - cx);
    lastAngleRef.current = a;

    // 스크래칭 시작 시 속도 초기화
    targetVelocityRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startScratch(e.clientX, e.clientY);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    startScratch(t.clientX, t.clientY);
  };

  // 각도 정규화 (-PI to PI)
  const normalizeAngle = (ang: number) => {
    let a = ang;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };

  // 스크래칭 중 움직임 처리
  const handleMove = (clientX: number, clientY: number) => {
    if (!isScratching || !audioRef.current) return;
    const lastA = lastAngleRef.current;
    if (lastA === null) {
      // 불가능한 움직임이지만 안전하게 처리
      const cx = centerRef.current.x;
      const cy = centerRef.current.y;
      lastAngleRef.current = Math.atan2(clientY - cy, clientX - cx);
      return;
    }
    const cx = centerRef.current.x;
    const cy = centerRef.current.y;
    const curA = Math.atan2(clientY - cy, clientX - cx);
    let deltaRad = curA - lastA;
    deltaRad = normalizeAngle(deltaRad);
    lastAngleRef.current = curA;

    // 라디안을 각도(deg)로 변환
    const rad2deg = 180 / Math.PI;
    const deltaDeg = deltaRad * rad2deg;

    // 시각적 회전 업데이트
    // (마우스 움직임에 비례하여 회전, scratchFactor로 감도 조절)
    const visualDelta = deltaDeg * scratchFactor;
    rotationRef.current += visualDelta;
    setRotation(rotationRef.current);

    // 오디오 재생 위치 업데이트
    if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
      const newTime = Math.min(
        Math.max(0, audioRef.current.currentTime + visualDelta * audioDegToSec),
        audioRef.current.duration - 0.001,
      );
      audioRef.current.currentTime = newTime;
    } else {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime + visualDelta * audioDegToSec,
      );
    }

    // 속도 업데이트 (관성에 사용)
    lastMoveSpeedRef.current = visualDelta;
    velocityRef.current = visualDelta; // 즉각적인 반응을 위해 속도도 업데이트
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isScratching) {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (isScratching) {
      e.preventDefault();
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    }
  };

  // 스크래칭 종료
  const handleRelease = () => {
    if (!isScratching) return;
    setIsScratching(false);

    // 관성 적용
    // (스크래칭 종료 시점의 속도를 기반으로 관성 부여)
    const inertia = lastMoveSpeedRef.current || 0;
    velocityRef.current = inertia;
    targetVelocityRef.current = isPlaying ? rotationSpeed : 0;

    // 스크래칭 종료 후 오디오 재생 재개
    if (audioRef.current) {
      // 작은 지연 후 재생 시도 (브라우저 정책 대응)
      // setTimeout(() => audioRef.current?.play().catch(() => {}), 10);
    }

    // clear
    lastMoveSpeedRef.current = 0;
    lastAngleRef.current = null;
  };

  // 글로벌 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleRelease);

    window.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    } as AddEventListenerOptions);
    window.addEventListener('touchend', handleRelease);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleRelease);
    };
  }, [isScratching]);

  // rotationRef 초기화
  useEffect(() => {
    rotationRef.current = rotation;
  }, []);

  // ---------- render ----------
  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className='flex flex-col items-center space-y-6'
    >
      <div className='w-[44rem] h-[44rem] rounded-full border-[7px] border-gray-900 shadow-2xl relative flex items-center justify-center'>
        <div
          className='absolute inset-0 rounded-full pointer-events-none'
          style={{
            backgroundImage: `
      repeating-radial-gradient(
        circle at center,
        rgba(255,255,255,0.04) 0px,
        rgba(255,255,255,0.04) 1px,
        transparent 2px,
        transparent 6px
      )
    `,
            mixBlendMode: 'overlay',
          }}
        />
        {/* LP 판 */}
        <div
          ref={lpRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`w-full h-full rounded-full  border-[7px] border-gray-900 relative overflow-hidden select-none
    ${isOver ? 'ring-4 ring-blue-400' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isScratching ? 'none' : 'transform 0.08s linear',
            backgroundImage: `
      repeating-radial-gradient(
        circle at center,
        #111 0px,
        #111 1px,
        #000 3px,
        #000 6px
      )
    `,
            backgroundColor: '#000',
          }}
        >
          {/* LP 그루브 효과 */}
          <div
            aria-hidden
            className='absolute inset-0 rounded-full pointer-events-none shadow-2xl'
            style={{
              backgroundImage:
                'repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0) 2px 6px)',
              mixBlendMode: 'overlay',
              opacity: 0.15,
            }}
          />

          {/* LP 중앙 라벨 */}
          <div
            className='absolute top-1/2 left-1/2 rounded-full flex items-center justify-center overflow-hidden'
            style={{
              width: '16rem',
              height: '16rem',
              transform: 'translate(-50%,-50%)',
              background: 'black',
              border: '3px solid rgba(0,0,0,0.6)',
              boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.03), 0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {currentTrack ? (
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className='w-full h-full object-cover rounded-full pointer-events-none'
              />
            ) : (
              <div className='flex items-center justify-center w-full h-full text-gray-500'>
                {' '}
                Drop a track here{' '}
              </div>
            )}
          </div>

          {/* LP 중앙 홀 */}
          <div className='w-3 h-3 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl'></div>
        </div>
      </div>

      {/* 현재 재생 정보 */}
      {currentTrack && (
        <div className='text-center'>
          <h3 className='font-semibold text-lg text-gray-700'>{currentTrack.title}</h3>
          <p className='text-gray-400'>{currentTrack.artist}</p>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className='flex space-x-4'>
        <button
          onClick={handlePlay}
          className='px-6 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600'
        >
          ▶ Play
        </button>
        <button
          onClick={handlePause}
          className='px-6 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600'
        >
          ⏸ Pause
        </button>
      </div>

      {/* 오디오 */}
      {currentTrack && <audio ref={audioRef} src={currentTrack.previewUrl} preload='auto' />}
    </div>
  );
}
