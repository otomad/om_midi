var layer = app.project.activeItem.selectedLayers[0];
var prop = layer("Effects").addProperty("ADBE Geometry2");
prop.property(3).setValue(false)