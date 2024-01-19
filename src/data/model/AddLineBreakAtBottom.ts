// MergeAddLineBottom

export enum AddLineBreakAtBottom {
  NoLine = 'NoLine',
  CompatOneLine = 'CompatOneLine',
  CompatTwoLines = 'CompatTwoLines',
  YaruyomiOneLine = 'YaruyomiOneLine',
  YaruyomiTwoLines = 'YaruyomiTwoLines'
}

/*
   ・ 2ちゃんねる互換(したらば、ぜろちゃんねる)では連続した改行で終了すると削除されるので、空白をつくには末尾にピリオドをつける。
   ・ bbs.yaruyomi.comでは改行のみでよい。
*/
