import { ImageColorTheme, ImageColorUtil } from '@model/ImageColor';

//prettier-ignore
export class String2image {
  // 画像出力用 レンダラープロセスで使用する canvasと
  // 変換用のelectron系を、それぞれ動作するために ipcを挟んでレンラダープロセスとメインプロセスで連携して使う
  //
  // 使い方
  // レンダラープロセス
  //  const dataURL = String2image.convertDataURL(canvas, dataStr, 'MS Pゴシック', false)
  //  これを ipc.invokeとかでメインプロセスに送り
  // メインプロセス
  //const nativeImage = require('electron').nativeImage
  //const png = nativeImage.createFromDataURL(dataURL).toPNG();
  static convertDataURL(canvas: HTMLCanvasElement, data: string, fontname: string, isDarkMode: boolean): string | null {
    const c = String2image._canvas(canvas, data, fontname, isDarkMode);
    return c.toDataURL();
  }
  static convertCanvas(canvas: HTMLCanvasElement, data: string, fontname: string, isDarkMode: boolean ): HTMLCanvasElement | null {
    const c = String2image._canvas(canvas, data, fontname, isDarkMode);
    return c;
  }
  static convertCanvas2(canvas: HTMLCanvasElement, data: string, theme: ImageColorTheme): HTMLCanvasElement | null {
    const c = String2image._canvas2(canvas, data, theme);
    return c;
  }

  static convertDataURLBAK(
    canvas: HTMLCanvasElement,
    data: string,
    fontname: string,
    isDarkMode: boolean
  ): string | null {
    const context = canvas.getContext('2d');
    if (context == null) return null;

    const font = "16px '" + fontname + "'";

    //let padding = 0;
    const padding = 32;
    const lines = data.split(/\n/);
    let width = 0;
    const height = (lines.length - 1) * 18;
    for (const line of lines) {
      context.font = font;
      const w = context.measureText(line).width;
      width = w > width ? w : width;
    }

    // colorは src/assets/app.css にある --font-color --aa-bg-colorを参照
    const backgroundColor = isDarkMode ? 'rgb( 20,  20,  20)' : 'rgb(254, 254, 254)';
    const fontColor       = isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(  0,   0,   0)';

    canvas.width = width + padding * 4;
    canvas.height = height + padding * 2;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = fontColor;
    context.font = font;

    let i = 18;
    for (const line of lines) {
      context.fillText(line, padding, i + padding);
      i += 18;
    }
    context.scale(1, 1);

    return canvas.toDataURL();
  }

  static _canvas(
    canvas: HTMLCanvasElement,
    data: string,
    fontname: string,
    isDarkMode: boolean
  ): HTMLCanvasElement {
    const context = canvas.getContext('2d');
    if (context == null) return canvas;

    const font = "16px '" + fontname + "'";

    const padding = 32;
    const lines = data.split(/\n/);
    let width = 0;
    const height = (lines.length - 1) * 18;
    for (const line of lines) {
      context.font = font;
      const w = context.measureText(line).width;
      width =  w > width ? w : width;
    }

    // colorは src/assets/app.css にある --font-color --aa-bg-colorを参照
    const backgroundColor = isDarkMode ? 'rgb( 20,  20,  20)' : 'rgb(254, 254, 254)';
    const fontColor       = isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(  0,   0,   0)';

    canvas.width = width + padding * 4;
    canvas.height = height + padding * 2;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = fontColor;
    context.font = font;

    let i = 18;
    for (const line of lines) {
      context.fillText(line, padding, i + padding);
      i += 18;
    }
    context.scale(1, 1);
    return canvas
  }

  static _canvas2(canvas: HTMLCanvasElement, data: string, theme:ImageColorTheme):HTMLCanvasElement {
    const context = canvas.getContext('2d');
    if (context == null) return canvas;

    const font = "16px 'Saitamaar'";

    const padding = 32;
    const lines = data.split(/\n/);
    let width = 0;
    const height = (lines.length - 1) * 18;
    for (const line of lines) {
      context.font = font;
      const w = context.measureText(line).width;
      width =  w > width ? w : width;
    }

    // colorは src/assets/app.css にある --font-color --aa-bg-colorを参照
    const backgroundColor = ImageColorUtil.rgbBackgroundColor(theme);
    const fontColor       = ImageColorUtil.rgbFontColor(theme);

    canvas.width = width + padding * 4;
    canvas.height = height + padding * 2;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = fontColor;
    context.font = font;

    let i = 18;
    for (const line of lines) {
      context.fillText(line, padding, i + padding);
      i += 18;
    }
    context.scale(1, 1);
    return canvas;
  }
}
/*
  static convertPNG(canvas: HTMLCanvasElement, data: string, fontname: string, isDarkMode: boolean):Buffer | null {
    const image = String2image.convert(canvas, data, fontname, isDarkMode);
    if (image == null) return null;
    const nativeImage = require('electron').nativeImage
    return nativeImage.createFromDataURL(image).toPNG();
  }

  static convertDataURL2JPG(data:string):Buffer | null {
    const nativeImage = require('electron').nativeImage
    return nativeImage.createFromDataURL(data).toJPEG(100);
  }

  static convertJPG(canvas: HTMLCanvasElement, data: string, fontname: string, isDarkMode: boolean):Buffer |null {
    const image = String2image.convert(canvas, data, fontname, isDarkMode);
    if (image == null) return null;
    const nativeImage = require('electron').nativeImage
    return nativeImage.createFromDataURL(image).toJPEG(100);
  }
*/
