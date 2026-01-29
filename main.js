const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "水墨修仙", // 你的游戏标题
    icon: path.join(__dirname, 'icon.png'), // 如果你有图标的话
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 隐藏顶部默认菜单栏（修仙游戏通常不需要文件/编辑菜单）
  Menu.setApplicationMenu(null)

  // 加载你的游戏入口
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})