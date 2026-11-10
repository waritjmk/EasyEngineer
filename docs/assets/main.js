// Board: the LED mirrors the button, like digitalWrite(LED, digitalRead(BTN))
(function () {
  var board = document.querySelector("[data-board]");
  if (board) {
    var btn = board.querySelector("button");
    var scope = board.parentNode;
    var btnOut = scope.querySelector("[data-btn]");
    var ledOut = scope.querySelector("[data-led]");
    var last = 0;
    var set = function (on) {
      last = performance.now();
      if (board.classList.contains("is-on") === on) return;
      board.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
      btnOut.textContent = on ? "HIGH" : "LOW";
      ledOut.textContent = on ? board.dataset.on : board.dataset.off;
    };
    btn.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      set(true);
    });
    ["pointerup", "pointercancel", "lostpointercapture", "blur"].forEach(function (t) {
      btn.addEventListener(t, function () { set(false); });
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) set(true); }
    });
    btn.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") set(false);
    });
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    // Assistive tech that only sends "click" (no pointer or key events): give a short pulse
    btn.addEventListener("click", function () {
      if (performance.now() - last < 400) return;
      set(true);
      setTimeout(function () { set(false); }, 900);
    });
  }

  // Quiet scroll reveal (transform + opacity only). CSS ignores it under reduced motion.
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }
})();
