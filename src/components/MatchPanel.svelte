<script>
  import { app, spin, setLock, canSpin, filters, excluded, saves, restore, fromRecord, toast } from "../lib/store.svelte.js";
  import { licGroup } from "../lib/iconify.js";
  import { WEIGHT_NAMES, fontPage } from "../lib/fonts.js";
  import { iconPage } from "../lib/render.js";
  import { FILL_NAME, WEIGHT_WORD } from "../lib/util.js";
  import { ui } from "../lib/ui-icons.js";
  import PairList from "./PairList.svelte";

  const v = $derived(app.view);
  const cur = $derived(app.cur);
  const ok = $derived(canSpin(v));
  const ip = $derived(cur ? iconPage(cur, app.q) : null);
  const fp = $derived(cur ? fontPage(cur.font) : null);
  const credit = $derived(cur && ["by", "sa", "nc"].includes(licGroup(cur.style.lib.license)));
  const LOCKS = ["Icon set", "Typeface", "Weight"];
  let tab = $state("recent");
  let clearArm = $state(false), clearT;
  const savedItems = $derived(app.saved.map(fromRecord));

  $effect(() => {
    if (cur) app.status = `${cur.style.lib.name} ${cur.style.label} with ${cur.font.f} ${cur.weight}.`;
  });
  // fetch the shapes and fonts of saved pairings the first time the tab opens
  let warmed = false;
  $effect(() => { if (tab === "saved" && !warmed && app.saved.length) { warmed = true; saves.warm().then(() => (app.saved = [...app.saved])); } });

  function clearAll() {
    if (!clearArm) { clearArm = true; clearT = setTimeout(() => (clearArm = false), 3000); return; }
    clearTimeout(clearT); clearArm = false; saves.clear();
  }
</script>

<section class="panel rightcol" aria-label="Pairing details">
  <p class="eyebrow">Spin</p>
  <wa-button class="spin" variant="danger" size="l" id="spin" disabled={!ok} loading={app.spinning} onclick={spin}>
    <span slot="start" class="ico">{@html ui("refresh-cw")}</span>Spin
  </wa-button>
  <div class="keep" role="group" aria-label="Keep when spinning">
    <span>Keep</span>
    {#each LOCKS as l, i}
      <wa-button size="s" pill data-lock={i} variant={app.locks[i] ? "brand" : "neutral"} appearance={app.locks[i] ? "accent" : "outlined"} aria-pressed={app.locks[i]} onclick={() => setLock(i, !app.locks[i])}>
        <span slot="start" class="ico">{@html ui(app.locks[i] ? "lock" : "lock-open")}</span>{l}
      </wa-button>
    {/each}
  </div>
  <div class="modehelp" class:bad={!ok && v && !(v.block.waiting && v.poolFonts.length)} id="modehelp">
    {#if ok}
      Spin draws an icon, a typeface and a weight at random from your filters. Press Space to spin.
    {:else if v}
      {#each v.block.lines as line}<span>{line}</span>{/each}
      {#each v.block.fixes as x (x.kind + x.g)}
        <wa-button size="s" variant="danger" appearance="outlined" class="fix" data-fix={`${x.kind}:${x.g}`} onclick={() => filters.clear(x.kind, x.g)}>
          Remove {x.label}<b slot="end">{x.n.toLocaleString()} {x.unit}{x.n === 1 ? "" : "s"}</b>
        </wa-button>
      {/each}
    {/if}
  </div>
  <wa-divider></wa-divider>
  {#if cur}
    {@const L = cur.style.lib}
    <dl class="kv" id="kv">
      <dt>Icon set</dt><dd><a class="ext" href={L.url} target="_blank" rel="noopener" title={`See all ${L.name} icons on Iconify`}>{L.name}{@html ui("external-link")}</a></dd>
      <dt>Icon</dt><dd><a class="ext" href={ip.url} target="_blank" rel="noopener" title={`Open ${cur.icon} on ${ip.site}`}>{cur.icon}{@html ui("external-link")}</a></dd>
      <dt>Icon license</dt><dd>{#if L.licUrl}<a class="ext" href={L.licUrl} target="_blank" rel="noopener">{L.licTitle}{@html ui("external-link")}</a>{:else}{L.licTitle}{/if}
        {#if credit}<small class="lic">Credit {L.author || L.name}{licGroup(L.license) === "nc" ? ", non-commercial use only" : ""}</small>{/if}</dd>
      <dt>Font source</dt><dd>{cur.font.src === "fs" ? "Fontsource" : "Google Fonts"}</dd>
      <dt>Typeface</dt><dd><a class="ext" href={fp.url} target="_blank" rel="noopener" title={`Open ${cur.font.f} on ${fp.site}`}>{cur.font.f}{@html ui("external-link")}</a>{#if cur.font.attr}<small class="lic">{cur.font.attr}</small>{/if}</dd>
      <dt>Weight</dt><dd>{WEIGHT_NAMES[cur.weight] || cur.weight} ({cur.weight}){cur.italic ? " Italic" : ""}</dd>
      <dt>Icon style</dt><dd>{cur.style.label || FILL_NAME[cur.style.fill]}</dd>
      <dt>Icon weight</dt><dd>{WEIGHT_WORD[cur.style.weight] || "Medium"}</dd>
    </dl>
    {#if !app.excluded.includes(cur.font.f)}
      <wa-button size="s" appearance="plain" class="kvfoot" onclick={() => { const n = cur.font.f; excluded.exclude(n); toast(`Excluded ${n}. It won't come up again.`); }}>Exclude this typeface</wa-button>
    {/if}
  {/if}
  <wa-divider></wa-divider>
  <wa-callout variant="neutral" size="s"><span slot="icon" class="ico">{@html ui("lightbulb")}</span>Refine the filters on the left to explore a different look, or try a new word to discover more matches.</wa-callout>
  <wa-divider></wa-divider>
  <wa-tab-group active={tab} onwa-tab-show={(e) => (tab = e.detail.name)}>
    <wa-tab panel="recent">Recent</wa-tab>
    <wa-tab panel="saved">Saved{app.saved.length ? ` (${app.saved.length})` : ""}</wa-tab>
    <wa-tab-panel name="recent">
      <PairList items={app.history} empty="Your last ten spins appear here." onOpen={(i) => restore(app.history[i])} />
    </wa-tab-panel>
    <wa-tab-panel name="saved">
      <PairList items={savedItems} saved empty="Nothing saved yet. Use Save pairing above the preview to keep a spin." onOpen={(i) => restore(savedItems[i])} onRemove={(i) => saves.remove(i)} />
      {#if app.saved.length}<wa-button size="s" appearance="plain" variant={clearArm ? "danger" : "neutral"} onclick={clearAll}>{clearArm ? "Click again to remove all" : "Remove all saved"}</wa-button>{/if}
    </wa-tab-panel>
  </wa-tab-group>
</section>
