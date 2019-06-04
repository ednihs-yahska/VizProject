const hyperbolicShader = {
    vertexShader: `
        
        precision highp float;

        varying vec2 vUv;

        void main(){
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
       
        precision mediump float;
        #define MAX_GHOSTS 4

        uniform float	uK;
        uniform float	uTransX;
        uniform float	uTransY;
        uniform float	uXcntr;
        uniform float	uYcntr;
        uniform float	uScale;
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main(){
            vec2 texCoord = vUv;
            float _Ycntr = 1.0 - uYcntr;
            float _TransY = 1.0 - uTransY;
            texCoord = texCoord - vec2(uXcntr, uYcntr);
            texCoord = texCoord / uScale;
            texCoord = texCoord + vec2(uTransX, uTransY);
            float r = length(texCoord);
            vec2 pos2 = vec2(0.5, 0.5);
            pos2 = texCoord / vec2((r + uK));
            int x = 0;
            for (int j=0; j < MAX_GHOSTS; j++) {
                for (int k=0; k< MAX_GHOSTS; k++){
                    // statement(s)
                    texture2D(tDiffuse, vUv+vec2(j));
                } 
            }
            gl_FragColor = texture2D(tDiffuse, pos2);
        }
    `
}

export {hyperbolicShader}