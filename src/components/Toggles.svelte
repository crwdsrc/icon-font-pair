<script>
  // A row of on/off buttons, each with the result count it would give. Zero-result options are dimmed and disabled.
  let { options = [], onToggle, label = "", size = "s", locked = false } = $props();
</script>

<div class="toggles" role="group" aria-label={label}>
  {#each options as o (o.v)}
    <wa-button size={size} variant={o.sel ? "brand" : "neutral"} appearance={o.sel ? "accent" : "outlined"} aria-pressed={o.sel} disabled={o.zero || locked}
      title={o.zero ? "No results with your other filters" : o.sel ? "" : `${o.n.toLocaleString()} if you add this`} onclick={() => onToggle(o.v)}>
      {o.label}{#if !o.sel}<span class="n">{o.n.toLocaleString()}</span>{/if}
    </wa-button>
  {/each}
</div>
