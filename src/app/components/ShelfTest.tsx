import React, { useState, useRef, useEffect, useReducer } from 'react';
import { motion } from 'motion/react';
import { loadShadowOpacity, loadShelfImage, loadDefaultShelfImage, STORAGE_KEY_SETTINGS } from './bookData';
import { useBooksContext } from '../context/BooksContext';
import { buildSpineSVG, spineWidth, titleToRgb, applyColorSettings } from '../../lib/spineGenerator';
import { extractColor, applyNoise } from '../../lib/colorExtractor';

const SPINE_COLOR_CACHE_KEY = 'spine-color-cache';

// Thinnest allowed spine on the test shelf (px)
const TEST_MIN_SPINE_WIDTH = 16;

// Stored tilts are -4..4 degrees; scale them down so books lean less (max ≈ 2.6°)
const TEST_TILT_SCALE = 0.65;

// Tallest allowed spine on the test shelf (px); was 224
const TEST_MAX_SPINE_HEIGHT = 208;

// Room below the board, inside the scroll area, for the shelf's shadow (px)
const SHELF_SHADOW_ROOM = 40;


function loadColorCache(): Map<number, [number, number, number]> {
  try {
    const raw = localStorage.getItem(SPINE_COLOR_CACHE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, [number, number, number]>;
      return new Map(Object.entries(obj).map(([k, v]) => [Number(k), v]));
    }
  } catch { /* ignore */ }
  return new Map();
}

