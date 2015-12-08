#ifdef GL_ES
precision mediump float;
#endif

varying vec4 cc_FragColor;
varying vec2 cc_FragTexCoord1;

uniform sampler2D u_alphaTexture;

void main()
{
    vec2 texCoord = cc_FragTexCoord1;
    float alpha = texture2D(u_alphaTexture, cc_FragTexCoord1).x;

    float time = CC_Time[1];
    float newX = texCoord.x - time * 0.1;

    texCoord.x = newX - float(int(newX));
    if (texCoord.x < 0.0)
        texCoord.x += 1.0;

    if (texCoord.x < 0.5)
        alpha = 0.5;
    
    vec4 c = texture2D(CC_Texture0, texCoord);

    gl_FragColor = vec4(c.x, c.y, c.z, alpha);
}
