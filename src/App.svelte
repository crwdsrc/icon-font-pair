<script>
  import { onMount } from "svelte";
  import { app, start, spin, setMode } from "./lib/store.svelte.js";
  import { fitLockups } from "./lib/render.js";
  import { ui } from "./lib/ui-icons.js";
  import CreatePanel from "./components/CreatePanel.svelte";
  import Preview from "./components/Preview.svelte";
  import MatchPanel from "./components/MatchPanel.svelte";
  import DesignSystems from "./components/DesignSystems.svelte";
  import Scenarios from "./components/Scenarios.svelte";
  import Settings from "./components/Settings.svelte";

  // Source repository: change this one value and every GitHub link updates.
  const GITHUB_URL = "https://github.com/crwdsrc/icon-font-pair";
  let toastEl = $state();

  onMount(() => {
    app.toastEl = toastEl;
    start();
    let t;
    const refit = () => { clearTimeout(t); t = setTimeout(() => fitLockups(), 120); };
    addEventListener("resize", refit);
    document.fonts?.addEventListener?.("loadingdone", refit);
    return () => { removeEventListener("resize", refit); document.fonts?.removeEventListener?.("loadingdone", refit); };
  });

  const MODES = [["random", "Randomizer"], ["scenarios", "Scenarios"], ["systems", "Design systems"]];
  // arrow keys, Home and End move between the tabs
  function onTabKey(e) {
    const i = MODES.findIndex(([m]) => m === app.mode), n = MODES.length;
    const j = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (j == null) return;
    e.preventDefault();
    const next = MODES[j % n][0];
    setMode(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  // in the randomizer, Space spins, unless focus is in a control that uses Space itself
  function onkeydown(e) {
    if (e.code !== "Space" || e.repeat || app.mode !== "random") return;
    const el = document.activeElement, tag = el?.tagName || "";
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "SUMMARY", "A"].includes(tag) || tag.startsWith("WA-")) return;
    e.preventDefault(); spin();
  }
</script>

<svelte:window {onkeydown} />

<header class="top">
  <div class="brand"><h1>Icon + Type</h1><span class="sep" aria-hidden="true"></span><span class="sub">Pairing Studio</span></div>
  <div class="tools">
    <a class="exp" href="https://crwdsrc.dev" target="_blank" rel="noopener">A <span class="dom">crwdsrc.dev</span> experiment</a>
    <wa-button appearance="plain" href={GITHUB_URL} target="_blank" rel="noopener" aria-label="Source on GitHub" title="Source on GitHub" class="icon-btn">{@html ui("github")}</wa-button>
    <wa-divider orientation="vertical"></wa-divider>
    <wa-button appearance="plain" id="helpBtn" class="tool-btn"><span slot="start" class="ico">{@html ui("circle-help")}</span><span class="lbl">Help</span></wa-button>
    <wa-popover for="helpBtn" placement="bottom-end">
      <div class="pop">
        <h2>How it works</h2>
        <ul>
          <li>Type an icon name or a meaning, such as growth or money, and the text you want to set.</li>
          <li>Spin to draw an icon set from Iconify, a typeface and a weight. Keep any of the three to spin only the others.</li>
          <li>Save pairings you like. They stay in this browser.</li>
          <li>Scenarios shows strong pairings for dashboards, marketing, mobile, docs, reading and more, with the reasons they work.</li>
          <li>Design systems lists icon sets and fonts that real design systems ship together, filtered the same way.</li>
        </ul>
      </div>
    </wa-popover>
    <wa-button appearance="plain" id="setBtn" class="tool-btn" aria-label="Preview settings"><span class="ico">{@html ui("settings")}</span></wa-button>
    <wa-popover for="setBtn" placement="bottom-end"><Settings /></wa-popover>
  </div>
</header>

<div class="modebar">
  <div class="modes" role="tablist" aria-label="View">
    {#each MODES as [m, label] (m)}
      <button role="tab" id={`tab-${m}`} aria-selected={app.mode === m} aria-controls="main" tabindex={app.mode === m ? 0 : -1}
        onclick={() => setMode(m)} onkeydown={onTabKey}>{label}</button>
    {/each}
  </div>
</div>

<main class="layout" class:sgview={app.mode === "systems"} class:scview={app.mode === "scenarios"} id="main" role="tabpanel" aria-labelledby={`tab-${app.mode}`}>
  {#if app.mode !== "scenarios"}<CreatePanel />{/if}
  {#if app.mode === "random"}
    <Preview />
    <MatchPanel />
  {:else if app.mode === "systems"}
    <DesignSystems />
  {:else}
    <Scenarios />
  {/if}
</main>

<footer class="foot">
  <p>Icon + Type is a <a href="https://crwdsrc.dev" target="_blank" rel="noopener">crwdsrc.dev</a> experiment. <a href={GITHUB_URL} target="_blank" rel="noopener">View the source on GitHub</a>.</p>
  <p>Icons from the <a href="https://iconify.design" target="_blank" rel="noopener">Iconify</a> API. Fonts from Google Fonts and Fontsource. Interface built with Svelte and Web Awesome. Each icon set and font keeps its own license.</p>
</footer>
<div class="wa-visually-hidden" aria-live="polite">{app.status}</div>
<wa-toast bind:this={toastEl} placement="bottom-center"></wa-toast>
