export enum CanvasGuideSize {
  w800_l40 = '800x40',
  w800_l50 = '800x50',
  w900_l40 = '900x40',
  w900_l50 = '900x50',
  w1000_l40 = '1000x40',
  w1000_l50 = '1000x50',
  w1100_l40 = '1100x40',
  w1100_l50 = '1100x50',
  w1200_l50 = '1200x50',
  w1200_l60 = '1200x60'
}

export class CanvasGuideSizeUtil {
  static list() {
    //console.log(JSON.stringify(Object.entries(CanvasGuideSize)));
    return Object.entries(CanvasGuideSize);
  }

  static bounds(cgSize: CanvasGuideSize) {
    const size = cgSize.valueOf().split('x');
    return { width: size[0], height: size[1] };
  }

  static width(cgSize: CanvasGuideSize): number {
    return parseInt(CanvasGuideSizeUtil.bounds(cgSize).width, 10);
  }

  static height(cgSize: CanvasGuideSize): number {
    return parseInt(CanvasGuideSizeUtil.bounds(cgSize).height, 10);
  }
}

//
// キャンバスの基準値
// 左リスト + ルーラーの幅
//dot値
export const canvasMinX = (function () {
  return 20 + 20; /* canvas position + ruler length + line width*/
})();

//
// キャンバスの基準値
// ツールバー + ルーラーの幅
//dot値
export const canvasMinY = (function () {
  return 20; /* ruler length + line width*/
})();
