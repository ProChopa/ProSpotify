# ProSpotify
Theme for [Spicetify](https://github.com/spicetify/spicetify-cli) based on [DefaultDynamic](https://github.com/JulienMaille/spicetify-dynamic-theme) and [Hazy](https://github.com/Astromations/Hazy) with Auto-Update

# Preview
![Preview](https://prochopa.github.io/ProSpotify/ProSpotify.png)

# Install / Update
1. Download [ProSpotify](https://github.com/ProChopa/ProSpotify/releases/download/Release/ProSpotify.rar)
2. Copy content folder `Themes` to your folder `Spicetify/Themes`
3. Add the 2 lines in `[Patch]` section of the config file (see details below)
4. Run file `Install Theme`

```ini
[Patch]
xpui.js_find_8008 = ,(\w+=)32,
xpui.js_repl_8008 = ,${1}28,
```
