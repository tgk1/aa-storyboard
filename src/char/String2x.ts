import { Item } from '@model/Item';
import { KomaList, YBBSFile } from '@model/Koma';
import { AAListTxt } from '@model/AAListTxt';
import { mlt2KomaList, ast2KomaList } from '@/char/str2k/Str2KomaList';
import { mlt2ybbsFile } from '@/char/str2k/Str2YbbsFile';
import { txt2aalisttxt } from '@/char/str2str/Str2aalisttxt';
import * as iconv from 'iconv-lite';
import * as he from 'he';
import { AddLineBreakAtBottom, AddLineBreakAtTop } from '@/data/model/index';

export class String2x {
  static html(data: string): string {
    const dat = he.encode(data);
    return dat
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r\n|\n/g, '<br>');
  }

  static html2(data: string): string {
    const dat = data;
    return dat
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r\n|\n/g, '<br>');
  }

  static numericChar(useUnicodeSpaceOnCopy: boolean, data: string) {
    if (useUnicodeSpaceOnCopy) {
      return data;
    }
    let encData = '';
    for (const c of data.split('')) {
      const encChar = iconv.encode(c, 'Windows-31j').toString();
      if (c != '?' && encChar != '?') {
        encData += c;
      } else {
        encData += '&#' + c.charCodeAt(0) + ';';
      }
    }
    return encData;
  }

  //static decode(data: string, encoding: string) {
  static decode(buffer: Buffer, encoding: string) {
    // "Shift_JIS"
    // "Windows-31j"
    const data1 = iconv.decode(buffer, encoding);
    const data2 = he.decode(data1);
    return data2;
  }
  static htmldecode(buffer: string,) {
    return he.decode(buffer);
  }

  static encode(data: string, encoding: string) {
    // "Shift_JIS"
    // "Windows-31j"
    // replace(new RegExp(/\u2014/g), '\u2015') は\u2014 EM DASHが扱いに失敗するため
    return iconv.encode(data.replace(new RegExp(/\u2014/g), '\u2015'), encoding);
  }

  static lf2crlf(data: string) {
    return data.replace(/\n/g, '\r\n');
  }

  static mlt2komaList(data: string, item: Item): KomaList {
    return mlt2KomaList(data, item);
  }

  static ast2komaList(data: string, item: Item): KomaList {
    return ast2KomaList(data, item);
  }

  static ybbsFile(data: string): YBBSFile {
    return mlt2ybbsFile(data);
  }

  static txt2aalist(data: string): AAListTxt {
    return txt2aalisttxt(data);
  }

  static addLineBreaksAtTop(t: AddLineBreakAtTop, data: string): string {
    switch (t) {
      case AddLineBreakAtTop.NoLine:
        return data;
      case AddLineBreakAtTop.OneLine:
        return '\n' + data;
      case AddLineBreakAtTop.TwoLines:
        return '\n\n' + data;
      default:
        return data;
    }
  }

  static addLineBreaksAtBottom(t: AddLineBreakAtBottom, data: string): string {
    const text = data.replace('\n+$', '');
    switch (t) {
      case AddLineBreakAtBottom.NoLine:
        return text;
      case AddLineBreakAtBottom.YaruyomiOneLine:
        return text + '\n';
      case AddLineBreakAtBottom.CompatOneLine:
        return text + '\n.';
      case AddLineBreakAtBottom.YaruyomiTwoLines:
        return text + '\n\n';
      case AddLineBreakAtBottom.CompatTwoLines:
        return text + '\n\n.';
      default:
        return text;
    }
  }

  static addBottomTwoLines2ch(data: string): string {
    const ary = data.split('');
    if (ary[ary.length - 1] == '.' && ary[ary.length - 2] == '\n' && ary[ary.length - 3] == '\n') {
      return data;
    }
    if (ary[ary.length - 1] == '\n' && ary[ary.length - 2] == '\n') {
      return data + '.';
    }
    return data + '\n\n.';
  }

  static addBottomTwoLinesYaruyomi(data: string): string {
    const ary = data.split('');
    if (ary[ary.length - 1] == '\n' && ary[ary.length - 2] == '\n') {
      return data;
    }
    return data + '\n\n';
  }

  static removeBottomTwoLines(data: string): string {
    const ary = data.split('');
    if (ary[ary.length - 1] == '\n' && ary[ary.length - 2] == '\n') {
      return data.slice(0, -2);
    }
    return data;
  }

  // textareaなどの改行含む文字列から、
  // javascriptのselectionStartで取得したポイントを元に
  // 指定ポイントのある行の、その位置までの文字列を返す
  // 例) point2lineString("aaa\nbcd", 5) --> "c"
  static point2lineString(data: string, point: number) {
    let line = '';
    for (let i = 0; i < point; i++) {
      const cur_char = data.substring(i, i + 1);
      if (data.substring(i, i + 1) == '\n') {
        line = '';
      } else {
        line += cur_char;
      }
    }
    return line;
  }
}
