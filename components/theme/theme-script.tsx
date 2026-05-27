import Script from "next/script";

/** Tek tema: Apple premium sistem paleti. */
export function ThemeScript() {
  const code = `(function(){document.documentElement.setAttribute("data-theme","light");})();`;
  return <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}
