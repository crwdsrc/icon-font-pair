<script>
  import { app, filters, excluded, setWord } from "../lib/store.svelte.js";
  import { iconSVG } from "../lib/iconify.js";
  import { FONTS } from "../lib/fonts.js";
  import { setMono } from "../lib/render.js";
  import { ui } from "../lib/ui-icons.js";
  import Toggles from "./Toggles.svelte";
  import Checks from "./Checks.svelte";
  import Picker from "./Picker.svelte";

  const v = $derived(app.view);
  const f = $derived(v?.facets);
  const TILE_SVG = {
    outline: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 25C7 14 14 7 25 7c0 11-7 18-18 18Z"/><path d="M7 25 18 14"/></svg>`,
    filled: `<svg viewBox="0 0 32 32"><path fill="currentColor" d="M6 26C6 13.8 13.8 6 26 6c0 12.2-7.8 20-20 20Z"/></svg>`,
    duotone: `<svg viewBox="0 0 32 32"><path fill="currentColor" opacity=".3" d="M6 26C6 13.8 13.8 6 26 6c0 12.2-7.8 20-20 20Z"/><path d="M7 25C7 14 14 7 25 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M7 25 18 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    multicolor: `<svg viewBox="0 0 32 32"><path fill="#2E9E5B" d="M6 26C6 13.8 13.8 6 26 6c0 12.2-7.8 20-20 20Z"/><path d="M7 25 18 14" stroke="#B8E6C9" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  };

  let wordT;
  const onWord = (e) => { const val = e.target.value; clearTimeout(wordT); wordT = setTimeout(() => setWord(val), 300); };
  let searchT;
  const onSearch = (e) => { const val = e.target.value; clearTimeout(searchT); searchT = setTimeout(() => filters.setFont("search", val.trim().toLowerCase()), 150); };

  // excluded families: type a name, pick from the matches
  let fx = $state(""), fxHint = $state(null);
  const fxMatches = $derived(fx.trim().length >= 2 ? FONTS.filter((x) => x.f.toLowerCase().includes(fx.trim().toLowerCase()) && !app.excluded.includes(x.f)).slice(0, 6) : []);
  function addExcluded(name) { fxHint = excluded.add(name ?? fx); if (!fxHint?.bad) fx = ""; }

  let libq = $state("");
  const sets = $derived(!v ? [] : libq ? v.sets.filter((x) => x.name.toLowerCase().includes(libq) || x.set.id.includes(libq)) : v.sets);
</script>

