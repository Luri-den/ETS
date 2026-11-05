/* editor-common.js: shared by every editor.
   1) Unsaved-changes warning: an editor counts as "unsaved" while its Download button is enabled and has not been clicked since your last edit. The hub shows a red dot on that tab.
   2) applySiteView(map): opens an editor map on the site's own start view (CENTER_LAT / CENTER_LNG / ZOOM in site.csv) unless the editor has already moved the map itself. */
(function () {
  "use strict";
  let clean = false, last = null;
  const btn = () => document.getElementById("publishBtn") || document.getElementById("dlBtn");
  const dirty = () => { const b = btn(); return !!b && !b.disabled && !clean; };
  function report() {
    const d = dirty();
    if (d === last) return;
    last = d;
    try { if (window.parent !== window) window.parent.postMessage({ type: "ets-dirty", dirty: d }, location.origin); } catch (e) {}
  }
  const later = () => setTimeout(report, 60);
  document.addEventListener("click", e => { const b = btn(); if (b && b.contains(e.target)) { clean = true; later(); } }, true);
  ["input", "change", "pointerup", "keyup"].forEach(t => document.addEventListener(t, e => {
    const b = btn();
    if (b && b.contains(e.target)) return;
    clean = false; later();
  }, true));
  document.addEventListener("DOMContentLoaded", () => {
    const b = btn();
    if (b) new MutationObserver(() => { if (!b.disabled) clean = false; later(); }).observe(b, { attributes: true, attributeFilter: ["disabled"] });
    setInterval(report, 1500);
  });
  window.addEventListener("beforeunload", e => { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

  function applySiteView(map) {
    const c0 = map.getCenter();
    fetch("site.csv", { cache: "no-store" }).then(r => r.ok ? r.text() : "").then(t => {
      const kv = {};
      String(t).split(/\r?\n/).forEach(l => { const m = /^([A-Z_]+),(.*)$/.exec(l); if (m) kv[m[1]] = m[2].replace(/^"|"$/g, "").trim(); });
      const lat = parseFloat(kv.CENTER_LAT), lng = parseFloat(kv.CENTER_LNG);
      if (!isFinite(lat) || !isFinite(lng)) return;
      const c = map.getCenter();
      if (Math.abs(c.lng - c0.lng) > 1e-6 || Math.abs(c.lat - c0.lat) > 1e-6) return;
      const z = parseFloat(kv.ZOOM);
      map.jumpTo({ center: [lng, lat], zoom: isFinite(z) ? z : 10 });
    }).catch(() => {});
  }
  window.ETSCommon = { applySiteView, isDirty: dirty };
})();
