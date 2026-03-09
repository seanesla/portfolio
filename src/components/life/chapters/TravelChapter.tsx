import { forwardRef, useImperativeHandle, useRef } from 'react'
import ThreeDHoverGallery from '../../ui/ThreeDHoverGallery'

const ALL_PLACES = [
  { src: '/media/travelstuffs/russiaworldcup2018iranvsportugal.jpeg', label: 'Russia World Cup 2018', sublabel: 'Saransk, Russia' },
  { src: '/media/travelstuffs/dubai.jpeg', label: 'Dubai', sublabel: 'United Arab Emirates' },
  { src: '/media/travelstuffs/nyc.jpeg', label: 'New York City', sublabel: 'United States' },
  { src: '/media/travelstuffs/cozumel.jpeg', label: 'Cozumel', sublabel: 'Mexico' },
  { src: '/media/travelstuffs/bahiadebanderas.jpeg', label: 'Bahia de Banderas', sublabel: 'Mexico' },
  { src: '/media/travelstuffs/pebblebeach.jpeg', label: 'Pebble Beach', sublabel: 'California' },
  { src: '/media/travelstuffs/washingtondc.jpeg', label: 'Washington, D.C.', sublabel: 'United States' },
  { src: '/media/travelstuffs/chelseastadium.jpeg', label: 'Chelsea Stadium', sublabel: 'London, England' },
]

export interface TravelChapterRefs {
  heading: HTMLHeadingElement | null
  galleryWrap: HTMLDivElement | null
}

interface Props {
  active: boolean
}

const TravelChapter = forwardRef<TravelChapterRefs, Props>(({ active }, ref) => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const galleryWrapRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    get heading() { return headingRef.current },
    get galleryWrap() { return galleryWrapRef.current },
  }))

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <div className="w-[90vw]">
        <h2
          ref={headingRef}
          className="text-[clamp(2rem,4vw,3rem)] font-extralight tracking-wide text-white/80 mb-8 ml-[2vw]"
        >
          Places I've Been
        </h2>
        <div ref={galleryWrapRef}>
          <ThreeDHoverGallery items={ALL_PLACES} />
        </div>
      </div>
    </div>
  )
})

TravelChapter.displayName = 'TravelChapter'
export default TravelChapter
