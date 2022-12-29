(function(thisObj)
{
	buildUI(thisObj);

	function buildUI(thisObj)
	{

		// JSON handler
		"object"!=typeof JSON&&(JSON={}),function(){"use strict";var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep;function f(t){return t<10?"0"+t:t}function this_value(){return this.valueOf()}function quote(t){return rx_escapable.lastIndex=0,rx_escapable.test(t)?'"'+t.replace(rx_escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,u,f,a=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,f=[],"[object Array]"===Object.prototype.toString.apply(i)){for(u=i.length,r=0;r<u;r+=1)f[r]=str(r,i)||"null";return o=0===f.length?"[]":gap?"[\n"+gap+f.join(",\n"+gap)+"\n"+a+"]":"["+f.join(",")+"]",gap=a,o}if(rep&&"object"==typeof rep)for(u=rep.length,r=0;r<u;r+=1)"string"==typeof rep[r]&&(o=str(n=rep[r],i))&&f.push(quote(n)+(gap?": ":":")+o);else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i))&&f.push(quote(n)+(gap?": ":":")+o);return o=0===f.length?"{}":gap?"{\n"+gap+f.join(",\n"+gap)+"\n"+a+"}":"{"+f.join(",")+"}",gap=a,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value),"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;n<r;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(void 0!==(n=walk(o,r))?o[r]=n:delete o[r]);return reviver.call(t,e,o)}if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

		/*
		Code for Import https://scriptui.joonas.me — (Triple click to select): 
		{"activeId":15,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"window","windowType":"Window","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":true},"text":"MMaker - RPP Marker Creator","preferredSize":[256,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","center"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Load .rpp","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":1,"style":{"enabled":true,"varName":"fileOpener","text":"...","justify":"center","preferredSize":[24,24],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"JSON Data","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-7":{"id":7,"type":"StaticText","parentId":6,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Track Name","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-9":{"id":9,"type":"EditText","parentId":0,"style":{"enabled":true,"varName":"jsonData","creationProps":{"noecho":false,"readonly":false,"multiline":true,"scrollable":true,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"","justify":"left","preferredSize":[224,96],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"runButton","text":"Go!","justify":"center","preferredSize":[64,0],"alignment":"center","helpTip":null}},"item-11":{"id":11,"type":"DropDownList","parentId":6,"style":{"enabled":true,"varName":"trackName","text":"DropDownList","listItems":"","preferredSize":[140,0],"alignment":null,"selection":0,"helpTip":null}},"item-12":{"id":12,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-13":{"id":13,"type":"StaticText","parentId":12,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Frame Offset","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-15":{"id":15,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"aboutButton","text":"?","justify":"center","preferredSize":[24,24],"alignment":"right","helpTip":null}},"item-16":{"id":16,"type":"EditText","parentId":12,"style":{"enabled":true,"varName":"frameOffset","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"-3","justify":"left","preferredSize":[32,0],"alignment":null,"helpTip":null}}},"order":[0,1,2,3,5,9,6,7,11,12,13,16,10,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
		*/ 

		// WINDOW
		// ======
		var window = (thisObj instanceof Panel) ? thisObj : new Window("window", undefined, undefined, {closeButton: true, resizeable: false}); 
			// window.text = "MMaker - RPP Marker Creator"; 
			window.preferredSize.width = 224; 
			window.orientation =	 "column"; 
			window.alignChildren = ["left","center"]; 
			window.spacing = 10; 
			window.margins = 16; 

		// GROUP1
		// ======
		var group1 = window.add("group", undefined, {name: "group1"}); 
			group1.orientation = "row"; 
			group1.alignChildren = ["left","center"]; 
			group1.spacing = 10; 
			group1.margins = 0; 

		var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
			statictext1.text = "Load .rpp"; 

		var fileOpener = group1.add("button", undefined, undefined, {name: "fileOpener"}); 
			fileOpener.text = "..."; 
			fileOpener.preferredSize.width = 24; 
			fileOpener.preferredSize.height = 24; 

		// WINDOW
		// ======
		var statictext2 = window.add("statictext", undefined, undefined, {name: "statictext2"}); 
			statictext2.text = "JSON Data"; 

		var jsonData = window.add('edittext {properties: {name: "jsonData", multiline: true, scrollable: true}}'); 
			jsonData.preferredSize.width = 160; 
			jsonData.preferredSize.height = 48; 

		// GROUP2
		// ======
		var group2 = window.add("group", undefined, {name: "group2"}); 
			group2.orientation = "row"; 
			group2.alignChildren = ["left","center"]; 
			group2.spacing = 10; 
			group2.margins = 0; 

		var statictext3 = group2.add("statictext", undefined, undefined, {name: "statictext3"}); 
			statictext3.text = "Track Name"; 

		var trackName = group2.add("dropdownlist", undefined, undefined, {name: "trackName"}); 
			trackName.selection = 0; 
			trackName.preferredSize.width = 96; 

		// GROUP3
		// ======
		var group3 = window.add("group", undefined, {name: "group3"}); 
			group3.orientation = "row"; 
			group3.alignChildren = ["left","center"]; 
			group3.spacing = 10; 
			group3.margins = 0; 

		var statictext4 = group3.add("statictext", undefined, undefined, {name: "statictext4"}); 
			statictext4.text = "Frame Offset"; 

		var frameOffset = group3.add('edittext {properties: {name: "frameOffset"}}'); 
			frameOffset.text = "-2";
			frameOffset.preferredSize.width = 32; 

		// WINDOW
		// ======
		var runButton = window.add("button", undefined, undefined, {name: "runButton"}); 
			runButton.text = "Go!"; 
			runButton.preferredSize.width = 64; 
			runButton.alignment = ["center","center"]; 

		var aboutButton = window.add("button", undefined, undefined, {name: "aboutButton"}); 
			aboutButton.text = "?"; 
			aboutButton.preferredSize.width = 24; 
			aboutButton.preferredSize.height = 24; 
			aboutButton.alignment = ["right","center"]; 

		window.onResizing = window.onResize = function()
		{
			this.layout.resize();
		};

		if (window instanceof Window)
		{
			window.center();
			window.show();
		} 
		else
		{
			window.layout.layout(true);
			window.layout.resize();
		}
	
		fileOpener.addEventListener("mousedown", function(evt)
		{
			rppFile = (new File()).openDlg("Select .rpp file ...", "*.rpp", false);

			if (rppFile != null)
			{
				if (trackName.items.length > 0)
				{
					trackName.removeAll();
				}
	
				stdOut = system.callSystem("python \"Scripts\\ScriptUI Panels\\MMaker_RPPJSON.py\" \"" + rppFile.fsName + "\"")
				jsonData.text = stdOut;
	
				trackNames = getObjectKeys(JSON.parse(jsonData.text));
				for (var i = 0; i < trackNames.length; i++)
				{
					currentTrack = trackNames[i];
					currentTrack = currentTrack.substring(1);
					trackName.add("item", currentTrack);
				}
			}
		});

		runButton.addEventListener("mousedown", function(evt)
		{
			try
			{
				app.beginUndoGroup("Add markers");
				var comp = app.project.activeItem;

				jsonParsed = JSON.parse(jsonData.text);
				if (trackName.selection != null)
				{
					flipItem = "!" + trackName.selection.text;
				}
				else
				{
					alert("Please select a track.");
					return;
				}

				if (isNaN(parseInt(frameOffset.text)))
				{
					alert("Please enter a valid number for the frame offset.");
					return;
				}
				else
				{
					timeConst = parseInt(frameOffset.text) / (1/comp.frameDuration); 
				}
				
				if (typeof jsonParsed[flipItem] != 'undefined')
				{
					for (var i = 0; i < jsonParsed[flipItem].length; i++)
					{
						newMarker = new MarkerValue("");
						marker_params = {};
						newMarker.label = 0;
						marker_params.label = newMarker.label;
						newMarker.setParameters(marker_params);
						comp.markerProperty.setValueAtTime(jsonParsed[flipItem][i] + timeConst, newMarker);
					}
				}
				else
				{
					alert("Track does not exist!");
					return;
				}
				
				app.endUndoGroup();
			}
			catch(e)
			{
				alert(e);
			}
		});

		aboutButton.addEventListener("mousedown", function(evt)
		{
			alert("Script by MMaker\nmmaker.moe");
		});
	
	}

	// https://gist.github.com/ltfschoen/79ab3e98723e61660117
	var getObjectKeys = function(associativeArrayObject) {
		var arrayWithKeys=[], associativeArrayObject;
		for (key in associativeArrayObject) {
			// Avoid returning these keys from the Associative Array that are stored in it for some reason
			if (key !== undefined && key !== "toJSONString" && key !== "parseJSON" ) {
			arrayWithKeys.push(key);
			}
		}
		return arrayWithKeys;
		}

})(this);