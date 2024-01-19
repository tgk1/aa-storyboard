//
// エディターのルーラーを描画する
//
// vueファイルにしたかったけど canvasのdom取得を
// 上位componentでする変則的な感じになりそう。
//
// canvas: HTMLCanvasElement <canvas>タグ
// gridWidth: number 全角スペースのドット値
// gridHeight: number 1行のドット値
// guideWidth: オレンジのガイド線の幅
// canvasWidth: キャンバスの幅
// guideLine: オレンジのガイド線の行(ドットではない)
// canvasHeight:

export function drawRuler(canvas: HTMLCanvasElement | null, gridWidth: number, gridHeight: number) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!(context instanceof CanvasRenderingContext2D)) {
    return 0;
  }

  const cwidth = canvas.width;
  const cheight = canvas.height;

  const pad = 0.5;
  const padX = 19 + pad; //0.5 は 線がぼやける。ずらすとはっきりする
  const padY = 19 + pad;

  //
  // 既存の描画線を削除
  //
  //context.clearRect(0, 0, cwidth, cheight);

  //
  // ruler
  context.beginPath();
  context.strokeStyle = '#cccccc';
  for (let i = 0; i * gridHeight < cheight; i++) {
    let w = i % 5 == 0 ? 15 : 5;
    w = i % 10 == 0 ? 20 : w;
    context.moveTo(0, gridHeight * i + padY);
    context.lineTo(w, gridHeight * i + padY);
  }
  context.moveTo(padX, pad);
  context.lineTo(padX, cwidth + padX);

  const gw = gridWidth == -1 ? 5 : gridWidth;
  for (let i = 0; i * gw < cwidth; i++) {
    let w = i % 5 == 0 ? 15 : 5;
    w = i % 10 == 0 ? 20 : w;
    context.moveTo(gw * i + padX, 0);
    context.lineTo(gw * i + padX, w);
  }
  context.moveTo(padX, padY);
  context.lineTo(cwidth + padX, padY);

  context.stroke();

  return 1;
}

export function drawGuideLine(
  canvas: HTMLCanvasElement | null,
  gridHeight: number,
  guideWidth: number,
  guideLine: number
) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!(context instanceof CanvasRenderingContext2D)) {
    return 0;
  }

  const cwidth = canvas.width;
  const cheight = canvas.height;
  const gwidth = Math.floor(guideWidth);
  const gline = Math.floor(guideLine);

  const pad = 0.5;
  const padX = 19 + pad; //0.5 は 線がぼやける。ずらすとはっきりする
  const padY = 19 + pad;

  //
  // 既存の描画線を削除
  //
  //context.clearRect(0, 0, width2, height2);

  //
  // frame
  context.beginPath();
  context.strokeStyle = '#f56c6c';
  context.lineWidth = 1;

  context.moveTo(0 + padX, gridHeight * gline + padY);
  context.lineTo(cwidth + padX, gridHeight * gline + padY);
  context.moveTo(gwidth + padX, padY);
  context.lineTo(gwidth + padX, cheight + padY);
  context.stroke();

  return 1;
}
