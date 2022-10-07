<div lang="ja">

[![Cover](cover.png)](#om_midi)
<div align="center">
	<h2 id="om_midi">om midi</h2>
	<p><b>蘭音</b></p>

[EN](README.md) | [简中](README_zh-CN.md) | **日**
</div>

**om midi**（略して **OMM**）は、**After Effects** 用の音 MAD / YTPMV アシスタント スクリプトです。After Effects で MIDI ファイルをキーフレームに自動変換するスクリプトです。om midi の助けを借りて、人々が退屈なビデオとオーディオの調整から解放され、よりクリエイティブな作品により多くのエネルギーを注ぐことができることを願っています。

オリジナルのスクリプト作成者である [デビッド・ヴァン・ブリンク（オミノ）](https://omino.com/)、[ドラ (NGDXW)](https://space.bilibili.com/40208180)、[韓琦](https://space.bilibili.com/66940276)、[家鼈大帝](https://github.com/Z4HD) の努力に感謝します。そして、このリポジトリは家鼈大帝のリポジトリ [om_midi_NGDXW_zh](https://github.com/Z4HD/om_midi_NGDXW_zh) に基づいて変更されています。

現在のプロジェクトは、レガシー スクリプトに基づく TypeScript などの新しいテクノロジを使用して書き直されています。

**「om midi」の綴り規則：**<wbr />文頭であっても、**すべて**の文字は**小文字**です、コンテキストがすべて大文字の場合は無視できます。単語はアンダースコアではなく**スペース**で区切られます。

**姉妹プロジェクト：**[Otomad Helper for Vegas](https://github.com/otomad/OtomadHelper)。

### ドキュメンテーション
* [家鼈大帝の中国語ドキュメント](https://om.z4hd.cf/)
* [私の中国語リリースノート](https://www.bilibili.com/read/cv18532219)

### サポートされている AE バージョン
`CS5` 以降のバージョンは、理論的にはサポートされています。 また、理論的には Windows と macOS の両方がサポートされています。

### インストール
最新のスクリプト ファイルをダウンロードします。

#### `om midi`
After Effects のインストール ディレクトリにある `Scripts\ScriptUI Panels` フォルダーに配置されます。
> (例えば：C:\Program Files\Adobe\Adobe After Effects 2022\Scripts\ScriptUI Panels)
#### `om utils`
インポートする方法は 2 つあります。
1. AEP プロジェクトと同じディレクトリに配置する場合。
	* 式の先頭に追加：
```javascript
$.evalFile(thisProject.fullPath.replace(/\\[^\\]*$/, "\\om_utils.jsx"));
```
2. 任意の場所に配置し、AE プロジェクトに追加する場合。
	* 式の先頭に追加：
```javascript
footage("om_utils.jsx").sourceData;
```

### バージョン比較
> v1.2 を除き、その他のバージョン タグは付与されません。そのため、これらのバージョン タグは自分で定義しています。

バージョン | 一般名 | マルチトラックのサポート | キーフレームをレイヤーに追加 | 日本語 UI | その他の便利なキーフレーム | MIDI トラックを手動で選択 | BPM を変更
:--- | :--- | :---: | :---: | :---: | :---: | :---: | :---:
v0.1 | [デヴィッド・ヴァン・ブリンク（オミノ）の原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/) | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
v1.0 | [ドラ (NGDXW) の改版](https://www.bilibili.com/read/cv170398) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌
v1.0 閏 | [韓琦のプリセット](https://www.bilibili.com/video/av29649969) | ✔️ | ✔️ | ❌ | ✔️ | ❌ | ❌
v1.2 | [家鼈大帝の中国語版](https://github.com/Z4HD/om_midi_NGDXW_zh) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌
v2.0 | [ドラ (NGDXW) の再訂版](https://www.bilibili.com/read/cv1217487) | ❌ | ✔️ | ❌ | ✔️ | ❌ | ❌
v3.x | **現在版** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️

### 参考文献
#### 以前のバージョン
* [デヴィッド・ヴァン・ブリンク（オミノ）の原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/)
* [ドラ (NGDXW) の改版](https://www.bilibili.com/read/cv170398)
* [韓琦のプリセット](https://www.bilibili.com/video/av29649969)
* [家鼈大帝の中国語版](https://github.com/Z4HD/om_midi_NGDXW_zh)
* [ドラ (NGDXW) の再訂版](https://www.bilibili.com/read/cv1217487)
#### 紹介ビデオ
* [竜の祖者 - 通りで.アエプ](https://www.bilibili.com/video/av9228581)
* [陳沈晨 - メロン風.アエプ](https://www.bilibili.com/video/av9778499)
#### 依存
* [モーション開発者の Rollup TypeScript スキャフォールディング](https://github.com/motiondeveloper/expression-globals-typescript)
* [シリーV](https://github.com/Silly-V/Adobe-TS-ExtendScript)と[アエンハンサー](https://github.com/aenhancers/Types-for-Adobe)の Adobe タイプ
* [セルジ・グスマン（コルシー）の MIDI パーサー JS - MIDI ファイル形式の仕様](https://github.com/colxi/midi-parser-js/wiki/MIDI-File-Format-Specifications)

</div>
