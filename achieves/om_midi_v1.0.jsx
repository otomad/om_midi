/* File: ..//src//afterEffects//om_midi.jsx
Date: Sun Dec 25 22:58:10 PST 2011
Author: David Van Brink
This script is part of the omino adobe script suite.
The latest version can be found at http://omino.com/pixelblog/.

I write these because I like to. Please enjoy as you see fit.

Questions to poly@omino.com, subject line should start with
"plugins" so my spam filter lets it in.

This file has been preprocessed to be
standalone.  I develop them against some
reusable libraries -- such as for dialog
layout -- but for distribution it's nicer to
have just one file. dvb 2007.
 */
﻿

/*
Description: This After Effects script reads a Standard MIDI file (.mid) and creates layers and keyframes corresponding to the notes and controllers in that MIDI file.
::
*/

//#include "midi_reader.jsx"
// -----------------------------------------
// #include "../shared/ominoMidiFileReader.jsx"
// -----------------------------------------
﻿
/*
	The OMINO MIDI FILE READER
	
	This ExtendScript library reads a Standard MIDI File (.mid) into memory, organizing the events
	in a friendly manner suitable for a variety of purposes.
	
	This version only captures note events. Controller info is all lost.
	
	To use it, you create it with a file path, and read info out of the various notes array. Here:
	
	var m = new MidiFile("/path/to/midifile.mid");
	
	var notes = m.notes; // array of NOTE events
	var note = notes[0]; // first note
	var pitch = note.pitch;
	var vel = note.vel; // if zero, it's the END of a note
	var dur = note.duration; // only for note-starts.
	var ch = note.channel; // 16 * trackIndex + midiChannel. note.channel % 16 for midiChannel.

also

	var tracks = m.tracks; // array with per-track goodies
	var channels = m.channels; // array with per-channel goodies.
	
	Future enhancements:
	   • Write a MIDI file
	   • Properly track tempo changes
	   • Keep controller & pitch bend changes
	*/

/*
	This constructor takes a path to a MIDI file and, does a very light analysis of it.
	It does just enough to build up an array of note events, which includes the note on
	and note off as separate entries, in an array called notes.
	
	note.time is the time in seconds
	note.pitch
	note.vel is 0 for note off.
	*/
function MidiFile(filePath)
{
    
	addMidiFileMethods(this);

	this.microsecondsPerQuarterNote = 500000;
	this.timeSignatureNumerator = 4;
	this.timeSignatureDenominator = 4;
	this.timeSignatureMetronomeInterval = 24;
	this.timeSignatureHemiDemiSemiNotesPerQuarterNote = 8;

	this.filePath = filePath;
	this.file = readFile(filePath);
	this.fileLength = this.file.length;
	this.isMidi = isMidi(this.file);
	
	this.format = this.getShort(8);//判断单音轨或者双音轨
	this.trackCount = this.getShort(10);//轨道数目
	this.timeDivision = this.getShort(12);//基本时间
	if(this.timeDivision & 0x8000)//0x8000:1000000000000000
		this.framesPerSecond = this.timeDivision & 0x7fff;//0x7fff:111111111111111
	else
		this.ticksPerBeat = this.timeDivision; // more common.
   //     alert([this.timeDivision.toString(16),this.timeDivision & 0x8000])
	
	this.chunkCount = 0;
	this.noteOns = 0;
	this.noteOffs = 0;
	
	this.notes = new Array();
	this.channels = new Array();
	this.tracks = new Array();

	// read the rest of the chunks.
	var offset = 14;
	currentTrack = 0;
	while(offset < this.fileLength)
	{
		var chunkType = this.file.substring(offset,offset + 4);//4d54726b——mtrk
		var chunkLength = this.getLong(offset + 4);//本轨道长度
		this.chunkCount ++;
		
		if(chunkType == "MTrk")
		{
			var track = new Track();
			this.tracks.push(track);
			var previousStatus = 0;
			var chunkOffset = offset + 8;//正式轨道入口、无前缀
			var chunkEnd = chunkOffset + chunkLength;//正式轨道出口
			var ticks = 0;
			var midiChannelPrefix = 0;//前缀
			while(chunkOffset < chunkEnd)
			{
				var partial = this.file.substring(chunkOffset,chunkEnd);//局部
				var delta = this.getVarVal(chunkOffset);//以16位为格式的时间，单位是tick
				ticks += delta;

				var seconds = 0;
				var beats = 0;
				if(ticks && this.timeDivision && this.microsecondsPerQuarterNote)
				{
					seconds = ticks * this.microsecondsPerQuarterNote / this.timeDivision / 1000000;//由tick来算出秒
                  //  alert(seconds)
					beats = ticks / this.timeDivision;
				}
				chunkOffset += this.getVarLen(chunkOffset);//光标由时差移到事件上
				var status = this.file.charCodeAt(chunkOffset);//事件
				if(status & 0x80)//如果事件大于80
					chunkOffset++;
				else
					status = previousStatus;
				
				var statusTop = (status & 0xf0) >> 4;//事件判断
				var channel = (currentTrack) * 16 + (status & 0x0f);
				var b1 = this.file.charCodeAt(chunkOffset);
				var b2 = this.file.charCodeAt(chunkOffset + 1);

             //   alert(b2)
				if(status == 0xff)
					statusTop = status;
				switch(statusTop)
				{
					case 8: // note off
						this.addNote(seconds,beats,channel,b1,0);
						break;
					case 9: // note on (or note off if b2==0)
						this.addNote(seconds,beats,channel,b1,b2);
						break;
					case 0xff:
						{
							switch(b1)
							{
								case 0x03: // track name
									trackName = this.getVarString(chunkOffset + 1);
									track.name = trackName;
									break;
								case 0x04: // instrument name
									channel = (currentTrack) * 16 + midiChannelPrefix;
									var channelO = this.findChannel(channel);
									channelO.insrument = this.getVarString(chunkOffset + 1);
									break;
								case 0x20: // midi channel prefix
									midiChannelPrefix = this.getByte(chunkOffset + 2);
									break;
								case 0x51: // tempo
									// TODO build a tempo list, and always parse along it til thend. But for now, ignore tempos past t=0
									if(ticks == 0)
										this.microsecondsPerQuarterNote = this.getInt24(chunkOffset + 2);
									break;
								case 0x54: // smpte offset
									break;
								case 0x58: // sig
									this.timeSignatureNumerator = this.getByte(chunkOffset + 2);
									this.timeSignatureDenominator = 1 << this.getByte(chunkOffset + 3);
									this.timeSignatureMetronomeInterval = this.getByte(chunkOffset + 4);
									this.timeSignatureHemiDemiSemiNotesPerQuarterNote = this.getByte(chunkOffset + 5);
									break;
							}
						}
						break;
				}
			
				var eventLength = this.getEventLength(status,chunkOffset);
				chunkOffset += eventLength;
				previousStatus = status;
			}
			currentTrack++;
		}
		
		offset += 8 + chunkLength;//跳转到下一轨道
	}

	// sort the event-bucket
	this.notes.sort(function(a,b) { return a.time - b.time; });

}




