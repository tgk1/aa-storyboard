import { Koma, KomaPart, YBBSFile } from '@model/Koma';

export function mlt2ybbsFile(data: string): YBBSFile {
  const pat = /\[SPLIT_PART:([A-z]+[0-9]+):([0-9]+):([0-9]+):([0-9]+):([0-9\\.)]+)/;
  const lines = data.split(/\n/);
  const ybbs = new YBBSFile();

  let name = '';
  let x = 0;
  let y = 0;
  let order_num = 0;
  let buf = '';
  let mode = 2;

  let i = 0;
  for (const line of lines) {
    if (line == '[SPLIT]') {
      //
    } else if (line.match(pat)) {
      const m = line.match(pat);
      if (m) {
        name = m[1];
        x = parseInt(m[3]);
        y = parseInt(m[4]);
        order_num = parseInt(m[5]);
        mode = parseInt(m[2]);
      }
    } else if (line == '[SPLIT_END]') {
      if (buf) {
        i += 1;
        const koma = new Koma();
        koma.data = buf;
        koma.order_num = i;
        ybbs.ybbsKomas.push({ koma: koma, komaParts: [] });
        buf = '';
      }
    } else if (line == '[SPLIT_PART_END]') {
      if (buf) {
        const kpart = new KomaPart();
        kpart.data = buf;
        kpart.name = name;
        kpart.x = x;
        kpart.y = y;
        kpart.mode = mode;
        kpart.order_num = 100 - order_num;
        ybbs.ybbsKomas[ybbs.ybbsKomas.length - 1].komaParts.push(kpart);
        buf = '';
      }
    } else {
      buf += line + '\n';
    }
  }

  return ybbs;
}
