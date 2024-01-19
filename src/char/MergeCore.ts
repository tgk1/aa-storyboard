import { KomaPart } from '@model/Koma';
import he from 'he';
/*
  メモ1)
  現在はフォントサイズ16で、1から16までを決め打ちで設定する仕様に変更した。

  メモ2)
  古い情報
  古のデフォルトフォント  MS Pゴシック + サイス 16
  //import { createCanvas } from 'canvas';

  ChromeにはDirectWrite使用によりMS Pゴシックでの文字幅が、AA作成時の幅と異なる問題がある。
  createCanvasで画像化し、その幅を測るとその違いが出る
  よって文字幅計算においてMS Pゴシックは使用できない。

  AA対応フォントでも文字幅が微妙に合わないときがある。
  tests/unit/letters_spec.tsで試験すると、monapo Saiamaaarなど期待値にならないケースがある。
  Fantasioso Acsii Artでのドット幅と概ねずれないのが
  全てを調べたわけではないがRobotoJAAだった。

*/

export class MergeCore {
  public gridWidth!: number; //全角文字のドット数
  public gridHeight!: number; //全角文字のドット数
  public fontSize!: number;
  private el!: HTMLElement;

  //prettier-ignore
  spaceCatalog = [
    { code: 0x0020, dot: 5,      name: 'SAPCE' },
    { code: 0x00a0, dot: 5,      name: 'NO-BREAK SPACE' },
    { code: 0x2002, dot: 8,      name: 'EN SPACE' },
    { code: 0x2003, dot: 16,     name: 'EM SPACE' },
    { code: 0x2004, dot: 5,      name: 'THREE-PER-EM SPACE' },
    { code: 0x2005, dot: 4,      name: 'FOUR-PER-EM SPACE' },
    { code: 0x2006, dot: 3,      name: 'SIX-PER-EM SPACE' },
    { code: 0x2007, dot: 9,      name: 'FIGURE SPACE' },
    { code: 0x2008, dot: 4,      name: 'PUNCTUATION SPACE' },
    { code: 0x2009, dot: 2,      name: 'THIN SPACE' },
    { code: 0x200a, dot: 2,      name: 'HAIR SPACE' },
    { code: 0x200b, dot: 0,      name: 'ZERO WIDTH SPACE' },
    { code: 0x3000, dot: 11,     name: 'ZENKAKU SAPCE' },
    { code: 0xfeff, dot: 0,      name: 'ZERO WIDTH NO-BREAK SPACE' },
    { code: 0x0009, dot: 39.875, name: 'CHARACTER TABULATION' },
    { code: 0x8204, dot: 16,     name: 'zero width non-joiner' }
  ];

  //prettier-ignore
  spaceCatalogUnicodePaddings = [
    { dot: 1,  code: [0x200a],         name: '' }, // dummy
    { dot: 2,  code: [0x2009],         name: '' },
    { dot: 3,  code: [0x2006],         name: '' },
    { dot: 4,  code: [0x2005],         name: '' },
    { dot: 5,  code: [0x0020],         name: '' },

    { dot: 6,  code: [0x2006, 0x2006], name: '' },
    { dot: 7,  code: [0x2005, 0x2006], name: '' },
    { dot: 8,  code: [0x2002],         name: '' },
    { dot: 9,  code: [0x2004, 0x2005], name: '' },
    { dot: 10, code: [0x2004, 0x2004], name: '' },

    { dot: 11, code: [0x3000],         name: '' },
    { dot: 12, code: [0x2002, 0x2005], name: '' },
    { dot: 13, code: [0x3000, 0x200a], name: '' },
    { dot: 14, code: [0x3000, 0x2006], name: '' },
    { dot: 15, code: [0x3000, 0x2005], name: '' },

    { dot: 16, code: [0x3000, 0x2004], name: '' }
    //{ dot:26,  code: [0x2009, 0x2008], name: '' }
  ];

