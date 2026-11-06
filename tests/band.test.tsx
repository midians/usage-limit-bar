import { expect, mock, test } from 'claude-code/testing'

const SLOT = { plugin: 'usage-limit-bar', component: 'SessionMode', props: { modes: [] } } as const

function usage(rateLimits: { kind: string; percentUsed: number; resetsAt?: string }[]) {
  return () => ({ value: { startedAt: 0, context: {} as never, rateLimits } })
}

function engine(on: Parameters<Parameters<typeof test>[1]>[1]) {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
}

test('the footer draws the 5-hour figure', async ($, on) => {
  mock.store(on)
  on('session.usage', usage([{ kind: 'five_hour', percentUsed: 22, resetsAt: '2099-11-06T21:40:00Z' }]))
  engine(on)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...SLOT, surface })
    expect((await ui.find({ type: 'Text', text: /22%/ }))?.text).toContain('22%')
    expect((await ui.find({ type: 'Text', text: /━/ }))?.text).toMatch(/━/)
    await ui.unmount()
  }
})

test('a session with no reply yet shows the last remembered figure', async ($, on) => {
  mock.store(on, { lastFiveHour: { kind: 'five_hour', percentUsed: 53, resetsAt: '2099-11-06T21:40:00Z' } })
  on('session.usage', usage([]))
  engine(on)
  const ui = await $.ui.mount({ ...SLOT, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /53%/ }))?.text).toContain('53%')
  await ui.unmount()
})

test('a remembered window that has reset shows 0%', async ($, on) => {
  mock.store(on, { lastFiveHour: { kind: 'five_hour', percentUsed: 53, resetsAt: '2000-01-01T00:00:00Z' } })
  on('session.usage', usage([]))
  engine(on)
  const ui = await $.ui.mount({ ...SLOT, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /0%/ }))?.text).toContain('5h 0%')
  await ui.unmount()
})

test('with nothing remembered the bar still shows, empty', async ($, on) => {
  mock.store(on)
  on('session.usage', usage([]))
  engine(on)
  const ui = await $.ui.mount({ ...SLOT, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /5h –%/ }))?.text).toMatch(/━/)
  await ui.unmount()
})
