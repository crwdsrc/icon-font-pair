<script>
  import { app, setTheme, setDir } from "../lib/store.svelte.js";
</script>

<div class="pop">
  <h2>Preview settings</h2>
  <p>Theme and direction change the preview only.</p>
  <wa-radio-group label="Preview theme" orientation="horizontal" size="s" value={app.theme} onchange={(e) => setTheme(e.target.value)}>
    <wa-radio appearance="button" value="light">Light</wa-radio>
    <wa-radio appearance="button" value="dark">Dark</wa-radio>
  </wa-radio-group>
  <wa-radio-group label="Preview direction" orientation="horizontal" size="s" value={app.dir} onchange={(e) => setDir(e.target.value)}>
    <wa-radio appearance="button" value="ltr">Left to right</wa-radio>
    <wa-radio appearance="button" value="rtl">Right to left</wa-radio>
  </wa-radio-group>
  <wa-slider label="Text size" min="36" max="96" value={app.size} with-tooltip oninput={(e) => (app.size = +e.target.value)}></wa-slider>
  <wa-switch checked={app.strokeMatch} onchange={(e) => (app.strokeMatch = e.target.checked)} hint="Applies to icons drawn with strokes, such as Lucide and Tabler.">Match icon stroke to font weight</wa-switch>
</div>
