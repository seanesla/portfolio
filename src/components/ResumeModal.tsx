import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'

const RESUME_PDF_URL = '/resumefeb172026.pdf'
const RESUME_DATE = 'Feb 17, 2026'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ResumeModal({ open, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pdfDocRef = useRef<any>(null)
  const renderingRef = useRef(false)

  const pendingPageRef = useRef<number | null>(null)

  const renderPage = useCallback(async (num: number) => {
    const pdfDoc = pdfDocRef.current
    if (!pdfDoc || !canvasRef.current) return
    if (renderingRef.current) {
      // Queue this page so it renders after the current one finishes
      pendingPageRef.current = num
      return
    }
    renderingRef.current = true

    try {
      const page = await pdfDoc.getPage(num)
      const canvas = canvasRef.current
      if (!canvas) { renderingRef.current = false; return }
      const ctx = canvas.getContext('2d')!
      const container = canvas.parentElement!
      const containerWidth = container.clientWidth - 48
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(containerWidth / viewport.width, 2)
      const scaledViewport = page.getViewport({ scale })

      const outputScale = window.devicePixelRatio || 1
      canvas.width = Math.floor(scaledViewport.width * outputScale)
      canvas.height = Math.floor(scaledViewport.height * outputScale)
      canvas.style.width = Math.floor(scaledViewport.width) + 'px'
      canvas.style.height = Math.floor(scaledViewport.height) + 'px'

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null

      await page.render({
        canvasContext: ctx,
        transform,
        viewport: scaledViewport,
      }).promise
    } catch {
      setError('Failed to render page.')
    } finally {
      renderingRef.current = false
      // If a page change was queued while we were rendering, render it now
      const pending = pendingPageRef.current
      if (pending !== null) {
        pendingPageRef.current = null
        renderPage(pending)
      }
    }
  }, [])

  // Load PDF when modal opens
  useEffect(() => {
    if (!open) return

    let cancelled = false
    ;(async () => {
      if (pdfDocRef.current) {
        renderPage(pageNum)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs' as any)
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'

        const loadingTask = pdfjsLib.getDocument(RESUME_PDF_URL)
        const doc = await loadingTask.promise
        if (cancelled) return
        pdfDocRef.current = doc
        setNumPages(doc.numPages)
        renderPage(1)
      } catch {
        if (!cancelled) setError('Unable to load resume. Please try the download link below.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [open, pageNum, renderPage])

  // Open/close animation
  useEffect(() => {
    if (open) {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleClose() {
    gsap.to(contentRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: onClose,
    })
  }

  if (!open) return null

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35"
      onClick={(e) => e.target === modalRef.current && handleClose()}
    >
      <div
        ref={contentRef}
        className="w-[90%] max-w-[900px] h-[85vh] bg-[rgba(10,10,10,0.95)] border border-white/15 rounded-lg flex flex-col backdrop-blur-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <span className="text-[0.9rem] font-light tracking-[0.1em] uppercase text-white/70">
            Resume &middot; Updated {RESUME_DATE}
          </span>
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 text-white/70 text-[0.85rem] tracking-[0.05em] cursor-pointer transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-[#080808]">
          {loading && (
            <span className="text-white/40 text-sm tracking-[0.1em]">Loading resume...</span>
          )}
          {error && (
            <span className="text-red-400/80 text-sm tracking-[0.05em]">{error}</span>
          )}
          <canvas ref={canvasRef} className={`max-w-full h-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${loading || error ? 'hidden' : ''}`} />
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 p-4 bg-black/50 border-t border-white/10">
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => p - 1)}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/80 text-[0.85rem] cursor-pointer transition-all duration-200 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-white/70 text-[0.85rem] min-w-[80px] text-center">
            {pageNum} / {numPages}
          </span>
          <button
            disabled={pageNum >= numPages}
            onClick={() => setPageNum((p) => p + 1)}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/80 text-[0.85rem] cursor-pointer transition-all duration-200 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <a
            href={RESUME_PDF_URL}
            download
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/80 text-[0.85rem] no-underline transition-all duration-200 hover:bg-white/20 hover:text-white ml-4"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  )
}
