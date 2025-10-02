import { useEffect, useRef } from 'react';
import { Track } from '@/types/Player.types';

export function useAudioPlayer(track?: Track) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  // 현재 재생 위치 추적
  const currentTimeRef = useRef(0);
  const lastVelocityRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);

  // 초기화
  useEffect(() => {
    if (!track) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 1;
    gainRef.current = gain;

    // 트랙 로드
    fetch(track.previewUrl)
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => {
        bufferRef.current = buf;
      });

    return () => {
      ctx.close();
      audioCtxRef.current = null;
      sourceRef.current = null;
      bufferRef.current = null;
    };
  }, [track]);

  const stop = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  };

  const play = () => {
    if (!audioCtxRef.current || !bufferRef.current) return;

    stop();
    lastFrameTimeRef.current = audioCtxRef.current.currentTime;
    lastVelocityRef.current = 1; // 기본 정방향
    createSource(lastVelocityRef.current);
  };

  // velocity 기반으로 재생 (forward/backward)
  const setVelocity = (velocity: number, baseSpeed = 2.5) => {
    if (!audioCtxRef.current || !bufferRef.current) return;
    if (Math.abs(velocity) < 1e-3) {
      stop();
      lastVelocityRef.current = 0;
      return;
    }

    const now = audioCtxRef.current.currentTime;
    if (lastFrameTimeRef.current !== null) {
      // 지난 프레임부터 이동한 시간 계산
      const dt = now - lastFrameTimeRef.current;
      currentTimeRef.current += lastVelocityRef.current * dt;
      const dur = bufferRef.current.duration;
      currentTimeRef.current = ((currentTimeRef.current % dur) + dur) % dur; // wrap-around
    }
    lastFrameTimeRef.current = now;
    lastVelocityRef.current = velocity / baseSpeed;

    createSource(lastVelocityRef.current);
  };

  const createSource = (velocity: number) => {
    if (!audioCtxRef.current || !bufferRef.current) return;
    stop();

    const src = audioCtxRef.current.createBufferSource();
    src.buffer = bufferRef.current;
    src.connect(gainRef.current!);
    src.loop = true;

    if (velocity >= 0) {
      // 정방향
      src.playbackRate.value = velocity;
      src.start(0, currentTimeRef.current % bufferRef.current.duration);
    } else {
      // 역방향 → 버퍼를 재생 위치부터 뒤로 읽는 느낌
      // AudioBufferSourceNode 자체로는 역재생 불가 → playbackRate 음수는 허용 안됨
      // 따라서 1ms마다 stop/start로 직접 위치 이동 (간단 구현)
      src.playbackRate.value = Math.abs(velocity);
      src.start(0, currentTimeRef.current % bufferRef.current.duration);
      // 실제 역방향은 LPPlayer에서 offset을 반대로 이동시켜야 함
    }

    sourceRef.current = src;
  };

  const fade = (target: number, duration = 0.5) => {
    if (!gainRef.current || !audioCtxRef.current) return;
    const g = gainRef.current.gain;
    g.cancelScheduledValues(audioCtxRef.current.currentTime);
    g.linearRampToValueAtTime(target, audioCtxRef.current.currentTime + duration);
  };

  return {
    play,
    stop,
    setVelocity,
    fade,
    currentTimeRef, // LPPlayer에서 scratch 시 직접 업데이트 가능
  };
}
