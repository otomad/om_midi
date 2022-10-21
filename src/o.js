const cs = new CSInterface();

document.getElementById("browse-midi").addEventListener("click", function () {
	cs.evalScript("$.om_midi.openFile()", (result: string) => {
		if (!result || result === "undefined") return;
		document.getElementById("midi-name").textContent = result;
	});
});

document.getElementById("midi-bpm-section").addEventListener("click", () => {
	document.getElementById("midi-bpm-text").focus();
});