  constructor(el: HTMLElement | null, fontSize: number) {
    if (el) {
      this.el = el;
      this.setFontSize(fontSize);
    } else {
      this.fontSize = 16;
      this.gridWidth = 11;
      this.gridHeight = 18;
    }
    //this.testWidth();
  }

  testWidth() {
    // debug 確認用
    /*
    for (let s of this.spaceCatalog) {
      this.log.info('CODE:' + s.code + ' ' + s.dot + ' : ' + this.measureWidth(String.fromCharCode(s.code)));
    }
    */
    for (const s of this.spaceCatalogUnicodePaddings) {
      let space = '';
      for (const scode of s.code) {
        space += String.fromCharCode(scode);
      }
      console.log('CODE:' + s.code + ' ' + s.dot + ' : ' + this.measureWidth(space));
      //this.log.info('CODE:' + s.code + ' ' + s.dot + ' : ' + this.measureWidth(space));
    }
  }

  setCanvas(el: HTMLElement) {
    this.el = el;
    return this;
  }

  setFontSize(fontSize: number) {
    this.fontSize = fontSize;
    this.gridWidth = this.measureWidth('\u3000');
    this.gridHeight = fontSize + (fontSize > 10 ? 2 : 1);
    //this.gridHeight = fontSize + (Math.floor(fontSize / 10));
    return this;
  }

  // 文字列の幅
  public measureWidth(str: string): number {
    if (this.el) {
      while (this.el.lastChild) {
        this.el.removeChild(this.el.lastChild);
      }
      const tx = this.el.appendChild(document.createTextNode(str));
      const w = this.el.offsetWidth;
      this.el.removeChild(tx);
      return w;
    }
    return -1; //何らかの不具合
  }

  // 半角文字から幅や名前などを出す
  spaceCharInfo(char: string): string {
    for (let i = 0; i < this.spaceCatalog.length; i++) {
      const sc: { code: number; dot: number; name: string } = this.spaceCatalog[i];
      if (char == String.fromCharCode(sc.code)) {
        return `${sc.dot}dot ${sc.name}`;
      }
    }
    return '';
  }

  public measureLinesWidth(lines: string[]): number {
    let maxW = 0;
    for (const line of lines) {
      const w = this.measureWidth(line);
      maxW = w > maxW ? w : maxW;
    }
    return maxW;
  }

  // 文字列の高さ
  public measureHight(str: string): number {
    const lines = str.split(/\n/);
    return lines.length * this.gridHeight;
  }

  // css的にはleft
  public kmpX2dotX(x: number) {
    return x * this.gridWidth;
  }
  // css的にはtop
  public kmpY2dotY(y: number) {
    return y * this.gridHeight;
  }
  // css的にはright
  public kmpX2dotW(x: number, str: string) {
    return x * this.gridWidth + this.measureWidth(str);
  }
  // css的にはbottom
  public kmpY2dotH(y: number, str: string) {
    return y * this.gridHeight + this.measureHight(str);
  }

  // 二つのKomaPartの位置と大きさから、全体の縦横サイズを求める
  private getLayerSize(kparts: KomaPart[]) {
    let maxW = 0;
    let maxLine = 0;
    for (const kpart of kparts) {
      const w = kpart.x * this.gridWidth + this.measureWidth(kpart.data);
      const linesLength = kpart.y + kpart.data.split(/\r\n|\n/).length;
      maxW = w > maxW ? w : maxW;
      maxLine = linesLength > maxLine ? linesLength : maxLine;
    }
    return { width: maxW, line: maxLine };
  }

  // 左側を指定X座標まで、全角空白で埋める1
  private kmp2layer(kpart: KomaPart, width: number, line: number): string[] {
    const buf: string[] = [];
    const kdata = he.decode(kpart.data); // ただしbeta 0.9.2以前での参照文字などがある場合があるのお
    const lines = kdata.split(/\r\n|\n/);
    for (let i = 0; i < line; i++) {
      if (i < kpart.y || i > kpart.y + lines.length - 1) {
        buf.push(this.zenkakuPaddingDot(width));
      } else {
        buf.push(this.zenkakuPaddingDot(kpart.x * this.gridWidth) + lines[i - kpart.y]);
      }
    }
    return buf;
  }
  // 左側を指定X座標まで、全角空白で埋める2
  private zenkakuPaddingDot(x: number) {
    let buf = '';
    for (let i = 0; i < x; i += this.gridWidth) {
      buf += String.fromCharCode(0x3000);
    }
    return buf;
  }