function readFile(filePath)
{
	var f = new File(filePath);
	f.encoding = "BINARY";

	f.open ("r");
	var length = f.length;
	var result = f.read(length);
	f.close();
    ss=f.read(250)
  
	return result;
}

function isMidi(s)
{
	var h = s.substring(0,4);
	var result = h == "MThd";
	return result;
}

// time in seconds
function Note(time,beats,channel,pitch,vel)
{
	this.time = time;
	this.beats = beats;
	this.channel = channel;
	this.pitch = pitch;
	this.vel = vel;
}

function Channel(index)
{
	this.index = index;
	this.trackIndex = Math.floor(index / 16);
	this.midiChannel = index % 16;
	this.notes = new Array();
}

function Track(index)
{
	this.index = index;
	this.channels = new Array();
}

function addMidiFileMethods(m)
{
	m.getShort = function(offset) {//23 [96]=2396
		var result = this.file.charCodeAt(offset) * 256
				+ this.file.charCodeAt(offset + 1);    
		return result;
	}

	m.getLong = function(offset) {//23 [96] [45] [83] =23964583
		var result = this.file.charCodeAt(offset) * (1<<24)//16:1000000
				+ this.file.charCodeAt(offset + 1) * (1<<16)
				+ this.file.charCodeAt(offset + 2) * (1<<8)
				+ this.file.charCodeAt(offset + 3);
		return result;
	}

	m.getByte = function(offset) {
		var result = this.file.charCodeAt(offset);
		return result;
	}

	m.getInt24 = function(offset) {//23 [96] [45]  =239645
		var result = this.file.charCodeAt(offset) * (1<<16)
				+ this.file.charCodeAt(offset + 1) * (1<<8)
				+ this.file.charCodeAt(offset + 2) * (1<<0);
		return result;
	}

	/*
		Find a channel reference, or create it if needed, to assign.
		index is trackIndex * 16 + channel
		*/
	m.findChannel = function(index)
	{
		var channel = this.channels[index];
		if(!channel)
		{
			channel = new Channel(index);
			this.channels[index] = channel;
			var track = this.tracks[Math.floor(index / 16)]; // it MUST already be allocated.
			var midiChannel = index % 16;
			track.channels.push(channel);
		}
		return channel;
	}

	m.addNote = function(time,beats,channel,pitch,vel)
	{
		var note = new Note(time,beats,channel,pitch,vel);
		this.notes.push(note);
		
		var channelO = this.findChannel(channel);
		channelO.notes.push(note);

		if(vel)
		{
			this.noteOns++;
		}
		else
		{
			this.noteOffs++;
			// note-off? try to assign duration to a note-on
			for(var i = channelO.notes.length - 2; i >= 0; i--)
			{
				var note2 = channelO.notes[i];
				if(note2.vel && note2.pitch == pitch)
				{
					note2.durTime= time - note2.time;
					note2.durBeats = beats - note2.beats;
					i = 0;
//					break;
				}
			}
		}
		//alert([note.time,note.beats,note.vel,note.channel,note.pitch])
		return note;
	}

	m.getEventLength = function(status,offset)//得到事件长度
	{
        //alert([status,status & 0xf0])
		var statusTop = (status & 0xf0) >> 4;
		switch(statusTop)
		{
			case 0x8:
			case 0x9:
			case 0xa:
			case 0xb:
			case 0xe:
				return 2;
			case 0xc:
			case 0xd:
				return 1;
		}
		
		if(status == 0xff || status == 0xf0) // meta or sysex
		{
			var result = this.getVarVal(offset + 1);
			result += this.getVarLen(offset + 1);
			result += 1;
			return result;

// meta events
//~ 				case 0: // sequence number short
//~ 				case 1: //text event
//~ 				case 2: // copyright
//~ 				case 3: // seq/trk name
//~ 				case 4: // instrument name
//~ 				case 5: // lyrics
//~ 				case 6: // marker
//~ 				case 7: // cue point
//~ 				case 0x20: // midi channel for next instrument name
//~ 				case 0x2f: // end of track
//~ 				case 0x51: // tempo
//~ 				case 0x54: // smpte offset
//~ 				case 0x58: // time signature
//~ 				case 0x59: // key signature
//~ 				case 0x7f: // sequencer-specific
		}


	}

	m.getVarLen = function(offset) {//看0有多长
		var result = 1;
		while(1) {
			if(this.file.charCodeAt(offset) & 0x80)
			{
				result++;
				offset++;
			}
			else
				return result;
		}
	}

	m.getVarVal = function(offset) {//看非0有多长的
		var result = 0;
		while(1) {
			var b = this.file.charCodeAt(offset);
			result = result * 128 + (b & 0x7f);
			if(b & 0x80)
				offset++;
			else
				return result;
		}
	}

	m.getVarString = function(offset) {
		var result = "";
		var len = this.getVarVal(offset);
		var lenlen = this.getVarLen(offset);
		result = this.file.substring(offset + lenlen,offset + lenlen + len);
		return result;
	}

}

