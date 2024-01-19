export enum FontName {
  Saitamaar = 'Saitamaar',
  MSPGothic = 'ＭＳ Ｐゴシック'
}

// cssのfont family用 文字列
export function fontFamily(fontName: string) {
  if (fontName == 'MSPGothic') {
    return "'ＭＳ Ｐゴシック', 'Saitamaar'";
  } else if (fontName != '') {
    return `'${fontName}', 'Saitamaar'`;
  } else {
    return `'Saitamaar'`;
  }
}
