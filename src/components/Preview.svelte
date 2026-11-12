<script>
  import { tick } from "svelte";
  import { app, saves } from "../lib/store.svelte.js";
  import { iconSVG, licGroup } from "../lib/iconify.js";
  import { WEIGHT_NAMES, CAT_NAME, fontPage } from "../lib/fonts.js";
  import { lockup, iconFor, fontCss, subWeight, capWord, setMono, fitLockups, applyStroke, iconPage, snippet } from "../lib/render.js";
  import { ui } from "../lib/ui-icons.js";

  let root = $state();
  const p = $derived(app.frame || app.cur);
  const shuffle = $derived(!!app.frame);
  const text = $derived(app.text.trim() || " ");
  const dark = $derived(app.theme === "dark");
  const saved = $derived(saves.isSaved(app.cur, app.text));
  const cur = $derived(app.cur);
  let showCode = $state(false);

  const ic = $derived(p ? iconSVG(p.style.prefix, p.icon) || "" : "");
  const sw = $derived(p ? subWeight(p) : 400);
  const navs = $derived(p && !shuffle ? [[ic, capWord(app.q)], [iconFor(p, "home"), "Today"], [iconFor(p, "compass"), "Explore"], [iconFor(p, "user"), "Profile"]] : []);
  const code = $derived(cur ? snippet(cur, app.text, app.size) : "");
  const ip = $derived(cur ? iconPage(cur, app.q) : null);
  const fp = $derived(cur ? fontPage(cur.font) : null);

  // after each redraw, size the icons to the text and match stroke weight
  $effect(() => {
    void [p, text, app.size, app.theme, app.dir, app.strokeMatch];
    if (!p || !root) return;
    tick().then(() => { fitLockups(root); applyStroke(root, p, app.strokeMatch); });
  });
</script>

<section class="panel" aria-label="Live preview" bind:this={root}>
  <div class="prev-head">
    <p class="eyebrow">Live preview</p>
    <wa-button size="s" appearance={saved ? "accent" : "outlined"} variant={saved ? "brand" : "neutral"} aria-pressed={saved} disabled={!cur} onclick={() => saves.toggle()} id="save">
      <span slot="start" class="ico">{@html ui(saved ? "bookmark-check" : "bookmark")}</span>{saved ? "Saved" : "Save pairing"}
    </wa-button>
  </div>
  <div class="hero-prev" class:shuffle class:wa-dark={dark} data-theme={app.theme} dir={app.dir} id="heroPrev" style="--pv:{app.size}px">
    {#if p}{@html lockup(p, text)}{:else}<wa-spinner></wa-spinner>{/if}
  </div>
  <wa-divider></wa-divider>
  <p class="eyebrow">Preview in UI elements</p>
  <p class="help">See how your pairing works across common UI patterns.</p>
  {#if p && !shuffle}
    <div class="uipv" class:wa-dark={dark} data-theme={app.theme} dir={app.dir}>
      <div class="uic"><h3>1. Hero / Headline</h3><div class="ui-hero"><div class="wrap">{@html lockup(p, text)}<p class="sub" style={fontCss(p.font, sw, false)}>Progress compounds over time.</p></div></div></div>
      <div class="uic"><h3>2. Button</h3><div class="ui-btn" role="img" aria-label="Button preview">{@html lockup(p, text)}</div></div>
      <div class="uic"><h3>3. Feature list item</h3><div class="ui-feat"><span class="ficon">{@html ic}</span><div><b style={fontCss(p.font, p.weight, p.italic)}>{text}</b><span style={fontCss(p.font, sw, false)}>Turn intention into progress.</span></div></div></div>
      <div class="uic"><h3>4. Card</h3><div class="ui-card"><span class="cicon">{@html ic}</span><div><b style={fontCss(p.font, p.weight, p.italic)}>{text}</b><p style={fontCss(p.font, sw, false)}>A calmer, more focused you is just one step away.</p><span class="lm"><span class="lk" style={fontCss(p.font, sw, false)}><span class="tx">Learn more</span><span class="ic2">{@html ui("arrow-right")}</span></span></span></div></div></div>
      <div class="uic navc"><h3>5. Navigation item</h3><div class="ui-nav">
        {#each navs as [svg, label], i}<span class:on={i === 0} style="font-family:'{p.font.f}',system-ui">{@html svg || setMono(p.style.lib)}{label}</span>{/each}
      </div></div>
    </div>
  {/if}

  {#if cur}
    <div class="summary">
      <div><p class="eyebrow">Icon set</p><div class="val"><span class="sv">{@html iconSVG(cur.style.prefix, cur.icon) || ""}</span><a href={cur.style.lib.url} target="_blank" rel="noopener">{cur.style.lib.name}</a></div>
        <small><a class="ext" href={ip.url} target="_blank" rel="noopener" title={`Open ${cur.icon} on ${ip.site}`}>{cur.icon}{@html ui("external-link")}</a></small></div>
      <div><p class="eyebrow">Font source</p><div class="val">{@html ui(cur.font.src === "fs" ? "leaf" : "type")}{cur.font.src === "fs" ? "Fontsource" : "Google Fonts"}</div><small>{cur.font.src === "fs" ? "Self-hosted, open source" : "Open source"}</small></div>
      <div><p class="eyebrow">Typeface</p><div class="val"><a class="ext" href={fp.url} target="_blank" rel="noopener" title={`Open ${cur.font.f} on ${fp.site}`}>{cur.font.f}{@html ui("external-link")}</a></div><small>{CAT_NAME[cur.font.c] || cur.font.c}</small></div>
      <div><p class="eyebrow">Weight</p><div class="val">{WEIGHT_NAMES[cur.weight] || cur.weight}</div><small>{cur.weight}{cur.italic ? " italic" : ""}</small></div>
    </div>
    <div class="coderow">
      <div class="meta">{@html ui("code")}<span id="codeMeta">Icon: {cur.style.prefix}:{cur.icon} | Font: {cur.font.f} ({cur.weight})</span></div>
      <div class="acts">
        <wa-button size="s" appearance="plain" aria-expanded={showCode} onclick={() => (showCode = !showCode)}>{showCode ? "Hide code" : "Show code"}</wa-button>
        <wa-copy-button value={code} copy-label="Copy code" success-label="Code copied"></wa-copy-button>
      </div>
    </div>
    {#if showCode}<pre id="code">{code}</pre>{/if}
    {#if licGroup(cur.style.lib.license) !== "perm" && licGroup(cur.style.lib.license) !== "pd"}
      <wa-callout variant="warning" size="s" class="credit">This icon set uses {cur.style.lib.licTitle}. Credit {cur.style.lib.author || cur.style.lib.name} where you use it{licGroup(cur.style.lib.license) === "nc" ? ", and don't use it commercially" : ""}.</wa-callout>
    {/if}
  {/if}
</section>
