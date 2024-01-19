import { Koma, KomaPart } from '@model/Koma';

export class KomaPartsClient {
  dic = { path: '', komaID: 0 };

  constructor(path: string, komaID: number) {
    this.dic['path'] = path;
    this.dic['komaID'] = komaID;
  }

  public getKomaPart(komaPartID: number): Promise<KomaPart> {
    const d = Object.assign(this.dic, { komaPartID: komaPartID });
    return window.localDB.getKomaPart(d);
  }

  public getKomaParts(): Promise<Array<KomaPart>> {
    return window.localDB.getKomaParts(this.dic);
  }

  public trashKomaPart(kpart: KomaPart) {
    const d = Object.assign(this.dic, { strKomaPart: JSON.stringify(kpart) });
    window.localDB.trashKomaPart(d);
  }

  public hasMergedKomaParts(): boolean {
    return window.localDB.hasMergedKomaParts(this.dic);
  }

  public hasTrashedKomaParts(): boolean {
    return window.localDB.hasTrashedKomaParts(this.dic);
  }

  public undoMergeKomaParts(): Promise<Array<KomaPart>> {
    window.localDB.undoMergeKomaParts(this.dic);
    return this.getKomaParts();
  }

  public undoTrashKomaPart(): Promise<Array<KomaPart>> {
    window.localDB.undoTrashKomaPart(this.dic);
    return this.getKomaParts();
  }

  public sortKomaParts(id: number, oldOrderNum: number, newOrderNum: number): Promise<Array<KomaPart>> {
    const d = Object.assign(this.dic, {
      komaPartID: id,
      oldOrderNum: oldOrderNum,
      newOrderNum: newOrderNum
    });
    window.localDB.sortKomaParts(d);
    return this.getKomaParts();
  }

  public insertKomaPart(kpart: KomaPart): number {
    kpart.parent_id = this.dic['komaID'];
    const d = Object.assign(this.dic, { strKomaPart: JSON.stringify(kpart) });
    return window.localDB.insertKomaPart(d);
  }

  public addNewKomaPart(): number {
    return window.localDB.addNewKomaPart(this.dic);
  }

  public duplicateKomaPart(kpart: KomaPart): number {
    kpart.parent_id = this.dic['komaID'];
    const d = Object.assign(this.dic, { strKomaPart: JSON.stringify(kpart) });
    return window.localDB.duplicateKomaPart(d);
  }

  public setKomaPart(kpart: KomaPart) {
    kpart.parent_id = this.dic['komaID'];
    const d = Object.assign(this.dic, { strKomaPart: JSON.stringify(kpart) });
    window.localDB.setKomaPart(d);
  }

  public mergeKomaParts(koma: Koma, kpart: KomaPart): Promise<Array<KomaPart>> {
    kpart.parent_id = this.dic['komaID'];
    const d = Object.assign(this.dic, { strKoma: JSON.stringify(koma), strKomaPart: JSON.stringify(kpart) });
    window.localDB.mergeKomaParts(d);
    return this.getKomaParts();
  }
}
