const { app, BrowserWindow, Menu, shell } = require("electron");
const http = require("node:http");
const { createReadStream, existsSync, statSync } = require("node:fs");
const path = require("node:path");

const distRoot = path.join(__dirname, "..", "dist");
const preferredPort = 36789;
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

function safeFile(requestPath) {
  const clean = decodeURIComponent(requestPath.split("?")[0]).replaceAll("\\", "/");
  const relative = clean === "/" ? "index.html" : clean.replace(/^\/+/, "");
  const resolved = path.resolve(distRoot, relative);
  if (!resolved.startsWith(path.resolve(distRoot))) return path.join(distRoot, "index.html");
  if (!existsSync(resolved) || statSync(resolved).isDirectory()) return path.join(distRoot, "index.html");
  return resolved;
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const file = safeFile(request.url || "/");
      const extension = path.extname(file).toLowerCase();
      response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
      response.setHeader("Cache-Control", extension === ".html" ? "no-cache" : "public, max-age=86400");
      response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      createReadStream(file).on("error", () => {
        response.statusCode = 500;
        response.end("Unable to load the garden.");
      }).pipe(response);
    });
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function createWindow() {
  let server;
  let port = preferredPort;
  try {
    server = await startServer(port);
  } catch {
    server = await startServer(port + 1);
    port += 1;
  }

  const window = new BrowserWindow({
    width: 1180,
    height: 880,
    minWidth: 900,
    minHeight: 680,
    show: false,
    backgroundColor: "#f4e6dc",
    autoHideMenuBar: true,
    title: "桂庭拾光",
    icon: path.join(__dirname, "..", "dist", "icons", "icon-512.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged
    }
  });

  Menu.setApplicationMenu(null);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.once("ready-to-show", () => window.show());
  await window.loadURL(`http://127.0.0.1:${port}/`);

  window.on("closed", () => {
    server.close();
  });
}

const lock = app.requestSingleInstanceLock();
if (!lock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows[0]) {
      if (windows[0].isMinimized()) windows[0].restore();
      windows[0].focus();
    }
  });
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => app.quit());
}
