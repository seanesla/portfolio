import { forwardRef, useImperativeHandle, useRef } from 'react'
import CardSwap, { Card } from '../../ui/CardSwap'
import TerminalAbout from '../../ui/TerminalAbout'
import { useIsMobile } from '../../../hooks/useIsMobile'

export interface AboutChapterRefs {
  photo: HTMLDivElement | null
  card: HTMLDivElement | null
  video: HTMLVideoElement | null
}

interface Props {
  holdActive: boolean
}

const AboutChapter = forwardRef<AboutChapterRefs, Props>(({ holdActive }, ref) => {
  const photoRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile()

  useImperativeHandle(ref, () => ({
    get photo() { return photoRef.current },
    get card() { return cardRef.current },
    get video() { return videoRef.current },
  }))

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-start gap-[2vh] md:gap-0">
      {/* Video — bleeds left */}
      <div ref={photoRef} className="relative w-[85vw] h-[35vh] md:absolute md:left-[5vw] md:top-1/2 md:-translate-y-1/2 md:w-[42vw] md:h-[55vh] overflow-hidden rounded-2xl md:mt-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-2xl"
          loop
          muted
          playsInline
          preload="none"
        >
          <source src="/media/flying-montage.mp4" type="video/mp4" />
        </video>
        <CardSwap
          width={isMobile ? 120 : 180}
          height={isMobile ? 155 : 230}
          cardDistance={isMobile ? 15 : 30}
          verticalDistance={isMobile ? 10 : 20}
          delay={2000}
          pauseOnHover={true}
          easing="linear"
        >
          <Card>
            <img src="/media/photoofme.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme2.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme3.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/photoofme4.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
          <Card>
            <img src="/media/melockedinduringhackathon.jpeg" alt="" className="w-full h-full object-cover rounded-xl" />
          </Card>
        </CardSwap>
      </div>

      {/* Terminal card — offset right */}
      <div ref={cardRef} className="w-[90vw] h-[40vh] md:ml-auto md:mr-[5vw] lg:mr-[8vw] md:w-[45vw] lg:w-[40vw] md:h-[55vh] relative z-[3] overflow-hidden">
        <TerminalAbout startAnimation={holdActive} />
      </div>
    </div>
  )
})

AboutChapter.displayName = 'AboutChapter'
export default AboutChapter
