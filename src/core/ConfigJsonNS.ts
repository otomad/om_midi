import assign from "../modules/assign";

namespace ConfigJsonNS {
	export class MappingVelocity {
		velocityLess = 0;
		velocityMore = 127;
		targetLess = -192;
		targetMore = 0;
		
		constructor(raw?: Partial<MappingVelocity>) {
			if (raw) assign(this, raw);
		}
	}
}

export default ConfigJsonNS;