function midiReaderTest1(mf)
{
	var d = "/Users/poly/Sites/src/adobe_scripts/in_progress/";
	var p = d + mf;
	m = new MidiFile(p);
	if(!m.isMidi)
	{
		alert(p + " is not midi!");
		return;
	}

	var alertString = 
			", chunkCount: " + m.chunkCount
			+ ", tracksFound: " + m.tracks.length
			+ ", noteOns: " + m.noteOns
			+ ", noteOffs: " + m.noteOffs
			;
	
	for(var i in m.tracks)
	{
		var track = m.tracks[i];
		alertString += "\n" + track.name + "[" + track.channels.length + "],";
	}

	var toShow = m.notes.length;
	if(toShow > 40)
		toShow = 40;
	for(var i = 0; i < toShow; i++)
	{
		var note = m.notes[i];
		alertString += "\n" + note.time + ": " + note.pitch + "/" + note.vel + " on " + note.channel + " beats:" + note.beats;
		if(note.durTime)
			alertString += "--- dur = " + note.durBeats + "---";
		}

	alert(alertString);
}

//midiReaderTest1("moreNotes.mid");
//midiReaderTest1("Gimme_Gimme_Gimme.mid");
// thus ends ../shared/ominoMidiFileReader.jsx
// -----------------------------------------
// -----------------------------------------
// #include "../shared/ominoDialogMaker.jsx"
// -----------------------------------------
﻿{

var D_MARGIN = 4;
var D_CONTROLHEIGHT = 18;
var D_BUTTONWIDTH = 96;
var D_CONTROLLABELWIDTH = 84;
var D_CONTROLWIDTH = 100;
var D_DIALOG_WIDTH = 1 * D_MARGIN + D_CONTROLLABELWIDTH + D_CONTROLWIDTH;

var S2 = 1.41421356237309504880;


// create a rectangle for a new control, walking downwards.
function _odControlShared(label,name)
{
	od = this;
    var y = od.curYPos;
    var itemHeight = D_CONTROLHEIGHT;
    var itemBump = itemHeight + D_MARGIN;

    if(label != "")
        label += ":";
    var labelCtl = od.w.add('statictext',[D_MARGIN,y,D_MARGIN + D_CONTROLLABELWIDTH,y+itemHeight],label);
    labelCtl.justify = "right";

    var controlBox = new Object();
    controlBox.left = D_MARGIN + D_CONTROLLABELWIDTH + D_MARGIN;
    controlBox.top = y;
    controlBox.right = controlBox.left + D_CONTROLWIDTH;
    controlBox.bottom = controlBox.top + itemHeight;
    od.curYPos = controlBox.bottom + D_MARGIN;
	
	return controlBox;
}

function _odControlSharedFinish(control,name,valueFieldName)
{
	oD = this;
    oD.items[name] = control;
	oD.itemValueFieldNames[name] = valueFieldName;
	oD.itemNames[oD.itemNames.length] = name;
}

function _odNumber(label,name,value)
{
		oD = this;
		var controlBox = oD._odControlShared(label,name);
        var control = oD.w.add('edittext',controlBox,value);
		control.value = value;
        control.onChange = function(){this.value = (this.text) * 1.0; this.text = this.value;};  // make them all .value accessible
		oD._odControlSharedFinish(control,name,"text");
		return control;
}

function _odText(label,name,value)
{
		oD = this;
		var controlBox = oD._odControlShared(label,name);
        var control = oD.w.add('edittext',controlBox,value);
		control.value = value;
        control.onChange = function(){this.value = this.text; };  // make them all .value accessible
		oD._odControlSharedFinish(control,name,"text");
		return control;
}


function _setColorFromButton(victim,button)
{
			var g = victim.graphics;
			var n = button.value;
			var myBrush = g.newBrush(g.BrushType.SOLID_COLOR, n);
			g.backgroundColor = myBrush;
}
/*
	color values are array of three floats, 0.0 .. 1.0.
	*/
function _odColor(label,name,color)
{
	oD = this;
	var controlBox = oD._odControlShared(label,name);
	var swatchBox = [controlBox.left + 40,controlBox.top,controlBox.right,controlBox.bottom];
	var buttonBox = [controlBox.left,controlBox.top,controlBox.left + 30,controlBox.bottom];
	
	var swatch = oD.w.add('group',swatchBox);
	var button = oD.w.add('button',buttonBox);
	button.swatch = swatch;
	button.value = color;
	button.onClick = function(){
			var n = doColorPicker(this.value);
			this.value = n;
			_setColorFromButton(swatch,this);
			};
	_setColorFromButton(swatch,button);
	oD._odControlSharedFinish(button,name,"value");
	return button;
}

/*
	Add a button and static text to the dialog;
	the button refers to the text "nameCtl",
	and has .filePrompt and .fileExtension.
	*/
function _odFileCommon(label,name,path,prompt,extension)
{
	var controlBox = oD._odControlShared(label,name);
	var buttonWidth = 10;
	var buttonBox = [controlBox.left,controlBox.top,controlBox.left + buttonWidth,controlBox.bottom];
	var nameBox = [controlBox.left + buttonWidth + 10,controlBox.top,D_DIALOG_WIDTH,controlBox.bottom];
	var f = new File(path);
	
	var nameCtl = oD.w.add('statictext',nameBox);
	var button = oD.w.add('button',buttonBox,'...');
	button.nameCtl = nameCtl;
	nameCtl.text = f.name;
	button.value = f.fsName;
	button.file = f;
	button.filePrompt = prompt;
	button.fileExtension = extension;
	oD._odControlSharedFinish(button,name,"value");
	button.onChange = function()
	{
		this.file = new File(this.value);
		this.nameCtl.text = this.file.name;
	}
	return button;
}

function _odOpenFile(label,name,path,prompt,extension)//打开文件
{
	oD = this;
	var buttonCtl = _odFileCommon(label,name,path,prompt,extension);
	buttonCtl.onClick = function(){
		var f = this.file.openDlg(this.filePrompt);
     //   alert(f)
		if(f)
		{
			this.file = f;
			this.value = f.fsName;
			this.nameCtl.text = f.name;
		}
	};
	return buttonCtl;
}

function _odSaveFile(label,name,path,prompt,extension)
{
	oD = this;
	var buttonCtl = _odFileCommon(label,name,path,prompt,extension);
	buttonCtl.onClick = function(){
		var f = this.file.saveDlg(this.filePrompt);
		if(f)
		{
			this.file = f;
			this.value = f.fsName;
			this.nameCtl.text = f.name;
		}
	};
	return buttonCtl;
}

function _odSelectFolder(label,name,path,prompt,extension)
{
	oD = this;
	var buttonCtl = _odFileCommon(label,name,path,prompt,extension);
	buttonCtl.folder = new Folder(path); // folder, pls, not file
	buttonCtl.nameCtl.text += "/";
	buttonCtl.onClick = function(){
		var f = this.folder.selectDlg(this.filePrompt);
		if(f)
		{
			this.folder = f;
			this.value = f.fsName;
			this.nameCtl.text = f.name + "/";
		}
	};
	return buttonCtl;
}

function _odCheckbox(label,name,value,checkboxText)
{
		oD = this;
		var controlBox = oD._odControlShared(label,name);
        var control = oD.w.add('checkbox',controlBox,checkboxText);
		control.value = value;
        //control.onChange = function(){this.value = this.text;}; 
		oD._odControlSharedFinish(control,name,"value");
		return control;
}

function _odRadioButtons(label,name,value,radioChoices)
{
	var oD = this;
	controlBox = oD ._odControlShared(label,name);
	var itemHeight = controlBox.bottom - controlBox.top;

	result = oD.w.add('edittext',controlBox,value); // hidden text field to control it...
	result.onChange = function(){
		var i;
		this.value = this.text;
		for(i = 0; i < this.buttons.length; i++)
		{
			var button = this.buttons[i];
			button.value = (button.theChoice == this.text);
		}
	}
	result.hide();
	result.value = value;
	result.buttons = new Array();

	var i;
	for(i = 0; i < radioChoices.length; i++)
	{
		var choice = radioChoices[i];
		if(i > 0)
		{
			var bump = itemHeight + D_MARGIN;
			controlBox.top += bump;
			controlBox.bottom += bump;
			oD.curYPos += bump;
		}

		// each radiobutton object pokes its choice into the ersatz control,
		// so it looks like a simple value.
		// ("Grouping" appears to be by adjacent additions only. Nice!)
		var rb = oD.w.add('radiobutton',controlBox,choice);
		rb.value = choice == value;
		rb.theChoice = choice;
		rb.theGroupErsatzControl = result;
		rb.onClick = function(){this.theGroupErsatzControl.value = this.theChoice;};
		result.buttons[result.buttons.length] = rb;
	}
	oD._odControlSharedFinish(result,name,"text");
	return result;
}

function _odMenu(label,name,value,menuChoices)
{
	var oD = this;
	controlBox = oD ._odControlShared(label,name);
	var itemHeight = controlBox.bottom - controlBox.top;
	var control = oD.w.add('dropdownlist',controlBox,menuChoices);
	// I couldnt discern how to get this from the "items" array, so I stash menuChoice for later. dvb08.
	control.menuChoices = menuChoices;
	control.value = value;
	// set the initial selection index
	var index = 0;
	for(var i = 0; i < menuChoices.length; i++)
	{
		if(value == menuChoices[i])
			index = i;
	}
	control.selection = index;
    control.onChange = function() {
		this.value = this.selection.text;
		} // make them all .value accessible
	oD._odControlSharedFinish(control,name,"value");
}

function _odSectionLabel(label)
{
	var oD = this;
    var b2 = new Object();
	b2.left = D_MARGIN;
	b2.top = oD.curYPos;
	b2.right = b2.left + D_DIALOG_WIDTH;
	b2.bottom = b2.top + D_CONTROLHEIGHT;
	oD.curYPos += D_CONTROLHEIGHT + D_MARGIN;
    oD.w.add('statictext',b2,label + ':',{multiline:true});
}

function _odBoxedText(lines,text)
{
	var oD = this;
	var width = D_DIALOG_WIDTH;
	var height = lines * 15;

    var b2 = new Object();

	var b = new Object();
	b.top = oD.curYPos;
	b.bottom = b.top + height + 2 * D_MARGIN;
	b.left = D_MARGIN;
	b.right = b.left + width;

	oD.curYPos = b.bottom + D_MARGIN;

	var panel = oD.w.add('panel',b);

	b2.left = D_MARGIN;
	b2.top = D_MARGIN;
	b2.right = b2.left + width - 2 * D_MARGIN;
	b2.bottom = b2.top + height;

    panel.add('statictext',b2,text,{multiline:true});
}

function _odSeparator()
{
	var oD = this;
	var height = oD.groupGap;
	var barWidth = oD.ominoDialogWidth;
    if(barWidth)
    {
        var b = new Object();
        b.top = oD.curYPos + height / 2;
        b.bottom = b.top;
        b.left = D_MARGIN;
        b.right = b.left + barWidth;

        var barHeight = 2;
        b.top -= barHeight / 2;
        b.bottom = b.top + barHeight;
        oD.w.add('panel',b);
    }
    oD.curYPos += height;
}

function _odAppendGap()
{
	oD = this;
    oD.curYPos += oD.groupGap;
}

function appendOKCancel(oD)
{
    var y = oD.curYPos;

    var cancelRect = new Object();
    var okRect = new Object();

    cancelRect.left = D_MARGIN
    cancelRect.top = y;
    cancelRect.right = cancelRect.left + D_BUTTONWIDTH;
    cancelRect.bottom = cancelRect.top + D_CONTROLHEIGHT;

    okRect.left = cancelRect.right + D_MARGIN + D_MARGIN;
    okRect.top = y;
    okRect.right = okRect.left + D_BUTTONWIDTH;
    okRect.bottom = okRect.top + D_CONTROLHEIGHT;
    
    // Set up either Apply button, or OK/Cancel buttons
    if(oD.isPalette)
    {
        var applyBtn = oD.w.add('button',cancelRect,'Apply');
        applyBtn.oD = oD;
        applyBtn.onClick = function(){
            var oD = this.oD;
            var result = oD.get();
            oD.paletteCallback(result,oD.paletteCallbackArg2);
        };
    }
    else
    {
        var cancelBtn = oD.w.add('button',cancelRect,'Cancel',{name:'cancel'});
        var okBtn = oD.w.add('button',okRect,'OK',{name:'ok'});

        cancelBtn.oD = oD;
        cancelBtn.onClick = function(){this.oD.w.close(0);};  // 0 on cancel
        okBtn.theDialog = oD;
        okBtn.onClick = function(){this.theDialog.w.close(1);}; // 1 on ok
    }

    oD.curYPos = okRect.bottom + D_MARGIN;
}

function trimDialogBounds(oD)
{
    var xMax = 20;
    var yMax = 20;
    var n = oD.w.children.length;
	var i;
    for(i = 0; i < n; i++)
    {
        var aChild= od.w.children[i];
        var aChildBounds = aChild.bounds;
        if(aChildBounds.right > xMax)
            xMax = aChildBounds.right;
        if(aChildBounds.bottom > yMax)
            yMax = aChildBounds.bottom;
    }

    od.w.bounds.right = od.w.bounds.left + xMax + D_MARGIN;
    od.w.bounds.bottom = od.w.bounds.top + yMax + D_MARGIN;
	
	// actually... allow bottom gaps.
	od.w.bounds.bottom = od.curYPos + od.w.bounds.top;
}

/**
 * The optional 2nd, 3rd, and 4th arguments make it a palette instead of a modal dialog. The callback
 * is invoked every time Apply is clicked (you get an Apply button instead of OK/Cancel)
 */
function newOminoDialog(name,existingPanel,paletteCallback,paletteCallbackArg2)
{
    // if you pass in something other than a panel, no can use.
    if(!(existingPanel instanceof Panel))
        existingPanel = null;

    var isPalette = (existingPanel || paletteCallback) ? 1 : 0;
    var kind = isPalette ? 'palette' : 'dialog';    
    
    var oD = new Object();
    oD.w = existingPanel ? existingPanel : new Window(kind,name,[100,100,500,500]);
    
    oD.isPalette = isPalette;
    oD.paletteCallback = paletteCallback;
    oD.paletteCallbackArg2 = paletteCallbackArg2;
    
    oD.curYPos = D_MARGIN;
	oD.groupGap = 12;
	oD.itemNames = new Array();
	oD.item
	oD.items = new Array();
	oD.itemValueFieldNames = new Object(); // to poke a value into the dialog, each control's appropriate field, like "text" or "value"
	oD.ominoDialogWidth = D_DIALOG_WIDTH;
	
	oD.gap = _odAppendGap;
	oD.number = _odNumber;
	oD.string = _odText;
	oD.radioButtons = _odRadioButtons;
	oD.checkbox = _odCheckbox;
	oD.sectionLabel = _odSectionLabel;
	oD.separator = _odSeparator;
	oD.boxedText = _odBoxedText;
	oD.color = _odColor;
	oD.openFile = _odOpenFile;
	oD.selectFolder = _odSelectFolder;
	oD.saveFile = _odSaveFile;
	oD.menu = _odMenu;
	
	oD.set = _odSet;
	
	oD.run = _odRun;
	oD.get = _odGet;

	oD._odControlShared = _odControlShared;
	oD._odControlSharedFinish = _odControlSharedFinish;
	return oD;
}

function _odGet()
{
	var values = new Object();
	var name;
	for(name in this.items)
	{
		var value = this.items[name].value;
		values[name] = value;
	}

	return values;
}

function _odSet(values)
{
	var oD = this;
	if(!values)
		return;
	for(var p in values)
	{
		var value = values[p];
		var item = oD.items[p];
		if(!item)
			continue;
		var itemValueFieldName = oD.itemValueFieldNames[p];
		if(itemValueFieldName)
		{
			item[itemValueFieldName] = value;
			if(item.onChange)
				item.onChange();
			item.notify('onChange'); // to get the refresh
		}
	}
}

/**
   * Can be run as a modal dialog, OR as an ongoing palette. 
   * As a dialog, nothing happens until OK or Cancel is chosen; on OK,
   * the parameters are returned.
   * To be a palette, pass in a function and an arg. The function will
   * be called with (resultParams, yourArg).
   */
function _odRun()
{
	var oD = this;
	
	if(!oD.finishingTouches)
	{
		oD.separator(oD);
		//oD.gap();
		appendOKCancel(oD);
		//oD.gap();

		trimDialogBounds(oD);
		oD.finishingTouches = true;
	}

    if(oD.w instanceof Window)
    {
        var resultCode = oD.w.show();
        if(resultCode != 1) // cancel
            return null;

        var result = oD.get();
        return result;
    }
    else
        return null;
}

function objectToString(o)
{
    if(!o)
        return "";
        
    var s = "";
    var i;
    for(name in o)
        s += name + " = " + o[name] + "\n";
    return s;
}

var gExampleSettings = null;

function example(thisObj)
{
	var host = app;
    var d = newOminoDialog("Omino Example Dialog: " + host.name,thisObj,function(a,b){alert("result\n" + objectToString(a));});

    d.boxedText(4, "This is an example of a dialog built with ominoDialogMaker.jsx\n"
	+ "host: " + host.name + " " + host.version + "\n"
		+ "\n"
		+ "©2007-2012 poly@omino.com",
        D_DIALOG_WIDTH,80);

// d.separator();
//	d.sectionLabel("Kinds of Controls");
    d.number("Number H","h",11.23);
	d.checkbox("Checkbox X","x",true,"check this");
	d.string("Text","t","type here");
    d.openFile("A File","f","","open it","jpg");

	d.radioButtons("Choose One","r","red",["red","maroon","scarlet","crimson"]);

	var result;
    d.set(gExampleSettings);
    var result = d.run();
    if(result !=null)
    {
        gExampleSettings = result;
        var s = "Result Values\n";
          s += objectToString(result);
        alert(s);
    }
}

/*
	Easy to use progress bar for ExtendScript.
	Written by poly@omino.com, 2007
	Enjoy, but this credit must remain intact.

usage:
	
	var pb = progressBar("main title","subtitle");
	pb.setValue(valueFrom0to1);
	pb.setTitle2("new subtitle display!")
	if(pb.isCanceled())
		pb.close(); // they clicked cancel
*/
function progressBar(title1,title2)
{
	var result = new Object();
	result.running = true;
	result.p = new Window("palette");
	result.p.orientation = "column";
	result.p.alignChildren = "left";

	result.t1 = result.p.add("statictext",undefined,title1);
	result.t2 = result.p.add("statictext",undefined,title2);
	result.b = result.p.add("progressbar");
	
	result.c = result.p.add("button",undefined,"Cancel");
	result.c.onClick = function() {
		result.running = false;
		}
	
	result.isRunning = function() { return this.running; }
	result.isCanceled = function() { return !this.isRunning(); }
	result.setValue = function(x) { this.b.value = x * 100; this.p.update(); }
	result.setTitle1 = function(t1) { this.t1.text = t1; }
	result.setTitle2 = function(t2) { this.t2.text = t2; }
	result.close = function() { this.p.close(); }

	result.p.show();
	return result;
}


/*
	a foolish little routine to show all the insides of an object in al Alert.
	You know, for debugging.
	*/
function alertObj(o,title)
{
	if(!title)
		title = "";
	var s = title + "\n";
	var k;
	if(!o)
		s += "(null object)";
	else
        s += objectToString(o);
	alert(s);
}

//example(this);

"ok";

}
// end of file
// thus ends ../shared/ominoDialogMaker.jsx
// -----------------------------------------


