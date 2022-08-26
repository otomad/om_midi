<div lang="zh-CN">

[![Cover](cover.png)](#om_midi)
<div align="center">
	<h2 id="om_midi">om midi</h2>

[EN](README.md) | **简中**
</div>

> *项目还在开发中，请耐心等待发布……*

**om midi**，简称 **OMM**，**After Effects** 的音 MAD / YTPMV 辅助脚本。它是一个能够自动将 MIDI 文件转换为 After Effects 中关键帧的脚本。希望在 om midi 的帮助下，可以把人们从枯燥繁重的音画对齐中解救出来，把更多的精力投入到更有创造性的工作中。

感谢脚本原作者们 [大卫·范·布林克 (omino)](http://omino.com/)、[Dora (NGDXW)](https://space.bilibili.com/40208180)、[韩琦](https://space.bilibili.com/66940276)、[家鳖大帝](https://github.com/Z4HD)的努力工作。此仓库基于家鳖大帝的原始仓库 [om_midi_NGDXW_zh](https://github.com/Z4HD/om_midi_NGDXW_zh) 修改而成。

当前项目根据旧版的脚本使用 TypeScript 等新技术进行重写。

**姊妹项目：**[Otomad Helper for Vegas](https://github.com/otomad/OtomadHelper)。

### 说明文档
* [家鳖大帝的中文说明文档](https://om.z4hd.cf/)

### 支持的 AE 版本
理论上支持 `CS5` 及以后的版本。并且理论上 Windows 和 macOS 都能支持。

### 安装
下载脚本文件并将其移动至位于 After Effects 安装目录的 `Script` 或 `Script\ScriptUI` 文件夹中。
> (例如：C:\\Program Files\\Adobe\\Adobe After Effects 2022)

### 版本对比
> 除了 v1.2 之外，其它的版本均没有给出版本号。因此那些版本号是我自拟的。

版本 | 通用名称 | 多轨支持 | 添加关键帧至图层 | 英语 UI | 中文 UI | 日语 UI | 额外的实用关键帧 | 手动选择轨道 | 更改 BPM
:--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---:
v0.1 | [大卫·范·布林克 (omino) 的原版](http://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/) | ✔️ | ❌ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
v1.0 | [Dora (NGDXW) 的修改版](https://www.bilibili.com/read/cv170398) | ✔️ | ❌ | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌
v1.0 Plus | [韩琦的预设](https://www.bilibili.com/video/av29649969) | ✔️ | ✔️ | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌
v1.2 | [家鳖大帝的汉化版](https://github.com/Z4HD/om_midi_NGDXW_zh) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ✔️ | ❌ | ❌
v2.0 | [Dora (NGDXW) 的二次修改版](https://www.bilibili.com/read/cv1217487) | ❌ | ✔️ | ❌ | ✔️ | ❌ | ✔️ | ❌ | ❌
v3.0 | **当前版本** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️

### 参考
#### 之前版本
* [大卫·范·布林克 (omino) 的原版](http://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/)
* [Dora (NGDXW) 的修改版](https://www.bilibili.com/read/cv170398)
* [韩琦的预设](https://www.bilibili.com/video/av29649969)
* [家鳖大帝的汉化版](https://github.com/Z4HD/om_midi_NGDXW_zh)
* [Dora (NGDXW) 的二次修改版](https://www.bilibili.com/read/cv1217487)
#### 介绍视频
* [龍之祖者 - Dans la rue.aep](https://www.bilibili.com/video/av9228581)
* [陈沈晨 - melon style.aep](https://www.bilibili.com/video/av9778499)
#### 其它依赖
* [动感开发的 Rollup TypeScript 脚手架](https://github.com/motiondeveloper/expression-globals-typescript)
* [犀利 V](https://github.com/Silly-V/Adobe-TS-ExtendScript) 和 [AE 增强剂](https://github.com/aenhancers/Types-for-Adobe)的 Adobe 类型注解

</div>

