# Development Changelog

## 2025-04-21

### Added
- Re-added dark mode with theme toggle button in navigation (no alert popups)
- Added advanced left-to-right rainbow sweep animation for section headers
- Adjusted hero background image position to improve text visibility

### Changed
- Removed grid background pattern for cleaner look
- Changed "Home" to "Back to Top" in navigation
- Removed footer section for cleaner ending
- Fixed typing animation to prevent vertical jumps

### Fixed
- Theme toggle now works properly without annoying popups
- Section highlight animation now properly sweeps left to right across each character
- Ensured hero background image stays positioned correctly with cursor interactions

## 2025-04-20

### Added
- Embedded NCAS poster directly within NASA card
- Added typing animation with blinking cursor effect
- Created styling for NCAS list items 
- Added developer README.md

### Changed
- Enlarged about gallery images to 200x200px
- Renamed work section to experience section
- Changed NASA description from "built telemetry tools" to accurate mission descriptions 
- Removed dark mode toggle and theme
- Made experience cards full-width for better poster display
- Switched hero background image to personal photo
- Adjusted HTML structure for better readability

### Fixed
- Cursor now correctly blinks when idle, stays solid when typing
- Center-aligned section headers 
- Increased poster size for better readability
- Fixed AT3 program dates (Nov 2024 - Mar 2025)

## Development Helpers

### Local Testing Commands
```bash
# Start a local server
python3 -m http.server 8080

# View in browser at
http://localhost:8080
```

### Common Fixes
- If elements don't appear correctly, try hard refresh (Cmd+Shift+R)
- For JavaScript animation bugs, check console (Right-click > Inspect > Console)
- When updating embedded PDFs, clear browser cache to see changes

### Future Development Ideas
- Add image carousel for about gallery
- Implement smooth scrolling for better navigation
- Consider adding project section with actual project examples