  // 指定ドット幅の空白文字列を、全角空白+補正空白で作成する
  padding(width: number): string {
    let buf = '';
    let w = Math.round(width);
    for (w; w >= this.gridWidth; w -= this.gridWidth) {
      buf += String.fromCharCode(0x3000);
    }
    if (this.spaceCatalogUnicodePaddings[w - 1]) {
      for (let j = 0; j < this.spaceCatalogUnicodePaddings[w - 1].code.length; j++) {
        buf += String.fromCharCode(this.spaceCatalogUnicodePaddings[w - 1].code[j]);
      }
    }
    return buf;
  }

  // 右側にある空白を削除する
  private removeRightSpace(line: string) {
    let i = 0;
    for (const c of line.split('').reverse()) {
      const isSpace = this.spaceCatalog.find((sp) => {
        return sp.code == c.charCodeAt(0) || c == '\n';
      });
      if (!isSpace) {
        return line.slice(0, line.length - i);
      }
      i += 1;
    }
    return '';
  }

  public removeLFs(data: string): string {
    return data.replace(/\n+$/, '\n');
  }

  //
  //
  //
  public mergeKomaPartsArray(kparts: KomaPart[]): KomaPart | null {
    let mergedData = '';
    let lower: KomaPart | null = null;

    if (kparts.length == 1) {
      lower = new KomaPart();
      lower.data = '';
    }

    for (const kpart of kparts.slice().reverse()) {
      if (lower) {
        //console.log('QQ mergeKomaPart: ID: ' + kpart.id + ' X:' + kpart.x, ' Y:' + kpart.y);
        mergedData = this.mergeKomaParts(lower, kpart);
        const tmpKPart = new KomaPart();
        tmpKPart.data = mergedData;
        tmpKPart.html = he.decode(mergedData);
        tmpKPart.parent_id = kpart.parent_id;
        tmpKPart.order_num = 1;
        tmpKPart.name = 'AA1';
        tmpKPart.mode = kpart.mode;
        lower = tmpKPart;
      } else {
        lower = kpart;
      }
    }

    if (lower) {
      lower = this.replaceSPC(lower);
    }
    return lower;
  }
  //
  // KomaPartを1行ずつマージ
  //
  // 1) 上位レイヤー下位レイヤーを、同じ幅、高さになるように空白で埋める。
  // 2) 1行ごとに上位と下位を結合する
  // 上位は中央にあると想定、その左側と右側にある下位レイヤーは表示があるとして結合する、中央にある下位レイヤーの文字は削除する
  // [左側下位レイヤー] + [中央上位レイヤー] + [右側下位レイヤー] となる
  public mergeKomaParts(lowerKpart: KomaPart, upperKpart: KomaPart) {
    const size = this.getLayerSize([lowerKpart, upperKpart]);
    const lowerLayer: string[] = this.kmp2layer(lowerKpart, size.width, size.line);
    const upperLayer: string[] = this.kmp2layer(upperKpart, size.width, size.line);

    let buf = '';
    //this.log.info('LC mergeKomaParts: w:' + size.width + ' h:' + size.line);
    if (upperKpart.mode == 2) {
      for (let i = 0; i < size.line; i++) {
        //this.log.info('LC mergeKomaParts:' + i + '|' + lowerLayer[i] + '|' + upperLayer[i] + '|');
        buf += this.mergeKomaPartsLine(lowerLayer[i], upperLayer[i]);
      }
      return this.removeLFs(buf);
    } else if (upperKpart.mode == 1) {
      for (let i = 0; i < size.line; i++) {
        buf += this.mergeKomaPartsLineWithSpacePadding(lowerLayer[i], upperLayer[i]);
      }
      return this.removeLFs(buf);
    } else if (upperKpart.mode == 3) {
      for (let i = 0; i < size.line; i++) {
        buf += this.mergeKomaPartsLineDropRight(lowerLayer[i], upperLayer[i]);
      }
      return this.removeLFs(buf);
    } else if (upperKpart.mode == 4) {
      for (let i = 0; i < size.line; i++) {
        buf += this.mergeKomaPartsLineDropLeft(lowerLayer[i], upperLayer[i]);
      }
      return this.removeLFs(buf);
    } else {
      const position = this.positionUpperLayer(upperKpart);
      for (let i = 0; i < size.line; i++) {
        if (i >= position.startY && i <= position.endY) {
          buf += this.mergeNonTransparentKomaPartsLine(lowerLayer[i], upperLayer[i], position);
        } else {
          buf += this.mergeKomaPartsLine(lowerLayer[i], upperLayer[i]);
        }
      }
      return this.removeLFs(buf);
    }
  }

