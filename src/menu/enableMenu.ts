import { AppActivity } from '@/data/model';
import { Menu } from 'electron';

export function enableMenu(act: AppActivity) {
  interface menuStatus {
    [id: string]: boolean;
  }
  const menuIDs: menuStatus = {
    Import: false,
    Export: false,
    Save: false,
    CloseTab: false,
    Close: false,

    Undo: true,
    Redo: true,
    Cut: true,
    Copy: true,
    Paste: true,
    Delete: true,
    SelectAll: false,

    AddKoma: false,
    AddKomaPart_AA: false,
    AddKomaPart_Editor: false,
    AddKomaPart_Mini: false,
    Frame: false,
    SplitKomaPart: false,
    DeleteLeftCharacters: false,
    DeleteRightCharacters: false,

    SwitchTabMode: false,
    SelectPrevTab: false,
    SelectTabNext: false,
    SwitchListMode: false,
    ListUp: false,
    ListDown: false,
    FontSizeUp: false,
    FontSizeDown: false,
    VisibleButtons: false,
    VisibleKomaPartsList: false,

    Nav1: false,
    Nav2: false,
    Nav3: false,
    Nav4: false,
    Nav5: false,
    Nav6: false,
    Nav7: false
  };

  menuIDs[''] = true;

  switch (act) {
    case AppActivity.MainIndex:
      menuIDs['Import'] = true;
      menuIDs['Export'] = true;
      menuIDs['Save'] = false;
      menuIDs['CloseTab'] = true;
      menuIDs['Close'] = true;
      menuIDs['AddKoma'] = true;
      menuIDs['AddKomaPart_AA'] = false;
      menuIDs['AddKomaPart_Editor'] = false;
      menuIDs['AddKomaPart_Mini'] = false;
      menuIDs['CreateFrame'] = false;
      menuIDs['SplitKomaPart'] = false;
      menuIDs['DeleteLeftCharacters'] = false;
      menuIDs['DeleteRightCharacters'] = false;
      menuIDs['SwitchTabMode'] = true;
      menuIDs['SelectPrevTab'] = true;
      menuIDs['SelectNextTab'] = true;
      menuIDs['SwitchListMode'] = true;
      menuIDs['ListUp'] = true;
      menuIDs['ListDown'] = true;
      menuIDs['FontSizeUp'] = true;
      menuIDs['FontSizeDown'] = true;
      menuIDs['VisibleButtons'] = false;
      menuIDs['VisibleKomaPartsList'] = false;
      menuIDs['Nav1'] = true;
      menuIDs['Nav2'] = true;
      menuIDs['Nav3'] = true;
      menuIDs['Nav4'] = true;
      menuIDs['Nav5'] = true;
      menuIDs['Nav6'] = true;
      menuIDs['Nav7'] = true;
      if (process.platform === 'darwin') {
        menuIDs['Close'] = false;
      }
      break;
    case AppActivity.MLTSelector:
      menuIDs['Import'] = false;
      menuIDs['Export'] = false;
      menuIDs['Save'] = false;
      menuIDs['CloseTab'] = true;
      menuIDs['Close'] = true;
      menuIDs['AddKoma'] = false;
      menuIDs['AddKomaPart_AA'] = false;
      menuIDs['AddKomaPart_Editor'] = false;
      menuIDs['AddKomaPart_Mini'] = false;
      menuIDs['CreateFrame'] = false;
      menuIDs['SplitKomaPart'] = false;
      menuIDs['DeleteLeftCharacters'] = false;
      menuIDs['DeleteRightCharacters'] = false;
      menuIDs['SwitchTabMode'] = true;
      menuIDs['SelectPrevTab'] = true;
      menuIDs['SelectNextTab'] = true;
      menuIDs['SwitchListMode'] = true;
      menuIDs['ListUp'] = true;
      menuIDs['ListDown'] = true;
      menuIDs['FontSizeUp'] = true;
      menuIDs['FontSizeDown'] = true;
      menuIDs['VisibleButtons'] = false;
      menuIDs['VisibleKomaPartsList'] = false;
      menuIDs['Nav1'] = true;
      menuIDs['Nav2'] = true;
      menuIDs['Nav3'] = true;
      menuIDs['Nav4'] = true;
      menuIDs['Nav5'] = true;
      menuIDs['Nav6'] = true;
      menuIDs['Nav7'] = true;
      break;
    case AppActivity.AACanvas:
      menuIDs['Import'] = false;
      menuIDs['Export'] = false;
      menuIDs['Save'] = false;
      menuIDs['CloseTab'] = false;
      menuIDs['Close'] = true;
      menuIDs['AddKoma'] = false;
      menuIDs['AddKomaPart_AA'] = true;
      menuIDs['AddKomaPart_Editor'] = true;
      menuIDs['AddKomaPart_Mini'] = true;
      menuIDs['CreateFrame'] = false;
      menuIDs['SplitKomaPart'] = false;
      menuIDs['DeleteLeftCharacters'] = false;
      menuIDs['DeleteRightCharacters'] = false;
      menuIDs['SwitchTabMode'] = false;
      menuIDs['SelectPrevTab'] = false;
      menuIDs['SelectNextTab'] = false;
      menuIDs['SwitchListMode'] = false;
      menuIDs['ListUp'] = false;
      menuIDs['ListDown'] = false;
      menuIDs['FontSizeUp'] = true;
      menuIDs['FontSizeDown'] = true;
      menuIDs['VisibleButtons'] = true;
      menuIDs['VisibleKomaPartsList'] = true;
      menuIDs['Nav1'] = false;
      menuIDs['Nav2'] = false;
      menuIDs['Nav3'] = false;
      menuIDs['Nav4'] = false;
      menuIDs['Nav5'] = false;
      menuIDs['Nav6'] = false;
      menuIDs['Nav7'] = false;
      break;
    case AppActivity.TextEditor:
      menuIDs['Import'] = false;
      menuIDs['Export'] = false;
      menuIDs['Save'] = true;
      menuIDs['CloseTab'] = false;
      menuIDs['Close'] = true;
      menuIDs['AddKoma'] = false;
      menuIDs['AddKomaPart_AA'] = false;
      menuIDs['AddKomaPart_Editor'] = false;
      menuIDs['AddKomaPart_Mini'] = false;
      menuIDs['CreateFrame'] = true;
      menuIDs['SplitKomaPart'] = true;
      menuIDs['DeleteLeftCharacters'] = true;
      menuIDs['DeleteRightCharacters'] = true;
      menuIDs['SwitchTabMode'] = false;
      menuIDs['SelectPrevTab'] = false;
      menuIDs['SelectNextTab'] = false;
      menuIDs['SwitchListMode'] = false;
      menuIDs['ListUp'] = false;
      menuIDs['ListDown'] = false;
      menuIDs['FontSizeUp'] = true;
      menuIDs['FontSizeDown'] = true;
      menuIDs['VisibleButtons'] = false;
      menuIDs['VisibleKomaPartsList'] = false;
      menuIDs['Nav1'] = false;
      menuIDs['Nav2'] = false;
      menuIDs['Nav3'] = false;
      menuIDs['Nav4'] = false;
      menuIDs['Nav5'] = false;
      menuIDs['Nav6'] = false;
      menuIDs['Nav7'] = false;
      break;
  }

  const menu = Menu.getApplicationMenu();
  if (menu) {
    for (const id of Object.keys(menuIDs)) {
      const item = menu.getMenuItemById(id);
      if (item) {
        item.enabled = menuIDs[id];
      }
    }
  }
}
