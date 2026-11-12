<script>
  // Checkboxes in two columns, each with the result count it would give.
  let { options = [], onToggle } = $props();
</script>

<div class="checks">
  {#each options as o (o.v)}
    <wa-checkbox checked={o.sel} disabled={o.zero} onchange={() => onToggle(o.v)} title={o.zero ? "No results with your other filters" : ""}>
      {o.label}{#if !o.sel}<span class="n">{o.n.toLocaleString()}</span>{/if}
    </wa-checkbox>
  {/each}
</div>
