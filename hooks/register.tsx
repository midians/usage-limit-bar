import type { Register, SessionRateLimit, Timer } from 'claude-code'

// The first version opened a pane; close it if it is still up.
const OLD_PANE = 'usage-limit'

const FILL = '#3b82f6' // the Usage panel's blue
const TRACK_TEXT = '#71717a' // the Usage panel's gray track, bright enough to see on the dark footer

function resetLabel(resetsAt: string | undefined): string {
  if (!resetsAt) return ''
  const d = new Date(resetsAt)
  if (Number.isNaN(d.getTime())) return ''
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `↻${h}:${String(m).padStart(2, '0')}${ampm}`
}

// Where the last 5-hour figure is kept, shared by every session.
const STORE_KEY = 'lastFiveHour'

function asRateLimit(v: unknown): SessionRateLimit | undefined {
  if (!v || typeof v !== 'object') return undefined
  const r = v as Partial<SessionRateLimit>
  if (typeof r.percentUsed !== 'number') return undefined
  return { kind: 'five_hour', percentUsed: r.percentUsed, resetsAt: typeof r.resetsAt === 'string' ? r.resetsAt : undefined }
}

export const register: Register = on => {
  let tick: Timer | undefined
  let lastSaved = ''

  on('session.start', async ($, e, next) => {
    void $.ui.close({ id: OLD_PANE })
    // Re-read once a minute so a reset shows without waiting for a reply.
    tick?.cancel()
    tick = $.clock.every(60_000, () => $.ui.invalidate('ui.render'))
    return next(e)
  })

  // The engine pushes this when a rate-limit window moves a point.
  on('session.measure', ($, e, next) => {
    if (e.changed.includes('rateLimits')) $.ui.invalidate('ui.render')
    return next(e)
  })

  // The prompt footer's mode line: the one slot by the prompt the desktop draws.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const usage = await $.session.usage()
    const fresh: SessionRateLimit | undefined = usage.rateLimits.find(r => r.kind === 'five_hour')

    // A session only learns its usage from Claude's replies, so a session just
    // opened (or reopened after a restart) knows nothing yet. Remember the last
    // figure any session saw, and show that until this one hears its own.
    let win: SessionRateLimit | undefined = fresh
    if (fresh) {
      const key = `${fresh.percentUsed}|${fresh.resetsAt ?? ''}`
      if (key !== lastSaved) {
        lastSaved = key
        void $.store.set(STORE_KEY, fresh)
      }
    } else {
      win = asRateLimit(await $.store.get(STORE_KEY))
      // The remembered window has since reset: nothing used in the new one yet.
      if (win?.resetsAt && new Date(win.resetsAt).getTime() <= Date.now()) {
        win = { kind: 'five_hour', percentUsed: 0 }
      }
    }

    const { Box, Text } = $.ui.resolve(e)
    const pct = win ? Math.max(0, Math.min(100, win.percentUsed)) : 0
    const shown = win ? `${Math.round(win.percentUsed)}%` : '–%'
    const reset = resetLabel(win?.resetsAt)
    const modes = e.props.modes.join(' & ')
    // Short enough for the footer's room (about 22 characters before it cuts):
    // the bar and percent always show; the reset time rides at the end, where
    // the footer's hover tooltip shows it whole.
    // A solid line like the Usage panel's: blue fill on a gray track.
    // Kept short so the whole bar, gray end included, fits before the cut.
    const cells = 6
    const filled = pct > 0 ? Math.max(1, Math.round((pct / 100) * cells)) : 0

    // One Text with inline spans: separate Texts get spaces and wraps between them.
    return (
      <Box flexDirection="row">
        <Text>
          {modes ? <Text dimColor>{modes} · </Text> : null}
          {`5h ${shown} `}
          <Text color={FILL}>{'━'.repeat(filled)}</Text>
          <Text color={TRACK_TEXT}>{'━'.repeat(cells - filled)}</Text>
          <Text dimColor>{reset ? ` ${reset}` : ''}</Text>
        </Text>
      </Box>
    )
  })
}
