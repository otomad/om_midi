{
    version: '1.0.1',
    get_functions(time = thisLayer.time) {
        function get_key_index(forward = false, input_property = thisProperty) {
            let n = 0;
            if (input_property.numKeys > 0) {
                n = input_property.nearestKey(time).index;
                if (input_property.key(n).time > time && !forward)
                    n--;
                else if (input_property.key(n).time <= time && forward)
                    n++;
            }
            return Math.min(n, input_property.numKeys);
        }
        function angle_offset(rot, pos) {
            rot = thisLayer.degreesToRadians(rot - 90);
            const x = Math.cos(rot);
            const y = Math.sin(rot);
            return [pos * x, pos * y];
        }
        // https://gist.github.com/animoplex/aafd6a157282351c8dfeea385d969ef2
        function inertial_bounce(amp, freq, decay, input_property = thisProperty) {
            const n = get_key_index(undefined, input_property);
            let t = 0;
            if (n != 0) {
                t = time - input_property.key(n).time;
            }
            if (n > 0 && t < 1) {
                const v = input_property.velocityAtTime(input_property.key(n).time - thisComp.frameDuration / 10);
                return input_property.value + v * (amp / 100) * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
            }
            else {
                return t;
            }
        }
        const YTPMV = {
            flip: function (input_property = thisProperty, mult = 100) {
                const n = get_key_index(undefined, input_property);
                return (n % 2 != 0 || n == 0) ? 1 * mult : -mult;
            },
            time_reset: function (input_property = thisProperty) {
                const n = get_key_index(undefined, input_property);
                return (n > 0) ? time - input_property.key(n).time : 0;
            }
        };
        return {
            get_key_index,
            angle_offset,
            inertial_bounce,
            YTPMV
        };
    },
}