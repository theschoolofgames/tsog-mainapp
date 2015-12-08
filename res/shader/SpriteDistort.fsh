#ifdef GL_ES
precision mediump float;
#endif

varying vec4 cc_FragColor;
varying vec2 cc_FragTexCoord1;

uniform int useDistrort;

void main()
{
	vec2 texCoord = cc_FragTexCoord1;
	
	highp float time = CC_Time[0];
    if (useDistrort == 1) {
	   texCoord.x += 0.05 * sin(3.0 * texCoord.y + time * 50.0);
    }
	
	gl_FragColor = cc_FragColor * texture2D(CC_Texture0, texCoord);
}
