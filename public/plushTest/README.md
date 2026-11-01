# Puppet menu demo

Open `/plushTest/` from the site, or serve `public/` with a local HTTP server.

Click the puppet or **Open my menu** to reveal navigation and focus search. Search filters the five menu destinations. Tab reaches matching links, Enter in search opens the first match, and Escape closes the menu and returns focus to the puppet button. Navigation remains available when WebGL or the model fails.

The character comes from the supplied `dancingpuppit (3).zip`. `puppet-dance.fbx` includes a skeleton and a 12.37 second dance clip. Opening the menu plays a short greeting from that clip. Typing settles the character into its initial pose. **Dance** plays the full loop; **Stop dancing** blends back to the initial pose. The character turns toward menu choices. Reduced motion disables automatic greetings and head movement, while the explicit Dance control remains available.

The FBX references old texture paths. The loader maps four available textures to the supplied files and uses a solid tongue material for the missing tongue texture. It does not request the old paths. The original static USDZ is superseded by this animated asset.

The browser loads Three.js 0.160.0 from jsDelivr, as the original demo did. Search runs locally and covers menu labels, not project content. This demo retains the existing PopIT styling.

## Validation

JavaScript syntax, repository lint, and DOM interaction checks passed. Checks covered closed link visibility, opening through the character and menu controls, search focus, case insensitive filtering, empty results, resume destination, Escape, and reset on close. The FBX parsed successfully with Three.js; its skeleton, animation duration, and sampled animated bounds were checked. The camera adapts to narrow screens to accommodate the dance.

Full site build requires the existing Supabase environment configuration. Browser visual verification was unavailable because the browser download failed in the execution environment.
