# usage-limit-bar

A Claude Code mod that shows a live progress bar of your 5-hour usage limit in the prompt footer:

```
5h 27% ━━━━━━ ↻4:40PM
```

The used part is blue and the rest is gray. It updates whenever your usage moves by a point, and once a minute. The ↻ time is when the window resets.

The figure comes from the rate-limit info sent back with each Claude reply. A session that has not had a reply yet shows the last figure any session saw (0% once that window has reset), so the bar is there from the start. It needs a subscription plan (not an API key).

## Install

At the prompt of a terminal session:

```
/plugin install usage-limit-bar --marketplace midians/usage-limit-bar
```

Answer `y` to add the marketplace, then pick a scope (user scope is the first choice).

From a shell:

```
claude plugin install usage-limit-bar --marketplace midians/usage-limit-bar
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `midians/usage-limit-bar`, then Add plugin.
