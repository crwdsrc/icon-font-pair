<script>
  import { tick } from "svelte";
  import { app, filters, openPairing } from "../lib/store.svelte.js";
  import { suggestions } from "../lib/suggest.js";
  import { LESSONS } from "../lib/systems.js";
  import { loadFont, WEIGHT_NAMES } from "../lib/fonts.js";
  import { lockup, fitLockups, applyStroke, setMono } from "../lib/render.js";
  import { ui } from "../lib/ui-icons.js";

  // app.view changes after every word search and filter change, so the rows follow both
  const rows = $derived(app.view ? suggestions() : []);
  const shown = $derived(rows.filter((r) => r.ok));
  const hidden = $derived(rows.filter((r) => !r.ok));
  const text = $derived(app.text.trim() || "Aa");
  const dark = $derived(app.theme === "dark");
  let root = $state();

  // load each font at its weight, then size the icons and match strokes
  $effect(() => {
    void [rows, text, app.theme, app.dir, app.strokeMatch];
    if (!root) return;
    const draw = () => tick().then(() => {
      fitLockups(root);
      root.querySelectorAll("[data-sys]").forEach((el) => { const r = rows.find((x) => x.sys.id === el.dataset.sys); if (r?.p) applyStroke(el, r.p, app.strokeMatch); });
    });
    draw();
    Promise.all(rows.filter((r) => r.p).map((r) => loadFont(r.p.font, r.p.weight, false, text))).then(draw);
  });

  const weightsLine = (r) => r.sys.weights.map(([w, role]) => `${WEIGHT_NAMES[w]} ${w} for ${role}`).join(", ");
  function fix(x) { if (x.kind === "lib") filters.setLib(x.g, true); else filters.clear(x.kind, x.g); }
</script>

{#snippet card(r)}
  <article class="sg-card" class:off={!r.ok} data-sys={r.sys.id}>
    <div class="sg-prev" class:wa-dark={dark} data-theme={app.theme} dir={app.dir}>
      {#if r.p}{@html lockup(r.p, text)}{:else}<span class="sg-none">{@html setMono({ name: r.setName })}<span style="font-family:'{r.sys.font}',system-ui">{text}</span></span>{/if}
    </div>
    <div class="sg-body">
      <h3>{r.sys.name}<small>{r.sys.org}</small></h3>
      <p class="sg-pair">{r.setName} with {r.sys.font}{r.p ? ` ${WEIGHT_NAMES[r.p.weight]} ${r.p.weight}` : ""}</p>
      <p class="sg-note">{r.sys.note}</p>
      <p class="sg-meta">The system uses {weightsLine(r)}.</p>
      <p class="sg-meta">Sources: {#each r.sys.sources as [label, url], i}<a class="ext" href={url} target="_blank" rel="noopener">{label}{@html ui("external-link")}</a>{i < r.sys.sources.length - 1 ? ", " : ""}{/each}</p>
      {#if r.reasons.length}
        <div class="sg-why">
          {#each r.reasons as x (x.label)}
            {#if x.kind}
              <wa-button size="xs" appearance="outlined" onclick={() => fix(x)}>{x.g === "decor" ? "Show decorative" : `Remove ${x.label}`}</wa-button>
            {:else}
              <span class="help" class:bad={!x.pending}>{x.label}</span>
            {/if}
          {/each}
        </div>
      {/if}
      <wa-button size="s" appearance={r.ok ? "accent" : "outlined"} variant={r.ok ? "brand" : "neutral"} disabled={!r.p} onclick={() => openPairing(r.p)}>
        <span slot="start" class="ico">{@html ui("refresh-cw")}</span>Open in randomizer
      </wa-button>
    </div>
  </article>
{/snippet}

<section class="panel sg" aria-label="Suggestions" bind:this={root}>
  <div class="eyebrow-row"><p class="eyebrow">Suggestions</p><span class="count">{shown.length} of {rows.length} fit your filters</span></div>
  <h2 class="sg-title">Icon sets and fonts that ship together</h2>
  <p class="help">Each pair comes from a design system in production use, checked against its own docs. Your word, text, weight and filters apply.</p>
  <div class="sg-lessons">
    {#each LESSONS as [h, body] (h)}<div><b>{h}</b><p>{body}</p></div>{/each}
  </div>
  <wa-divider></wa-divider>
  {#if shown.length}
    <div class="sg-grid">{#each shown as r (r.sys.id)}{@render card(r)}{/each}</div>
  {:else}
    <p class="empty">No suggestion fits your word and filters. The pairings below say which filter or word to change.</p>
  {/if}
  {#if hidden.length}
    <wa-details class="sg-hidden" summary={`${hidden.length} hidden by your word or filters`} open={!shown.length}>
      <div class="sg-grid">{#each hidden as r (r.sys.id)}{@render card(r)}{/each}</div>
    </wa-details>
  {/if}
</section>
