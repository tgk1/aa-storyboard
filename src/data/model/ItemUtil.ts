import { Item, ItemType, ItemSort, ItemOrder, ItemList } from './Item';

export class ItemUtil {
  static str2ItemType(name: string): ItemType {
    const val = ItemType[name as keyof typeof ItemType];
    return val ? val : ItemType.AppStart;
  }

  static str2ItemSort(name: string): ItemSort {
    const val = ItemSort[name as keyof typeof ItemSort];
    return val ? val : ItemSort.Name;
  }

  static str2ItemOrder(name: string): ItemOrder {
    const val = ItemOrder[name as keyof typeof ItemOrder];
    return val ? val : ItemOrder.ASC;
  }

  //prettier-ignore
  static sortSets: { [ItemType: string]: Array<string> } = {
    LocalFolderDB:  ['Name-ASC', 'Name-DESC', 'UpdateDate-DESC', 'UpdateDate-ASC'],
    LocalFolderMLT: ['Name-ASC', 'Name-DESC', 'UpdateDate-DESC', 'UpdateDate-ASC'],
    WebFolderMLT:   ['Name-ASC', 'UpdateDate-DESC'],
    MarkFolder:     ['Name-ASC', 'Name-DESC', 'UpdateDate-DESC', 'AccessDate-DESC', 'UseDate-DESC'],
    RecentFolder:   ['Name-ASC', 'Name-DESC', 'AccessDate-DESC', 'UseDate-DESC'],
    ReplicaFolder:  ['Name-ASC', 'Name-DESC', 'UpdateDate-DESC', 'UpdateDate-ASC']
  };

  static setSortOption(item: Item, value: string): Item {
    const sortOrderAry = value.split('-');
    item.sort = ItemUtil.str2ItemSort(sortOrderAry[0]);
    item.order = ItemUtil.str2ItemOrder(sortOrderAry[1]);
    return item;
  }

  static getSortOptions(item: Item) {
    const sortList: { label: string; value: string; sort: ItemSort; order: ItemOrder }[] = [];

    const sortSets = ItemUtil.sortSets[item.type] ? ItemUtil.sortSets[item.type] : [];

    for (const sortSet of sortSets) {
      let tmp_item = new Item(item.type);
      tmp_item = ItemUtil.setSortOption(tmp_item, sortSet);

      const label = item.sort.valueOf() + '-' + item.order.valueOf();

      const dic = { label: label, value: sortSet, sort: tmp_item.sort, order: tmp_item.order };
      sortList.push(dic);
    }

    return sortList;
  }

  static getSortOptionVal(item: Item) {
    const sortVal = '';
    if (!item) return '';

    const sortSets = ItemUtil.sortSets[item.type] ? ItemUtil.sortSets[item.type] : [];

    for (const sortSet of sortSets) {
      let tmp_item = new Item(item.type);
      tmp_item = ItemUtil.setSortOption(tmp_item, sortSet);

      if (tmp_item.sort == item.sort && tmp_item.order && item.order) {
        return sortSet;
      }
    }
    return sortVal;
  }

  static obj2item(obj: Item): Item {
    const item = new Item(ItemUtil.str2ItemType(obj.type));
    item.web_id = obj.web_id;
    item.name = obj.name;
    item.url = obj.url;
    item.hukutemp_path = obj.hukutemp_path;
    item.size = obj.size;
    item.access_date = new Date(obj.access_date);
    item.use_date = new Date(obj.use_date);
    item.update_date = new Date(obj.update_date);
    item.parent_name = obj.parent_name;
    item.parent_web_id = obj.parent_web_id;
    item.sort = ItemUtil.str2ItemSort(obj.sort);
    item.order = ItemUtil.str2ItemOrder(obj.order);
    item.search = obj.search;
    item.mark = obj.mark;
    item.scroll = obj.scroll;
    item.original_url = obj.original_url;
    if (!obj.original_url) {
      item.original_url = obj.url;
    }
    item.replica_name = obj.replica_name;
    return item;
  }

  static obj2items(obj: Item[]): Item[] {
    const ary: Item[] = [];
    for (const obj2 of obj) {
      ary.push(ItemUtil.obj2item(obj2));
    }
    return ary;
  }

  static obj2itemList(obj: ItemList): ItemList {
    const list = new ItemList();
    list.base = ItemUtil.obj2item(obj.base);
    list.items = ItemUtil.obj2items(obj.items);
    return list;
  }
}
