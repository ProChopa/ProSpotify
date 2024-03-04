(function ProSpotify() {
  if (!(Spicetify.Player.data && Spicetify.Platform)) {
    setTimeout(ProSpotify, 100);
    return;
  }
  
  async function onSongChange() {
      fetchFadeTime(); // Call fetchFadeTime after songchange

      let album_uri = Spicetify.Player.data.item.metadata.album_uri;
      let bgImage = Spicetify.Player.data.item.metadata.image_url;
  
      if (album_uri !== undefined && !album_uri.includes("spotify:show")) {
          const albumInfo = await getAlbumInfo(album_uri.replace("spotify:album:", ""));
      } else if (Spicetify.Player.data.item.uri.includes("spotify:episode")) {
          // podcast
          bgImage = bgImage.replace("spotify:image:", "https://i.scdn.co/image/");
          
      } else if (Spicetify.Player.data.item.provider == "ad") {
          // ad
          return;
      } else {
          // When clicking a song from the homepage, songChange is fired with half empty metadata
          setTimeout(onSongChange, 200);
      }
      loopOptions("/")
      updateLyricsPageProperties();
  }
  Spicetify.Player.addEventListener("songchange", onSongChange);
  onSongChange();
  windowControls();
  controlDimensions();
  
  function windowControls() {
    function detectOS() {
      const userAgent = window.navigator.userAgent;
      
      if (userAgent.indexOf('Win') !== -1) {
        document.body.classList.add('windows');
      }
    }
    detectOS();
  }

  function controlDimensions() {
    Spicetify.Platform.PlayerAPI._prefs.get({ key: 'app.browser.zoom-level' }).then((value) => {
      const  zoomLevel = value.entries['app.browser.zoom-level'].number;
        console.log(zoomLevel)
      const multiplier = zoomLevel != 0 ? zoomLevel/50 : 0;
        console.log(multiplier)
      constant = 0.912872807

        final_width = 135 * (constant**(multiplier));
        final_height = 31 * (constant**(multiplier));
        document.documentElement.style.setProperty("--control-width", Math.abs(final_width) + "px");
        document.documentElement.style.setProperty("--control-height", Math.abs(final_height) + "px");
        console.log("its done")
        console.log(multiplier)
        console.log(zoomLevel)
    });
  }
  window.addEventListener('resize', function() {
    controlDimensions();
  });

function waitForElement(els, func, timeout = 100) {
    const queries = els.map((el) => document.querySelector(el));
    if (queries.every((a) => a)) {
        func(queries);
    } else if (timeout > 0) {
        setTimeout(waitForElement, 300, els, func, --timeout);
    }
}

function getAlbumInfo(id) {
    return Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${id}`);
}

function getEpisodeInfo(id) {
    return Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/episodes/${id}`);
}

function isLight(hex) {
    var [r, g, b] = hexToRgb(hex).map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

function hexToRgb(hex) {
    var bigint = parseInt(hex.replace("#", ""), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

function rgbToHex([r, g, b]) {
    const rgb = (r << 16) | (g << 8) | (b << 0);
    return "#" + (0x1000000 + rgb).toString(16).slice(1);
}

function lightenDarkenColor(h, p) {
    return (
        "#" +
        [1, 3, 5]
            .map((s) => parseInt(h.substr(s, 2), 16))
            .map((c) => parseInt((c * (100 + p)) / 100))
            .map((c) => (c < 255 ? c : 255))
            .map((c) => c.toString(16).padStart(2, "0"))
            .join("")
    );
}

function rgbToHsl([r, g, b]) {
    (r /= 255), (g /= 255), (b /= 255);
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h,
        s,
        l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb([h, s, l]) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
}

function setLightness(hex, lightness) {
    hsl = rgbToHsl(hexToRgb(hex));
    hsl[2] = lightness;
    return rgbToHex(hslToRgb(hsl));
}

let textColor = getComputedStyle(document.documentElement).getPropertyValue("--spice-text");
let textColorBg = getComputedStyle(document.documentElement).getPropertyValue("--spice-main");

function setRootColor(name, colHex) {
    let root = document.documentElement;
    if (root === null) return;
    root.style.setProperty("--spice-" + name, colHex);
    root.style.setProperty("--spice-rgb-" + name, hexToRgb(colHex).join(","));
}

function toggleDark(setDark) {
    if (setDark === undefined) setDark = isLight(textColorBg);

    document.documentElement.style.setProperty("--is_light", setDark ? 0 : 1);
    textColorBg = setDark ? "#0A0A0A" : "#FAFAFA";

    setRootColor("main", textColorBg);
    setRootColor("sidebar", textColorBg);
    setRootColor("player", textColorBg);
    setRootColor("shadow", textColorBg);
    setRootColor("card", setDark ? "#040404" : "#ECECEC");
    setRootColor("subtext", setDark ? "#EAEAEA" : "#3D3D3D");
    setRootColor("main-elevated", setDark ? "#303030" : "#DDDDDD");
    setRootColor("notification", setDark ? "#303030" : "#DDDDDD");
    setRootColor("highlight-elevated", setDark ? "#303030" : "#DDDDDD");

    updateColors(textColor);
}

/* Init with current system light/dark mode */
let systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
toggleDark(systemDark);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    toggleDark(e.matches);
});

waitForElement([".main-topBar-container"], (queries) => {
    // Add activator on top bar
    const div = document.createElement("div");
    div.id = "main-topBar-moon-div";
    queries[0].insertBefore(div, queries[0].querySelector(".main-userWidget-box"));

    const button = document.createElement("button");
    button.id = "main-topBar-moon-button";
    button.classList.add("main-topBar-buddyFeed");
    button.setAttribute("title", "Light/Dark");
    button.onclick = () => {
        toggleDark();
    };
    button.innerHTML = `<svg role="img" viewBox="0 0 16 16" height="16" width="16"><path fill="currentColor" d="M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786zm1.616 1.945a7 7 0 01-7.678 7.678 5.5 5.5 0 107.678-7.678z"></path></svg>`;
    div.append(button);
});

function updateColors(textColHex) {
    if (textColHex == undefined) return registerCoverListener();

    let isLightBg = isLight(textColorBg);
    if (isLightBg) textColHex = lightenDarkenColor(textColHex, -15); // vibrant color is always too bright for white bg mode

    let darkColHex = lightenDarkenColor(textColHex, isLightBg ? 12 : -20);
    let darkerColHex = lightenDarkenColor(textColHex, isLightBg ? 30 : -40);
    let softHighlightHex = setLightness(textColHex, isLightBg ? 0.9 : 0.14);
    setRootColor("text", textColHex);
    setRootColor("button", darkerColHex);
    setRootColor("button-active", darkColHex);
    setRootColor("selected-row", darkerColHex);
    setRootColor("tab-active", softHighlightHex);
    setRootColor("button-disabled", softHighlightHex);
    let softerHighlightHex = setLightness(textColHex, isLightBg ? 0.9 : 0.1);
    setRootColor("highlight", softerHighlightHex);

    // compute hue rotation to change spotify green to main color
    let rgb = hexToRgb(textColHex);
    let m = `url('data:image/svg+xml;utf8,
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="recolor" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="
            0 0 0 0 ${rgb[0] / 255}
            0 0 0 0 ${rgb[1] / 255}
            0 0 0 0 ${rgb[2] / 255}
            0 0 0 1 0
          "/>
        </filter>
      </svg>
      #recolor')`;
    document.documentElement.style.setProperty("--colormatrix", encodeURI(m));
}

let nearArtistSpanText = "";
async function songchange() {
    if (!document.querySelector(".main-trackInfo-container")) return setTimeout(songchange, 300);
    try {
        // warning popup
        if (Spicetify.Platform.PlatformData.client_version_triple < "1.1.68") Spicetify.showNotification(`Your version of Spotify ${Spicetify.Platform.PlatformData.client_version_triple}) is un-supported`);
    } catch (err) {
        console.error(err);
    }

    let album_uri = Spicetify.Player.data.item.metadata.album_uri;
    let bgImage = Spicetify.Player.data.item.metadata.image_url;
    if (!bgImage) {
        bgImage = "/images/tracklist-row-song-fallback.svg";
        textColor = "#1db954";
        updateColors(textColor);
    }

    if (album_uri && !album_uri.includes("spotify:show")) {
        const albumInfo = await getAlbumInfo(album_uri.replace("spotify:album:", ""));
        let album_date = new Date(albumInfo.release_date);
        let recent_date = new Date();
        recent_date.setMonth(recent_date.getMonth() - 6);
        album_date = album_date.toLocaleString("default", album_date > recent_date ? { year: "numeric", month: "short" } : { year: "numeric" });
        nearArtistSpanText = `
            <span>
                <span draggable="true">
                    <a draggable="false" dir="auto" href="${album_uri}">${Spicetify.Player.data.item.metadata.album_title}</a>
                </span>
            </span>
            <span> • ${album_date}</span>
        `;
    } else if (Spicetify.Player.data.item.type === "episode") {
        // podcast
        const episodeInfo = await getEpisodeInfo(Spicetify.Player.data.item.uri.replace("spotify:episode:", ""));
        let podcast_date = new Date(episodeInfo.release_date);
        podcast_date = podcast_date.toLocaleString("default", { year: "numeric", month: "short" });
        bgImage = bgImage.replace("spotify:image:", "https://i.scdn.co/image/");
        nearArtistSpanText = `
            <span>
                <span draggable="true">
                    <a draggable="false" dir="auto" href="${album_uri}">${Spicetify.Player.data.item.metadata["show.publisher"]}</a>
                </span>
            </span>
            <span> • ${podcast_date}</span>
        `;
    } else if (Spicetify.Player.data.item.isLocal) {
        // local file
        nearArtistSpanText = Spicetify.Player.data.item.metadata.album_title;
    } else if (Spicetify.Player.data.item.provider == "ad") {
        // ad
        nearArtistSpanText.innerHTML = "Advertisement";
        return;
    } else {
        // When clicking a song from the homepage, songChange is fired with half empty metadata
        // todo: retry only once?
        setTimeout(songchange, 200);
    }

    if (!document.querySelector("#main-trackInfo-year")) {
        waitForElement([".main-trackInfo-container:not(#upcomingSongDiv)"], (queries) => {
            nearArtistSpan = document.createElement("div");
            nearArtistSpan.id = "main-trackInfo-year";
            nearArtistSpan.classList.add("main-trackInfo-release", "standalone-ellipsis-one-line", "main-type-finale");
            nearArtistSpan.innerHTML = nearArtistSpanText;
            queries[0].append(nearArtistSpan);
        });
    } else {
        nearArtistSpan.innerHTML = nearArtistSpanText;
    }
    document.documentElement.style.setProperty("--image_url", `url("${bgImage}")`);
    registerCoverListener();
}

Spicetify.Player.addEventListener("songchange", songchange);

function pickCoverColor(img) {
    if (!img.currentSrc.startsWith("spotify:")) return;
    if (img.complete) {
        textColor = "#1db954";
        try {
            var swatches = new Vibrant(img, 12).swatches();
            cols = isLight(textColorBg) ? ["Vibrant", "DarkVibrant", "Muted", "LightVibrant"] : ["Vibrant", "LightVibrant", "Muted", "DarkVibrant"];
            for (var col in cols)
                if (swatches[cols[col]]) {
                    textColor = swatches[cols[col]].getHex();
                    break;
                }
        } catch (err) {
            console.error(err);
        }
    }
    updateColors(textColor);
}

var coverListener;
function registerCoverListener() {
    const img = document.querySelector(".main-image-image.cover-art-image");
    if (!img) return setTimeout(registerCoverListener, 250); // Check if image exists
    if (!img.complete) return img.addEventListener("load", registerCoverListener); // Check if image is loaded
    pickCoverColor(img);

    if (coverListener != null) {
        coverListener.disconnect();
        coverListener = null;
    }

    coverListener = new MutationObserver((muts) => {
        const img = document.querySelector(".main-image-image.cover-art-image");
        if (!img) return registerCoverListener();
        pickCoverColor(img);
    });
    coverListener.observe(img, {
        attributes: true,
        attributeFilter: ["src"]
    });
}
registerCoverListener();

document.documentElement.style.setProperty("--warning_message", " ");

(function e$$0(x, z, l) {
    function h(p, b) {
        if (!z[p]) {
            if (!x[p]) {
                var a = "function" == typeof require && require;
                if (!b && a) return a(p, !0);
                if (g) return g(p, !0);
                a = Error("Cannot find module '" + p + "'");
                throw ((a.code = "MODULE_NOT_FOUND"), a);
            }
            a = z[p] = { exports: {} };
            x[p][0].call(
                a.exports,
                function (a) {
                    var b = x[p][1][a];
                    return h(b ? b : a);
                },
                a,
                a.exports,
                e$$0,
                x,
                z,
                l
            );
        }
        return z[p].exports;
    }
    for (var g = "function" == typeof require && require, w = 0; w < l.length; w++) h(l[w]);
    return h;
})(
    {
        1: [
            function (A, x, z) {
                if (!l)
                    var l = {
                        map: function (h, g) {
                            var l = {};
                            return g
                                ? h.map(function (h, b) {
                                      l.index = b;
                                      return g.call(l, h);
                                  })
                                : h.slice();
                        },
                        naturalOrder: function (h, g) {
                            return h < g ? -1 : h > g ? 1 : 0;
                        },
                        sum: function (h, g) {
                            var l = {};
                            return h.reduce(
                                g
                                    ? function (h, b, a) {
                                          l.index = a;
                                          return h + g.call(l, b);
                                      }
                                    : function (h, b) {
                                          return h + b;
                                      },
                                0
                            );
                        },
                        max: function (h, g) {
                            return Math.max.apply(null, g ? l.map(h, g) : h);
                        }
                    };
                A = (function () {
                    function h(f, c, a) {
                        return (f << (2 * d)) + (c << d) + a;
                    }
                    function g(f) {
                        function c() {
                            a.sort(f);
                            b = !0;
                        }
                        var a = [],
                            b = !1;
                        return {
                            push: function (c) {
                                a.push(c);
                                b = !1;
                            },
                            peek: function (f) {
                                b || c();
                                void 0 === f && (f = a.length - 1);
                                return a[f];
                            },
                            pop: function () {
                                b || c();
                                return a.pop();
                            },
                            size: function () {
                                return a.length;
                            },
                            map: function (c) {
                                return a.map(c);
                            },
                            debug: function () {
                                b || c();
                                return a;
                            }
                        };
                    }
                    function w(f, c, a, b, m, e, q) {
                        this.r1 = f;
                        this.r2 = c;
                        this.g1 = a;
                        this.g2 = b;
                        this.b1 = m;
                        this.b2 = e;
                        this.histo = q;
                    }
                    function p() {
                        this.vboxes = new g(function (f, c) {
                            return l.naturalOrder(f.vbox.count() * f.vbox.volume(), c.vbox.count() * c.vbox.volume());
                        });
                    }
                    function b(f) {
                        var c = Array(1 << (3 * d)),
                            a,
                            b,
                            m,
                            r;
                        f.forEach(function (f) {
                            b = f[0] >> e;
                            m = f[1] >> e;
                            r = f[2] >> e;
                            a = h(b, m, r);
                            c[a] = (c[a] || 0) + 1;
                        });
                        return c;
                    }
                    function a(f, c) {
                        var a = 1e6,
                            b = 0,
                            m = 1e6,
                            d = 0,
                            q = 1e6,
                            n = 0,
                            h,
                            k,
                            l;
                        f.forEach(function (c) {
                            h = c[0] >> e;
                            k = c[1] >> e;
                            l = c[2] >> e;
                            h < a ? (a = h) : h > b && (b = h);
                            k < m ? (m = k) : k > d && (d = k);
                            l < q ? (q = l) : l > n && (n = l);
                        });
                        return new w(a, b, m, d, q, n, c);
                    }
                    function n(a, c) {
                        function b(a) {
                            var f = a + "1";
                            a += "2";
                            var v, d, m, e;
                            d = 0;
                            for (k = c[f]; k <= c[a]; k++)
                                if (y[k] > n / 2) {
                                    m = c.copy();
                                    e = c.copy();
                                    v = k - c[f];
                                    d = c[a] - k;
                                    for (v = v <= d ? Math.min(c[a] - 1, ~~(k + d / 2)) : Math.max(c[f], ~~(k - 1 - v / 2)); !y[v]; ) v++;
                                    for (d = s[v]; !d && y[v - 1]; ) d = s[--v];
                                    m[a] = v;
                                    e[f] = m[a] + 1;
                                    return [m, e];
                                }
                        }
                        if (c.count()) {
                            var d = c.r2 - c.r1 + 1,
                                m = c.g2 - c.g1 + 1,
                                e = l.max([d, m, c.b2 - c.b1 + 1]);
                            if (1 == c.count()) return [c.copy()];
                            var n = 0,
                                y = [],
                                s = [],
                                k,
                                g,
                                t,
                                u,
                                p;
                            if (e == d)
                                for (k = c.r1; k <= c.r2; k++) {
                                    u = 0;
                                    for (g = c.g1; g <= c.g2; g++) for (t = c.b1; t <= c.b2; t++) (p = h(k, g, t)), (u += a[p] || 0);
                                    n += u;
                                    y[k] = n;
                                }
                            else if (e == m)
                                for (k = c.g1; k <= c.g2; k++) {
                                    u = 0;
                                    for (g = c.r1; g <= c.r2; g++) for (t = c.b1; t <= c.b2; t++) (p = h(g, k, t)), (u += a[p] || 0);
                                    n += u;
                                    y[k] = n;
                                }
                            else
                                for (k = c.b1; k <= c.b2; k++) {
                                    u = 0;
                                    for (g = c.r1; g <= c.r2; g++) for (t = c.g1; t <= c.g2; t++) (p = h(g, t, k)), (u += a[p] || 0);
                                    n += u;
                                    y[k] = n;
                                }
                            y.forEach(function (a, c) {
                                s[c] = n - a;
                            });
                            return e == d ? b("r") : e == m ? b("g") : b("b");
                        }
                    }
                    var d = 5,
                        e = 8 - d;
                    w.prototype = {
                        volume: function (a) {
                            if (!this._volume || a) this._volume = (this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1);
                            return this._volume;
                        },
                        count: function (a) {
                            var c = this.histo;
                            if (!this._count_set || a) {
                                a = 0;
                                var b, d, n;
                                for (b = this.r1; b <= this.r2; b++) for (d = this.g1; d <= this.g2; d++) for (n = this.b1; n <= this.b2; n++) (index = h(b, d, n)), (a += c[index] || 0);
                                this._count = a;
                                this._count_set = !0;
                            }
                            return this._count;
                        },
                        copy: function () {
                            return new w(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histo);
                        },
                        avg: function (a) {
                            var c = this.histo;
                            if (!this._avg || a) {
                                a = 0;
                                var b = 1 << (8 - d),
                                    n = 0,
                                    e = 0,
                                    g = 0,
                                    q,
                                    l,
                                    s,
                                    k;
                                for (l = this.r1; l <= this.r2; l++) for (s = this.g1; s <= this.g2; s++) for (k = this.b1; k <= this.b2; k++) (q = h(l, s, k)), (q = c[q] || 0), (a += q), (n += q * (l + 0.5) * b), (e += q * (s + 0.5) * b), (g += q * (k + 0.5) * b);
                                this._avg = a ? [~~(n / a), ~~(e / a), ~~(g / a)] : [~~((b * (this.r1 + this.r2 + 1)) / 2), ~~((b * (this.g1 + this.g2 + 1)) / 2), ~~((b * (this.b1 + this.b2 + 1)) / 2)];
                            }
                            return this._avg;
                        },
                        contains: function (a) {
                            var c = a[0] >> e;
                            gval = a[1] >> e;
                            bval = a[2] >> e;
                            return c >= this.r1 && c <= this.r2 && gval >= this.g1 && gval <= this.g2 && bval >= this.b1 && bval <= this.b2;
                        }
                    };
                    p.prototype = {
                        push: function (a) {
                            this.vboxes.push({ vbox: a, color: a.avg() });
                        },
                        palette: function () {
                            return this.vboxes.map(function (a) {
                                return a.color;
                            });
                        },
                        size: function () {
                            return this.vboxes.size();
                        },
                        map: function (a) {
                            for (var c = this.vboxes, b = 0; b < c.size(); b++) if (c.peek(b).vbox.contains(a)) return c.peek(b).color;
                            return this.nearest(a);
                        },
                        nearest: function (a) {
                            for (var c = this.vboxes, b, n, d, e = 0; e < c.size(); e++) if (((n = Math.sqrt(Math.pow(a[0] - c.peek(e).color[0], 2) + Math.pow(a[1] - c.peek(e).color[1], 2) + Math.pow(a[2] - c.peek(e).color[2], 2))), n < b || void 0 === b)) (b = n), (d = c.peek(e).color);
                            return d;
                        },
                        forcebw: function () {
                            var a = this.vboxes;
                            a.sort(function (a, b) {
                                return l.naturalOrder(l.sum(a.color), l.sum(b.color));
                            });
                            var b = a[0].color;
                            5 > b[0] && 5 > b[1] && 5 > b[2] && (a[0].color = [0, 0, 0]);
                            var b = a.length - 1,
                                n = a[b].color;
                            251 < n[0] && 251 < n[1] && 251 < n[2] && (a[b].color = [255, 255, 255]);
                        }
                    };
                    return {
                        quantize: function (d, c) {
                            function e(a, b) {
                                for (var c = 1, d = 0, f; 1e3 > d; )
                                    if (((f = a.pop()), f.count())) {
                                        var m = n(h, f);
                                        f = m[0];
                                        m = m[1];
                                        if (!f) break;
                                        a.push(f);
                                        m && (a.push(m), c++);
                                        if (c >= b) break;
                                        if (1e3 < d++) break;
                                    } else a.push(f), d++;
                            }
                            if (!d.length || 2 > c || 256 < c) return !1;
                            var h = b(d),
                                m = 0;
                            h.forEach(function () {
                                m++;
                            });
                            var r = a(d, h),
                                q = new g(function (a, b) {
                                    return l.naturalOrder(a.count(), b.count());
                                });
                            q.push(r);
                            e(q, 0.75 * c);
                            for (
                                r = new g(function (a, b) {
                                    return l.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
                                });
                                q.size();

                            )
                                r.push(q.pop());
                            e(r, c - r.size());
                            for (q = new p(); r.size(); ) q.push(r.pop());
                            return q;
                        }
                    };
                })();
                x.exports = A.quantize;
            },
            {}
        ],
        2: [
            function (A, x, z) {
                (function () {
                    var l,
                        h,
                        g,
                        w = function (b, a) {
                            return function () {
                                return b.apply(a, arguments);
                            };
                        },
                        p = [].slice;
                    window.Swatch = h = (function () {
                        function b(a, b) {
                            this.rgb = a;
                            this.population = b;
                        }
                        b.prototype.hsl = void 0;
                        b.prototype.rgb = void 0;
                        b.prototype.population = 1;
                        b.yiq = 0;
                        b.prototype.getHsl = function () {
                            return this.hsl ? this.hsl : (this.hsl = g.rgbToHsl(this.rgb[0], this.rgb[1], this.rgb[2]));
                        };
                        b.prototype.getPopulation = function () {
                            return this.population;
                        };
                        b.prototype.getRgb = function () {
                            return this.rgb;
                        };
                        b.prototype.getHex = function () {
                            return "#" + (16777216 + (this.rgb[0] << 16) + (this.rgb[1] << 8) + this.rgb[2]).toString(16).slice(1, 7);
                        };
                        b.prototype.getTitleTextColor = function () {
                            this._ensureTextColors();
                            return 200 > this.yiq ? "#fff" : "#000";
                        };
                        b.prototype.getBodyTextColor = function () {
                            this._ensureTextColors();
                            return 150 > this.yiq ? "#fff" : "#000";
                        };
                        b.prototype._ensureTextColors = function () {
                            if (!this.yiq) return (this.yiq = (299 * this.rgb[0] + 587 * this.rgb[1] + 114 * this.rgb[2]) / 1e3);
                        };
                        return b;
                    })();
                    window.Vibrant = g = (function () {
                        function b(a, b, d) {
                            this.swatches = w(this.swatches, this);
                            var e, f, c, g, p, m, r, q;
                            "undefined" === typeof b && (b = 64);
                            "undefined" === typeof d && (d = 5);
                            p = new l(a);
                            r = p.getImageData().data;
                            m = p.getPixelCount();
                            a = [];
                            for (g = 0; g < m; ) (e = 4 * g), (q = r[e + 0]), (c = r[e + 1]), (f = r[e + 2]), (e = r[e + 3]), 125 <= e && ((250 < q && 250 < c && 250 < f) || a.push([q, c, f])), (g += d);
                            this._swatches = this.quantize(a, b).vboxes.map(
                                (function (a) {
                                    return function (a) {
                                        return new h(a.color, a.vbox.count());
                                    };
                                })(this)
                            );
                            this.maxPopulation = this.findMaxPopulation;
                            this.generateVarationColors();
                            this.generateEmptySwatches();
                            p.removeCanvas();
                        }
                        b.prototype.quantize = A("quantize");
                        b.prototype._swatches = [];
                        b.prototype.TARGET_DARK_LUMA = 0.26;
                        b.prototype.MAX_DARK_LUMA = 0.45;
                        b.prototype.MIN_LIGHT_LUMA = 0.55;
                        b.prototype.TARGET_LIGHT_LUMA = 0.74;
                        b.prototype.MIN_NORMAL_LUMA = 0.3;
                        b.prototype.TARGET_NORMAL_LUMA = 0.5;
                        b.prototype.MAX_NORMAL_LUMA = 0.7;
                        b.prototype.TARGET_MUTED_SATURATION = 0.3;
                        b.prototype.MAX_MUTED_SATURATION = 0.4;
                        b.prototype.TARGET_VIBRANT_SATURATION = 1;
                        b.prototype.MIN_VIBRANT_SATURATION = 0.35;
                        b.prototype.WEIGHT_SATURATION = 3;
                        b.prototype.WEIGHT_LUMA = 6;
                        b.prototype.WEIGHT_POPULATION = 1;
                        b.prototype.VibrantSwatch = void 0;
                        b.prototype.MutedSwatch = void 0;
                        b.prototype.DarkVibrantSwatch = void 0;
                        b.prototype.DarkMutedSwatch = void 0;
                        b.prototype.LightVibrantSwatch = void 0;
                        b.prototype.LightMutedSwatch = void 0;
                        b.prototype.HighestPopulation = 0;
                        b.prototype.generateVarationColors = function () {
                            this.VibrantSwatch = this.findColorVariation(this.TARGET_NORMAL_LUMA, this.MIN_NORMAL_LUMA, this.MAX_NORMAL_LUMA, this.TARGET_VIBRANT_SATURATION, this.MIN_VIBRANT_SATURATION, 1);
                            this.LightVibrantSwatch = this.findColorVariation(this.TARGET_LIGHT_LUMA, this.MIN_LIGHT_LUMA, 1, this.TARGET_VIBRANT_SATURATION, this.MIN_VIBRANT_SATURATION, 1);
                            this.DarkVibrantSwatch = this.findColorVariation(this.TARGET_DARK_LUMA, 0, this.MAX_DARK_LUMA, this.TARGET_VIBRANT_SATURATION, this.MIN_VIBRANT_SATURATION, 1);
                            this.MutedSwatch = this.findColorVariation(this.TARGET_NORMAL_LUMA, this.MIN_NORMAL_LUMA, this.MAX_NORMAL_LUMA, this.TARGET_MUTED_SATURATION, 0, this.MAX_MUTED_SATURATION);
                            this.LightMutedSwatch = this.findColorVariation(this.TARGET_LIGHT_LUMA, this.MIN_LIGHT_LUMA, 1, this.TARGET_MUTED_SATURATION, 0, this.MAX_MUTED_SATURATION);
                            return (this.DarkMutedSwatch = this.findColorVariation(this.TARGET_DARK_LUMA, 0, this.MAX_DARK_LUMA, this.TARGET_MUTED_SATURATION, 0, this.MAX_MUTED_SATURATION));
                        };
                        b.prototype.generateEmptySwatches = function () {
                            var a;
                            void 0 === this.VibrantSwatch && void 0 !== this.DarkVibrantSwatch && ((a = this.DarkVibrantSwatch.getHsl()), (a[2] = this.TARGET_NORMAL_LUMA), (this.VibrantSwatch = new h(b.hslToRgb(a[0], a[1], a[2]), 0)));
                            if (void 0 === this.DarkVibrantSwatch && void 0 !== this.VibrantSwatch) return (a = this.VibrantSwatch.getHsl()), (a[2] = this.TARGET_DARK_LUMA), (this.DarkVibrantSwatch = new h(b.hslToRgb(a[0], a[1], a[2]), 0));
                        };
                        b.prototype.findMaxPopulation = function () {
                            var a, b, d, e, f;
                            d = 0;
                            e = this._swatches;
                            a = 0;
                            for (b = e.length; a < b; a++) (f = e[a]), (d = Math.max(d, f.getPopulation()));
                            return d;
                        };
                        b.prototype.findColorVariation = function (a, b, d, e, f, c) {
                            var g, h, m, l, q, p, s, k;
                            l = void 0;
                            q = 0;
                            p = this._swatches;
                            g = 0;
                            for (h = p.length; g < h; g++) if (((k = p[g]), (s = k.getHsl()[1]), (m = k.getHsl()[2]), s >= f && s <= c && m >= b && m <= d && !this.isAlreadySelected(k) && ((m = this.createComparisonValue(s, e, m, a, k.getPopulation(), this.HighestPopulation)), void 0 === l || m > q))) (l = k), (q = m);
                            return l;
                        };
                        b.prototype.createComparisonValue = function (a, b, d, e, f, c) {
                            return this.weightedMean(this.invertDiff(a, b), this.WEIGHT_SATURATION, this.invertDiff(d, e), this.WEIGHT_LUMA, f / c, this.WEIGHT_POPULATION);
                        };
                        b.prototype.invertDiff = function (a, b) {
                            return 1 - Math.abs(a - b);
                        };
                        b.prototype.weightedMean = function () {
                            var a, b, d, e, f, c;
                            f = 1 <= arguments.length ? p.call(arguments, 0) : [];
                            for (a = d = b = 0; a < f.length; ) (e = f[a]), (c = f[a + 1]), (b += e * c), (d += c), (a += 2);
                            return b / d;
                        };
                        b.prototype.swatches = function () {
                            return { Vibrant: this.VibrantSwatch, Muted: this.MutedSwatch, DarkVibrant: this.DarkVibrantSwatch, DarkMuted: this.DarkMutedSwatch, LightVibrant: this.LightVibrantSwatch, LightMuted: this.LightMuted };
                        };
                        b.prototype.isAlreadySelected = function (a) {
                            return this.VibrantSwatch === a || this.DarkVibrantSwatch === a || this.LightVibrantSwatch === a || this.MutedSwatch === a || this.DarkMutedSwatch === a || this.LightMutedSwatch === a;
                        };
                        b.rgbToHsl = function (a, b, d) {
                            var e, f, c, g, h;
                            a /= 255;
                            b /= 255;
                            d /= 255;
                            g = Math.max(a, b, d);
                            h = Math.min(a, b, d);
                            f = void 0;
                            c = (g + h) / 2;
                            if (g === h) f = h = 0;
                            else {
                                e = g - h;
                                h = 0.5 < c ? e / (2 - g - h) : e / (g + h);
                                switch (g) {
                                    case a:
                                        f = (b - d) / e + (b < d ? 6 : 0);
                                        break;
                                    case b:
                                        f = (d - a) / e + 2;
                                        break;
                                    case d:
                                        f = (a - b) / e + 4;
                                }
                                f /= 6;
                            }
                            return [f, h, c];
                        };
                        b.hslToRgb = function (a, b, d) {
                            var e, f, c;
                            e = f = c = void 0;
                            e = function (a, b, c) {
                                0 > c && (c += 1);
                                1 < c && (c -= 1);
                                return c < 1 / 6 ? a + 6 * (b - a) * c : 0.5 > c ? b : c < 2 / 3 ? a + (b - a) * (2 / 3 - c) * 6 : a;
                            };
                            0 === b ? (c = f = e = d) : ((b = 0.5 > d ? d * (1 + b) : d + b - d * b), (d = 2 * d - b), (c = e(d, b, a + 1 / 3)), (f = e(d, b, a)), (e = e(d, b, a - 1 / 3)));
                            return [255 * c, 255 * f, 255 * e];
                        };
                        return b;
                    })();
                    window.CanvasImage = l = (function () {
                        function b(a) {
                            this.canvas = document.createElement("canvas");
                            this.context = this.canvas.getContext("2d");
                            document.body.appendChild(this.canvas);
                            this.width = this.canvas.width = a.width;
                            this.height = this.canvas.height = a.height;
                            this.context.drawImage(a, 0, 0, this.width, this.height);
                        }
                        b.prototype.clear = function () {
                            return this.context.clearRect(0, 0, this.width, this.height);
                        };
                        b.prototype.update = function (a) {
                            return this.context.putImageData(a, 0, 0);
                        };
                        b.prototype.getPixelCount = function () {
                            return this.width * this.height;
                        };
                        b.prototype.getImageData = function () {
                            return this.context.getImageData(0, 0, this.width, this.height);
                        };
                        b.prototype.removeCanvas = function () {
                            return this.canvas.parentNode.removeChild(this.canvas);
                        };
                        return b;
                    })();
                }).call(this);
            },
            { quantize: 1 }
        ]
    },
    {},
    [2]
);
