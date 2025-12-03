# LINE Rich Menu Curl Generator

A free online tool to visually design LINE Rich Menus and automatically generate executable curl commands.

**Demo Mode** - No Channel Access Token required. All operations run locally without sending any API requests.

## Features

- Visual editor for Rich Menu clickable areas
- Three action types: Message, Rich Menu Switch, Open URL
- Automatic image validation (size, format, dimensions)
- Rich Menu Alias management for menu switching
- One-click curl command generation
- Runs entirely in the browser - no data uploaded to servers

## Quick Start

Simply open `index.html` in your browser, or deploy to any static hosting service.

## Usage

### 1. Create Rich Menu

1. Click "Create Rich Menu"
2. Upload an image that meets the specifications
3. Drag on the image to draw clickable areas
4. Configure each area's action (Message / Rich Menu Switch / Open URL)
5. Enter the name and chat bar text
6. Click "Add to List"

### 2. Configure Aliases

To enable Rich Menu switching:

1. Navigate to "Alias Settings"
2. Click "Create Alias"
3. Enter an alias ID and select the corresponding Rich Menu

### 3. Generate Curl Commands

1. Click the "Generate Curl" button in the top right
2. Execute the curl commands in order
3. Replace `{channel access token}` with your actual Channel Access Token
4. Replace `{richMenuId_N}` with the richMenuId returned from the API

## Image Requirements

| Property | Specification |
|----------|---------------|
| Format | JPEG, PNG |
| Width | 800 - 2500 px |
| Height | Minimum 250 px |
| Aspect Ratio | Minimum 1.45 |
| File Size | Maximum 1 MB |

## File Structure

```
├── index.html        # Main page
├── styles.css        # Stylesheet
├── config.js         # Configuration
├── app.js            # Main application
├── imageHandler.js   # Image processing
├── areaSelector.js   # Area selector
└── README.md
```

## Local Development

No installation required. Simply open `index.html` in your browser.

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

Or use any HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

## Technical Details

- Pure JavaScript (Vanilla JS), no framework dependencies
- All data stored in browser memory
- Images temporarily stored as Base64
- Zero network requests

## Resources

- [LINE Messaging API - Rich Menu](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/)
- [Rich Menu API Reference](https://developers.line.biz/en/reference/messaging-api/#rich-menu)

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!
