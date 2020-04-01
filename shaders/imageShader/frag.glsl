precision mediump float;

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.rgb *= gl_FragColor.a; // premultiply alpha
}