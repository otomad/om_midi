import user from "./user";
import Portal from "./ui/Portal";
import { NotAfterEffectsError } from "./exceptions";

declare const thisObj: Panel;

if (BridgeTalk.appName !== "aftereffects")
	throw new NotAfterEffectsError();
else
	Portal.build(thisObj, user);