  // eslint-disable-next-line prettier/prettier
  mergeKomaPartsLine(lower: string, upper: string) {
    const upperFigure = this.getUpperFigureData(this.removeRightSpace(upper));
    const lowerFigure = this.getLowerFigureData(lower, upperFigure.startPoint, upperFigure.endPoint);
    const mergedLine = this.removeRightSpace(lowerFigure.dataLeft + upperFigure.dataCenter + lowerFigure.dataRight);
    return mergedLine + '\n';
    //return mergedLine + '|[T ' + upperFigure.startPoint + ':' + upperFigure.endPoint + ']\n';
  }

  mergeNonTransparentKomaPartsLine(lower: string, upper: string, position: NonTransparentLayerPosition) {
    const upperFigure = this.getNonTransparentUpperFigureData(upper, position);
    const lowerFigure = this.getLowerFigureData(lower, upperFigure.startPoint, upperFigure.endPoint);
    const mergedLine = this.removeRightSpace(lowerFigure.dataLeft + upperFigure.dataCenter + lowerFigure.dataRight);
    return mergedLine + '\n';
    //return mergedLine + '|[NT ' + upperFigure.startPoint + ':' + upperFigure.endPoint + '] \n';
  }

  mergeKomaPartsLineWithSpacePadding(lower: string, upper: string) {
    const upperFigure = this.getUpperFigureDataWithSpacePadding(this.removeRightSpace(upper));
    const lowerFigure = this.getLowerFigureData(lower, upperFigure.startPoint, upperFigure.endPoint);
    const mergedLine = this.removeRightSpace(lowerFigure.dataLeft + upperFigure.dataCenter + lowerFigure.dataRight);
    return mergedLine + '\n';
  }

  mergeKomaPartsLineDropRight(lower: string, upper: string) {
    const upperFigure = this.getUpperFigureData(this.removeRightSpace(upper));
    const lowerFigure = this.getLowerFigureData(lower, upperFigure.startPoint, upperFigure.endPoint);
    const mergedLine = this.removeRightSpace(lowerFigure.dataLeft + upperFigure.dataCenter);
    return mergedLine + '\n';
  }

  mergeKomaPartsLineDropLeft(lower: string, upper: string) {
    const upperFigure = this.getUpperFigureData(this.removeRightSpace(upper));
    const lowerFigure = this.getLowerFigureData(lower, upperFigure.startPoint, upperFigure.endPoint);
    const leftSpace = upperFigure.startPoint == 0 ? lowerFigure.dataLeft : this.padding(upperFigure.startPoint);
    const mergedLine = this.removeRightSpace(leftSpace + upperFigure.dataCenter + lowerFigure.dataRight);
    return mergedLine + '\n';
    //return mergedLine + '|[T ' + upperFigure.startPoint + ':' + upperFigure.endPoint + ']\n';
  }

