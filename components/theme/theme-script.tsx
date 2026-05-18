import Script from "next/script";

import { THEME_STORAGE_KEY } from "@/lib/theme/constants";

/** İlk boyamadan önce tema sınıfını ayarlar (FOUC önler). */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var k=${JSON.stringify(THEME_STORAGE_KEY)};
    var t=localStorage.getItem(k);
    var d=document.documentElement;
    if(t==="light") d.setAttribute("data-theme","light");
    else d.setAttribute("data-theme","dark");
  } catch(e) {
    document.documentElement.setAttribute("data-theme","dark");
  }
})();`;
  return <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}
