/* marker-shapes.js: marker outlines, shared by Demo2.html (the map) and editor.html (the editor).
   Built-in shapes are listed below. Your own shapes live in shapes.csv (CODE, LABEL, POINTS), where
   POINTS is a list of corners as percentages of the marker box, like "50 0;100 50;50 100;0 50".
   categories.csv has a SHAPE column that says which shape each category uses (blank or circle = round). */
(function () {
  const POLY = {
    diamond:  { label: "Diamond",  points: [[50,0],[100,50],[50,100],[0,50]] },
    triangle: { label: "Triangle", points: [[50,3],[100,92],[0,92]] },
    hexagon:  { label: "Hexagon",  points: [[25,3],[75,3],[100,50],[75,97],[25,97],[0,50]] },
    house:    { label: "House",    points: [[50,0],[100,38],[82,100],[18,100],[0,38]] },
    star:     { label: "Star",     points: [[50,0],[61,35],[98,35],[68,57],[79,91],[50,70],[21,91],[32,57],[2,35],[39,35]] }
  };
  const slug = s => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const pointsToClip = pts => "polygon(" + pts.map(p => p[0] + "% " + p[1] + "%").join(",") + ")";

  const BUILTIN = { circle: { label: "Circle", clip: "" }, square: { label: "Square", clip: "inset(3% round 18%)" } };
  Object.keys(POLY).forEach(k => { BUILTIN[k] = { label: POLY[k].label, clip: pointsToClip(POLY[k].points) }; });

  function parsePoints(str) {
    const pts = String(str || "").split(";").map(p => p.trim().split(/\s+/).map(Number)).filter(p => p.length === 2 && p.every(isFinite));
    return pts.length >= 3 ? pts.map(p => [Math.min(100, Math.max(0, p[0])), Math.min(100, Math.max(0, p[1]))]) : null;
  }
  function parseRows(rows) {                       // shapes.csv rows -> { code: { label, points } }
    const out = {};
    (rows || []).forEach(r => {
      const code = slug(r.CODE), pts = parsePoints(r.POINTS);
      if (code && pts && !BUILTIN[code]) out[code] = { label: String(r.LABEL || code).trim(), points: pts };
    });
    return out;
  }
  function clipFor(code, custom) {
    code = slug(code);
    if (BUILTIN[code]) return BUILTIN[code].clip;
    return custom && custom[code] ? pointsToClip(custom[code].points) : "";
  }
  function list(custom) {
    const out = Object.keys(BUILTIN).map(k => ({ code: k, label: BUILTIN[k].label, clip: BUILTIN[k].clip, custom: false }));
    Object.keys(custom || {}).forEach(k => out.push({ code: k, label: custom[k].label, clip: pointsToClip(custom[k].points), custom: true }));
    return out;
  }
  // Turns a round marker button into a shaped one. Call it after the photo is inside the button.
  function apply(btn, code, custom) {
    const clip = clipFor(code, custom);
    if (!clip || btn.querySelector(".shp")) return false;
    btn.classList.add("shaped");
    btn.style.setProperty("--clip", clip);
    const shp = document.createElement("span");
    shp.className = "shp";
    Array.from(btn.childNodes).forEach(n => shp.appendChild(n));
    btn.appendChild(shp);
    return true;
  }

  const CSS = "button.pin.shaped{border:0;background:transparent;overflow:visible;box-shadow:none;--ring:4px;filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 1px 3px rgba(0,0,0,.55))}" +
    "button.pin.shaped.parent{--ring:5px}" +
    "button.pin.shaped.sel,button.pin.shaped.nophoto{box-shadow:none;background:transparent}" +
    "button.pin.shaped.gone{filter:grayscale(1) drop-shadow(0 0 1.5px #fff) drop-shadow(0 1px 3px rgba(0,0,0,.55))}" +
    "button.pin.shaped .shp{position:absolute;inset:0;background:var(--c,#E47303);clip-path:var(--clip)}" +
    "button.pin.shaped.sel .shp{background:#ff9800}" +
    "button.pin.shaped .shp img{position:absolute;inset:var(--ring);width:calc(100% - 2 * var(--ring));height:calc(100% - 2 * var(--ring));clip-path:var(--clip);object-fit:cover}";
  if (typeof document !== "undefined" && !document.getElementById("marker-shapes-css")) {
    const st = document.createElement("style");
    st.id = "marker-shapes-css";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  window.MarkerShapes = { BUILTIN, TEMPLATES: POLY, slug, parsePoints, pointsToClip, parseRows, clipFor, list, apply };
})();
