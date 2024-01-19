import { Menu } from 'electron';
import { darwinTemplate } from './darwinTemplate';
import { windowsTemplate } from './windowsTemplate';

export class MenuBuilder {
  public static build(app: Electron.App) {
    if (process.platform === 'darwin') {
      const menu = Menu.buildFromTemplate(darwinTemplate(app));
      Menu.setApplicationMenu(menu);
    } else {
      const menu = Menu.buildFromTemplate(windowsTemplate(app));
      Menu.setApplicationMenu(menu);
    }
  }
}
