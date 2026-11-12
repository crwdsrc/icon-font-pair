import "@awesome.me/webawesome/dist/styles/webawesome.css";
import "./webawesome.js";
import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app") });
