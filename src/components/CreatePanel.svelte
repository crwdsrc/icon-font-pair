<script>
  import { app, filters, excluded, setWord, setLock } from "../lib/store.svelte.js";
  import { iconSVG } from "../lib/iconify.js";
  import { FONTS } from "../lib/fonts.js";
  import { setMono } from "../lib/render.js";
  import { hasWeight } from "../lib/filters.js";
  import { ui } from "../lib/ui-icons.js";
  import Toggles from "./Toggles.svelte";
  import Checks from "./Checks.svelte";
  import Picker from "./Picker.svelte";

  const v = $derived(app.view);
  const fontLocked = $derived(app.locks[1] && !!app.cur);
  const iconLocked = $derived(app.locks[0] && !!app.cur);
  // with a kept typeface, the weight choices are that font's weights
  const weightOptions = $derived(!v ? [] : fontLocked ? f.fweight.map((o) => ({ ...o, n: null, zero: !!o.v && !hasWeight(app.cur.font, +o.v) })) : f.fweight);
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
    {#if fontLocked}
      <wa-callout variant="neutral" size="s" class="lockednote"><span slot="icon" class="ico">{@html ui("lock")}</span>You're keeping the typeface, so font filters are off.
        <wa-button size="xs" appearance="outlined" onclick={() => setLock(1, false)}>Unlock typeface</wa-button></wa-callout>
    {/if}
    <!-- the weight is a pick, not a filter: spins use it, and it stays available for a kept typeface -->
    <div class="field weightpick">
      <span class="flabel" id="fweightLbl">Font weight</span>
      <Picker label="Font weight" options={weightOptions} value={v.ff.weight} onPick={(x) => filters.setWeight(x)} />
      <p class="help">{v.ff.weight ? "Spins use this weight. Only fonts that have it are in the pool." : "Any weight picks one at random from each font."}</p>
    </div>
    <!-- a kept typeface ignores the font filters, so they are switched off until it is unlocked -->
    <fieldset class="lockable" disabled={fontLocked}>
    <wa-radio-group disabled={fontLocked} label="Font source" value={v.ff.src} onchange={(e) => filters.setFont("src", e.target.value)}>
      {#each f.fsrc as o (o.v)}
        <wa-radio value={o.v} disabled={o.zero}><span class="radio-l"><b>{o.label}{#if !o.sel}<span class="n">{o.n.toLocaleString()}</span>{/if}</b><small>{o.desc}</small></span></wa-radio>
      {/each}
    </wa-radio-group>

    <wa-divider></wa-divider>
    <div class="eyebrow-row"><p class="eyebrow">Font filters</p><span class="count" id="fcount">{v.fcount}</span></div>
    <div class="field">
      <wa-select disabled={fontLocked} id="fcat" label="Font category" placeholder="Any category" multiple with-clear value={v.ff.cat} onchange={(e) => filters.setFontCats(e.target.value || [])}>
        {#each f.fcat as o (o.v)}<wa-option value={o.v} disabled={o.zero}>{o.label}{#if !o.sel}<span slot="end" class="n">{o.n.toLocaleString()}</span>{/if}</wa-option>{/each}
      </wa-select>
    </div>
    <div class="field">
      <span class="flabel">Font properties</span>
      <div class="propgrid">
        <span class="plabel">Width</span>
        <Picker locked={fontLocked} label="Width" options={f.fwidth} value={v.ff.width} onPick={(x) => filters.setFont("width", x)} />
        <span class="plabel">Style</span>
        <Picker locked={fontLocked} label="Style" options={f.fstyle} value={v.ff.style} onPick={(x) => filters.setFont("style", x)} />
        <span class="plabel">Mood</span>
        <Picker locked={fontLocked} label="Mood" options={f.fmood} value={v.ff.mood} onPick={(x) => filters.setFont("mood", x)} />
      </div>
    </div>
    <div class="field">
      <span class="flabel">Visual style</span>
      <Checks locked={fontLocked} options={f.fvis} onToggle={(x) => filters.toggleFont("vis", x)} />
      <p class="help">Shows fonts that match any checked style. Numbers show how many you'd get by adding one.</p>
    </div>
    <wa-details summary="More font filters" appearance="plain" class="more">
      <div class="subh">Classification</div><Toggles locked={fontLocked} label="Classification" options={f.fsub} onToggle={(x) => filters.toggleFont("sub", x)} />
      <div class="subh">License</div><Toggles locked={fontLocked} label="Font license" options={f.flic} onToggle={(x) => filters.toggleFont("lic", x)} />
      <div class="subh">Script support</div><Picker locked={fontLocked} label="Script support" options={f.fscript} value={v.ff.script} onPick={(x) => filters.setFont("script", x)} />
      <wa-slider disabled={fontLocked} class="sub-slider" label={`Minimum quality: ${v.ff.q ? v.ff.q + "+" : "any"}`} min="0" max="90" step="5" value={v.ff.q} oninput={(e) => filters.setFont("q", +e.target.value)}></wa-slider>
      <wa-input disabled={fontLocked} class="sub-input" size="s" type="search" label="Family name contains" placeholder="Grotesk" value={v.ff.search} oninput={onSearch}></wa-input>
      <div class="subh">Excluded families</div>
      <form class="inline-form" onsubmit={(e) => { e.preventDefault(); addExcluded(); }}>
        <wa-input disabled={fontLocked} size="s" placeholder="Family name, such as Roboto" aria-label="Family to exclude" autocomplete="off" value={fx} oninput={(e) => { fx = e.target.value; fxHint = null; }}></wa-input>
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
    </fieldset>

    <wa-divider></wa-divider>
    {#if iconLocked}
      <wa-callout variant="neutral" size="s" class="lockednote"><span slot="icon" class="ico">{@html ui("lock")}</span>You're keeping the icon set, so icon filters are off.
        <wa-button size="xs" appearance="outlined" onclick={() => setLock(0, false)}>Unlock icon set</wa-button></wa-callout>
    {/if}
    <fieldset class="lockable" disabled={iconLocked}>
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
          <wa-button size="s" variant={o.sel ? "brand" : "neutral"} appearance={o.sel ? "accent" : "outlined"} aria-pressed={o.sel} disabled={o.zero || iconLocked} onclick={() => filters.toggleIcon("weight", o.v)}>
            {o.label}{#if !o.sel}<span class="n">{o.n}</span>{/if}
          </wa-button>
        {/each}
      </div>
      {#if v.if.weightNote}<p class="help">Stroke weight applies to outline and duotone icons. Filled and color icons stay in the pool.</p>{/if}
    </div>
    <div class="field">
      <span class="flabel">Visual style</span>
      <Checks locked={iconLocked} options={f.ivis} onToggle={(x) => filters.toggleIcon("vis", x)} />
      <p class="help">Read from each icon's shape. Shows icons that match any checked trait.</p>
    </div>
    <wa-details summary="More icon filters" appearance="plain" class="more">
      <div class="subh">Design grid</div><Toggles locked={iconLocked} label="Design grid" options={f.igrid} onToggle={(x) => filters.toggleIcon("grid", x)} />
      <div class="subh">License</div><Toggles locked={iconLocked} label="Icon license" options={f.ilic} onToggle={(x) => filters.toggleIcon("lic", x)} />
      <p class="help">Every icon set here is free. Credit required means you name the author where you use the icon.</p>
      <div class="subh">Icon set category</div><Toggles locked={iconLocked} label="Icon set category" options={f.icat} onToggle={(x) => filters.toggleIcon("cat", x)} />
      <div class="subh">Set size</div><Picker locked={iconLocked} label="Set size" options={f.isize} value={v.if.size} onPick={(x) => filters.setIconSize(x)} />
      <div class="subh row"><span>Icon sets <span class="count">({v.sets.length})</span></span>
        <span><wa-button size="xs" appearance="plain" disabled={iconLocked} onclick={() => filters.allLibs(true)}>All</wa-button><wa-button size="xs" appearance="plain" disabled={iconLocked} onclick={() => filters.allLibs(false)}>None</wa-button></span></div>
      <wa-input disabled={iconLocked} size="s" type="search" placeholder="Find a set, such as Lucide" aria-label="Find an icon set" value={libq} oninput={(e) => (libq = e.target.value.trim().toLowerCase())}></wa-input>
      <div class="libs" id="libs">
        {#each sets as x (x.set.id)}
          {@const svg = iconSVG(x.set.id, x.sample.name)}
          <wa-checkbox size="s" disabled={iconLocked} checked={x.on} class:nomatch={!x.n} onchange={(e) => filters.setLib(x.set.id, e.target.checked)}
            title={`${x.set.name}: ${x.set.total.toLocaleString()} icons, ${x.set.licTitle}`}>
            <span class="lib">{#if svg}<span class="g">{@html svg}</span>{:else}{@html setMono(x.set)}{/if}<span>{x.name}<small>{x.n ? `${x.n} style${x.n === 1 ? "" : "s"}, ${x.set.licTitle}` : "no style fits your filters"}</small></span></span>
          </wa-checkbox>
        {:else}
          <p class="empty">{v.sets.length ? "No icon set by that name." : "Icon sets appear here once the word finds icons."}</p>
        {/each}
      </div>
    </wa-details>
    </fieldset>
    <wa-button class="reset" appearance="outlined" onclick={() => filters.reset()}><span slot="start" class="ico">{@html ui("rotate-ccw")}</span>Reset all filters</wa-button>
  {/if}
</section>
