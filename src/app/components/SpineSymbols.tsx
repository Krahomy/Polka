import { useEffect } from 'react';

const DECOR_IDS = ['decor_1', 'decor_2', 'decor_3', 'decor_4'];

export default function SpineSymbols() {
  useEffect(() => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('id', 'spine-decor-defs');
    svgEl.style.cssText = 'display:none;position:absolute;width:0;height:0';
    const defsEl = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgEl.appendChild(defsEl);
    document.body.appendChild(svgEl);

    Promise.all(
      DECOR_IDS.map(async (id) => {
        try {
          const res  = await fetch(`/Decoration/${id}.svg`);
          const text = await res.text();
          const doc  = new DOMParser().parseFromString(text, 'image/svg+xml');
          const root = doc.documentElement;
          const sym  = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
          sym.setAttribute('id', id);
          sym.setAttribute('viewBox', root.getAttribute('viewBox') ?? '0 0 100 100');
          while (root.firstChild) sym.appendChild(root.firstChild);
          defsEl.appendChild(sym);
        } catch (e) {
          console.warn(`SpineSymbols: failed to load ${id}`, e);
        }
      })
    );

    return () => { svgEl.remove(); };
  }, []);

  return null;
}
