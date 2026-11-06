# usage-limit-bar

A Claude Code mod that shows a live progress bar of your 5-hour usage limit in the prompt footer:

```
5-hour 27% ━━━━━━━━━━ · resets 4:40 PM
```

The used part is blue and the rest is gray. It updates whenever your usage moves by a point, and once a minute. Hover the footer to see the reset time if it's cut off.

The figure comes from the rate-limit info sent back with each Claude reply, so it appears after the first reply in a session, and only on a subscription plan (not an API key).

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
