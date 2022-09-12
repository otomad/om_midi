<div lang="en">

[![Cover](cover.png)](#om_midi)
<div align="center">
	<h2 id="om_midi">om midi</h2>
	<img src="https://img.shields.io/badge/STATE-STABLE-green?style=flat-square" alt="Badge" />
	<img src="https://img.shields.io/badge/VERSION-3.9.10.0-orange?style=flat-square" alt="Badge" />
	<!-- <img src="https://img.shields.io/github/downloads/otomad/om_midi/total.svg?style=flat-square&label=DOWNLOADS" alt="Downloads"> -->

**EN** | [简中](README_zh-CN.md)
</div>

**om midi**, or **OMM** for short, an Otomad/YTPMV assistant script for **After Effects**. It is a script that automatically converts MIDI files to keyframes in After Effects. Hope that with the help of om midi, people can be rescued from tedious aligning video and audio, and put more energy into more creative works.

Thanks to original script creators [David Van Brink (omino)](http://omino.com/), [Dora (NGDXW)](https://space.bilibili.com/40208180), [HanceyMica](https://space.bilibili.com/66940276), [Z4HD](https://github.com/Z4HD) for their efforts. And this repository is modified based on Z4HD's repository [om_midi_NGDXW_zh](https://github.com/Z4HD/om_midi_NGDXW_zh).

The current project is rewritten using new technologies like TypeScript based on legacy scripts.

**Sister Projects:** [Otomad Helper for Vegas](https://github.com/otomad/OtomadHelper).

### Documentations
* [Z4HD's Chinese Documentation](https://om.z4hd.cf/)
* [My Chinese Release Notes](https://www.bilibili.com/read/cv18532219)

### Supported AE Versions
`CS5` and later versions are theoretically supported. And both Windows and macOS are theoretically supported.

### Install
Download the latest script files.

#### `om midi`
Placed in the `Scripts\ScriptUI Panels` folder located in the After Effects installation directory.
> (ie. C:\Program Files\Adobe\Adobe After Effects 2022\Scripts\ScriptUI Panels)
#### `om utils`
There are two ways to import:
1. Placed in the same directory as the aep project.
	* Prepend to expressions:
```javascript
$.evalFile(thisProject.fullPath.replace(/\\[^\\]*$/, "\\om_utils.jsx"));
```
2. Placed anywhere, and then add to AE project.
	* Prepend to expressions:
```javascript
footage("om_utils.jsx").sourceData;
```

### Versions Comparison
> Except v1.2, no version tags are given for others. So those version tags are defined by myself.

Ver. | Common Name | Multitrack Support | Add Keyframes to Layers | English UI | Additional Useful Keyframes | Manually Select MIDI Tracks | Change BPM
:--- | :--- | :---: | :---: | :---: | :---: | :---: | :---:
v0.1 | [David Van Brink (omino)'s Original Edition](http://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/) | ✔️ | ❌ | ✔️ | ❌ | ❌ | ❌ | ❌
v1.0 | [Dora (NGDXW)'s Revision](https://www.bilibili.com/read/cv170398) | ✔️ | ❌ | ✔️ | ✔️ | ❌ | ❌
v1.0 Plus | [HanceyMica's Presets](https://www.bilibili.com/video/av29649969) | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌
v1.2 | [Z4HD's Chinese Edition](https://github.com/Z4HD/om_midi_NGDXW_zh) | ✔️ | ❌ | ❌ | ✔️ | ❌ | ❌
v2.0 | [Dora (NGDXW)'s Second Revision](https://www.bilibili.com/read/cv1217487) | ❌ | ✔️ | ❌ | ✔️ | ❌ | ❌
v3.x | **Current Version** | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️

### References
#### Previous Versions
* [David Van Brink (omino)'s Original Edition](http://omino.com/pixelblog/2011/12/26/ae-hello-again-midi/)
* [Dora (NGDXW)'s Revision](https://www.bilibili.com/read/cv170398)
* [HanceyMica's Presets](https://www.bilibili.com/video/av29649969)
* [Z4HD's Chinese Edition](https://github.com/Z4HD/om_midi_NGDXW_zh)
* [Dora (NGDXW)'s Second Revision](https://www.bilibili.com/read/cv1217487)
#### Introduction Videos
* [Dragon Ancestor - Dans la rue.aep](https://www.bilibili.com/video/av9228581)
* [Chen Chen Chen - melon style.aep](https://www.bilibili.com/video/av9778499)
#### Other Dependencies
* [Motion Developer's Rollup TypeScript Scaffolding](https://github.com/motiondeveloper/expression-globals-typescript)
* [Silly-V's](https://github.com/Silly-V/Adobe-TS-ExtendScript) and [aenhancers's](https://github.com/aenhancers/Types-for-Adobe) Adobe Types
* [Sergi Guzman (colxi)'s midi-parser-js - MIDI File Format Specifications](https://github.com/colxi/midi-parser-js/wiki/MIDI-File-Format-Specifications)

</div>
