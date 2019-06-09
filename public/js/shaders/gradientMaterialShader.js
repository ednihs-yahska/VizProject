const gradientMaterialShader = {
    vertexShader:`
        precision highp float;

        varying vec2 vUv;

        void main(){
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader:`
        precision mediump float;

        uniform float mixRatio;
        varying vec2 vUv;
        
        void main(){
            vec4 color1 = vec4(0.0, 1.0, 0.0, 1.0);
            vec4 color2 = vec4(0.0, 0.0, 1.0, 1.0);
            if(mixRatio > vUv.y){
                gl_FragColor = color1;
            }else{
                gl_FragColor = color2;
            }
             
        }
    `
}

export {gradientMaterialShader};