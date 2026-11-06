import { expect, test } from 'claude-code/testing'

const SLOT = { plugin: 'usage-limit-bar', component: 'SessionMode', props: { modes: [] } } as const

test('the footer draws the 5-hour figure', async ($, on) => {
  on('session.usage', () => ({
    value: { startedAt: 0, context: {} as never, rateLimits: [{ kind: 'five_hour', percentUsed: 22, resetsAt: '2026-11-06T21:40:00Z' }] },
  }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...SLOT, surface })
    expect((await ui.find({ type: 'Text', text: /22%/ }))?.text).toContain('22%')
    expect((await ui.find({ type: 'Text', text: /━/ }))?.text).toMatch(/━/)
    await ui.unmount()
  }
})
