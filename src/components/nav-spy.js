// Marks the primary-navigation link for the section currently in view with
// aria-current="true" so the sticky header always shows "you are here".
export function initializeNavSpy({
  document: doc = globalThis.document,
  IntersectionObserver: Observer = globalThis.IntersectionObserver
} = {}) {
  const links = Array.from(doc?.querySelectorAll?.(".nav-links a[href^='#']") || []);
  const entries = links
    .map((link) => ({ link, section: doc.getElementById(link.getAttribute("href").slice(1)) }))
    .filter(({ section }) => section);
  if (!entries.length) return null;

  const setCurrent = (id) => {
    for (const { link, section } of entries) {
      if (section.id === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  for (const { link, section } of entries) {
    link.addEventListener("click", () => setCurrent(section.id));
  }
  if (typeof Observer !== "function") return { setCurrent };

  const visible = new Map();
  const observer = new Observer((changes) => {
    for (const change of changes) {
      if (change.isIntersecting) visible.set(change.target.id, change.intersectionRatio);
      else visible.delete(change.target.id);
    }
    const current = entries.find(({ section }) => visible.has(section.id));
    setCurrent(current ? current.section.id : null);
  }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01] });
  for (const { section } of entries) observer.observe(section);
  return { setCurrent, observer };
}
