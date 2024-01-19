/* eslint-disable prettier/prettier */
import { MergeCore } from '@/char/MergeCore';
import { String2x } from '@/char/String2x';

export class TextDecorator {
  mc: MergeCore;

  constructor(mc: MergeCore) {
    this.mc = mc;
  }

  // 枠作成の挙動
  // 1) dataと左右の枠線で最大の幅を求め、暫定幅 zanteiWidth を算出する
  // 2) zanteiWidthを元に上部行を作成する 幅を算出する
  // 3) 中央、下部行を2の幅を元に作成する
  frame1A(data: string) {
    const lines = this.addFrameStr(data, '│', '│');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('┌', '─',  '┐', zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('│', data, '│', dat.width);
    const buf2 = this.makeLineCharRepeat     ('└', '─',  '┘', dat.count);

    return dat.str + buf1 + buf2;
  }

  frame1B(data: string) {
    const lines = this.addFrameStr(data, '　　', '　　');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('┌', '─',    '┐',    zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('　　', data, '　　', dat.width);
    const buf2 = this.makeLineCharRepeat     ('└', '─',    '┘',    dat.count);

    return dat.str + buf1 + buf2;
  }

  frame1D(data: string) {
    const lines = this.addFrameStr(data, '　　', '　　');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('─', '─',    '─',    zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('　　', data, '　　', dat.width);
    const buf2 = this.makeLineCharRepeat     ('─', '─',    '─',    dat.count);

    return dat.str + buf1 + buf2;
  }

  frame1E(data: string) {
    const lines = this.addFrameStr(data, '│', '│');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('┌', '　', '┐',  zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('│', data,  '│',  dat.width);
    const buf2 = this.makeLineCharRepeatCount('└', '　',   '┘', zanteiWidth);

    return dat.str + buf1 + buf2.str;
  }

  frame2A(data: string) {
    const lines = this.addFrameStr(data, '|　', '　|');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('f´', '￣',  '｀ヽ', zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('|　', data, '　|',  dat.width);
    const buf2 = this.makeLineCharRepeat     ('乂', '＿',  '_ノ',  dat.count);

    return dat.str + buf1 + buf2;
  }

  frame2B(data: string) {
    const lines = this.addFrameStr(data, '|　', '　|');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('f´', '￣',   '｀ヽ', zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('|　', data,  '　|',  dat.width);
    const buf2 = this.makeLineCharRepeat     ('ヽ', '＿',   '_乂',  dat.count);

    return dat.str + buf1 + buf2;
  }

  frame3(data: string) {
    const lines = this.addFrameStr(data, '.: :　', '　: :.');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('. : ', '.:',   ' : .', zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('. :　', data,  '　: .', dat.width);
    const buf2 = this.makeLineCharRepeat     ('. : ', '.:',   ' : .', dat.count);

    return dat.str + buf1 + buf2;
  }

  frame4A(data: string) {
    const lines = this.addFrameStr(data, '＞', '＜');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('＼', '人_', '／',  zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('＞', data,  '＜',  dat.width);
    const buf2 = this.makeLineCharRepeatCount('／', 'Y⌒',   '＼', zanteiWidth);

    return dat.str + buf1 + buf2.str;
  }

  frame4B(data: string) {
    const lines = this.addFrameStr(data, '）　', '　(');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('､__', '人_', '',  zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('）　', data,  '　(',  dat.width);
    const buf2 = this.makeLineCharRepeatCount('⌒', 'Y⌒',   '', zanteiWidth);

    return dat.str + buf1 + buf2.str;
  }

  frame5(data: string) {
    const lines = this.addFrameStr(data, '二', '二');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('＼ヽ ', 'l｜', ' /／', zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('二', data,    '二',    dat.width);
    const buf2 = this.makeLineCharRepeat     ('／/ ', 'l｜',  ' ヽ＼', dat.count);

    return dat.str + buf1 + buf2;
  }

  frame6(data: string) {
    const lines = this.addFrameStr(data, '|　', '　|');
    const zanteiWidth = this.mc.measureLinesWidth(lines);
    const dat  = this.makeLineCharRepeatCount('／', '￣', '＼',  zanteiWidth);
    const buf1 = this.makeLinePaddingSpace   ('|　', data,  '　|',  dat.width);
    const buf2 = this.makeLineCharRepeatCount('＼', '＿',   '／', zanteiWidth);

    return dat.str + buf1 + buf2.str;
  }


  deleteCharsLeft(data: string, point: number): string {
    const cline = String2x.point2lineString(data, point);
    const width = this.mc.measureWidth(cline);
    const lines = data.split('\n');

    let deletedData = '';

    for (const line of lines) {
      let tmpLine = '';
      let add_flag = false;
      for (let i = 0; i < line.length; i++) {
        tmpLine += line.substring(i, i + 1);
        const tmpWidth = this.mc.measureWidth(tmpLine);
        if (tmpWidth - width >= 0) {
          deletedData += this.mc.padding(tmpWidth - width) + line.substring(i + 1) + '\n';
          add_flag = true;
          break;
        }
      }
      if (!add_flag) {
        deletedData += "\n";
      }

    }

    return deletedData;
  }

  deleteCharsRight(data: string, point: number): string {
    const cline = String2x.point2lineString(data, point);
    const width = this.mc.measureWidth(cline);
    const zenkakuWidth = this.mc.measureWidth('\u3000');
    const lines = data.split('\n');

    let deletedData = '';

    for (const line of lines) {
      let tmpLine = '';
      let tmpWidth = 0;
      for (let i = 0; i < line.length; i++) {
        tmpLine += line.substring(i, i + 1);
        tmpWidth = this.mc.measureWidth(tmpLine);
        if (tmpWidth - width >= 0) {
          break;
        }
      }
      deletedData += tmpLine + this.mc.padding(zenkakuWidth - tmpWidth - width) + '\n';
    }

    return deletedData;
  }


  private addFrameStr(data: string, left: string, right: string): string[] {
    const tmpLines = data.split(/\n/);
    const lines: string[] = []
    for (const line of tmpLines) {
      //TODO 要確認
      //lines.push(right + line + right);
      lines.push(left + line + right); //left + rightのはず????
    }
    return lines;
  }
  private makeLinePaddingSpace(left: string, center: string, right: string, width: number) {
    let buf = '';
    for (const line of center.split(/\n/)) {
      buf += this.makeLinePaddingSpace2(left, line, right, width);
    }
    return buf;
  }

  private makeLinePaddingSpace2(left: string, center: string, right: string, width: number) {
    const line = left + center + right;
    let line0 = left + center;
    const cw = this.mc.measureWidth('\u3000');
    let w = this.mc.measureWidth(line);
    //const log = require('electron-log');

    if (width - w < cw) {
      //let debugNum = width - w;
      //let tmpWidth = this.mc.padding(width - w, true);
      //return left + center + this.mc.padding(width - w, true) + right + " P1(" + width + ":" + w + ":" + debugNum + ")\n";
      return left + center + this.mc.padding(width - w) + right + '\n';
    }
    while (w < width) {
      const tmpLine = line0 + '\u3000' + right;
      const tmpWidth = this.mc.measureWidth(tmpLine);
      if (width - tmpWidth < cw) {
        //let debugNum = width - tmpWidth;
        //return line0 + "\u3000" + this.mc.padding(width - tmpWidth, true) + right + " P2(" + tmpWidth + ":" + debugNum + ")\n";
        return line0 + '\u3000' + this.mc.padding(width - tmpWidth) + right + '\n';
      }
      line0 += '\u3000';
      w = tmpWidth;
    }
    return left + center + right + '\n';
  }

  /*
  private makeLineCharRepeat(left: string, center: string, right: string, width: number) {
    let line0 = left + center;
    let cw = this.mc.measureWidth(center);
    let w = this.mc.measureWidth(left + center + right);

    while (w < width) {
      let tmpLine = line0 + center + right;
      let tmpWidth = this.mc.measureWidth(tmpLine);
      if (width - tmpWidth < cw) {
        //let debugNum = width - tmpWidth;
        //return line0 + center + this.mc.padding(width - tmpWidth, true) + right + " R(" + tmpWidth + ":" + debugNum + ")" + "\n";
        return line0 + center + this.mc.padding(width - tmpWidth, true) + right + "\n";
      }
      line0 += center;
      w = tmpWidth;
    }
    return left + center + right + "\n";
  }
  */

  private makeLineCharRepeatCount(left: string, center: string, right: string, width: number) {
    let line0 = left;
    let w = this.mc.measureWidth(left + center + right);

    let i = 1;
    while (w < width) {
      line0 += center;
      i += 1;
      const tmpLine = line0 + center + right;
      const tmpWidth = this.mc.measureWidth(tmpLine);
      if (width <= tmpWidth) {
        return { str: tmpLine + '\n', width: tmpWidth, count: i };
      }
      w = tmpWidth;
    }
    return { str: left + center + right + '\n', width: width, count: 1 };
  }

  private makeLineCharRepeat(left: string, center: string, right: string, count: number) {
    let line = '';
    let i = 0;
    while (i < count) {
      line += center;
      i += 1;
    }
    return left + line + right + '\n';
  }
}
