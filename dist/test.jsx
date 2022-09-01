var layer = app.project.activeItem.selectedLayers[0];
for (var i = 1; i <= 2; i++) {
	var kk = layer.rotation.keyInTemporalEase(i)[0];
	alert(kk.influence + ',' + kk.speed);
}
