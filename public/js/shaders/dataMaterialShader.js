const dataMaterialShader = {
    vertexShader: `
        
        precision highp float;

        varying vec2 vUv;

        void main(){
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `   
        precision mediump float;

        uniform float visible;
        uniform vec3 color;
        
        void main(){
            if(visible>0.0){
                gl_FragColor = vec3(0.0);
            }else{
                gl_FragColor = color;
            }
            
        }
    `
}

export {dataMaterialShader}