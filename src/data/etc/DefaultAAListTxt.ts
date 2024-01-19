import fs from 'fs';
import path from 'path';

import { AppConfig } from '@/data/config/AppConfig';
import { String2x } from '@/char/String2x';
import { aalisttxt } from '@/char/str2str/Str2aalisttxt';

export function defaultAAListTxt() {
  const dir = path.join(AppConfig.get().PathLocalFolderDB, 'aa-storyboard');
  const file1 = path.join(dir, 'aalist.txt');
  const file2 = path.join(dir, '_readme.txt');
  const aalisttxt_utf8 = aalisttxt();
  const aalisttxt_sjis = String2x.encode(aalisttxt_utf8, 'Windows-31j');
  const readme =
    'これはAA Storyboardのテンプレート用ファイルを置くフォルダです。\n' +
    'アプリで指定している「スレフォルダ」に自動で作成されます。aalist.txtはOrinrinEditorと同じ形式です。';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(file1)) {
    fs.writeFileSync(file1, aalisttxt_sjis);
  }
  if (!fs.existsSync(file2)) {
    fs.writeFileSync(file2, readme);
  }
}
