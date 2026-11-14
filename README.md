# YouHaveBeenStaring — Obsidian 1.15+ rewrite

Two status-bar counters: how long this session has been running, and how long you have stared at this vault in total.

## Why this repository exists

The community plugin [`fxal/obsidian-youhavebeenstaring-plugin`](https://github.com/fxal/obsidian-youhavebeenstaring-plugin)
was last released as 1.2.2 in 2021 and no longer loads on current Obsidian (1.15.x). Its
TypeScript build targets ES5, so the emitted `__extends` helper instantiates the base class
with `_super.apply(this, arguments)`. `obsidian.Plugin` is a native ES class now, and calling
a native class without `new` throws:

```
Plugin failure: youhavebeenstaring-plugin
TypeError: Class constructor ... cannot be invoked without 'new'
```

`main.js` here is a rewrite of that plugin as native ES classes. Behaviour, settings keys,
status-bar texts and `data.json` layout are unchanged, so an existing vault keeps its
accumulated uptime. There is no build step — `main.js` is the source.

Changes relative to 1.2.2, beyond the class syntax:

- `moment` comes from the `obsidian` module instead of `window.moment`.
- The ribbon button uses the `eye` icon; 1.2.2 passed `any-key`, which is not a valid Lucide
  id, so the button rendered empty.
- The 1-second tick no longer runs the accumulation through a comma expression.

## Install

Copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/youhavebeenstaring-plugin/`,
reload Obsidian (or toggle the plugin off and on), then enable it in **Settings → Community
plugins**.

The plugin is not in the community plugin store, and it must not be replaced by the store
release: doing so reinstalls the broken 2021 bundle.

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

Original plugin by [Felix Almer](https://almer.dev), published as
[`fxal/obsidian-youhavebeenstaring-plugin`](https://github.com/fxal/obsidian-youhavebeenstaring-plugin).
This rewrite keeps that plugin's id, manifest metadata and behaviour so existing vaults load it
unchanged.

The root cause is also fixed at the source in a fork: the upstream build targets ES5, which
cannot subclass the native `obsidian.Plugin` class, so the fix is
[`fxal/obsidian-youhavebeenstaring-plugin#13`](https://github.com/fxal/obsidian-youhavebeenstaring-plugin/pull/13)
(one-line `tsconfig.json` change, reported in
[#14](https://github.com/fxal/obsidian-youhavebeenstaring-plugin/issues/14)). The upstream
repository publishes no license file, although its `package.json` declares MIT; the attribution
above is a request to honour, and the repository will be taken down if the original author
objects.
