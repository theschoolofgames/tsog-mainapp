#ifdef GL_ES
precision mediump float;
#endif

varying vec4 cc_FragColor;
varying vec2 cc_FragTexCoord1;

void main(void)
{
    vec4 c = texture2D(CC_Texture0, cc_FragTexCoord1);
    gl_FragColor = vec4(cc_FragColor.x * c.w, cc_FragColor.y * c.w, cc_FragColor.z * c.w, c.w);
}