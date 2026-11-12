<script>
  import { tick } from "svelte";
  import { app } from "../lib/store.svelte.js";
  import { lockup, fitLockups, applyStroke } from "../lib/render.js";
  import { verdictOf } from "../lib/harmony.js";
  import { ui } from "../lib/ui-icons.js";

  // recent or saved pairings, each drawn as a small lockup
  let { items = [], saved = false, empty = "", onOpen, onRemove } = $props();
  let box = $state();
  $effect(() => {
    void [items, app.strokeMatch];
    if (!box) return;
    tick().then(() => { fitLockups(box); box.querySelectorAll(".hitem-w").forEach((el, i) => items[i] && applyStroke(el, items[i], app.strokeMatch)); });
  });
  const when = (at) => new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short" });
</script>

<div class="hlist" bind:this={box}>
  {#each items as p, i (i + (p.at || "") + p.style.id + p.font.f + p.weight)}
    <div class="hitem-w">
      <button class="hitem" data-i={i} aria-label={`Open ${p.style.lib.name} with ${p.font.f}, ${verdictOf(p.score.total)[0]}`} onclick={() => onOpen(i)}>
        {@html lockup(p, p.text || app.text || "Aa")}
        <span class="cap"><b>{p.score.total}%</b> {p.style.lib.name} {p.style.label}, {p.font.f} {p.weight}{saved && p.at ? `, saved ${when(p.at)}` : ""}</span>
      </button>
      {#if saved}<button class="hrm" aria-label={`Remove saved pairing ${p.font.f}`} title="Remove" onclick={() => onRemove(i)}>{@html ui("x")}</button>{/if}
    </div>
  {:else}
    <p class="empty">{empty}</p>
  {/each}
</div>
