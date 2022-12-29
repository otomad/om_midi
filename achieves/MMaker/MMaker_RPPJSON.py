import json, sys, rpp

def getSecondsFromPPQ(tempo, ppq, offset):
    microseconds_per_tick = (60000 / tempo * 1000) / ppq
    seconds_per_tick = microseconds_per_tick / 1000000
    seconds = offset * seconds_per_tick
    return seconds

try:
    with open(sys.argv[1], "rb") as f:
        data = f.read().decode("utf-8")
        r = rpp.loads(data)

        tempo = float(next(r.iterfind(".//TEMPO"))[1])
        trackList = {}
        
        for item in r.iterfind(".//TRACK"):
            trackName = item.find(".//NAME")[1]
            if (trackName.startswith("!")):
                if not trackName in trackList:
                	trackList[trackName] = []
                for pos in item.iterfind(".//POSITION"):
                    itemType = item.find(".//SOURCE").attrib
                    itemPos = float(pos[1])
                    if (itemType[0] == "MIDI"):
                        ppq = 960
                        tick_offset = 0

                        for midiData in item.find(".//SOURCE").children:
                            if midiData[0] == 'HASDATA':
                                ppq = int(midiData[2])

                            if midiData[0] in ['e', 'E']:
                                if midiData[2].startswith('9') and midiData[4] != '00':
                                    trackList[trackName].append(getSecondsFromPPQ(tempo, ppq, int(midiData[1]) + tick_offset) + itemPos)
                                tick_offset += int(midiData[1])
                            
                    else:
                        trackList[trackName].append(itemPos)
        
        if (len(sys.argv) > 2):
            with open(sys.argv[2], "w") as out:
                json.dump(trackList, out)
            print("File saved to " + sys.argv[2])
        else:
            print(json.dumps(trackList))
except Exception as e:
    print(e)