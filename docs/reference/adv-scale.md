# 高级缩放

!!! caution "⚠施工现场⚠"
    此页面正在施工

!!! note "版本信息"
    该特性包含于 om_midi_NGDXW_zh `V1.2+`
    [*如何查看版本？*](/install.md#_4)

[![sample](/gallery/adv-scale-sample1.png)](/gallery/adv-scale-sample1.png)

与[缩放](scale.md)效果类似但生成的关键帧的值为 `1` 或 `-1` 。经过适当的表达式配置将允许图层在具备抽动效果的同时可被设置缩放比例。

## 应用示例

!!! tip
    推荐使用 AE 的表达式关联器

还记得[缩放](scale.md)里的示例代码吗？

```javascript
temp = thisComp.layer("midi").effect("高级缩放")("滑块"); //该行以实际情况为准，示例内容仅供参考

[temp, temp]
```

下面的 `[temp, temp]` 可按如下格式更改，在应用表达式后仍能像未应用表达式时一样自由的改变缩放比例。

### 水平抽动

```JavaScript
[value[0] * temp, value[1]]
```

### 垂直抽动

```JavaScript
[value[0], value[1] * temp]
```