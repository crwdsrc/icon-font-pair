<script>
  import { app, openPair } from "../lib/store.svelte.js";
  import { SYSTEMS, LESSONS, VERIFIED } from "../lib/systems.js";
  import { loadIconItems, iconSVG, SETS } from "../lib/iconify.js";
  import { FONT_BY_NAME, loadFont, nearestWeight, WEIGHT_NAMES } from "../lib/fonts.js";
  import { fontCss } from "../lib/render.js";
  import { ui } from "../lib/ui-icons.js";

  // the same sample in every system: a headline with a download icon, then home, search and settings
  const SAMPLE = { headline: "Download report", rows: ["Home", "Search", "Settings"] };
  const TEXT = [SAMPLE.headline, ...SAMPLE.rows].join(" ");

  let ready = $state(0);
  const dark = $derived(app.theme === "dark");
  const font = (name) => FONT_BY_NAME.get(name);
  const css = (name, w) => { const f = font(name); return f ? fontCss(f, nearestWeight(f, w), false) : ""; };
  const svg = (prefix, name) => (ready, iconSVG(prefix, name) || "");
  const setName = (prefix) => (ready, SETS.get(prefix)?.name || prefix);
  const body = (s) => s.weights[0][0], head = (s) => s.weights.at(-1)[0];

  $effect(() => {
    loadIconItems(SYSTEMS.flatMap((s) => [...s.icons, s.hero].map((name) => ({ prefix: s.prefix, name })))).then(() => ready++);
    for (const s of SYSTEMS) {
      const f = font(s.font), hf = font(s.headFont || s.font);
      Promise.all([f && loadFont(f, nearestWeight(f, body(s)), false, TEXT), hf && loadFont(hf, nearestWeight(hf, head(s)), false, TEXT)]).then(() => ready++);
    }
  });

  const verifiedLabel = new Date(VERIFIED + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const weightsLine = (s) => s.weights.map(([w, role]) => `${WEIGHT_NAMES[w]} ${w} for ${role}`).join(", ");
  const open = (s) => openPair({ prefix: s.prefix, hero: s.hero, word: s.word, font: s.font, head: body(s) }, SAMPLE.headline);
</script>

<div class="scwrap">
  <section class="panel sc-intro" aria-labelledby="ds-title">
    <p class="eyebrow">Design systems</p>
    <h2 class="sg-title" id="ds-title">Icon sets and fonts that ship together</h2>
    <p class="help">Each pair comes from a design system in production use, checked against its own docs. Every card draws the same sample with the system's own icons, font and weights.</p>
    <p class="sg-meta">Last verified <time datetime={VERIFIED}>{verifiedLabel}</time></p>
    <div class="sg-lessons">
      {#each LESSONS as [h, text] (h)}<div><b>{h}</b><p>{text}</p></div>{/each}
    </div>
  </section>

  <section class="panel" aria-label="Design system pairings">
    <div class="sc-grid">
      {#each SYSTEMS as s (s.id)}
        <article class="sg-card sc-card">
          <div class="sc-prev" class:wa-dark={dark} data-theme={app.theme} dir={app.dir}>
            <div class="sc-demo" style={css(s.font, body(s))}>
              <div class="sc-head" style={css(s.headFont || s.font, head(s))}><span class="sc-ic">{@html svg(s.prefix, s.hero)}</span><span>{SAMPLE.headline}</span></div>
              <ul class="sc-rows">
                {#each SAMPLE.rows as label, i (label)}<li><span class="sc-ic">{@html svg(s.prefix, s.icons[i])}</span><span>{label}</span></li>{/each}
              </ul>
            </div>
          </div>
          <div class="sg-body">
            <h3>{s.name}<small>{s.org}</small></h3>
            <p class="sg-pair">{setName(s.prefix)} with {s.font}{s.headFont ? ` and ${s.headFont}` : ""}</p>
            <p class="sg-note">{s.note}</p>
            <p class="sg-meta">The system uses {weightsLine(s)}.</p>
            <p class="sg-meta">Sources: {#each s.sources as [label, url], i}<a class="ext" href={url} target="_blank" rel="noopener">{label}{@html ui("external-link")}</a>{i < s.sources.length - 1 ? ", " : ""}{/each}</p>
            <wa-button size="s" appearance="outlined" onclick={() => open(s)}>
              <span slot="start" class="ico">{@html ui("refresh-cw")}</span>Open in randomizer
            </wa-button>
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>
