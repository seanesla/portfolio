import { useCallback, useState } from 'react'
import { useIsTouchDevice } from '../../hooks/useIsMobile'

interface GalleryItem {
  src: string
  label: string
  sublabel: string
}

interface ThreeDHoverGalleryProps {
  items: GalleryItem[]
  className?: string
}

export default function ThreeDHoverGallery({ items, className = '' }: ThreeDHoverGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const isTouch = useIsTouchDevice()

  const count = items.length
  const mid = (count - 1) / 2

  // Use mousemove on the container so hover tracks reliably even when
  // flex items shift under the cursor during transitions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-gallery-index]')
    if (target) {
      const idx = Number(target.dataset.galleryIndex)
      if (idx !== hoveredIndex) setHoveredIndex(idx)
    }
  }, [hoveredIndex])

  const handleTouchClick = useCallback((i: number) => {
    setHoveredIndex((prev) => (prev === i ? null : i))
  }, [])

  return (
    <div
      className={`flex gap-2 h-[40vh] md:h-[55vh] ${className}`}
      style={{ perspective: '1200px' }}
      onMouseMove={isTouch ? undefined : handleMouseMove}
      onMouseLeave={isTouch ? undefined : () => setHoveredIndex(null)}
    >
      {items.map((item, i) => {
        const isHovered = hoveredIndex === i
        const anyHovered = hoveredIndex !== null

        // 3D rotation: edges rotate inward, center stays flat
        const baseRotateY = ((i - mid) / mid) * 8 // range ~ -8 to +8 degrees
        const rotateY = isTouch ? 0 : (isHovered ? 0 : baseRotateY)

        // Flex distribution
        const flex = anyHovered ? (isHovered ? 3 : 0.5) : 1

        // Brightness/grayscale
        const brightness = isHovered ? 1 : anyHovered ? 0.5 : 0.7
        const grayscale = isHovered ? 0 : anyHovered ? 40 : 20

        return (
          <div
            key={item.label}
            data-gallery-index={i}
            onClick={isTouch ? () => handleTouchClick(i) : undefined}
            className="relative overflow-hidden rounded-xl cursor-pointer min-w-0"
            style={{
              flex,
              transform: `rotateY(${rotateY}deg)`,
              filter: `brightness(${brightness}) grayscale(${grayscale}%)`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: i < mid ? 'left center' : i > mid ? 'right center' : 'center center',
            }}
          >
            <img
              src={item.src}
              alt={item.label}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Label */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              <h3 className="text-lg md:text-2xl lg:text-3xl font-extralight tracking-wide text-white/90 mb-1">
                {item.label}
              </h3>
              <span className="text-xs md:text-sm tracking-[0.15em] uppercase text-white/50 font-light">
                {item.sublabel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