  // 中央に図像があり、左右に空白があると想定。
  // 左端と右端からそれぞれ空白領域を調べ、
  // 上書き対象となる領域(左X、 右X)を返す。
  // ※ 実際は右側の空白領域はあらかじめ削除されているケースがほとんどのはず。
  getUpperFigureData(line: string): FigureData {
    let startIndex = 0;
    let endIndex = 0;

    for (const c of line) {
      const isSpace = this.spaceCatalog.find((sp) => {
        return sp.code == c.charCodeAt(0);
      });
      if (!isSpace) break;
      startIndex += 1;
    }
    for (const c of line.split('').reverse()) {
      const isSpace = this.spaceCatalog.find((sp) => {
        return sp.code == c.charCodeAt(0);
      });
      if (!isSpace) break;
      endIndex += 1;
    }
    endIndex = startIndex < endIndex ? line.length - endIndex : line.length;

    //this.log.info('LC getUpperFigureData: startIndex: ' + startIndex + ' endIndex:', endIndex + ' | ' + line + ' |');
    let figure = line.slice(startIndex, endIndex);
    let startPoint = this.measureWidth(line.slice(0, startIndex));
    let endPoint = this.measureWidth(figure) + startPoint;
    if (startIndex == endIndex) {
      startPoint = 0;
      endPoint = 0;
      figure = '';
    }

    //this.log.info('LC getUpperFigureData: startPoint: ' + startPoint + ' endPoint:', endPoint + ' | ' + line + ' |');
    return { startPoint: startPoint, endPoint: endPoint, dataLeft: '', dataCenter: figure, dataRight: '' };
  }

  // 中央に図像があり、左右に空白があると想定。
  // 左端と右端からそれぞれ空白領域を調べ、
  // 上書き対象となる領域(左X、 右X)を返す。
  // ※ 実際は右側の空白領域はあらかじめ削除されているケースがほとんどのはず。
  getUpperFigureDataWithSpacePadding(line: string): FigureData {
    let startIndex = 0;
    let endIndex = 0;

    for (const c of line) {
      const isSpace = this.spaceCatalog.find((sp) => {
        return sp.code == c.charCodeAt(0);
      });
      if (!isSpace) {
        startIndex = startIndex > 1 ? startIndex - 2 : 0;
        break;
      }
      startIndex += 1;
    }
    for (const c of line.split('').reverse()) {
      const isSpace = this.spaceCatalog.find((sp) => {
        return sp.code == c.charCodeAt(0);
      });
      if (!isSpace) break;
      endIndex += 1;
    }
    endIndex = startIndex < endIndex ? line.length - endIndex : line.length;

    //this.log.info('LC getUpperFigureData: startIndex: ' + startIndex + ' endIndex:', endIndex + ' | ' + line + ' |');
    let figure = line.slice(startIndex, endIndex) + String.fromCharCode(0x3000); // EM_SPACEを追加する
    let startPoint = this.measureWidth(line.slice(0, startIndex));
    let endPoint = this.measureWidth(figure) + startPoint; // EM_SPACE幅分を追加する
    if (startIndex == endIndex) {
      startPoint = 0;
      endPoint = 0;
      figure = '';
    }

    //this.log.info('LC getUpperFigureData: startPoint: ' + startPoint + ' endPoint:', endPoint + ' | ' + line + ' |');
    return { startPoint: startPoint, endPoint: endPoint, dataLeft: '', dataCenter: figure, dataRight: '' };
  }

  getNonTransparentUpperFigureData(line: string, position: NonTransparentLayerPosition): FigureData {
    let startIndex = 0;
    //const endIndex = 0;

    let tmpLine = '';
    let tmpFigure = '';
    let tmpWidth = 0;
    let i = 0;
    for (const c of line) {
      tmpLine += c;
      tmpWidth = this.measureWidth(tmpLine);
      if (i >= position.startX) {
        tmpFigure += c;
      }
      if (tmpWidth > position.endDotX) {
        break;
      }
      i += 1;
    }
    startIndex = position.startX;

    const figure = tmpFigure;
    const startPoint = this.measureWidth(line.slice(0, startIndex));
    const endPoint = this.measureWidth(tmpFigure) + startPoint;

    return { startPoint: startPoint, endPoint: endPoint, dataLeft: '', dataCenter: figure, dataRight: '' };
  }

