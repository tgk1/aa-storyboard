import { BrowserWindow, MenuItem, MenuItemConstructorOptions, dialog, shell } from 'electron';
import ElectronLog from 'electron-log';

import { i18n } from '@/lib/i18n-main';
import autoUpdater from '@/lib/AutoUpdater';
import { AppConfig } from '@/data/config/AppConfig';
import { NavType } from '@model/NavType';
import { FileConverter } from '@/data/FileConverter';

export function windowsTemplate(app: Electron.App): MenuItemConstructorOptions[] {
  const menu: MenuItemConstructorOptions[] = [
    {
      id: 'File',
      label: i18n.t('MENU.&File'),
      submenu: [
        {
          id: 'Import',
          label: i18n.t('MENU.Import'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            const filePath = dialog.showOpenDialogSync({
              defaultPath: AppConfig.get().PathLocalFolderDB,
              properties: ['openFile'],
              filters: [
                { name: 'AST/MLT/YBBS', extensions: ['ast', 'mlt', 'ybbs'] },
                { name: 'ぜろちゃんねる/Yaruyomi DAT', extensions: ['dat'] },
                { name: 'したらば DAT(*.raw)', extensions: ['raw'] },
                { name: 'したらば 過去ログ(*.html)', extensions: ['html'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            if (filePath == undefined) return;
            const result = FileConverter.import(String(filePath));
            const message = result
              ? i18n.t('MENU.ImportSucceeded') + '\n' + AppConfig.get().PathLocalFolderDB
              : i18n.t('MENU.ImportFailed');
            dialog.showMessageBox({ type: 'info', message: message });
            browserWindow?.webContents.send('reload-list', 'imported');
          }
        },
        {
          id: 'Export',
          label: i18n.t('MENU.Export'),
          click: () => {
            const filePath = dialog.showSaveDialogSync({
              defaultPath: AppConfig.getPathDocuments(),
              filters: [
                { name: 'mlt', extensions: ['mlt', 'txt'] },
                { name: 'やる夫BBS+エディター', extensions: ['ybbs'] },
                { name: 'html', extensions: ['html'] }
              ]
            });
            if (filePath == undefined) return;
            let result = false;
            if (filePath.match(/ybbs$/i)) {
              result = FileConverter.exportYBBS(AppConfig.getCurrentFile(), filePath);
            } else if (filePath.match(/html$/i)) {
              result = FileConverter.exportHTML(AppConfig.getCurrentFile(), filePath);
            } else {
              result = FileConverter.exportMLT(AppConfig.getCurrentFile(), filePath);
            }
            const message = result ? i18n.t('MENU.ExportSucceeded') : i18n.t('MENU.ExportFailed');
            dialog.showMessageBox({ type: 'info', message: message });
          }
        },
        {
          id: 'Save',
          label: i18n.t('MENU.Save'),
          accelerator: 'Ctrl+S',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('Save');
          }
        },
        {
          id: 'Close Tab',
          label: i18n.t('MENU.CloseTab'),
          accelerator: 'Ctrl+Shift+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseTab');
          }
        },
        {
          id: 'Close',
          label: i18n.t('MENU.Close'),
          accelerator: 'Ctrl+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseWindow');
          }
        },
        {
          id: 'Quit',
          label: i18n.t('MENU.Quit'),
          accelerator: 'Ctrl+Q',
          click: function () {
            app.quit();
          }
        }
      ]
    },
    {
      id: 'Edit',
      label: i18n.t('MENU.Edit'),
      submenu: [
        { id: 'Undo', label: i18n.t('MENU.Undo'), role: 'undo' },
        { id: 'Redo', label: i18n.t('MENU.Redo'), role: 'redo' },
        { id: 'Cut', label: i18n.t('MENU.Cut'), role: 'cut' },
        { id: 'Copy', label: i18n.t('MENU.Copy'), role: 'copy' },
        { id: 'Paste', label: i18n.t('MENU.Paste'), role: 'paste' },
        { id: 'Delete', label: i18n.t('MENU.Delete'), role: 'delete' },
        { id: 'SelectAll', label: i18n.t('MENU.SelectAll'), role: 'selectAll' },
        { type: 'separator' },
        {
          id: 'FindKoma',
          label: i18n.t('MENU.FindKoma'),
          accelerator: 'Ctrl+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FindKoma');
          }
        },
        {
          id: 'ReplaceKoma',
          label: i18n.t('MENU.ReplaceKoma'),
          accelerator: 'Ctrl+Shift+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('ReplaceKoma');
          }
        },
        {
          id: 'BulkDeleteKoma',
          label: i18n.t('MENU.BulkDeleteKoma'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('BulkDeleteKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKoma',
          label: i18n.t('MENU.AddKoma'),
          accelerator: 'Ctrl+N',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKomaPart_AA',
          label: i18n.t('MENU.AddKomaPart_AA'),
          accelerator: 'Ctrl+I',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_AA');
          }
        },
        {
          id: 'AddKomaPart_Editor',
          label: i18n.t('MENU.AddKomaPart_Editor'),
          accelerator: 'Ctrl+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Editor');
          }
        },
        {
          id: 'AddKomaPart_Mini',
          label: i18n.t('MENU.AddKomaPart_Mini'),
          accelerator: 'Ctrl+Shift+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Mini');
          }
        },
        { type: 'separator' },
        {
          id: 'CreateFrame',
          label: i18n.t('MENU.CreateFrame'),
          accelerator: 'Ctrl+K',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CreateFrame');
          }
        },
        {
          id: 'SplitKomaPart',
          label: i18n.t('MENU.SplitKomaPart'),
          accelerator: 'Ctrl+L',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SplitKomaPart');
          }
        },
        {
          id: 'DeleteLeftCharacters',
          label: i18n.t('MENU.DeleteLeftCharacters'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('DeleteCharacters', true);
          }
        },
        {
          id: 'DeleteRightCharacters',
          label: i18n.t('MENU.DeleteRightCharacters'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('DeleteCharacters', false);
          }
        }
      ]
    },
    {
      id: 'View',
      label: i18n.t('MENU.View'),
      submenu: [
        {
          label: i18n.t('MENU.FullScreen'),
          accelerator: 'Ctrl+Alt+F',
          click: function (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
            browserWindow?.setFullScreen(!browserWindow.isFullScreen());
          }
        },
        {
          label: i18n.t('MENU.Minimize'),
          accelerator: 'Alt+M',
          role: 'minimize'
        },
        { type: 'separator' },
        {
          id: 'SwitchTabMode',
          label: i18n.t('MENU.SwitchTabMode'),
          accelerator: 'Ctrl+\\',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchTabMode');
          }
        },
        {
          id: 'SelectPrevTab',
          label: i18n.t('MENU.SelectPrevTab'),
          accelerator: 'Ctrl+[',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', true);
          }
        },
        {
          id: 'SelectNextTab',
          label: i18n.t('MENU.SelectNextTab'),
          accelerator: 'Ctrl+]',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', false);
          }
        },
        { type: 'separator' },
        {
          id: 'SwitchListMode',
          label: i18n.t('MENU.SwitchListMode'),
          accelerator: 'Ctrl+L',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchListMode');
          }
        },
        {
          id: 'MoveToTop',
          label: i18n.t('MENU.MoveToTop'),
          accelerator: 'Ctrl+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', true);
          }
        },
        {
          id: 'MoveToBottom',
          label: i18n.t('MENU.MoveToBottom'),
          accelerator: 'Ctrl+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', false);
          }
        },
        {
          id: 'MoveByNumber',
          label: i18n.t('MENU.MoveByNumber'),
          accelerator: 'Ctrl+G',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveByNumber');
          }
        },
        { type: 'separator' },
        {
          id: 'FontSizeUp',
          label: i18n.t('MENU.FontSizeUp'),
          accelerator: 'Alt+Ctrl+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SetFontSize', true);
          }
        },
        {
          id: 'FontSizeDown',
          label: i18n.t('MENU.FontSizeDown'),
          accelerator: 'Alt+Ctrl+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('setFontSize', false);
          }
        },
        { type: 'separator' },
        {
          id: 'VisibleButtons',
          label: i18n.t('MENU.VisibleButtons'),
          accelerator: 'Ctrl+B',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('VisibleButtons');
          }
        },
        {
          id: 'VisibleKomaPartsList',
          label: i18n.t('MENU.VisibleKomaPartsList'),
          accelerator: 'Ctrl+N',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('VisibleKomaPartsList');
          }
        }
      ]
    },
    {
      id: 'SideBar',
      label: i18n.t('MENU.SideBar'),
      submenu: [
        {
          id: 'Nav1',
          label: i18n.t('MENU.Nav1'),
          accelerator: 'Ctrl+1',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.LocalFolderDB);
          }
        },
        {
          id: 'Nav2',
          label: i18n.t('MENU.Nav2'),
          accelerator: 'Ctrl+2',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.WebFolderMLT);
          }
        },
        {
          id: 'Nav3',
          label: i18n.t('MENU.Nav3'),
          accelerator: 'Ctrl+3',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.LocalFolderMLT);
          }
        },
        {
          id: 'Nav4',
          label: i18n.t('MENU.Nav4'),
          accelerator: 'Ctrl+4',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.MarkFolder);
          }
        },
        {
          id: 'Nav5',
          label: i18n.t('MENU.Nav5'),
          accelerator: 'Ctrl+5',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.RecentFolder);
          }
        },
        {
          id: 'Nav6',
          label: i18n.t('MENU.Nav6'),
          accelerator: 'Ctrl+6',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.ReplicaFolder);
          }
        },
        {
          id: 'Nav7',
          label: i18n.t('MENU.Nav7'),
          accelerator: 'Ctrl+7',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.Config);
          }
        }
      ]
    },
    {
      label: i18n.t('MENU.Help'),
      submenu: [
        {
          id: 'CheckUpdate',
          label: i18n.t('MENU.CheckUpdate'),
          click: () => {
            const log = ElectronLog;
            const updater = autoUpdater();
            updater.checkForUpdates();
            log.info('AutoUpdater: Production');
            log.info(updater.getFeedURL());
          }
        },
        {
          id: 'Site',
          label: i18n.t('MENU.Site'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/');
          }
        },
        {
          id: 'Usage',
          label: i18n.t('MENU.Usage'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage.html');
          }
        },
        {
          id: 'Usage_Merge',
          label: i18n.t('MENU.Usage_Merge'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage_merge.html');
          }
        },
        {
          id: 'Usage_ImportDAT',
          label: i18n.t('MENU.Usage_ImportDAT'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage_import_dat.html');
          }
        }
      ]
    }
  ];

  return menu;
}
