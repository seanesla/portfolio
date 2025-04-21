import { useEffect, useRef, useState, useCallback } from 'react'

type LineType = 'user-prompt' | 'agent-response' | 'agent-response-continued' | 'loading' | 'blank'

interface TerminalLine {
  text: string
  type: LineType
}

const ABOUT_PARAGRAPHS = [
  "hi i'm sean, cs student, ai nerd, and chronic hackathon participant. i like building things that probably shouldn't work but somehow do. if there's a hackathon within driving distance i'm already packing my bag.",
  "",
  "when i'm not locked in on code i'm literally flying. private pilot based out of socal. nothing clears your head like being 5,000 feet up watching the coast disappear behind you.",
  "",
  "outside of that you'll probably catch me trying a new boba spot, building another keyboard i definitely don't need, or planning my next trip somewhere. always excited about something tbh.",
]

const SLASH_COMMANDS = ['/about', '/projects', '/contact', '/resume']

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

interface Props {
  startAnimation: boolean
}

// Module-level: survives unmount/remount
let finishedLines: TerminalLine[] | null = null
let animationComplete = false

export default function TerminalAbout({ startAnimation }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>(finishedLines ?? [])
  const [cursorVisible, setCursorVisible] = useState(true)
  const [cursorActive, setCursorActive] = useState(false)
  const [dropdown, setDropdown] = useState<{ filtered: string[]; typed: string } | null>(null)
  const [headerVisible, setHeaderVisible] = useState(animationComplete)
  const [inputBoxVisible, setInputBoxVisible] = useState(animationComplete)
  const [inputText, setInputText] = useState('')
  const [inputCursorActive, setInputCursorActive] = useState(false)
  const runIdRef = useRef(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  const addLine = useCallback((line: TerminalLine) => {
    setLines(prev => [...prev, line])
  }, [])

  const updateLastLine = useCallback((text: string) => {
    setLines(prev => {
      const next = [...prev]
      next[next.length - 1] = { ...next[next.length - 1], text }
      return next
    })
  }, [])

  // Auto-scroll output area
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  // Cursor blink
  useEffect(() => {
    if (!cursorActive && !inputCursorActive) return
    const id = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(id)
  }, [cursorActive, inputCursorActive])

  // Main animation sequence
  useEffect(() => {
    if (!startAnimation || animationComplete) return
    const myRunId = ++runIdRef.current

    const run = async () => {
      const c = () => runIdRef.current !== myRunId

      // 1. Header appears
      await wait(300)
      if (c()) return
      setHeaderVisible(true)

      // 2. Input box appears
      await wait(400)
      if (c()) return
      setInputBoxVisible(true)
      setInputCursorActive(true)

      // 3. Type "/about" in input box with dropdown
      await wait(500)
      if (c()) return
      const aboutCmd = '/about'
      for (let i = 0; i < aboutCmd.length; i++) {
        if (c()) return
        const typed = aboutCmd.slice(0, i + 1)
        setInputText(typed)
        const filtered = SLASH_COMMANDS.filter(cmd => cmd.startsWith(typed))
        setDropdown({ filtered, typed })
        await wait(100)
      }

      // 4. Submit — clear input, add user prompt bar to output
      await wait(400)
      if (c()) return
      setDropdown(null)
      setInputText('')
      setInputCursorActive(false)
      addLine({ text: '/about', type: 'user-prompt' })

      // 5. Loading spinner
      await wait(200)
      if (c()) return
      addLine({ text: '  cooking...', type: 'loading' })

      const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      const spinnerStart = Date.now()
      let frame = 0
      while (Date.now() - spinnerStart < 1200) {
        if (c()) return
        updateLastLine(`  ${spinnerFrames[frame % spinnerFrames.length]} cooking...`)
        frame++
        await wait(80)
      }

      // Remove spinner line
      setLines(prev => prev.slice(0, -1))
      await wait(100)
      if (c()) return

      // 6. Agent response — type out paragraphs
      for (let pIdx = 0; pIdx < ABOUT_PARAGRAPHS.length; pIdx++) {
        const para = ABOUT_PARAGRAPHS[pIdx]
        if (c()) return
        if (para === '') {
          addLine({ text: '', type: 'blank' })
          continue
        }
        // First paragraph gets the green bullet, rest are continuations
        addLine({ text: '', type: pIdx === 0 ? 'agent-response' : 'agent-response-continued' })
        setCursorActive(true)
        for (let i = 0; i < para.length; i++) {
          if (c()) return
          updateLastLine(para.slice(0, i + 1))
          await wait(15)
        }
        setCursorActive(false)
        await wait(100)
      }

      // 7. Done — cursor returns to input box
      setCursorActive(false)
      setInputCursorActive(true)

      // Save final state
      animationComplete = true
      setLines(prev => {
        finishedLines = prev
        return prev
      })
    }

    run()

    return () => {
      runIdRef.current++
      if (!animationComplete) {
        setLines([])
        setCursorActive(false)
        setDropdown(null)
        setHeaderVisible(false)
        setInputBoxVisible(false)
        setInputText('')
        setInputCursorActive(false)
      }
    }
  }, [startAnimation, addLine, updateLastLine])

  const renderLine = (line: TerminalLine, idx: number) => {
    switch (line.type) {
      case 'user-prompt':
        return (
          <div className="bg-indigo-500/15 border-l-2 border-indigo-400/60 px-3 py-1.5 rounded-r-md my-1">
            <span className="text-indigo-300/90 text-[0.8rem] font-medium">❯ </span>
            <span className="text-white/80 text-[0.8rem]">{line.text}</span>
          </div>
        )
      case 'agent-response':
        return (
          <div className="px-3 py-0.5" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            <span className="text-emerald-400/70 text-[0.8rem]">● </span>
            <span className="text-white/65 text-[0.85rem]">{line.text}</span>
            {cursorActive && idx === lines.length - 1 && (
              <span className={`inline-block w-[7px] h-[13px] bg-white/50 align-middle ml-[1px] translate-y-[1px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
            )}
          </div>
        )
      case 'agent-response-continued':
        return (
          <div className="px-3 py-0.5" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            <span className="text-white/65 text-[0.85rem]">{line.text}</span>
            {cursorActive && idx === lines.length - 1 && (
              <span className={`inline-block w-[7px] h-[13px] bg-white/50 align-middle ml-[1px] translate-y-[1px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
            )}
          </div>
        )
      case 'loading':
        return (
          <div className="px-3 py-0.5">
            <span className="text-amber-400/60 text-[0.8rem]">{line.text}</span>
          </div>
        )
      case 'blank':
        return <div className="h-3" />
      default:
        return <div className="px-3"><span className="text-white/60">{line.text}</span></div>
    }
  }

  const cursor = (
    <span className={`inline-block w-[8px] h-[15px] bg-white/70 align-middle ml-[1px] translate-y-[1px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
  )

  return (
    <div className="w-full h-full rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40 flex flex-col"
         style={{ fontFamily: "'IBM Plex Mono', monospace" }}>

      {/* Title bar */}
      <div className="flex items-center px-4 py-2.5 shrink-0" style={{ background: '#1a1a2e' }}>
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="text-[0.75rem] mx-auto pr-8">
          <span className="text-[#e8915a]">✻</span>
          <span className="text-white/60"> sean code</span>
        </span>
      </div>

      {/* Header block */}
      <div
        className={`shrink-0 px-4 py-3 border-b border-white/8 transition-all duration-300 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: '#0d0d1a' }}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <img src="/lobster.svg" alt="" className="h-7 w-7 object-contain opacity-80" />
          <span className="text-white/70 text-[0.8rem] font-semibold">sean code</span>
          <span className="text-white/30 text-[0.7rem]">v1.0.0</span>
        </div>
        <div className="text-white/35 text-[0.7rem] ml-[2.35rem] -mt-0.5">high effort · always cooking</div>
        <div className="text-white/25 text-[0.65rem] ml-[2.35rem] mt-1 font-mono">~/portfolio</div>
      </div>

      {/* Scrollable output area */}
      <div
        ref={bodyRef}
        className="flex-1 min-h-0 w-full py-3 overflow-y-auto overflow-x-hidden"
        style={{ background: '#0d0d1a' }}
      >
        {lines.map((line, idx) => (
          <div key={idx} className="leading-[1.6]">
            {renderLine(line, idx)}
          </div>
        ))}
      </div>

      {/* Input box */}
      <div
        className={`shrink-0 border-t border-white/8 transition-all duration-300 ${inputBoxVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: '#0f0f1f' }}
      >
        <div className="relative px-4 py-2.5">
          <span className="text-indigo-400/80 text-[0.85rem] font-semibold">❯ </span>
          <span className="text-white/80 text-[0.85rem]">{inputText}</span>
          {inputCursorActive && cursor}

          {/* Autocomplete dropdown — pops UP from input box */}
          {dropdown && (
            <div
              className="absolute left-4 bottom-full mb-1 rounded-md border border-white/10 overflow-hidden shadow-xl shadow-black/50"
              style={{ background: '#161628', boxShadow: '0 -4px 20px rgba(99, 102, 241, 0.08)' }}
            >
              {dropdown.filtered.map((cmd, i) => (
                <div
                  key={cmd}
                  className={`px-3 py-1 text-[0.8rem] ${
                    i === 0 ? 'bg-white/10 text-white/90' : 'text-white/50'
                  }`}
                >
                  {cmd}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div
        className={`shrink-0 px-4 py-1 flex items-center justify-between text-[0.7rem] text-white/30 transition-all duration-300 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: '#141425' }}
      >
        <span>seanesla.dev</span>
        <span>socal</span>
        <span>0% context</span>
      </div>
    </div>
  )
}