function persistColor(bookId: number, rgb: [number, number, number]) {
  try {
    const raw = localStorage.getItem(SPINE_COLOR_CACHE_KEY);
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj[bookId] = rgb;
    localStorage.setItem(SPINE_COLOR_CACHE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

export function ShelfTest() {
  const { books } = useBooksContext();

  const [shadowOpacity, setShadowOpacity] = useState<number>(() => loadShadowOpacity());
  const [customShelfImage, setCustomShelfImage] = useState<string | null>(() => loadShelfImage());
  const [defaultShelfImage, setDefaultShelfImage] = useState<string | null>(() => loadDefaultShelfImage());
  const [touchedBookId, setTouchedBookId] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const colorCacheRef = useRef<Map<number, [number, number, number]>>(loadColorCache());
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const isScrollingRef = useRef(false);
  const lastScrollLeftRef = useRef(0);
  const scrollCooldownRef = useRef(false);
  const isTouchDeviceRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  };

  const playClickSound = () => {
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    gainNode.gain.linearRampToValueAtTime(0.001, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  };

  const handleTouchStart = (bookId: number) => {
    isTouchDeviceRef.current = true;
    if (isScrollingRef.current || scrollCooldownRef.current) return;

    setTouchedBookId(bookId);
    playClickSound();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrollingRef.current || scrollCooldownRef.current) return;

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      const bookElement = element.closest('[data-book-id]') as HTMLElement;

      if (bookElement) {
        const bookIdStr = bookElement.getAttribute('data-book-id');
        if (bookIdStr) {
          const bookId = Number(bookIdStr);
          if (bookId !== touchedBookId) {
            setTouchedBookId(bookId);
            playClickSound();
          }
        }
      } else {
        if (touchedBookId !== null) {
          setTouchedBookId(null);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isScrollingRef.current && !scrollCooldownRef.current) {
      setTouchedBookId(null);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        scrollCooldownRef.current = true;
        setIsScrolling(true);
        setTouchedBookId(null);
      }

      lastScrollLeftRef.current = scrollContainer.scrollLeft;

      const pollScrollStop = () => {
        const prevPos = lastScrollLeftRef.current;

        scrollTimeoutRef.current = setTimeout(() => {
          const currentPos = scrollContainer.scrollLeft;
          if (currentPos === prevPos) {
            isScrollingRef.current = false;
            setIsScrolling(false);
            setTouchedBookId(null);
            setTimeout(() => {
              scrollCooldownRef.current = false;
            }, 150);
          } else {
            lastScrollLeftRef.current = currentPos;
            pollScrollStop();
          }
        }, 100);
      };

      pollScrollStop();
    };

    const handleContainerTouchStart = () => {
      if (isScrollingRef.current || scrollCooldownRef.current) {
        setTouchedBookId(null);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', handleContainerTouchStart, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('touchstart', handleContainerTouchStart);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [books.length]);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.shadowOpacity !== undefined) {
            setShadowOpacity(settings.shadowOpacity);
          }
          if (settings.customShelfImage !== undefined) {
            setCustomShelfImage(settings.customShelfImage);
          }
          if (settings.defaultShelfImage !== undefined) {
            setDefaultShelfImage(settings.defaultShelfImage);
          }
        }
      } catch (e) {
        console.error("Failed to reload settings", e);
      }
    };

    window.addEventListener('books-updated', handleSettingsUpdated);
    return () => window.removeEventListener('books-updated', handleSettingsUpdated);
  }, []);

  // Stored heights are h-48..h-56 (192..224px); squeeze everything above 192px
  // into 192..TEST_MAX_SPINE_HEIGHT so tall books stay different but lower
  const getBookHeightPixels = (heightClass: string) => {
    const numericPart = parseInt(heightClass.replace('h-', ''));
    const px = numericPart * 4;
    if (px <= 192) return px;
    return Math.round(192 + (Math.min(px, 224) - 192) * (TEST_MAX_SPINE_HEIGHT - 192) / (224 - 192));
  };

  const finishedBooks = books.filter((book) => book.status === 'Finished')
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  useEffect(() => {
    finishedBooks.forEach(book => {
      if (colorCacheRef.current.has(book.id)) return;
      colorCacheRef.current.set(book.id, titleToRgb(book.title));
      if (book.coverImage) {
        extractColor(book.coverImage).then(rgb => {
          if (rgb) { colorCacheRef.current.set(book.id, rgb); persistColor(book.id, rgb); forceUpdate(); }
        });
      }
    });
  }, [finishedBooks]);

  const totalBooksWidth = finishedBooks.reduce((acc, book) => {
    const widthPx = spineWidth(book.pages, TEST_MIN_SPINE_WIDTH);
    const heightPx = getBookHeightPixels(book.height);
    const tilt = (book.tilt || 0) * TEST_TILT_SCALE;
    const offset = Math.abs(Math.sin((tilt * Math.PI) / 180) * heightPx);
    return acc + widthPx + offset + 2;
  }, 0);

  const bufferSpace = 100;
  const shelfWidth = totalBooksWidth + bufferSpace;

  // Effective tilts: adjacent books must not lean the same way.
  // When conflict detected, choose between 0 and opposite direction deterministically by book.id.
  const effectiveTilts: number[] = [];
  for (let i = 0; i < finishedBooks.length; i++) {
    const raw = (finishedBooks[i].tilt || 0) * TEST_TILT_SCALE;
    let effective = raw;
    if (i > 0) {
      const prev = effectiveTilts[i - 1];
      if ((prev > 0 && raw > 0) || (prev < 0 && raw < 0)) {
        // Conflict: use book.id hash to pick between 0 (straight) or opposite
        const h = (finishedBooks[i].id * 1234567891) >>> 0;
        effective = (h & 1) === 0 ? 0 : -raw;
      }
    }
    effectiveTilts.push(effective);
  }

  return (
    <div className="relative w-full pt-12 shadow-sm bg-[#f8f8f8]">

      {/* Books Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden z-20 relative min-h-[285px]"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          // Scrollbar hidden; the shelf is scrolled by swiping
          scrollbarWidth: 'none',
          // Vertical swipes still scroll the page outside the books (board and shadow strip)
          touchAction: 'pan-x pan-y',
          overflowY: 'hidden',
          // The scroll area also holds the shadow below the board; pull following content back up
          marginBottom: -SHELF_SHADOW_ROOM,
        }}
      >
        {/* Books and board scroll together, so books don't slide over the shelf */}
        <div
          className="relative"
          style={{
            width: `${shelfWidth}px`,
            minWidth: '100%',
            paddingBottom: SHELF_SHADOW_ROOM,
            touchAction: 'pan-x pan-y',
          }}
        >
        <div
          className="flex items-end justify-start space-x-[2px] perspective-[1000px] min-h-[285px] pl-4"
          style={{ touchAction: 'pan-x' }}
        >
          {finishedBooks.map((book, index) => {
            const isFirstBook = index === 0;
            const isLastBook = index === finishedBooks.length - 1;
            const rawTilt = effectiveTilts[index];
            const tilt = isFirstBook ? 0 : isLastBook && rawTilt > 0 ? 0 : rawTilt;

            const heightPx = getBookHeightPixels(book.height);
            const widthPx  = spineWidth(book.pages, TEST_MIN_SPINE_WIDTH);
            const offset = Math.abs(Math.sin((tilt * Math.PI) / 180) * heightPx);
            const marginLeft = tilt < 0 ? offset : 0;
            const marginRight = tilt > 0 ? offset : 0;
            const absTilt = Math.abs(tilt);
            const baseShadowBlur = 6 + absTilt * 2;
            const baseShadowSpread = 1 + absTilt * 0.5;
            const baseShadowOpacity = Math.min(shadowOpacity * 0.6 + absTilt * 0.04, 0.7);
            const gapShadowBlur = absTilt > 0 ? 10 + absTilt * 3 : 0;
            const gapShadowOpacity = absTilt > 0 ? Math.min(shadowOpacity * 0.5 + absTilt * 0.05, 0.6) : 0;
            const gapOffsetX = tilt > 0 ? -absTilt * 0.8 : absTilt * 0.8;

            const isTouched = touchedBookId === book.id;
            const shouldAnimate = !isScrolling && isTouched;

            const rawRgb = colorCacheRef.current.get(book.id) ?? titleToRgb(book.title);
            const rgb    = applyColorSettings(...rawRgb);
            const svgStr = buildSpineSVG(book, rgb, heightPx, TEST_MIN_SPINE_WIDTH);

            return (
              <motion.div
                key={book.id}
                data-book-id={book.id}
                onMouseEnter={!isScrolling ? playClickSound : undefined}
                onTouchStart={() => handleTouchStart(book.id)}
                className="relative rounded-[2px] group cursor-pointer overflow-hidden"
                style={{
                  width: widthPx,
                  height: heightPx,
                  marginLeft: marginLeft,
                  marginRight: marginRight,
                  transformOrigin: tilt > 0 ? 'bottom left' : tilt < 0 ? 'bottom right' : 'bottom center',
                  pointerEvents: isScrolling ? 'none' : 'auto',
                  touchAction: 'pan-x',
                  flexShrink: 0,
                  backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
                }}
                initial={{ rotate: `${tilt}deg` }}
                whileHover={!isScrolling && !isTouchDeviceRef.current ? {
                  zIndex: 50,
                  y: -15,
                  rotate: "0deg",
                  boxShadow: `0px 20px 30px -5px rgba(0,0,0,${Math.min(shadowOpacity + 0.2, 0.8)})`,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                } : undefined}
                animate={shouldAnimate ? {
                  zIndex: 50,
                  y: -15,
                  rotate: "0deg",
                  boxShadow: `0px 20px 30px -5px rgba(0,0,0,${Math.min(shadowOpacity + 0.2, 0.8)})`,
                } : {
                  rotate: `${tilt}deg`,
                  scale: 1,
                  zIndex: 1,
                  y: 0,
                  boxShadow: [
                    `${tilt > 0 ? -5 : 5}px 0px 15px -3px rgba(0,0,0,${shadowOpacity})`,
                    `0px ${baseShadowBlur * 0.5}px ${baseShadowBlur}px -${baseShadowSpread}px rgba(0,0,0,${baseShadowOpacity})`,
                    absTilt > 0 ? `${gapOffsetX}px ${gapShadowBlur * 0.4}px ${gapShadowBlur}px -2px rgba(0,0,0,${gapShadowOpacity})` : '',
                  ].filter(Boolean).join(', ')
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Generated SVG spine */}
                <div
                  dangerouslySetInnerHTML={{ __html: svgStr }}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {/* Paper noise canvas overlay */}
                <canvas
                  ref={(canvas) => {
                    if (!canvas) return;
                    canvas.width  = widthPx;
                    canvas.height = heightPx;
                    const ctx = canvas.getContext('2d');
                    if (ctx) applyNoise(ctx, widthPx, heightPx);
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                />

                {/* Base contact shadow on the shelf */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-[-1]"
                  style={{
                    width: `${widthPx + 8 + absTilt * 2}px`,
                    height: `${4 + absTilt * 1.5}px`,
                    background: `radial-gradient(ellipse at center, rgba(0,0,0,${baseShadowOpacity * 0.8}) 0%, rgba(0,0,0,0) 70%)`,
                    transform: `translateY(${2 + absTilt * 0.5}px)`,
                    filter: `blur(${2 + absTilt}px)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Shelf Board */}
        <div className="relative h-6 w-full z-20">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${customShelfImage ?? defaultShelfImage ?? '/shelf-wood-seamless.jpg'})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left center',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
          <div
            className="absolute inset-0 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.08))',
            }}
          ></div>
        </div>
        </div>

        {/* Shadow under the shelf: inside the scroll area, so it moves with the board, edge bounce included */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: SHELF_SHADOW_ROOM + 4,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0))',
            filter: 'blur(6px)',
          }}
        ></div>
        </div>
      </div>

    </div>
  );
}
