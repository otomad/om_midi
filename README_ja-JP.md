<div lang="ja">

[![Cover](cover.png)](#om_midi)
<div align="center">
	<h2 id="om_midi">om midi</h2>
	<p><b>蘭音</b></p>
	<p><a href="https://github.com/otomad/om_midi/releases/latest"><img src="https://img.shields.io/badge/-ここをクリックして最新版をダウンロード！-brightgreen?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuMiAwYS44LjggMCAwIDAtLjguOHYxMS40TDcuMjYgOS40NGEuODAzLjgwMyAwIDAgMC0xLjEzLjA3NGwtMS4wNSAxLjJhLjguOCAwIDAgMCAuMDczIDEuMTNsNi4zMyA1LjU0YS43OTUuNzk1IDAgMCAwIDEuMDUgMGw2LjMyLTUuNTRhLjguOCAwIDAgMCAuMDc0LTEuMTNsLTEuMDUtMS4yYS44MDQuODA0IDAgMCAwLTEuMTMtLjA3NGwtMy4xNCAyLjc2Vi44YS44LjggMCAwIDAtLjgtLjh6bS04IDIwLjhhLjguOCAwIDAgMC0uOC44djEuNmEuOC44IDAgMCAwIC44LjhoMTcuNmEuOC44IDAgMCAwIC44LS44di0xLjZhLjguOCAwIDAgMC0uOC0uOHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+" alt="Download" /></a></p>

[English](README.md) | [<span lang="zh-CN">简体中文</span>](README_zh-CN.md) | **日本語** | [Tiếng Việt](README_vi-VN.md) | [한국어](README_ko-KR.md)
</div>

**om midi** は、**After Effects** 用の音 MAD / YTPMV アシスタント スクリプトです。After Effects で MIDI ファイルをキーフレームに自動変換するスクリプトです。om midi の助けを借りて、人々が退屈なビデオとオーディオの調整から解放され、よりクリエイティブな作品により多くのエネルギーを注ぐことができることを願っています。

オリジナルのスクリプト作成者である [@David Van Brink (omino)](https://omino.com/)、[@Dora (NGDXW)](https://space.bilibili.com/40208180)、[@家鼈大帝](https://github.com/Z4HD)の努力に感謝します。そして、このリポジトリは家鼈大帝のリポジトリ [om_midi_NGDXW_zh](https://github.com/Z4HD/om_midi_NGDXW_zh) に基づいて変更されています。

現在のプロジェクトは、レガシー スクリプトに基づく TypeScript などの新しいテクノロジを使用して書き直されています。

**「om midi」の綴り規則：**<wbr />文頭であっても、**すべて**の文字は**小文字**です、コンテキストがすべて大文字の場合は無視できます。単語はアンダースコアではなく**スペース**で区切られます。

**姉妹プロジェクト：**[Otomad Helper for Vegas](https://github.com/otomad/OtomadHelper)。

### 訳者
* ベトナム語翻訳は [@Cyahega](https://github.com/Cyahega) によって提供されています。
* 韓国語翻訳は @빈모드 によって提供されています。

### ドキュメンテーション
* [家鼈大帝の中国語ドキュメント](https://om.z4hd.cf/)
* [私の中国語リリースノート](https://www.bilibili.com/read/cv18532219)

### **互換性**
`CS4` 以降のバージョンは、理論的にはサポートされています。 また、理論的には Windows と macOS の両方がサポートされています。

### インストール
最新のスクリプト ファイルをダウンロードします。

#### `om midi`
After Effects のインストール ディレクトリにある `Scripts\ScriptUI Panels` フォルダーに配置されます。
> (例えば：C:\Program Files\Adobe\Adobe After Effects 2023\Scripts\ScriptUI Panels)

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

### チュートリアル
[![Get started with om midi in 1.5 minutes](covers/youtube_cover.svg)](https://youtu.be/amDtqY_HsGM)

#### お兄ちゃん気をつけてね
After Effects でスクリプトを開くと、図のようなエラーが発生する場合。  
![After Effects No Access Files](./covers/After_Effects_No_Access_Files.png)  
*編集 > 環境設定 > スクリプトとエクスプレッション > スクリプトによるファイルへの書き込みとネットワークへのアクセスを許可* を有効にしてください。

### ロードマップ
[GitHub プロジェクト **OTOMAD+** に移動します >](https://github.com/users/otomad/projects/2)

### バージョン比較
> v1.2 を除き、その他のバージョン タグは付与されません。そのため、これらのバージョン タグは自分で定義しています。

| バージョン | 一般名 | マルチトラックのサポート | キーフレームをレイヤーに追加 | 日本語 UI | その他の便利なキーフレーム | MIDI トラックを手動で選択 | BPM を変更 | ダイナミック BPM |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| v0.1 | [David Van Brink (omino) の原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/) | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| v1.0 | [Dora (NGDXW) の改版](https://www.bilibili.com/read/cv170398) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v1.0 閏 | [エクスプレッションプリセット](https://www.bilibili.com/video/av29649969) | ✔️ | ✔️ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v1.2 | [家鼈大帝の中国語版](https://github.com/Z4HD/om_midi_NGDXW_zh) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v2.0 | [Dora (NGDXW) の再訂版](https://www.bilibili.com/read/cv1217487) | ❌ | ✔️ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v3.x | **現在版** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |

### 参考文献
#### 以前のバージョン
* [David Van Brink (omino) の原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/)
* [Dora (NGDXW) の改版](https://www.bilibili.com/read/cv170398)
* [エクスプレッションプリセット](https://www.bilibili.com/video/av29649969)
* [家鼈大帝の中国語版](https://github.com/Z4HD/om_midi_NGDXW_zh)
* [Dora (NGDXW) の再訂版](https://www.bilibili.com/read/cv1217487)
#### 紹介ビデオ
* [竜の祖者 - 通りで.アエプ](https://www.bilibili.com/video/av9228581)
* [陳沈晨 - メロン風.アエプ](https://www.bilibili.com/video/av9778499)
#### 依存
* [Motion Developer の Rollup TypeScript スキャフォールディング](https://github.com/motiondeveloper/expression-globals-typescript)
* [Adobe 製品の TypeScript タイプ](https://github.com/aenhancers/Types-for-Adobe)
* [Sergi Guzman (colxi) の midi-parser-js - MIDI ファイル形式の仕様](https://github.com/colxi/midi-parser-js/wiki/MIDI-File-Format-Specifications)

</div>
