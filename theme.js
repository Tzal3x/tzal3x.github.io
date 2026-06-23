// Theme selector: lets a visitor override the OS color scheme.
//
// By the time this runs, the small inline <head> script has already read the
// saved choice and set <html data-theme="…"> before the first paint (so there
// is no flash of the wrong palette). This file's job is purely the UI: build
// the segmented control, drop it into the nav, and keep it in sync.
//
// "system" means: follow the OS. We store that as the *absence* of a saved
// value, and the CSS media query takes over — including live OS day/night
// flips, which need no JS here because the variables recolor on their own.
(function () {
    "use strict";

    var STORAGE_KEY = "theme";
    var MODES = [
        { value: "system", label: "sys" },
        { value: "light", label: "light" },
        { value: "dark", label: "dark" },
    ];

    // The active mode is whatever <html data-theme> says; anything that isn't
    // an explicit light/dark choice counts as "system".
    function currentMode() {
        var t = document.documentElement.dataset.theme;
        return t === "light" || t === "dark" ? t : "system";
    }

    function applyMode(mode) {
        document.documentElement.dataset.theme = mode;
        try {
            if (mode === "system") localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, mode);
        } catch (e) {
            // Private-mode / disabled storage: the choice just won't persist.
        }
    }

    function build() {
        var group = document.createElement("div");
        group.className = "theme-toggle";
        group.setAttribute("role", "group");
        group.setAttribute("aria-label", "Color theme");

        var buttons = MODES.map(function (mode) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = mode.label;
            btn.dataset.themeValue = mode.value;
            btn.setAttribute("aria-label", "Theme: " + mode.value);
            btn.addEventListener("click", function () {
                applyMode(mode.value);
                syncPressed();
            });
            group.appendChild(btn);
            return btn;
        });

        function syncPressed() {
            var active = currentMode();
            buttons.forEach(function (btn) {
                var on = btn.dataset.themeValue === active;
                btn.setAttribute("aria-pressed", on ? "true" : "false");
            });
        }

        var row = document.createElement("div");
        row.className = "theme-toggle-row";
        row.appendChild(group);

        // Home is the footer, just under the copyright. Fall back to below the
        // primary nav if a page ever lacks a footer.
        var footer = document.querySelector("footer");
        if (footer) {
            footer.appendChild(row);
        } else {
            var nav = document.querySelector('nav[aria-label="Primary"]');
            if (!nav) return;
            nav.insertAdjacentElement("afterend", row);
        }
        syncPressed();
    }

    // `defer` already waits for parsing, but stay robust if loaded otherwise.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", build);
    } else {
        build();
    }
})();
