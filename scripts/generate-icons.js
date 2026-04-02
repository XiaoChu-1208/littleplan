const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      offscreen: true
    }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        const { ipcRenderer } = require('electron');
        
        function renderSvg(svgContent, width, height) {
          return new Promise((resolve, reject) => {
            const img = new Image();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/png');
              URL.revokeObjectURL(url);
              resolve(dataUrl);
            };
            img.onerror = (e) => reject(new Error('Image load failed'));
            img.src = url;
          });
        }

        ipcRenderer.on('start-render', async (event, { pinSvg, iconSvg }) => {
          try {
            const tray1x = await renderSvg(pinSvg, 16, 16);
            const tray2x = await renderSvg(pinSvg, 32, 32);
            const tray3x = await renderSvg(pinSvg, 48, 48);
            const appIcon = await renderSvg(iconSvg, 512, 512);
            
            ipcRenderer.send('render-done', { tray1x, tray2x, tray3x, appIcon });
          } catch (err) {
            ipcRenderer.send('render-error', err.message);
          }
        });
      </script>
    </body>
    </html>
  `;

  const htmlPath = path.join(__dirname, 'render.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  win.loadFile(htmlPath);

  win.webContents.on('did-finish-load', () => {
    const pinSvg = fs.readFileSync(path.join(__dirname, '../assets/icons/pin.svg'), 'utf8');
    const iconSvg = fs.readFileSync(path.join(__dirname, '../assets/icons/icon.svg'), 'utf8');
    
    win.webContents.send('start-render', { pinSvg, iconSvg });
  });

  ipcMain.on('render-done', (event, { tray1x, tray2x, tray3x, appIcon }) => {
    const savePng = (dataUrl, filename) => {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(path.join(__dirname, '../assets/icons', filename), base64Data, 'base64');
    };

    savePng(tray1x, 'tray-iconTemplate.png');
    savePng(tray2x, 'tray-iconTemplate@2x.png');
    savePng(tray3x, 'tray-iconTemplate@3x.png');
    savePng(appIcon, 'icon.png');
    
    console.log('Icons generated successfully via Canvas!');
    try { fs.unlinkSync(htmlPath); } catch(e) {}
    app.quit();
  });

  ipcMain.on('render-error', (event, err) => {
    console.error('Render error:', err);
    app.quit();
  });
});