  getLowerFigureData(line: string, startPoint: number, endPoint: number) {
    if (startPoint == 0 && endPoint == 0) {
      //UpperLayerは空白のみなので処理をスキップする
      return { startPoint: 0, endPoint: 0, dataLeft: line, dataCenter: '', dataRight: '' };
    }

    let dataLeft = '';
    let dataRight = '';
    let currentStr = '';
    let i = 0;
    let step = 0;
    if (startPoint == 0) {
      step = 1;
    }

    const lineAndPadding = line + this.padding(endPoint);
    let beforeMesureWidth = 0;
    for (const c of lineAndPadding) {
      const nextMesureWidth = this.measureWidth(currentStr + c);
      if (step == 0 && nextMesureWidth >= startPoint) {
        //this.log.info('LC getLowerFigureData2: startPoint: ' + startPoint + ' mesStartPoint:' + nextMesureWidth + ' endPoint:' + endPoint);
        if (nextMesureWidth - startPoint == 0) {
          dataLeft = currentStr + c;
        } else {
          dataLeft = this.sliceLeftSide(currentStr, startPoint - beforeMesureWidth);
        }
        step = 1;
      } else if (step == 1 && nextMesureWidth >= endPoint) {
        //this.log.info('LC getLowerFigureData3: startPoint: ' + startPoint + ' mesStartPoint:' + nextMesureWidth + ' endPoint:' + endPoint);
        if (nextMesureWidth - startPoint == 0) {
          dataRight = this.sliceRightSide(lineAndPadding.slice(i + 1), nextMesureWidth - beforeMesureWidth);
        } else {
          dataRight = this.sliceRightSide(lineAndPadding.slice(i + 1), nextMesureWidth - endPoint);
        }

        break;
      }
      currentStr += c;
      beforeMesureWidth = nextMesureWidth;
      i += 1;
    }

    return { startPoint: startPoint, endPoint: endPoint, dataLeft: dataLeft, dataCenter: '', dataRight: dataRight };
  }

  private sliceLeftSide(line: string, width: number): string {
    //this.log.info('LC sliceLeftSide:' + line.length + ':' + width);
    return line + this.padding(width);
  }

  private sliceRightSide(line: string, width: number): string {
    //this.log.info('LC sliceRightSide:' + line.length + ':' + width);
    return this.padding(width) + line;
  }

  //
  // mergeMode: 0
  private positionUpperLayer(kpart: KomaPart): NonTransparentLayerPosition {
    const pos: NonTransparentLayerPosition = { startX: 0, startY: 0, endDotX: 0, endY: 0 };
    const lines = kpart.data.split('\n');
    pos.startX = kpart.x;
    pos.startY = kpart.y;
    pos.endY = pos.startY + lines.length - 1;
    for (const line of lines) {
      const x = this.measureWidth(line) + kpart.x * this.gridWidth;
      pos.endDotX = x > pos.endDotX ? x : pos.endDotX;
    }
    return pos;
  }

  // 連続した半角スペースがあればユニコード半角に変換する
  private replaceSPC(kpart: KomaPart) {
    kpart.data = kpart.data.replace(/(  +)/g, function (match) {
      let spc = ' ';
      for (let i = 0; i < match.length - 1; i++) {
        spc = spc.concat('\u2004');
      }
      return spc;
    });

    kpart.html = he.decode(kpart.data);
    return kpart;
  }
}

interface FigureData {
  startPoint: number;
  endPoint: number;
  dataRight: string;
  dataCenter: string;
  dataLeft: string;
}

//
// mergeMode: 0
interface NonTransparentLayerPosition {
  startX: number;
  startY: number;
  endDotX: number;
  endY: number;
}
