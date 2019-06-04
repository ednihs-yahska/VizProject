import {vec3, mat4} from "../gl-matrix/src/index";

var sceneShader = new THREE.ShaderMaterial( {
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #include <packing>

        varying vec2 vUv;

        void main() {

            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `
} );

var depthMaterialShader = new THREE.ShaderMaterial( {
    vertexShader: `
        varying vec2 vUv;

        float random (in vec2 _st) {
            return fract(sin(dot(_st.xy,
                                 vec2(12.9898,78.233)))*
                43758.5453123);
        }

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #include <packing>

        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;


        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main() {
            //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
            float depth = readDepth( tDepth, vUv );

            gl_FragColor.rgb = 1.0 - vec3( depth );
            gl_FragColor.a = 1.0;
        }
    `
} );

var motionBlurShader  = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #include <packing>
        varying vec2 vUv;
        uniform sampler2D tColor;
        uniform sampler2D tDepth;
        uniform mat4 uInverseViewProjectionMatrix;
        uniform mat4 uPreviousViewProjectionMatrix;
        uniform mat4 currentViewProjectionM;

        void main() {
            vec4 colorTexture = texture2D(tColor, vUv);
            float zOverW = texture2D(tDepth, vUv).z;
            vec4 zOver = texture2D(tDepth, vUv);
            vec4 H = vec4(vUv.x*2.0 - 1.0, (1.0 - vUv.y)*2.0 - 1.0, zOverW, 1.0);
            vec4 D = uInverseViewProjectionMatrix * H;
            vec4 worldPos = D/D.w;

            //
            vec4 testPos = currentViewProjectionM * H;
            vec4 IH = uInverseViewProjectionMatrix * testPos;


            //

            vec4 currentPos = H;
            vec4 previousPos = uPreviousViewProjectionMatrix * worldPos;
            previousPos /= previousPos.w;
            vec2 velocity = (currentPos - previousPos).xy;
            velocity = velocity / 2.0;
            vec2 blurCoord = vUv + velocity;

            // for(int i=0; i<2; i=i+1){
            //     vec4 currentColor = texture2D(tColor, blurCoord);
            //     colorTexture += currentColor;
            //     blurCoord+=velocity;
            // }

            vec4 currentColor = texture2D(tColor, blurCoord);
            colorTexture += currentColor;
            blurCoord+=velocity;

            currentColor = texture2D(tColor, blurCoord);
            colorTexture += currentColor;
            blurCoord+=velocity;

            // // currentColor = texture2D(tColor, blurCoord);
            // // colorTexture += currentColor;
            // // blurCoord+=velocity;
            // // currentColor = texture2D(tColor, blurCoord);
            // // colorTexture += currentColor;
            // // blurCoord+=velocity;


            gl_FragColor = IH;//colorTexture/2.0;
        }
    `
})

const getViewMatrix = (camera)=>{
    let position = camera.position;
    let positionV = vec3.create();
    positionV[0] = position.x;
    positionV[1] = position.y;
    positionV[2] = position.z;
    let up = camera.up;
    let upV = vec3.create();
    upV[0] = up.x;
    upV[1] = up.y;
    upV[2] = up.z;
    let lookAt = new THREE.Vector3(0,0,0);
    lookAt = camera.getWorldDirection(lookAt);
    let lookAtV = vec3.create();
    lookAtV[0] = lookAt.x;
    lookAtV[1] = lookAt.y;
    lookAtV[2] = lookAt.z;
    let viewMatrix = mat4.create();
    viewMatrix = mat4.lookAt(viewMatrix, positionV, lookAtV, upV);
    let viewMatrix3 = new THREE.Matrix4();//effect.uniforms["viewMatrix"].value;
    viewMatrix3.fromArray(Array.from(viewMatrix));
    //return viewMatrix3
    return viewMatrix;
}

export {depthMaterialShader, motionBlurShader, sceneShader, getViewMatrix}