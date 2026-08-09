const icons = {
  YouTube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"/></svg>',
  Vimeo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.6 7.1c-.1 3.2-2.4 7.6-6.9 13.2-2.3 2.9-4.3 4.3-6 4.3-1 0-1.9-.9-2.6-2.8L3.4 8.4C2.7 6.1 2 5 1.2 5c-.2 0-1 .5-2.2 1.5L0 5.2c1.4-1.2 2.8-2.4 4.1-3.6C6 .1 7.4-.1 8.2 0c2.2.2 3.5 1.5 4 3.9.5 2.6 1 5.3 1.5 7.9 1 2.4 1.7 3.6 2.3 3.6.5 0 1.2-.8 2.2-2.4 1-1.6 1.5-2.8 1.6-3.6.1-1.4-.4-2.1-1.7-2.1-.6 0-1.2.1-1.8.4 1.2-4 3.4-5.9 6.3-5.8 2.2.1 3.2 1.8 3 5.2Z"/></svg>',
  Behance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.8 11.1c1.6-.3 2.6-1.4 2.6-3.3C11.4 4.2 8.7 4 6.3 4H0v16h6.5c2.5 0 5.7-1.2 5.7-5 0-2.3-1.3-3.5-3.4-3.9ZM3.5 6.8h2.2c1.1 0 2.2.3 2.2 1.7 0 1.3-.9 1.8-2.1 1.8H3.5V6.8Zm2.8 10.4H3.5v-4.1h2.8c1.3 0 2.4.5 2.4 2.1 0 1.5-1.1 2-2.4 2ZM18.8 8.2c-3.7 0-5.8 2.7-5.8 6.2 0 3.6 2.3 6 5.9 6 2.6 0 4.5-1.2 5.1-3.7h-3.1c-.2.8-1.2 1.4-2 1.4-1.5 0-2.5-.8-2.6-2.4H24v-1c0-3.7-2.1-6.5-5.2-6.5ZM16.3 13.7c.1-1.2.8-2.3 2.4-2.3 1.4 0 2.1 1 2.2 2.3h-4.6ZM16 5.5h5V7h-5z"/></svg>',
  X: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.4l7.3-8.3L2 2h6.5l4.4 6.7L18.9 2Zm-1.1 18h1.7L7.6 3.9H5.8L17.8 20Z"/></svg>'
};

export function renderSocialLinks(socials) {
  const container = document.querySelector("#social-links");
  container.replaceChildren();
  socials.forEach(({ name, url }) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Ahmed Azzam on ${name}`);
    link.title = name;
    link.className = "social-icon";
    link.innerHTML = icons[name];
    container.append(link);
  });
}
