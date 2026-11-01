# Puppet menu demo

Open `/plushTest/` from the site, or serve `public/` with a local HTTP server.

Click the puppet or **Open my menu** to reveal navigation and focus search. Search filters the five menu destinations. Tab reaches matching links, Enter in search opens the first match, and Escape closes the menu and returns focus to the puppet button. Navigation remains available when WebGL or the model fails.

`puppet.glb` was converted from the supplied `puppetModel.usdz`, preserving its four mesh parts and embedded color textures. The source has no skeleton or animation clips. The character turns and leans toward menu choices as a whole; it does not have independent arm animation. Reduced motion disables idle motion and makes turns immediate.

The browser loads Three.js 0.160.0 from jsDelivr, as the original demo did. Search runs locally and covers menu labels, not project content.

## Validation

JavaScript syntax, repository lint, and DOM interaction checks passed. Checks covered closed link visibility, opening through the character and menu controls, search focus, case insensitive filtering, empty results, resume destination, Escape, and reset on close.

Full site build requires the existing Supabase environment configuration. Browser visual verification was unavailable because the browser download failed in the execution environment.
