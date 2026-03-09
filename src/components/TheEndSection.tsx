import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import ASCIIText from "./ui/ASCIIText";
import BlurText from "./ui/BlurText";
import CityOverlays from "./ui/CityOverlays";

export default function TheEndSection() {
  const isMobile = useIsMobile();
  const blurRef = useRef<HTMLDivElement>(null);
  const [blurVisible, setBlurVisible] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const [cityVisible, setCityVisible] = useState(false);

  // Trigger BlurText animation only when it scrolls into view
  useEffect(() => {
    if (!blurRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBlurVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(blurRef.current);
    return () => observer.disconnect();
  }, []);

  // Trigger city overlays when skyline scrolls into view
  useEffect(() => {
    if (!cityRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCityVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(cityRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section data-end-section>
      {/* Dark void gradient spacer */}
      <div
        className="h-[200vh]"
        style={{
          background: `linear-gradient(to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.3) 15%,
            rgba(0, 0, 0, 0.7) 35%,
            rgba(0, 0, 0, 0.9) 65%,
            #000000 100%
          )`,
        }}
      />

      {/* "you've reached" + ASCII "the end" */}
      <div className="relative z-10 h-[15vh] bg-black">
        {/* Inner wrapper is taller so ASCII text renders large, but parent clips layout height */}
        <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-auto">
          <ASCIIText
            text="the end"
            planeBaseHeight={isMobile ? 5 : 8}
            asciiFontSize={isMobile ? 6 : 8}
          />
        </div>
        <div
          ref={blurRef}
          className="absolute inset-x-0 top-[-2rem] z-10 flex justify-center pointer-events-none"
        >
          <BlurText
            text="you've reached"
            animate={blurVisible}
            className="text-3xl md:text-5xl text-white/60 tracking-[0.25em] uppercase"
            style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 200 }}
          />
        </div>
      </div>

      {/* City skyline */}
      <div ref={cityRef} className="relative bg-black">
        {/* Light pollution glow — sits above the clipped image so it can extend upward */}
        {cityVisible && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: "-20%",
              right: "-20%",
              top: "-80%",
              bottom: 0,
              background: `
                radial-gradient(ellipse 100% 65% at 50% 75%, rgba(0, 200, 255, 0.35) 0%, transparent 55%),
                radial-gradient(ellipse 70% 55% at 35% 80%, rgba(255, 180, 80, 0.22) 0%, transparent 45%),
                radial-gradient(ellipse 70% 55% at 65% 80%, rgba(140, 100, 255, 0.18) 0%, transparent 45%),
                radial-gradient(ellipse 50% 30% at 50% 90%, rgba(255, 50, 100, 0.12) 0%, transparent 40%)
              `,
            }}
          />
        )}
        <div className="relative overflow-hidden h-[50vh] md:h-auto md:max-h-[70vh]">
          <img
            src="/media/cityatbottomofwebsitepage.png"
            alt=""
            className="w-full block h-full object-cover object-top md:h-auto md:object-[unset]"
          />
          <CityOverlays visible={cityVisible} />
        </div>
      </div>
    </section>
  );
}
