### 見出し - Headers

# This is an H1
## This is an H2
###### This is an H6


[Sub1](/sub1/astro.md)

### 引用 - Blockquotes

> 引用引用引用引用
引用引用
> 引用本文引用本文
>> 入れ子

### リスト - Lists

* リスト1
  * リスト1-2  
* リスト2  

1. リスト1
    1. リスト1-1 
    2. リスト1-2  
2. リスト2 


<dl>
  <dt>オレオ</dt>
  <dd>クッキー&クリーム</dd>
  <dt>リッツ</dt>
  <dd>プレーンクラッカー</dd>
</dl> 

### Checkbox型

- [ ] リスト1
- [x] リスト2

### 水平線

***
* * *
--- 
- - -  

### 自動リンク

<http://qiita.com>
http://qiita.com


### インラインリンク


[Qiita](http://qiita.com)
[Qiita](http://qiita.com "Qiita")


### 強調 - Emphasis

*強調*
**強調**
***強調***

### 画像 - images

![ダミー画像](https://via.placeholder.com/150)
![ダミー画像](https://via.placeholder.com/150 "ダミー画像")

### 打ち消し

~~打ち消し~~

### 注釈

　　　本文本文本文\[^注釈]
　　　　\[^注釈]:注釈テキスト注釈テキスト注釈テキスト

### Code

`$hoge = 1`
`.md`

### シンタックスハイライト

```html:sample
   <div class="radioWave">
      <p>迷いの中あてなく見上げた空彩る星たちが</p>
      <p>嘘みたいに晴れた朝に繋がることを教えてくれた</p>
   </div>
```/

### テーブル記法

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       |        This |     This     |
| column     |      column |    column    |
| will       |        will |     will     |
| be         |          be |      be      |
| left       |       right |    center    |
| aligned    |     aligned |   aligned    |


