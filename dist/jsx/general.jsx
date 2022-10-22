if (typeof $ === "undefined") $ = {};
$.om_midi = {
	openFile: function () {
		var file = File.openDialog("选择一个文件", "所有文件:*.*");
		if (file === null) return;
		return file.displayName;
	},
	test: function (obj) {
		return obj;
	}
};
