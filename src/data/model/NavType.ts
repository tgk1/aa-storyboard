/* eslint-disable prettier/prettier */
import { Item, ItemType } from './Item';

export enum NavType {
  WebFolderMLT   = 'WebFolderMLT',
  LocalFolderMLT = 'LocalFolderMLT',
  LocalFolderDB  = 'LocalFolderDB',
  MarkFolder     = 'MarkFolder',
  RecentFolder   = 'RecentFolder',
  ReplicaFolder  = 'ReplicaFolder',
  Config         = 'Config'
}

export function nav2item(ntype: NavType): Item {
  const items: { [s: string]: ItemType } = {
    WebFolderMLT:   ItemType.WebFolderMLT,
    LocalFolderMLT: ItemType.LocalFolderMLT,
    LocalFolderDB:  ItemType.LocalFolderDB,
    MarkFolder:     ItemType.MarkFolder,
    RecentFolder:   ItemType.RecentFolder,
    ReplicaFolder:  ItemType.ReplicaFolder,
    Config:         ItemType.AppStart
  };
  return new Item(items[ntype]);
}
