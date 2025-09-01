import { BrowserWindow, MenuItem, MenuItemConstructorOptions, dialog, shell } from 'electron';
import ElectronLog from 'electron-log';

import { tMain } from '@/lib/i18n-main';
import autoUpdater from '@/lib/AutoUpdater';
import { AppConfig } from '@/data/config/AppConfig';
import { NavType } from '@model/NavType';
import { FileConverter } from '@/data/FileConverter';

export function darwinTemplate(app: Electron.App): MenuItemConstructorOptions[] {
  const menu: MenuItemConstructorOptions[] = [
    {
      label: 'AAStoryboard',
      submenu: [
        {
          label: tMain('MENU.About AA Storyboard'),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: tMain('MENU.Hide App'),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: tMain('MENU.Show All'),
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: tMain('MENU.Quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },

    {
      id: 'File',
      label: tMain('MENU.File'),
      submenu: [
        {
          id: 'Import',
          label: tMain('MENU.Import'),
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
              ? tMain('MENU.ImportSucceeded') + '\n' + AppConfig.get().PathLocalFolderDB
              : tMain('MENU.ImportFailed');
            dialog.showMessageBox({ type: 'info', message: message });
            browserWindow?.webContents.send('reload-list', 'imported');
          }
        },
        {
          id: 'Export',
          label: tMain('MENU.Export'),
          click: () => {
            const filePath = dialog.showSaveDialogSync({
              defaultPath: AppConfig.get().PathLocalFolderDB,
              filters: [
                { name: 'mlt', extensions: ['mlt', 'txt'] },
                { name: 'やる夫BBS+エディター', extensions: ['ybbs'] },
                { name: 'htmlとcss', extensions: ['html'] }
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
            const message = result ? tMain('MENU.ExportSucceeded') : tMain('MENU.ExportFailed');
            dialog.showMessageBox({ type: 'info', message: message });
          }
        },
        { type: 'separator' },
        {
          id: 'Save',
          label: tMain('MENU.Save'),
          accelerator: 'Command+S',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('Save');
          }
        },
        {
          id: 'CloseTab',
          label: tMain('MENU.CloseTab'),
          accelerator: 'Command+Shift+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseTab');
          }
        },
        {
          id: 'Close',
          label: tMain('MENU.Close'),
          accelerator: 'Command+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseWindow');
          }
        }
      ]
    },
    {
      id: 'Edit',
      label: tMain('MENU.Edit'),
      submenu: [
        { id: 'Undo', label: tMain('MENU.Undo'), role: 'undo' },
        { id: 'Redo', label: tMain('MENU.Redo'), role: 'redo' },
        { id: 'Cut', label: tMain('MENU.Cut'), role: 'cut' },
        { id: 'Copy', label: tMain('MENU.Copy'), role: 'copy' },
        { id: 'Paste', label: tMain('MENU.Paste'), role: 'paste' },
        { id: 'Delete', label: tMain('MENU.Delete'), role: 'delete' },
        { id: 'SelectAll', label: tMain('MENU.SelectAll'), role: 'selectAll' },
        { type: 'separator' },
        {
          id: 'FindKoma',
          label: tMain('MENU.FindKoma'),
          accelerator: 'Command+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FindKoma');
          }
        },
        {
          id: 'ReplaceKoma',
          label: tMain('MENU.ReplaceKoma'),
          accelerator: 'Command+Shift+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('ReplaceKoma');
          }
        },
        {
          id: 'BulkDeleteKoma',
          label: tMain('MENU.BulkDeleteKoma'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('BulkDeleteKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKoma',
          label: tMain('MENU.AddKoma'),
          accelerator: 'Command+N',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKomaPart_AA',
          label: tMain('MENU.AddKomaPart_AA'),
          accelerator: 'Command+I',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_AA');
          }
        },
        {
          id: 'AddKomaPart_Editor',
          label: tMain('MENU.AddKomaPart_Editor'),
          accelerator: 'Command+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Editor');
          }
        },
        {
          id: 'AddKomaPart_Mini',
          label: tMain('MENU.AddKomaPart_Mini'),
          accelerator: 'Command+Shift+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Mini');
          }
        },
        { type: 'separator' },
        {
          id: 'CreateFrame',
          label: tMain('MENU.CreateFrame'),
          accelerator: 'Command+K',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CreateFrame');
          }
        },
        {
          id: 'SplitKomaPart',
          label: tMain('MENU.SplitKomaPart'),
          accelerator: 'Command+L',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SplitKomaPart');
          }
        },
        {
          id: 'DeleteLeftCharacters',
          label: tMain('MENU.DeleteLeftCharacters'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('DeleteCharacters', true);
          }
        },
        {
          id: 'DeleteRightCharacters',
          label: tMain('MENU.DeleteRightCharacters'),
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('DeleteCharacters', false);
          }
        }
      ]
    },
    {
      label: tMain('MENU.View'),
      submenu: [
        {
          label: tMain('MENU.FullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.setFullScreen(!browserWindow.isFullScreen());
          }
        },
        {
          label: tMain('MENU.Minimize'),
          accelerator: 'Command+M',
          role: 'minimize'
        },
        { type: 'separator' },
        {
          id: 'SwitchTabMode',
          label: tMain('MENU.SwitchTabMode'),
          accelerator: 'Command+\\',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchTabMode');
          }
        },
        {
          id: 'SelectPrevTab',
          label: tMain('MENU.SelectPrevTab'),
          accelerator: 'Command+[',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', true);
          }
        },
        {
          id: 'SelectNextTab',
          label: tMain('MENU.SelectNextTab'),
          accelerator: 'Command+]',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', false);
          }
        },
        { type: 'separator' },
        {
          id: 'SwitchListMode',
          label: tMain('MENU.SwitchListMode'),
          accelerator: 'Command+L',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchListMode');
          }
        },
        {
          id: 'MoveToTop',
          label: tMain('MENU.MoveToTop'),
          accelerator: 'Command+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', true);
          }
        },
        {
          id: 'MoveToBottom',
          label: tMain('MENU.MoveToBottom'),
          accelerator: 'Command+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', false);
          }
        },
        {
          id: 'MoveByNumber',
          label: tMain('MENU.MoveByNumber'),
          accelerator: 'Command+G',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveByNumber');
          }
        },
        { type: 'separator' },
        {
          id: 'FontSizeUp',
          label: tMain('MENU.FontSizeUp'),
          accelerator: 'Option+Command+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FontSize', true);
          }
        },
        {
          id: 'FontSizeDown',
          label: tMain('MENU.FontSizeDown'),
          accelerator: 'Option+Command+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FontSize', false);
          }
        },
        { type: 'separator' },
        {
          id: 'VisibleButtons',
          label: tMain('MENU.VisibleButtons'),
          accelerator: 'Command+B',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('VisibleButtons');
          }
        },
        {
          id: 'VisibleKomaPartsList',
          label: tMain('MENU.VisibleKomaPartsList'),
          accelerator: 'Command+N',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('VisibleKomaPartsList');
          }
        }
      ]
    },

    {
      id: 'SideBar',
      label: tMain('MENU.SideBar'),
      submenu: [
        {
          id: 'Nav1',
          label: tMain('MENU.Nav1'),
          accelerator: 'Ctrl+1',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.LocalFolderDB);
          }
        },
        {
          id: 'Nav2',
          label: tMain('MENU.Nav2'),
          accelerator: 'Ctrl+2',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.WebFolderMLT);
          }
        },
        {
          id: 'Nav3',
          label: tMain('MENU.Nav3'),
          accelerator: 'Ctrl+3',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.LocalFolderMLT);
          }
        },
        {
          id: 'Nav4',
          label: tMain('MENU.Nav4'),
          accelerator: 'Ctrl+4',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.MarkFolder);
          }
        },
        {
          id: 'Nav5',
          label: tMain('MENU.Nav5'),
          accelerator: 'Ctrl+5',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.RecentFolder);
          }
        },
        {
          id: 'Nav6',
          label: tMain('MENU.Nav6'),
          accelerator: 'Ctrl+6',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.ReplicaFolder);
          }
        },
        {
          id: 'Nav7',
          label: tMain('MENU.Nav7'),
          accelerator: 'Ctrl+7',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectNav', NavType.Config);
          }
        }
      ]
    },

    {
      label: tMain('MENU.Help'),
      submenu: [
        {
          id: 'CheckUpdate',
          label: tMain('MENU.CheckUpdate'),
          click: async () => {
            const log = ElectronLog;
            const updater = autoUpdater();
            updater.checkForUpdates();
            log.info('AutoUpdater: Production');
            log.info(updater.getFeedURL());
          }
        },
        {
          label: tMain('MENU.Site'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/');
          }
        },
        {
          id: 'Usage',
          label: tMain('MENU.Usage'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage.html');
          }
        },
        {
          id: 'Usage_Merge',
          label: tMain('MENU.Usage_Merge'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage_merge.html');
          }
        },
        {
          id: 'Usage_ImportDAT',
          label: tMain('MENU.Usage_ImportDAT'),
          click: async () => {
            await shell.openExternal('https://rss.r401.net/mlt/usage_import_dat.html');
          }
        }
      ]
    }
  ];

  return menu;
}
