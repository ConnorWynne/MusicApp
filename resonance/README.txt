# Resonance brand assets

- `Resonance-original-master.png`: exact original image, preserved unchanged.
- `resonance-icon-master.png`: square launcher-friendly crop derived from the master artwork.
- `android-icons/`: density-sized legacy Android launcher PNGs.
- `resonance-splash.png`: centered artwork on a matching midnight background.
- `web/`: common web icon sizes.

Important: these are image assets only, not a replacement project. Before integration, check the existing Capacitor/Android asset setup so we update the right files rather than overwrite unrelated configuration. The Android adaptive foreground/background resources may be generated separately if the project uses adaptive icons.
