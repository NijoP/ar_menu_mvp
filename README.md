# AR Menu MVP

A Progressive Web App (PWA) demonstrating an Augmented Reality menu for food items using React, Vite, Three.js, and WebXR.

## features
- Procedural generation of 3D food models.
- Auto-generated menu data and QR code.
- "Rich Aesthetics" dark-mode UI.
- WebXR-powered AR view to place food items in the real world.
- Interactive 3D models (Rotation/Scaling).

## Prerequisites
- **Node.js**: Required to run the generation scripts and development server. [Download here](https://nodejs.org/).

## Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Generate 3D Models & Data**
    This step creates the procedural 3D models in `public/models` and the `src/data/menu.json` file.
    ```bash
    npm run generate:models
    ```

3.  **Generate QR Code**
    Creates a QR code for local access in `public/qr.png`.
    ```bash
    npm run generate:qr
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Usage

1.  Open the application in your browser (usually `http://localhost:5173`).
2.  **Desktop**: You will see the QR code and the menu list.
3.  **Mobile (AR)**: Scan the QR code with your phone (ensure both devices are on the same network or use a tunneling service like ngrok/localtunnel if strictly needed, though Vite exposes via IP with `--host`).
    - *Note for AR*: WebXR requires a secure context (HTTPS) or `localhost`. To test on mobile via local network, you might need to enable "WebXR Incubations" or use Chrome Port Forwarding via USB debugging, or deploy to a secure host (Vercel/Netlify).

## Architecture
- **Tech Stack**: React, Vite, Three.js, @react-three/fiber, @react-three/xr.
- **No Backend**: All data is static or procedurally generated at compile time.
- **Tools**: Located in `tools/` directory.

## Troubleshooting
- **"Node not recognized"**: Ensure Node.js is installed and added to your system PATH.
- **AR Button not showing**: Ensure your device supports WebXR (Chrome on Android 8+). iOS users (iPhone) need the *WebXR Viewer* app or valid USDZ fallback (this MVP focuses on WebXR).
