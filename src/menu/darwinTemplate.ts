import { BrowserWindow, MenuItem, MenuItemConstructorOptions, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

import { i18n } from '@/lib/i18n-main';
import { AppConfig } from '@/data/config/AppConfig';
import { NavType } from '@model/NavType';
import { FileConverter } from '@/data/FileConverter';

export function darwinTemplate(app: Electron.App): MenuItemConstructorOptions[] {
  const menu: MenuItemConstructorOptions[] = [
    {
      label: 'AAStoryboard',
      submenu: [
        {
          label: i18n.t('MENU.About AA Storyboard'),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: i18n.t('MENU.Hide App'),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: i18n.t('MENU.Show All'),
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: i18n.t('MENU.Quit'),
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },

    {
      id: 'File',
      label: i18n.t('MENU.File'),
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
            const message = result ? i18n.t('MENU.ExportSucceeded') : i18n.t('MENU.ExportFailed');
            dialog.showMessageBox({ type: 'info', message: message });
          }
        },
        { type: 'separator' },
        {
          id: 'Save',
          label: i18n.t('MENU.Save'),
          accelerator: 'Command+S',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('Save');
          }
        },
        {
          id: 'CloseTab',
          label: i18n.t('MENU.CloseTab'),
          accelerator: 'Command+Shift+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseTab');
          }
        },
        {
          id: 'Close',
          label: i18n.t('MENU.Close'),
          accelerator: 'Command+W',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CloseWindow');
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
          accelerator: 'Command+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FindKoma');
          }
        },
        {
          id: 'ReplaceKoma',
          label: i18n.t('MENU.ReplaceKoma'),
          accelerator: 'Command+Shift+F',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('ReplaceKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKoma',
          label: i18n.t('MENU.AddKoma'),
          accelerator: 'Command+N',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKoma');
          }
        },
        { type: 'separator' },
        {
          id: 'AddKomaPart_AA',
          label: i18n.t('MENU.AddKomaPart_AA'),
          accelerator: 'Command+I',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_AA');
          }
        },
        {
          id: 'AddKomaPart_Editor',
          label: i18n.t('MENU.AddKomaPart_Editor'),
          accelerator: 'Command+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Editor');
          }
        },
        {
          id: 'AddKomaPart_Mini',
          label: i18n.t('MENU.AddKomaPart_Mini'),
          accelerator: 'Command+Shift+T',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('AddKomaPart_Mini');
          }
        },
        { type: 'separator' },
        {
          id: 'CreateFrame',
          label: i18n.t('MENU.CreateFrame'),
          accelerator: 'Command+K',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('CreateFrame');
          }
        },
        {
          id: 'SplitKomaPart',
          label: i18n.t('MENU.SplitKomaPart'),
          accelerator: 'Command+L',
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
      label: i18n.t('MENU.View'),
      submenu: [
        {
          label: i18n.t('MENU.FullScreen'),
          accelerator: 'Ctrl+Command+F',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.setFullScreen(!browserWindow.isFullScreen());
          }
        },
        {
          label: i18n.t('MENU.Minimize'),
          accelerator: 'Command+M',
          role: 'minimize'
        },
        { type: 'separator' },
        {
          id: 'SwitchTabMode',
          label: i18n.t('MENU.SwitchTabMode'),
          accelerator: 'Command+\\',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchTabMode');
          }
        },
        {
          id: 'SelectPrevTab',
          label: i18n.t('MENU.SelectPrevTab'),
          accelerator: 'Command+[',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', true);
          }
        },
        {
          id: 'SelectNextTab',
          label: i18n.t('MENU.SelectNextTab'),
          accelerator: 'Command+]',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SelectTab', false);
          }
        },
        { type: 'separator' },
        {
          id: 'SwitchListMode',
          label: i18n.t('MENU.SwitchListMode'),
          accelerator: 'Command+L',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('SwitchListMode');
          }
        },
        {
          id: 'MoveToTop',
          label: i18n.t('MENU.MoveToTop'),
          accelerator: 'Command+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', true);
          }
        },
        {
          id: 'MoveToBottom',
          label: i18n.t('MENU.MoveToBottom'),
          accelerator: 'Command+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveToEdge', false);
          }
        },
        {
          id: 'MoveByNumber',
          label: i18n.t('MENU.MoveByNumber'),
          accelerator: 'Command+G',
          // DevToolsをONにしていると起動直後にこのショートカットが動作しない。ツールバーから一度操作すると動作する フォーカスが動作しない
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('MoveByNumber');
          }
        },
        { type: 'separator' },
        {
          id: 'FontSizeUp',
          label: i18n.t('MENU.FontSizeUp'),
          accelerator: 'Option+Command+Up',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FontSize', true);
          }
        },
        {
          id: 'FontSizeDown',
          label: i18n.t('MENU.FontSizeDown'),
          accelerator: 'Option+Command+Down',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('FontSize', false);
          }
        },
        { type: 'separator' },
        {
          id: 'VisibleButtons',
          label: i18n.t('MENU.VisibleButtons'),
          accelerator: 'Command+B',
          click: (_menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
            browserWindow?.webContents.send('VisibleButtons');
          }
        },
        {
          id: 'VisibleKomaPartsList',
          label: i18n.t('MENU.VisibleKomaPartsList'),
          accelerator: 'Command+N',
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
          click: async () => {
            // app updater
            //log.i18n.tports.file.level = 'info';
            //autoUpdater.logger = log;
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        {
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
        }
      ]
    }
  ];

  return menu;
}