{
    function addSliderControl(layer,sliderName)
    {
        var slider = layer.Effects.addProperty('ADBE Slider Control');
        slider.name = sliderName;
        return slider;
    }

    function setAllKeyFrames(prop,interpolationType)
    {
        var n = prop.numKeys;
        for(var i = 1; i <= n; i++)
            prop.setInterpolationTypeAtKey(i,interpolationType);
    }

	

	function applyChannelToLayer(channel,layer,pb,totalNotesCount,notesSoFar)//AAAAA
	{
        //for(q=0;q<channel.notes.length;q++)
       // alert(channel.notes[q].time)
        
        var midiChannel = channel.midiChannel;
		var trackIndex = channel.trackIndex;
		var name = "ch_" + midiChannel;
		
		pitchSliderName = name + "_pitch";
		velSliderName = name + "_vel";
		durSliderName = name + "_dur";
		
		addSliderControl(layer,pitchSliderName);
		addSliderControl(layer,velSliderName);
		addSliderControl(layer,durSliderName);

		// BUG: the previous object references are lost when we add a new property. lame! lame! lame!
		// SO, we re-find them, rather than keep the given ref.

		var pitchTimes = new Array();
		var pitchValues = new Array();
		var velTimes = new Array();
		var velValues = new Array();
		var durTimes = new Array();
		var durValues = new Array();
		
		// start "vel" at zero, so you can plot it if you like.
		// there will be no note at exactly time 0...
		velTimes.push(0);
		velValues.push(0);


		var lastT = 0;
		for(var i = 0; i < channel.notes.length; i++)
		{
			notesSoFar++;
			if(pb)
			{
				pb.setTitle2(notesSoFar + " of " + totalNotesCount);
				pb.setValue(notesSoFar  / totalNotesCount);
				if(pb.isCanceled())
					break;
			}
			var note = channel.notes[i];
			var t = note.time;
			
			if(t <= lastT)
				t = lastT + .0005; // bump time minutely past previous time, for simultaneous notes on same channel
						
			var pitch = note.pitch;
			var vel = note.vel;
			var dur = note.durTime; // in seconds. durBeats is in beats.
			
			pitchTimes.push(t);
			pitchValues.push(pitch);
			velTimes.push(t);
			velValues.push(vel);
			
			var durS = "" + dur;
			if(vel && typeof(dur) != "undefined")
			{
				durTimes.push(t);
				durValues.push(dur);
			}
		
			lastT = t;
		}
		
		var pitchValue = layer.Effects.property(pitchSliderName).property(1);
		var velValue = layer.Effects.property(velSliderName).property(1);
		var durValue = layer.Effects.property(durSliderName).property(1);

         if(pitchTimes.length > 0)
            pitchValue.setValuesAtTimes(pitchTimes,pitchValues);
		setAllKeyFrames(pitchValue,KeyframeInterpolationType.HOLD);
        
        if(velTimes.length > 0)
            velValue.setValuesAtTimes(velTimes,velValues);
		setAllKeyFrames(velValue,KeyframeInterpolationType.HOLD);
        
        if(durTimes.length > 0)
            durValue.setValuesAtTimes(durTimes,durValues);
		setAllKeyFrames(durValue,KeyframeInterpolationType.HOLD);
	}

	function applyMidiToLayer(midi,layer,totalNotesCount)//AAAAA
	{
        
       // alert(midi.channels[0].notes[0].time)
        
        // do this for each channel known in the midi file
        var channelCount = midi.channels.length;
        var notesSoFar = 0;
        var pb = progressBar("analyzing " + midi.filePath);
        for(var chKey in midi.channels)
        {
            var channel = midi.channels[chKey];
            var channelT = typeof channel;
            if(channelT != 'function')
            {
                applyChannelToLayer(channel,layer,pb,totalNotesCount,notesSoFar);
                notesSoFar += channel.notes.length;
            }
            if(pb.isCanceled())
                break;
        }
        pb.close();
	}


    function go(thisObj)
    {
        var omd = newOminoDialog("om midi",thisObj,apply);

        omd.boxedText(4,"Read a MIDI file, and add a new  " +
        "layer to your comp, with slider controls for each MIDI channel's " +
        "pitch, velocity, and duration");

        omd.openFile("midi file","midiFileName","","Choose a MIDI File",".mid");

        var result = omd.run();
    }

    function apply(result)//AAAAA2
    {
        if(result == null)
            return;

        var myComp = app.project.activeItem;
        app.beginUndoGroup("om midi");
        //		var midi = new MidiFile("/Users/poly/Sites/src/adobe_scripts/in_progress/moreNotes.mid");
        var pb = progressBar("loading " + result.midiFileName);
        pb.setValue(0.6);
        var midi = new MidiFile(result.midiFileName);
        pb.close();
        if(midi.notes.length > 0)
        {
            var newLayer = myComp.layers.addNull(10000);
            newLayer.name = "midi";

            var microsecondsPerQuarterNote = midi.microsecondsPerQuarterNote;
            var bpm = 60000000.0 / microsecondsPerQuarterNote;
            newLayer.comment = "midi imported by omMidiToKeyframes http://omino.com/pixelblog/"
            + "\nfile: " + result.midiFileName
            + "\nnotes: " + midi.notes.length
            + "\ntempo: " + bpm + "(" + midi.timeSignatureNumerator + "/" + midi.timeSignatureDenominator + ")";

            var totalNotesCount = midi.notes.length;
            applyMidiToLayer(midi,newLayer,totalNotesCount);
        }
        gMidiToKeyFramesParams = result;
        app.endUndoGroup();
    }

	go(this);

}
