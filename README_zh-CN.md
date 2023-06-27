<div lang="zh-CN">

[![Cover](cover.png)](#om_midi)
<div align="center">
	<h2 id="om_midi">om midi</h2>
	<p><b>兰音</b></p>
	<p><a href="https://github.com/otomad/om_midi/releases/latest"><img src="https://img.shields.io/badge/-点击下载最新版！-brightgreen?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuMiAwYS44LjggMCAwIDAtLjguOHYxMS40TDcuMjYgOS40NGEuODAzLjgwMyAwIDAgMC0xLjEzLjA3NGwtMS4wNSAxLjJhLjguOCAwIDAgMCAuMDczIDEuMTNsNi4zMyA1LjU0YS43OTUuNzk1IDAgMCAwIDEuMDUgMGw2LjMyLTUuNTRhLjguOCAwIDAgMCAuMDc0LTEuMTNsLTEuMDUtMS4yYS44MDQuODA0IDAgMCAwLTEuMTMtLjA3NGwtMy4xNCAyLjc2Vi44YS44LjggMCAwIDAtLjgtLjh6bS04IDIwLjhhLjguOCAwIDAgMC0uOC44djEuNmEuOC44IDAgMCAwIC44LjhoMTcuNmEuOC44IDAgMCAwIC44LS44di0xLjZhLjguOCAwIDAgMC0uOC0uOHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+" alt="Download" /></a></p>

[English](README.md) | **简体中文** | [日本語](README_ja-JP.md) | [Tiếng Việt](README_vi-VN.md) | [한국어](README_ko-KR.md)
</div>

**om midi**，**After Effects** 的音 MAD / YTPMV 辅助脚本。它是一个能够自动将 MIDI 文件转换为 After Effects 中关键帧的脚本。希望在 om midi 的帮助下，可以把人们从枯燥繁重的音画对齐中解救出来，把更多的精力投入到更有创造性的工作中。

感谢脚本原作者们 [@David Van Brink (omino)](https://omino.com/)、[@Dora (NGDXW)](https://space.bilibili.com/40208180)、[@家鳖大帝](https://github.com/Z4HD)的努力工作。此仓库基于家鳖大帝的原始仓库 [om_midi_NGDXW_zh](https://github.com/Z4HD/om_midi_NGDXW_zh) 修改而成。

当前项目根据旧版的脚本使用 TypeScript 等新技术进行重写。

**关于“om midi”的拼写规范：所有**字母**小写**，即便位于句首时也是如此，然而在全部大写的语境下允许忽略该条；单词间使用**空格**分隔而不是下划线。

**姊妹项目：**[Otomad Helper for Vegas](https://github.com/otomad/OtomadHelper)。

### 翻译
* 越南语翻译由 [@Cyahega](https://github.com/Cyahega) 提供。
* 韩语翻译由 @빈모드 提供。

### 说明文档
* [家鳖大帝的中文说明文档](https://om.z4hd.cf/)
* [我的中文发行说明](https://www.bilibili.com/read/cv18532219)

### **兼容性**
理论上支持 `CS4` 及以后的版本。并且理论上 Windows 和 macOS 都能支持。

### 安装
下载脚本文件。

#### `om midi`
将其移动至位于 After Effects 安装目录的 `Scripts\ScriptUI Panels` 文件夹中。
> (例如：C:\Program Files\Adobe\Adobe After Effects 2023\Scripts\ScriptUI Panels)

#### `om utils`
有两种方式导入：
1. 放置在 aep 项目的相同目录下。
	* 在表达式顶部添加：
```javascript
$.evalFile(thisProject.fullPath.replace(/\\[^\\]*$/, "\\om_utils.jsx"));
```
2. 放置在任意位置，然后添加到 AE 项目中。
	* 在表达式顶部添加：
```javascript
footage("om_utils.jsx").sourceData;
```

### 教程
[![一分半上手 om midi](covers/youtube_cover.svg)](https://b23.tv/g98ALSe)

#### 值得注意的是
如果 After Effects 在打开脚本时引发如图所示的错误。  
![After Effects No Access Files](./covers/After_Effects_No_Access_Files.png)  
请启用 *编辑 > 首选项 > 脚本和表达式 > 允许脚本写入文件和访问网络*。

### 路线图
[转到 GitHub 项目 **OTOMAD+** >](https://github.com/users/otomad/projects/2)

### 版本对比
> 除了 v1.2 之外，其它的版本均没有给出版本号。因此那些版本号是我自拟的。

| 版本 | 通用名称 | 多轨支持 | 添加关键帧至图层 | 中文 UI | 额外的实用关键帧 | 手动选择轨道 | 更改 BPM | 动态 BPM |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| v0.1 | [David Van Brink (omino) 的原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/) | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| v1.0 | [Dora (NGDXW) 的改版](https://www.bilibili.com/read/cv170398) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v1.0 闰 | [表达式预设](https://www.bilibili.com/video/av29649969) | ✔️ | ✔️ | ❌ | ✔️ | ❌ | ❌ | ❌ |
| v1.2 | [家鳖大帝的汉化版](https://github.com/Z4HD/om_midi_NGDXW_zh) | ✔️ | ❌ | ✔️ | ✔️ | ❌ | ❌ | ❌ |
| v2.0 | [Dora (NGDXW) 的再版](https://www.bilibili.com/read/cv1217487) | ❌ | ✔️ | ✔️ | ✔️ | ❌ | ❌ | ❌ |
| v3.x | **当前版本** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |

### 参考
#### 之前版本
* [David Van Brink (omino) 的原版](https://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/)
* [Dora (NGDXW) 的改版](https://www.bilibili.com/read/cv170398)
* [表达式预设](https://www.bilibili.com/video/av29649969)
* [家鳖大帝的汉化版](https://github.com/Z4HD/om_midi_NGDXW_zh)
* [Dora (NGDXW) 的再版](https://www.bilibili.com/read/cv1217487)
#### 介绍视频
* [龍之祖者 - 在街上.后效项](https://www.bilibili.com/video/av9228581)
* [陈沈晨 - 瓜风.后效项](https://www.bilibili.com/video/av9778499)
#### 依赖模块
* [Motion Developer 的 Rollup TypeScript 脚手架](https://github.com/motiondeveloper/expression-globals-typescript)
* [Adobe 产品的 TypeScript 类型注解](https://github.com/aenhancers/Types-for-Adobe)
* [Sergi Guzman (colxi) 的 MIDI 解析器 JS - MIDI 文件格式规范](https://github.com/colxi/midi-parser-js/wiki/MIDI-File-Format-Specifications)

</div>

