if (app.project.activeItem) {
	var layer = app.project.activeItem.selectedLayers[0];
	if (layer) {
		for (var i_ = 0; i_ <= layer.selectedProperties.length; i_++) {
			var property = layer.selectedProperties[i_];
			if (property === undefined) continue;
			for (var j_ = 0; j_ <= property.selectedKeys.length; j_++) {
				var keyIndex = property.selectedKeys[j_];
				if (keyIndex === undefined) continue;
				
				var easeLength = property.keyInTemporalEase(keyIndex).length;
				var ease = [];
				for (var k_ = 0; k_ < easeLength; k_++) // 似乎某个傻叉脚本把 k 定义为全局只读变量了。
					ease.push(new KeyframeEase(0, 100));
				if (ease.length !== 0)
					property.setTemporalEaseAtKey(keyIndex, ease);
				property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.LINEAR);
			}
		}
	}
}
