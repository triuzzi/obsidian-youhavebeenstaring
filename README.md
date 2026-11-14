# YouHaveBeenStaring (continued)

Two status-bar counters: how long this session has been running, and how long you have stared at
this vault in total.

This is a maintained continuation of [`fxal/obsidian-youhavebeenstaring-plugin`](https://github.com/fxal/obsidian-youhavebeenstaring-plugin),
which stopped loading on current Obsidian.

## Install

**Community plugins** — search for "YouHaveBeenStaring (continued)" in **Settings → Community
plugins → Browse**.

**Before it is listed, or to track this branch:** use [BRAT](https://github.com/TfTHacker/obsidian42-brat)
with `triuzzi/obsidian-youhavebeenstaring`.

**Manually:** download `main.js` and `manifest.json` from the [latest release](https://github.com/triuzzi/obsidian-youhavebeenstaring/releases/latest)
into `<vault>/.obsidian/plugins/youhavebeenstaring-continued/`, then enable the plugin.

The plugin id is `youhavebeenstaring-continued`, so it installs alongside the original
`youhavebeenstaring-plugin` rather than overwriting it. Settings and recorded uptime live in
`data.json` and are compatible with the original: copy that file across to keep your total.

## Why this exists

The original plugin was last released as 1.2.2 in 2021 and no longer loads on current Obsidian.
Its TypeScript build targets ES5, so the emitted `__extends` helper instantiates the base class
with `_super.apply(this, arguments)`. `obsidian.Plugin` is a native ES class now, and calling a
native class without `new` throws:

```
Plugin failure: youhavebeenstaring-plugin
TypeError: Class constructor ... cannot be invoked without 'new'
```

`main.js` here is that plugin rewritten as native ES classes. Behaviour, settings keys,
status-bar texts and the `data.json` layout are unchanged. There is no build step — `main.js` is
the source.

The same root cause is fixed at the source upstream in
[`fxal/obsidian-youhavebeenstaring-plugin#13`](https://github.com/fxal/obsidian-youhavebeenstaring-plugin/pull/13)
(a one-line `tsconfig.json` target change), reported in
[#14](https://github.com/fxal/obsidian-youhavebeenstaring-plugin/issues/14).

Changes relative to 1.2.2:

- Native ES classes instead of the ES5 `__extends` output, so it loads again.
- `moment` comes from the `obsidian` module instead of `window.moment`.
- The ribbon button uses the `eye` icon; 1.2.2 passed `any-key`, which is not a valid Lucide id,
  so the button rendered empty.
- The 1-second tick no longer runs the accumulation through a comma expression.

## Behaviour

- Status bar, left item: session uptime, ticking every second. Pausing the counter replaces it
  with the paused text.
- Status bar, right item: total recorded uptime for this vault (opt-in, see settings).
- Ribbon button (eye): start/stop counting. Pausing stops accumulation but keeps the total.
- Settings are written to `data.json` on change, every 10 minutes, and on unload.

## Settings

| Setting | Default |
| --- | --- |
| Show total staring duration | off |
| Display total recorded staring time as human readable | on (`2 months` instead of `HH:mm`) |
| Status bar text of staring time | `You have been staring at your vault for ` |
| Status bar text of total staring time | `Your total staring time in this vault is ` |
| Status bar text when staring counter is paused | `Your staring counter is paused` |

## Attribution

Original plugin by [Felix Almer](https://almer.dev). This continuation keeps its id-independent
behaviour and manifest fields, and is offered under the MIT license (see [LICENSE](LICENSE)). The
upstream repository publishes no license file, although its `package.json` declares MIT; the
attribution above is a request to honour, and this repository will be taken down if the original
author objects.
