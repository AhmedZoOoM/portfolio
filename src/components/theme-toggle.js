const storageKey = "portfolio-theme";
const colors = { dark: "#090c10", light: "#f4f7f9" };

function readTheme(storage) {
  try {
    return storage?.getItem(storageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function initializeTheme(options = {}) {
  const documentRef = options.document ?? document;
  let storage = options.storage;
  if (!("storage" in options)) {
    try {
      storage = globalThis.localStorage;
    } catch {
      storage = undefined;
    }
  }
  const root = documentRef.documentElement;
  const toggle = documentRef.querySelector("#theme-toggle");
  const themeColor = documentRef.querySelector('meta[name="theme-color"]');
  if (!toggle) return;

  function applyTheme(theme, persist = false) {
    const next = theme === "light" ? "light" : "dark";
    root.dataset.theme = next;
    toggle.setAttribute("aria-pressed", String(next === "light"));
    if (themeColor) themeColor.content = colors[next];
    if (!persist) return;
    try {
      storage?.setItem(storageKey, next);
    } catch {
      // The visible preference still works when storage is unavailable.
    }
  }

  applyTheme(readTheme(storage));
  toggle.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "light" ? "dark" : "light", true);
  });
}
