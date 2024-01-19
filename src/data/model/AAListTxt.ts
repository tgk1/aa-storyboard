export class AAListTxt {
  id = 0;
  names: { id: number; name: string }[] = [];
  lists: { id: number; name: string; value: string }[][] = [];

  //prettier-ignore
  constructor() {
    this.id = 0;

    this.names.push({ name: '空白文字セット', id: 0 });
    this.names.push({ name: '空白文字',      id: 1 });

    this.lists[0] = [
      { name: '1dot',  value: '\u200A',       id: 0 },
      { name: '2dot',  value: '\u2009',       id: 1 },
      { name: '3dot',  value: '\u2006',       id: 2 },
      { name: '4dot',  value: '\u2005',       id: 3 },
      { name: '5dot',  value: '\u0020',       id: 4 },
      { name: '6dot',  value: '\u2006\u2006', id: 5 },
      { name: '7dot',  value: '\u2005\u2006', id: 6 },
      { name: '8dot',  value: '\u2002',       id: 7 },
      { name: '9dot',  value: '\u2004\u2005', id: 8 },
      { name: '10dot', value: '\u2004\u2004', id: 9 },
      { name: '11dot', value: '\u3000',       id: 10 },
      { name: '12dot', value: '\u2002\u2005', id: 11 },
      { name: '13dot', value: '\u3000\u200A', id: 12 },
      { name: '14dot', value: '\u3000\u2006', id: 13 },
      { name: '15dot', value: '\u3000\u2005', id: 14 },
      { name: '16dot', value: '\u3000\u2004', id: 15 }
    ];

    this.lists[1] = [
      { name: '5dot 半角空白',            value: '\u0020', id: 0 },
      { name: '11dot 全角空白',           value: '\u3000', id: 1 },
      { name: '1dot HAIR SPACE',         value: '\u200A', id: 2 },
      { name: '2dot THIN SPACE',         value: '\u2009', id: 3 },
      { name: '3dot SIX-PER-EM SPACE',   value: '\u2003', id: 4 },
      { name: '4dot FOUR-PER-EM SPACE',  value: '\u2005', id: 5 },
      { name: '4dot PUNCTUATION SPACE',  value: '\u2008', id: 6 },
      { name: '5dot NO-BREAK SPACE',     value: '\u00A0', id: 7 },
      { name: '5dot THREE-PER-EM SPACE', value: '\u2004', id: 8 },
      { name: '8dot EN SPACE',           value: '\u2002', id: 9 },
      { name: '9dot FIGURE SPACE',       value: '\u2009', id: 10 },
      { name: '16dot EM SPACE',          value: '\u2003', id: 11 }
    ];
  }

  name(): string {
    return this.names[this.id].name;
  }

  list(): { name: string; value: string }[] {
    return this.lists[this.id];
  }

  hashName(key: number): string {
    return this.lists[this.id][key].value;
  }
}
