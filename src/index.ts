import user from "./user";
import Portal from "./ui/Portal";
import { NotAfterEffectsError } from "./errors";
import initPrototypes from "./module/prototypes";

declare const thisObj: Panel;

if (BridgeTalk.appName !== "aftereffects")
	throw new NotAfterEffectsError();
else {
	initPrototypes();
	Portal.build(thisObj, user);
}