<section class="panel" aria-label="Create a pairing">
  <p class="eyebrow">Create a pairing</p>
  <div class="field">
    <wa-input id="q" label="Icon name or meaning" value={app.q} autocomplete="off" spellcheck="false" oninput={onWord}
      hint="Try a concept, object, action or feeling, such as growth, shield, coffee or explore."></wa-input>
    {#if v}<p class="help" class:bad={v.hint[1]} id="qhint" aria-live="polite">{v.hint[0]}</p>{/if}
  </div>
  <div class="field">
    <wa-textarea id="t" label="Text to pair" rows="2" value={app.text} oninput={(e) => (app.text = e.target.value)}
      hint="A short phrase, headline or sentence, such as Build what matters."></wa-textarea>
  </div>

  {#if v}
    <wa-divider></wa-divider>
    <wa-radio-group label="Font source" value={v.ff.src} onchange={(e) => filters.setFont("src", e.target.value)}>
      {#each f.fsrc as o (o.v)}
        <wa-radio value={o.v} disabled={o.zero}><span class="radio-l"><b>{o.label}{#if !o.sel}<span class="n">{o.n.toLocaleString()}</span>{/if}</b><small>{o.desc}</small></span></wa-radio>
      {/each}
    </wa-radio-group>

    <wa-divider></wa-divider>
    <div class="eyebrow-row"><p class="eyebrow">Font filters</p><span class="count" id="fcount">{v.fcount}</span></div>
    <div class="field">
      <wa-select id="fcat" label="Font category" placeholder="Any category" multiple with-clear value={v.ff.cat} onchange={(e) => filters.setFontCats(e.target.value || [])}>
        {#each f.fcat as o (o.v)}<wa-option value={o.v} disabled={o.zero}>{o.label}{#if !o.sel} ({o.n.toLocaleString()}){/if}</wa-option>{/each}
      </wa-select>
    </div>
    <div class="field">
      <span class="flabel">Font properties</span>
      <div class="grid2">
        <Picker label="Weights" options={f.fweight} value={v.ff.weight} onPick={(x) => filters.setFont("weight", x)} />
        <Picker label="Widths" options={f.fwidth} value={v.ff.width} onPick={(x) => filters.setFont("width", x)} />
        <Picker label="Styles" options={f.fstyle} value={v.ff.style} onPick={(x) => filters.setFont("style", x)} />
        <Picker label="Moods" options={f.fmood} value={v.ff.mood} onPick={(x) => filters.setFont("mood", x)} />
      </div>
    </div>
    <div class="field">
      <span class="flabel">Visual style</span>
      <Checks options={f.fvis} onToggle={(x) => filters.toggleFont("vis", x)} />
      <p class="help">Shows fonts that match any checked style. Numbers show how many you'd get by adding one.</p>
    </div>
    <wa-details summary="More font filters" appearance="plain" class="more">
      <div class="subh">Classification</div><Toggles label="Classification" options={f.fsub} onToggle={(x) => filters.toggleFont("sub", x)} />
      <div class="subh">License</div><Toggles label="Font license" options={f.flic} onToggle={(x) => filters.toggleFont("lic", x)} />
      <div class="subh">Script support</div><Picker label="Script support" options={f.fscript} value={v.ff.script} onPick={(x) => filters.setFont("script", x)} />
      <wa-slider class="sub-slider" label={`Minimum quality: ${v.ff.q ? v.ff.q + "+" : "any"}`} min="0" max="90" step="5" value={v.ff.q} oninput={(e) => filters.setFont("q", +e.target.value)}></wa-slider>
      <wa-input class="sub-input" size="s" type="search" label="Family name contains" placeholder="Grotesk" value={v.ff.search} oninput={onSearch}></wa-input>
      <div class="subh">Excluded families</div>
      <form class="inline-form" onsubmit={(e) => { e.preventDefault(); addExcluded(); }}>
        <wa-input size="s" placeholder="Family name, such as Roboto" aria-label="Family to exclude" autocomplete="off" value={fx} oninput={(e) => { fx = e.target.value; fxHint = null; }}></wa-input>
        <wa-button size="s" type="submit">Exclude</wa-button>
      </form>
      {#if fxMatches.length}
        <div class="suggest">{#each fxMatches as m (m.f)}<wa-button size="xs" appearance="plain" onclick={() => addExcluded(m.f)}>{m.f}</wa-button>{/each}</div>
      {/if}
      {#if fxHint}<p class="help" class:bad={fxHint.bad} aria-live="polite">{fxHint.text}</p>{/if}
      {#if app.excluded.length}
        <div class="chips">
          {#each app.excluded as n (n)}<wa-tag size="s" with-remove onwa-remove={() => excluded.remove(n)}>{n}</wa-tag>{/each}
        </div>
        <wa-button size="s" appearance="plain" onclick={() => excluded.clear()}>Clear excluded families</wa-button>
      {/if}
    </wa-details>

    <wa-divider></wa-divider>
    <div class="eyebrow-row"><p class="eyebrow">Icon filters</p><span class="count" id="icount">{v.icount}</span></div>
    <div class="field">
      <span class="flabel" id="ifillLbl">Icon style</span>
      <div class="tiles" role="group" aria-labelledby="ifillLbl">
        {#each f.fill as o (o.v)}
          <button class="tile" class:zero={o.zero} aria-pressed={o.sel} disabled={o.zero} data-fill={o.v} onclick={() => filters.toggleIcon("fill", o.v)}>
            {@html TILE_SVG[o.v]}{o.label}{#if !o.sel}<span class="n">{o.n}</span>{/if}
          </button>
        {/each}
      </div>
    </div>
    <div class="field">
      <span class="flabel">Stroke weight (line icons)</span>
      <div role="group" aria-label="Stroke weight" class="segs">
        {#each f.iweight as o (o.v)}
          <wa-button size="s" variant={o.sel ? "brand" : "neutral"} appearance={o.sel ? "accent" : "outlined"} aria-pressed={o.sel} disabled={o.zero} onclick={() => filters.toggleIcon("weight", o.v)}>
            {o.label}{#if !o.sel}<span class="n">{o.n}</span>{/if}
          </wa-button>
        {/each}
      </div>
      {#if v.if.weightNote}<p class="help">Stroke weight applies to outline and duotone icons. Filled and color icons stay in the pool.</p>{/if}
    </div>
    <div class="field">
      <span class="flabel">Visual style</span>
      <Checks options={f.ivis} onToggle={(x) => filters.toggleIcon("vis", x)} />
      <p class="help">Read from each icon's shape. Shows icons that match any checked trait.</p>
    </div>
    <wa-details summary="More icon filters" appearance="plain" class="more">
      <div class="subh">Design grid</div><Toggles label="Design grid" options={f.igrid} onToggle={(x) => filters.toggleIcon("grid", x)} />
      <div class="subh">License</div><Toggles label="Icon license" options={f.ilic} onToggle={(x) => filters.toggleIcon("lic", x)} />
      <p class="help">Every icon set here is free. Credit required means you name the author where you use the icon.</p>
      <div class="subh">Icon set category</div><Toggles label="Icon set category" options={f.icat} onToggle={(x) => filters.toggleIcon("cat", x)} />
      <div class="subh">Set size</div><Picker label="Set size" options={f.isize} value={v.if.size} onPick={(x) => filters.setIconSize(x)} />
      <div class="subh row"><span>Icon sets <span class="count">({v.sets.length})</span></span>
        <span><wa-button size="xs" appearance="plain" onclick={() => filters.allLibs(true)}>All</wa-button><wa-button size="xs" appearance="plain" onclick={() => filters.allLibs(false)}>None</wa-button></span></div>
      <wa-input size="s" type="search" placeholder="Find a set, such as Lucide" aria-label="Find an icon set" value={libq} oninput={(e) => (libq = e.target.value.trim().toLowerCase())}></wa-input>
      <div class="libs" id="libs">
        {#each sets as x (x.set.id)}
          {@const svg = iconSVG(x.set.id, x.sample.name)}
          <wa-checkbox size="s" checked={x.on} class:nomatch={!x.n} onchange={(e) => filters.setLib(x.set.id, e.target.checked)}
            title={`${x.set.name}: ${x.set.total.toLocaleString()} icons, ${x.set.licTitle}`}>
            <span class="lib">{#if svg}<span class="g">{@html svg}</span>{:else}{@html setMono(x.set)}{/if}<span>{x.name}<small>{x.n ? `${x.n} style${x.n === 1 ? "" : "s"}, ${x.set.licTitle}` : "no style fits your filters"}</small></span></span>
          </wa-checkbox>
        {:else}
          <p class="empty">{v.sets.length ? "No icon set by that name." : "Icon sets appear here once the word finds icons."}</p>
        {/each}
      </div>
    </wa-details>
    <wa-button class="reset" appearance="outlined" onclick={() => filters.reset()}><span slot="start" class="ico">{@html ui("rotate-ccw")}</span>Reset all filters</wa-button>
  {/if}
</section>
