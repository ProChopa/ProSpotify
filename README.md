# ProSpotify
Theme for [Spicetify](https://github.com/spicetify/spicetify-cli) based on [DefaultDynamic](https://github.com/JulienMaille/spicetify-dynamic-theme) and [Hazy](https://github.com/Astromations/Hazy)

# Preview
![Preview)](https://github.com/ProChopa/ProSpotify/assets/112766478/d30893bf-24ef-4501-80e9-71909f786795)

# Install / Update
1. Download Release
2. Copy content folder **Themes** to your folder **Spicetify/Themes**
3. Add the 2 lines in **[Patch]** section of the config file (see details below)
4. Run file **Install Theme**

```ini
[Patch]
xpui.js_find_8008 = ,(\w+=)32,
xpui.js_repl_8008 = ,${1}28,
```
