<script>
  import { app, openPair } from "../lib/store.svelte.js";
  import { SCENARIOS } from "../lib/scenarios.js";
  import { loadIconItems, iconSVG, SETS } from "../lib/iconify.js";
  import { FONT_BY_NAME, loadFont, nearestWeight, WEIGHT_NAMES, fontPage } from "../lib/fonts.js";
  import { fontCss } from "../lib/render.js";
  import { ui } from "../lib/ui-icons.js";

  // icons and fonts load once; `ready` redraws the previews as they arrive
  let ready = $state(0);
  const dark = $derived(app.theme === "dark");
  const font = (name) => FONT_BY_NAME.get(name);
  const css = (name, w) => { const f = font(name); return f ? fontCss(f, nearestWeight(f, w), false) : ""; };
  const svg = (prefix, name) => (ready, iconSVG(prefix, name) || "");
  const setName = (prefix) => (ready, SETS.get(prefix)?.name || prefix);
  const sampleOf = (s) => [s.sample.headline, ...s.sample.rows, ...(s.sample.values || [])].join(" ");

  $effect(() => {
    const items = SCENARIOS.flatMap((s) => s.pairs.flatMap((x) => [...x.icons, x.hero].map((name) => ({ prefix: x.prefix, name }))));
    loadIconItems(items).then(() => ready++);
    for (const s of SCENARIOS) for (const x of s.pairs) {
      const f = font(x.font), m = x.mono && font(x.mono), text = sampleOf(s);
      if (f) Promise.all([loadFont(f, nearestWeight(f, x.weight), false, text), loadFont(f, nearestWeight(f, x.head), false, text)]).then(() => ready++);
      if (m) loadFont(m, 400, false, s.sample.code || "").then(() => ready++);
    }
  });

  const weightsLine = (x) => {
    const parts = [`${WEIGHT_NAMES[x.weight]} ${x.weight} for text`];
    if (x.head !== x.weight) parts.push(`${WEIGHT_NAMES[x.head]} ${x.head} for headings`);
    if (x.mono) parts.push(`${x.mono} for code`);
    return parts.join(", ");
  };
  const jump = (id) => document.getElementById(`sc-${id}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
</script>

<div class="scwrap">
  <section class="panel sc-intro" aria-labelledby="sc-title">
    <p class="eyebrow">Scenarios</p>
    <h2 class="sg-title" id="sc-title">Pairings for the job in front of you</h2>
    <p class="help">Each scenario says what matters there, then shows two or three strong icon and font pairings in that kind of interface, with the reasons they work. Open any of them in the randomizer to get the code.</p>
    <nav class="sc-jump" aria-label="Scenarios">
      {#each SCENARIOS as s (s.id)}<wa-button size="s" appearance="outlined" pill onclick={() => jump(s.id)}>{s.title}</wa-button>{/each}
    </nav>
  </section>

  {#each SCENARIOS as s (s.id)}
    <section class="panel sc" id={`sc-${s.id}`} aria-labelledby={`sc-h-${s.id}`}>
      <h2 class="sc-title" id={`sc-h-${s.id}`}>{s.title}</h2>
      <p class="sc-needs">{s.needs}</p>
      <div class="sc-grid">
        {#each s.pairs as x (x.prefix + x.font)}
          {@const f = font(x.font)}
          <article class="sg-card sc-card">
            <div class="sc-prev" class:wa-dark={dark} data-theme={app.theme} dir={app.dir}>
              <div class="sc-demo" style={css(x.font, x.weight)}>
                <div class="sc-head" style={css(x.font, x.head)}>
                  {#if s.demo !== "tabs"}<span class="sc-ic">{@html svg(x.prefix, x.hero)}</span>{/if}<span>{s.sample.headline}</span>
                </div>
                {#if s.demo === "tabs"}
                  <div class="sc-tabs">
                    {#each s.sample.rows as label, i (label)}
                      <span class:on={i === 0}><span class="sc-ic">{@html svg(x.prefix, i === 0 ? x.hero : x.icons[i])}</span>{label}</span>
                    {/each}
                  </div>
                {:else if s.demo === "chips"}
                  <div class="sc-chips">
                    {#each s.sample.rows as label, i (label)}<span><span class="sc-ic">{@html svg(x.prefix, x.icons[i])}</span>{label}</span>{/each}
                  </div>
                {:else}
                  <ul class="sc-rows">
                    {#each s.sample.rows as label, i (label)}
                      <li><span class="sc-ic">{@html svg(x.prefix, x.icons[i])}</span><span>{label}</span>{#if s.sample.values?.[i]}<span class="sc-v">{s.sample.values[i]}</span>{/if}</li>
                    {/each}
                  </ul>
                {/if}
                {#if s.sample.code && x.mono}<code class="sc-code" style={css(x.mono, 400)}>$ {s.sample.code}</code>{/if}
              </div>
            </div>
            <div class="sg-body">
              <h3>{x.font}<small>with {setName(x.prefix)}</small></h3>
              <p class="sg-meta">{weightsLine(x)}</p>
              <ul class="sc-why">{#each x.why as w (w)}<li>{w}</li>{/each}</ul>
              <p class="sg-meta">
                {#if f}<a class="ext" href={fontPage(f).url} target="_blank" rel="noopener">{x.font} on {fontPage(f).site}{@html ui("external-link")}</a>, {/if}<a class="ext" href={`https://icon-sets.iconify.design/${x.prefix}/`} target="_blank" rel="noopener">{setName(x.prefix)} on Iconify{@html ui("external-link")}</a>
              </p>
              <wa-button size="s" appearance="outlined" onclick={() => openPair(x, s.sample.headline)}>
                <span slot="start" class="ico">{@html ui("refresh-cw")}</span>Open in randomizer
              </wa-button>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>
