import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import App from "./App.jsx";
import "./styles/index.css";

      // Apply saved dark mode on load
const theme = localStorage.getItem("theme");
if (
  theme === "dark" ||
  (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
