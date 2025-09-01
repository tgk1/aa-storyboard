import { dialog } from 'electron';
import electronUpdater, { type AppUpdater } from 'electron-updater';
import ElectronLog from 'electron-log';

import { tMain } from '@/lib/i18n-main';

export default function autoUpdeter(): AppUpdater {
  const { autoUpdater } = electronUpdater;

  autoUpdater.on('update-downloaded', (_event) => {
    const dialogOpts = {
      title: tMain('AppUpdate.ApplicationUpdate'),
      buttons: [tMain('AppUpdate.Restart'), tMain('AppUpdate.Later')],
      message: _event.version,
      detail: tMain('AppUpdate.Message')
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
    const log = ElectronLog;
    log.info('There was a problem updating the application');
    log.info(message);
  });

  return autoUpdater;
}
