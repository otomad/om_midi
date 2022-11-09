/// <reference path="this.d.ts" />
import user from "./user";
import thisObj from "this";
import Portal from "./ui/Portal";
import { LowVersionError, NotAfterEffectsError } from "./errors";
import initPrototypes from "./modules/prototypes";

if (BridgeTalk.appName !== "aftereffects")
	throw new NotAfterEffectsError();
else if (parseFloat(app.version) < 9.0)
	throw new LowVersionError();
else {
	initPrototypes();
	Portal.build(thisObj, user);
}
