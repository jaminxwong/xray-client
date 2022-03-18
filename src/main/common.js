'use strict';
/**
 * Created by LOLO on 2022/02/26.
 */

const {app, dialog, ipcMain, shell} = require('electron');
const path = require('path');
const fs = require('fs-extra');
const ping = require('ping');
const consts = require('./consts');


const common = {
    tray: null,
    mainWnd: null,
    showed: true,
    xrayPath: '',
}


common.appMenu = [
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    }
];

common.trayMenu = [
    {
        label: 'Application', click: () => common.mainWnd.show()
    },
    {
        label: 'About XrayClient', click: () => showAbout()
    },

    {type: 'separator'},
    {
        label: 'Xray-Core', click: () => shell.showItemInFolder(common.xrayPath)
    },
    {
        label: 'Apply Changes', click: () => common.send(consts.M_R.APPLY_CHANGES)
    },

    {type: 'separator'},
    {
        label: 'Quit', click: () => app.quit()
    },
];

if (consts.IS_DEVELOPMENT) {
    common.trayMenu.splice(3, 0, {
        label: 'Developer Tools', click: () => common.mainWnd.openDevTools({mode: 'detach'})
    });
}


//


/**
 * 显示 About 界面
 */
function showAbout() {
    dialog.showMessageBox({
        // type: 'info',
        title: 'About',
        message: 'message',
        detail: 'The is a detail.',
        // icon: common.appPath('../icons/dist/icon.ico'),
    });
}


//


common.send = (channel, ...args) => {
    common.mainWnd.webContents.send(channel, ...args);
};


ipcMain.on(consts.R_M.HIDE_APP, () => {
    common.mainWnd.hide();
});


/**
 * 将 data 保存成文件
 */
ipcMain.on(consts.R_M.SAVE_FILE, async (event, name, data) => {
    let file = path.normalize(app.getPath('downloads') + '/' + name);
    let result = await dialog.showSaveDialog({title: 'Save As...', defaultPath: file});
    if (!result.canceled) {
        await fs.writeFile(result.filePath, data);
        shell.showItemInFolder(result.filePath);
    }
});


/**
 * 获取 ping 值
 */
ipcMain.handle(consts.R_M.PING, async (event, host) => {
    return await ping.promise.probe(host, {timeout: 3});
});


//


/**
 * 返回包体内的文件（或目录）路径
 * @param filePath
 * @returns {string}
 */
common.appPath = (filePath) => {
    return path.join(__dirname, filePath);
};

/**
 * 返回格式化后的存储目录下的文件（或目录）路径
 * @param subPath
 * @returns {string}
 */
common.storePath = (subPath) => {
    if (!subPath.startsWith('/')) subPath = '/' + subPath;
    return path.normalize(app.getPath('userData') + subPath);
};


/**
 * 传入的字符串是否为空
 * @param str
 * @returns {boolean}
 */
common.isEmpty = (str) => {
    return (!str || str.trim().length === 0);
};


module.exports = common;

