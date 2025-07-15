/// <reference path="this.d.ts" />
import thisObj from "this";
import user from "./user";
import "./modules/prototypes";
import Portal from "./ui/Portal";
import { LowVersionError, NotAfterEffectsError } from "./errors";

if (!BridgeTalk.appName.includes("aftereffects"))
	// After Effects app name is "aftereffects"
	// After Effects Beta version app name is "aftereffectsbeta"
	throw new NotAfterEffectsError();
else if (parseFloat(app.version) < 9.0)
	throw new LowVersionError();
else
	Portal.build(thisObj, user);
