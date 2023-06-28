import { FileUnreadableError } from "../errors";
import uiStr, { DIALOG_SIGN } from "../languages/ui-str";
import addControl, { addGroup } from "../modules/addControl";
import setNumberEditText from "../modules/setNumberEditText";
import BaseTool from "./BaseTool";
import ToolsTab from "./ToolsTab";

export default class BatchSubtitleGeneration extends BaseTool {
	//#region 组件对象
	browseButton: Button;
	subtitlesText: EditText;
	durationGroup: Group;
	durationLbl: StaticText;
	durationTxt: EditText;
	durationUnit: StaticText;
	//#endregion

	constructor(parent: ToolsTab) {
		super(parent);
		this.browseButton = addControl(this.group, "button", { alignment: ["fill", "top"] });
		this.subtitlesText = addControl(this.group, "edittext", { alignment: ["fill", "fill"] }, { multiline: true });
		({
			group: this.durationGroup,
			label: this.durationLbl,
			control: this.durationTxt,
		} = addGroup(this.group, localize(uiStr.duration), "edittext", { text: "1", alignment: ["fill", "center"] }, undefined, true));
		this.durationUnit = addControl(this.durationGroup, "statictext", { text: localize(uiStr.second_unit), alignment: ["right", "center"] });
		this.durationGroup.alignment = ["fill", "bottom"];
		setNumberEditText(this.durationTxt, { type: "decimal", min: 0, minNeq: true }, 1);
		this.translate();
		
		this.browseButton.onClick = () => {
			const file = File.openDialog(localize(uiStr.open), `${localize(uiStr.text_document)}:*.txt;*.text;*.log;*.md;*.lrc;*.srt,${localize(uiStr.all_files)}:*.*`);
			if (file === null) return;
			if (file.length > 1024 * 1024) // 设 1 MB 以上文件为大文件。
				if (!confirm(localize(uiStr.file_too_large_info), true, ""))
					return;
			let content: string;
			if (file && file.open("r")) {
				file.encoding = "UTF-8";
				content = file.read();
				file.close();
			} else throw new FileUnreadableError();
			if (!this.isEditTextEmpty())
				if (!confirm(localize(uiStr.will_clear_existing_text_info), true, ""))
					return;
			this.subtitlesText.text = content;
		};
	}

	private isEditTextEmpty() {
		return !this.subtitlesText.text.trim().length;
	}

	translate(): void {
		this.browseButton.text = localize(uiStr.browse) + DIALOG_SIGN;
		this.durationLbl.text = localize(uiStr.duration);
		this.durationUnit.text = localize(uiStr.second_unit);
	}
}
