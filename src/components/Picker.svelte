<script>
  // A single-choice select whose options show result counts. Web Awesome option values can't be empty,
  // so the "any" option uses the value "any" and reports "".
  let { options = [], value = "", onPick, label = "", size = "s", locked = false } = $props();
  const enc = (v) => (v === "" ? "any" : String(v));
</script>

<wa-select size={size} disabled={locked} aria-label={label} value={enc(value)} onchange={(e) => onPick(e.target.value === "any" ? "" : e.target.value)}>
  {#each options as o (o.v)}
    <wa-option value={enc(o.v)} disabled={o.zero || locked}>{o.label}{#if o.v !== "" && o.v !== 0 && !o.sel && o.n != null}<span slot="end" class="n">{o.n.toLocaleString()}</span>{/if}</wa-option>
  {/each}
</wa-select>
