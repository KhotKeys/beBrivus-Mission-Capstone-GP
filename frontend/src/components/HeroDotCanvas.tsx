import { useEffect, useRef, useCallback } from 'react';

interface Dot {
  x:           number;
  y:           number;
  baseX:       number;
  baseY:       number;
  vx:          number;
  vy:          number;
  radius:      number;
  opacity:     number;
  driftPhase:  number;
  driftSpeed:  number;
  driftRadius: number;
}

interface Props {
  dotCount?:     number;
  waveRadius?:   number;
  waveStrength?: number;
  returnSpeed?:  number;
  idleShiftMs?:  number;
}

export default function HeroDotCanvas({
  dotCount     = 1800,
  waveRadius   = 120,
  waveStrength = 6,
  returnSpeed  = 0.04,
  idleShiftMs  = 5000,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef   = useRef<Dot[]>([]);
  const mouseRef  = useRef({ x: -9999, y: -9999, active: false });
  const rafRef    = useRef<number>(0);
  const lastShift = useRef<number>(0);

  const buildDots = useCallback((w: number, h: number) => {
    const dots: Dot[] = [];
    for (let i = 0; i < dotCount; i++) {
      const bx = Math.random() * w;
      const by = Math.random() * h;
      dots.push({
        x:           bx,
        y:           by,
        baseX:       bx,
        baseY:       by,
        vx:          0,
        vy:          0,
        radius:      Math.random() * 1.2 + 0.8,
        opacity:     Math.random() * 0.18 + 0.22,
        driftPhase:  Math.random() * Math.PI * 2,
        driftSpeed:  Math.random() * 0.0008 + 0.0004,
        driftRadius: Math.random() * 18 + 8,
      });
    }
    dotsRef.current = dots;
  }, [dotCount]);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Idle nudge every idleShiftMs — gently shift drift phases
    if (timestamp - lastShift.current > idleShiftMs) {
      dotsRef.current.forEach(dot => {
        dot.driftPhase += (Math.random() - 0.5) * 0.8;
      });
      lastShift.current = timestamp;
    }

    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    const { x: mx, y: my, active } = mouseRef.current;

    dotsRef.current.forEach(dot => {
      // Idle sine-wave drift around base position
      const t = timestamp * dot.driftSpeed + dot.driftPhase;
      const targetX = dot.baseX + Math.sin(t)           * dot.driftRadius * 0.3;
      const targetY = dot.baseY + Math.cos(t * 0.7 + 1) * dot.driftRadius * 0.3;

      // Mouse wave repulsion
      if (active) {
        const dx   = dot.x - mx;
        const dy   = dot.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < waveRadius && dist > 0) {
          const force = (1 - dist / waveRadius);
          const eased = force * force;
          dot.vx += (dx / dist) * eased * waveStrength;
          dot.vy += (dy / dist) * eased * waveStrength;
        }
      }

      // Spring return to target
      dot.vx += (targetX - dot.x) * returnSpeed;
      dot.vy += (targetY - dot.y) * returnSpeed;

      // Damping
      dot.vx *= 0.82;
      dot.vy *= 0.82;

      dot.x += dot.vx;
      dot.y += dot.vy;

      // Slight opacity boost when displaced by mouse
      const disp = Math.sqrt((dot.x - dot.baseX) ** 2 + (dot.y - dot.baseY) ** 2);
      const finalOpacity = Math.min(dot.opacity + disp * 0.008, 0.55);

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${finalOpacity})`;
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [waveRadius, waveStrength, returnSpeed, idleShiftMs]);

  // Canvas setup + resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width        = width  * dpr;
      canvas.height       = height * dpr;
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      buildDots(width, height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    lastShift.current = performance.now();
    rafRef.current    = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [animate, buildDots]);

  // Mouse / touch events on parent hero element
  useEffect(() => {
    const hero = canvasRef.current?.parentElement;
    if (!hero) return;

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };
    const onTouch = (e: TouchEvent) => {
      const rect  = hero.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top, active: true };
    };

    hero.addEventListener('mousemove',  onMove);
    hero.addEventListener('mouseleave', onLeave);
    hero.addEventListener('touchmove',  onTouch, { passive: true });
    hero.addEventListener('touchend',   onLeave);

    return () => {
      hero.removeEventListener('mousemove',  onMove);
      hero.removeEventListener('mouseleave', onLeave);
      hero.removeEventListener('touchmove',  onTouch);
      hero.removeEventListener('touchend',   onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        2,
        display:       'block',
      }}
      aria-hidden="true"
    />
  );
}
