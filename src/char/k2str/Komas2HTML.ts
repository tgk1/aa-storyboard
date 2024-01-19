//
// Koma[]からMLT用string(SJIS)を作成する
//
// 引数のKoma[]はorder_numの昇順であることを想定している
//

import { Koma } from '@model/Koma';
import { Komas2String } from '@/char/K2StrInterface';

export interface Komas2HTML extends Komas2String<typeof Komas2HTML> {}
export class Komas2HTML implements Komas2String<typeof Komas2HTML> {
  html_header = '';
  html_footer = '';
  koma_header = '<div class="koma">';
  koma_footer = '</div>';
  date_header = '<div class="res_header">';
  date_footer = '</div>';
  aa_header = '<div class="aa">';
  aa_footer = '</div>';

  public static convert(name: string, komas: Koma[]): string {
    let buf = '';
    let i = 0;
    for (const koma of komas) {
      i += 1;
      const buf2 = koma.data.replace(/\n/g, '<br>\n');
      buf += this.koma_html(i, buf2);
    }

    return this.header(name) + buf + this.footer();
  }

  private static header(name: string): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <link href="aa.css" rel="stylesheet" />
  <title>${name}</title>
</head>
<body>
<div class="main">
<h1>${name}</h1>
`;
  }

  private static footer(): string {
    return '</div></body></html>';
  }

  private static date_html(num: number): string {
    const header = '<div class="koma_header"><a name="' + num.toString() + '">';
    const footer = '</a></div>\n';
    return header + num.toString() + footer;
  }

  private static aa_html(data: string): string {
    const header = '<div class="aa">';
    const footer = '</div>\n';
    return header + data + footer;
  }

  private static koma_html(num: number, data: string): string {
    const header = '<div class="koma">\n';
    const footer = '</div>\n';
    return header + this.date_html(num) + this.aa_html(data) + footer;
  }
}
