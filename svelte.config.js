// Web Awesome components are custom elements, so Svelte can't tell that <wa-button> is a button.
// These a11y checks would flag every one of them; the components handle keyboard and roles themselves.
const CUSTOM_ELEMENT_A11Y = ["a11y_click_events_have_key_events", "a11y_no_static_element_interactions"];
export default {
  compilerOptions: { runes: true },
  warningFilter: (w) => !(CUSTOM_ELEMENT_A11Y.includes(w.code) && /<wa-/.test(w.frame || w.message || "")),
};
