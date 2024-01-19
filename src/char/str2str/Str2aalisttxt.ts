/* eslint-disable no-irregular-whitespace */
import { AAListTxt } from '@/data/model/AAListTxt';

export function txt2aalisttxt(data: string): AAListTxt {
  const aalist = new AAListTxt();
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\[end\]\n/);

  const namereg = new RegExp(/ListName=(.*)\]/, 'i');

  let part_num = 2;
  for (const buf of parts) {
    let line_num = 0;
    for (const line of buf.split(/\n/)) {
      if (line == '') continue;
      if (line_num == 0) {
        namereg.exec(line);
        const m = line.match(namereg);
        if (m) {
          aalist.names.push({ name: m[1], id: part_num });
        } else {
          aalist.names.push({ name: 'aalist-' + part_num, id: part_num });
        }
        aalist.lists[part_num] = [];
      } else {
        aalist.lists[part_num].push({ id: line_num, name: line, value: line });
      }
      line_num += 1;
    }

    part_num += 1;
    aalist.lists[part_num] = [];
  }

  return aalist;
}

//prettier-ignore
export function aalisttxt(): string {
  const dat =
`[ListName=１]
┌
┬
┐
─
├
┼
┤
│
└
┴
┘

┏
┳
┓
━
┣
╋
┫
┃
┗
┻
┛





┠
╂
┨

┰
┸


┝
┿
┥

┯
┷


＿
‾
‖

「
」
=
＝
二
≡
三

⊂
⊃
∪
∩
∈
∋
⊆
[end]
[ListName=２]
丶
ヽ
ヾ
ゝ
ゞ
´
｀
＼
¨
ﾟ
ﾞ

巛
＜
《
へ
ヘ
ﾍ
ミ
ﾐ

／
/
丿
ノ
ﾉ
ソ
ｿ
＞
》
〆
⊿
彡
∠
∟
∨
∧
[end]
[ListName=３]
□
■
◇
◆

△
▲
▽
▼
　
○
●
☆
★
◎
↑
→
←
↓
　
＋
−
±
×
÷
＝
≠
≡
≒

＜
＞
≦
≧

≪
≫
∞
∽
∝
√
∠
⊥
⌒

∂
∫
∬
∴
∵
[end]
[ListName=４]
∧
∨
¬
⇒
⇔
∀
∃
♂
♀
∇
＃
＆
＊
＠
§
※
〒
〓
◯
♯
♭
♪
†
‡
¶
¥
＄
℃
¢
£
％
Å
‰
°
′
″
[end]
[ListName=５]
α
β
γ
δ
ε
ζ
η
θ
ι
κ
λ
μ
ν
ξ
ο
π
ρ
σ
τ
υ
φ
χ
ψ
ω

Α
Β
Γ
Δ
Ε
Ζ
Η
Θ
Ι
Κ
Λ
Μ
Ν
Ξ
Ο
Π
Ρ
Σ
Τ
Υ
Φ
Χ
Ψ
Ω
[end]
[ListName=６]
イ
彳
匚
亠
斤
廿
个
〒
┴
Π
Τ
∞
∽
∝
∩
∪
υ
ι
θ
σ
ρ
δ
б
ъ
Ц
庁
丁
了
凵
∂
[end]
[ListName=７]
一
凹
叶
干
久
災
咋
昨
皿
三
山
士
什
十
汁
升
小
少
上
人
心
壬
石
川
大
只
中
丁
刀
凸
乍
二
廿
入
八
[end]
[ListName=８]
亡
卜
又
毛
夕
了
丶
丿
乂
亅
亠
从
仆
儿
兀
冂
冖
冫
几
凵
勹
匕
匚
匸
卅
卞
厂
叮
叭
叨
夂
宀
幵
广
廾
弋
彡
彳
鬥
丨
＇
＂
[end]
[ListName=９]
一
凹
叶
干
久
災
咋
昨
皿
山
士
什
十
汁
升
小
少
上
人
心
壬
石
川
大
只
中
丁
刀
[end]
[ListName=１０]
凸
乍
二
廿
入
八
亡
卜
又
毛
夕
了
丿
乂
亅
亠
从
仆
儿
兀
冂
冖
冫
几
凵
勹
匕
匚
匸
卅
卞
厂
叮
叭
叨
夂
宀
幵
广
廾
弋
彡
彳
鬥
丨
＇
＂
[end]
[ListName=１１]
ⅰ
ⅱ
ⅲ
ⅳ
ⅴ
ⅵ
ⅶ
ⅷ
ⅸ
ⅹ
Ⅰ
Ⅱ
Ⅲ
Ⅳ
Ⅴ
Ⅵ
Ⅶ
Ⅷ
Ⅸ
Ⅹ
[end]
[ListName=１２]
㍉
㌔
㌢
㍍
㌘
㌧
㌃
㌶
㍑
㍗
㌍
㌦
㌣
㌫
㍊
㌻
㎜
㎝
㎞
㎎
㎏
㏄
㎡
㍻
〝
〟
№
㏍
℡
[end]
[ListName=１３]
㊤
㊥
㊦
㊧
㊨
㈱
㈲
㈹
㍾
㍽
㍼
≒
≡
∫
∮
∑
√
⊥
∠
∟
⊿
∵
∩
∪
[end]
[ListName=１４]
14
[end]
[ListName=１５]
&#9829;
&#9832;
&#9617;
&#9618;
&#9619;
&#9760;
&#9745;
[end]
[ListName=１６よく使う文字列]
16
,'
,′
/
／
〃
∠
〆
′
＼
ヽ
ゝ
ゞ
ヾ
｀ヽ
∧
∨
\`
｀
丶
´
゛
ﾞ
′
ﾟ
¨
^
＾
~
i
ｉ
l
ｌ
|
!
｜
┌
┐
┘
└
├
┬
┤
┴
┼
—
⊂
⊃
-
‐
−
ー
ｰ
=
＝
≠
亠
冖
宀
¬
‾
⌒
⊥
丁
匚
冂
厂
√
丿
厶
彡
从
斥
斧
爪
笊
气
刈
斗
孑
个
介
仆
弋
廴
辷
乂
匕
圦


[end]
[ListName=１７やる夫表情]
17
　 （●） 　（●）
（●）　 （●）
oﾟ(（●）) (（●）)ﾟo

　　　　 （__人__）
（__人__）
::::::⌒（__人__）⌒:::::
///（__人__）///
　　　 ｀ ⌒´
｀ ⌒´
\`Y⌒y'´
'´｀ﾞ 　 '´｀ﾞ
\`ー'
—
‾
_
／
(__人_)
＼
（⌒） 　（⌒）
///
⌒
（
）
＜●＞＜●＞
●
（○） 　（○）
○
＞
＜
ー
一
三
＿ノ　 ヽ__
ノ　 ヽ
（●） 　（—）
ノ '　ヽ､
（—） 　（—）
（—） 　（●）
＜○＞＜○＞
＼,三_ノ
⑪
●
u
①
}liil{
|!il|!|!|
|ｪｪｪ|
ω
lr┬|
(_У
´
（__人__）
／ﾟヽ／ﾟヽ
（ ≡） 　（≡）
⌒　　⌒
（ 　ﾟ） （　ﾟ）
＼ ,　, ／
'"
"＼ , ､/ﾞ
-==、 　 '==-
（∩） 　（∩）
､_,､_,
_ノ　iiiii ＼
fト､_{ﾙ{,ィ'ｅﾗ,
ｨてﾌ> ｉ iｨてﾌ>
-=;・;=-=;・;=-
ヽﾆﾆｿ
ﾄｪｪｪｲ
《;･;》 　《;･;》
⊂⊃
ゝ._）
<●>::::::<●>
kｚ-　　 -ｧ‐
‐kｚ-　　 -ｧ
‐=‐
､,
_ノ ''　'ー
（●）
[end]
[ListName=１８怪我]
18
.:,：;'：
.,::；;;#．
|||||
:::
（;:;:）
;:;:;:
#
//;;.
;;#
･･
""
//
\`\`
:
',∴ ･'
',∴ ･' :;;

[end]
[ListName=１９涙]
19
｡
 につ
 。
 ﾟ
 ゜
o
ｏ
 O
Ｏ
0
０
 О
 Ο
о
ο
〇
〇
○
ﾟ
 '
 \`
ﾟ
,
:
;
i
 l
|
と二つ
ｃ

[end]
[ListName=２０瞳用上]
20
**←
だ
灯
衍
行
仍
了
乍
仡
乞
云
伝
芸
茫
忙
它
佗
俐}
仗
な
f







**↑
不
示
宍
亦
兀
亢
万
迩
尓
禾
乏
弌
弍
弐
泛
夾
赱
符
≡
女
乍
气
旡
ま
み
て
テ
チ







**→
豺
犾
狄
勿
下
卞
抃
圷
圦
坏
心
沁
气
汽
斥
拆
仔
竹
刃
刈
付
以
雫
爿
な
う
か
て刈
てﾊ
[end]
[ListName=２１瞳用下]
21
**←
弋
辷
込
乂
癶
廴
匕
叱
杙
之
比
仆
ト






**→
歹
刋
升
刈
乃
汐
沙
少
炒
斗
ノ
ソ
ル
ツ
八
[end]
[ListName=２２衝撃]
**上
人
从
,从､
ゞ从ﾚ
ゞ火ノ
ゞ乂ノ
j|
j!
|!






**右上
/
し/
/／
／
ﾚ／
し／
ﾙ
ﾉし
ノ(
ノ)
ノし
ノし／
ｨ
ｲ





**右
て
)て
て＿＿
⌒ヾて
てノ(






**右下
＼
ヽ(
ヽ(⌒
/‾
√‾
厂‾
⌒ヾ
｀ゝ







**下
Y
⌒'Y'⌒
乂ゞ




**左下
／/
)/
／''⌒)
〃
γ⌒






**左
ソ
そ
そ(
)
＿）






**左上
＼
ﾄ、
ヽ､,
ﾉヽ
｣ヽ
jヽ
)ヽ
,）ソ
⌒ヽ{
[end]
[ListName=２３指]
**上
∩
rf
ri
f^!
ｎ
YY





**右上
r'）
ry
rっ
rぅ
γ）
/）
/>
/〉
/^)
／）
／>
／〉
／入
ノつ
fつ
Yﾌ
Y7
Y７
/Y
／Y







**右
ﾆ⊃






**右下
＼)
＼_)
＼_i
＼_j
⌒J






**下
∪
!_!
i_j
ｰ'
八_j






**左下
し'
り
t／
t/
(／
(_／
(/
(_／
(_　イ
(_ ｲ
i_/
i_／
i_ﾉ
Lﾉ
Y ,ｲ




**左
⊂ﾆ
こ _＿
乙 _＿
て _＿
と _＿






**左上
（ヽ
（｀ヽ
（｀ー
(＼
くヽ
く｀ヽ
く｀ー
く＼
Y ヽ
Y ＼
fヽ
f⌒ー
r ､
r-､
rﾔ
rや

[end]`
  return dat;
}
