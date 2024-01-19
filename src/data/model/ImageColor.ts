/* eslint-disable prettier/prettier */
export enum ImageColorTheme {
  White = 'white',
  Gray = 'gray',
  Sepia = 'sepia',
  Black = 'black'
}

export class ImageColorUtil {
  static list() {
    return [ImageColorTheme.White, ImageColorTheme.Gray, ImageColorTheme.Sepia, ImageColorTheme.Black];
  }

  static sname(theme: ImageColorTheme) {
    switch (theme) {
      case ImageColorTheme.Black: return '黒';
      case ImageColorTheme.White: return '白';
      case ImageColorTheme.Gray:  return '灰色';
      case ImageColorTheme.Sepia: return 'セピア';
      default:                    return '白';
    }
  }

  static cssFontColor(theme: ImageColorTheme) {
    switch (theme) {
      case ImageColorTheme.Black: return '#efefef';
      default:                    return '#000000';
    }
  }

  static cssBackgroundColor(theme: ImageColorTheme) {
    switch (theme) {
      case ImageColorTheme.Black: return '#000000';
      case ImageColorTheme.White: return '#fefefe';
      case ImageColorTheme.Gray:  return '#f3f3f3';
      case ImageColorTheme.Sepia: return '#fbf0d9';
      default:                    return '#fefefe';
    }
  }

  static rgbFontColor(theme: ImageColorTheme) {
    switch (theme) {
      case ImageColorTheme.Black: return 'rgb(254, 254, 254)';
      default:                    return 'rgb(0, 0, 0)';
    }
  }

  static rgbBackgroundColor(theme: ImageColorTheme) {
    switch (theme) {
      case ImageColorTheme.Black:        return 'rgb(0, 0, 0)';
      case ImageColorTheme.White:        return 'rgb(254, 254, 254)';
      case ImageColorTheme.Gray:         return 'rgb(239, 239, 239)';
      case ImageColorTheme.Sepia:        return 'rgb(251, 240, 217)';
      default:                           return 'rgb(254, 254, 254)';
    }
  }
}
