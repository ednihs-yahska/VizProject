import {hyperbolicShader} from './shaders/hyperbolicShader.js'
import {vec3, vec4, mat4} from "./gl-matrix/src/index";


if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

let colorScene, camera, hyperbolicMaterial; 
let renderer, controls, stats;
let mouse	= {x : 0, y : 0}
let lastTimeMsec = 0;
let Controls = function(){
    this.uK = 1.0;
    this.uTransX = 0.5;
    this.uTransY = 0.5;
    this.uXcntr = 0.5;
    this.uYcntr = 0.5;
    this.uScale = 1.0;
}

let hbg;

init();
animate();
function init() {
    /* Setup gui */
    {
        hbg = new Controls()
        let gui = new dat.GUI();
        const cK = gui.add(hbg, "uK", 0.1, 1.0);
        const cTransX = gui.add(hbg, "uTransX", 0.0, 1.0);
        const cTransY =gui.add(hbg, "uTransY", 0.0, 1.0);
        const cXcntr =gui.add(hbg, "uXcntr", 0.0, 1.0);
        const cYcntr =gui.add(hbg, "uYcntr", 0.0, 1.0);
        const cScale =gui.add(hbg, "uScale", 0.1, 1.0);

        cTransX.onChange((value)=>{hbg.uTransX = value})
        cTransY.onChange((value)=>{hbg.cTransY = value})
        cXcntr.onChange((value)=>{hbg.cXcntr = value})
        cYcntr.onChange((value)=>{hbg.cYcntr = value})
        cScale.onChange((value)=>{hbg.cScale = value})
        cK.onChange((value)=>{hbg.cK = value})
    }

     /* Setup Renderer*/
     {
        renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: false } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        if ( ! renderer.extensions.get( 'WEBGL_depth_texture' ) ) {
            supportsExtension = false;
            document.querySelector( '#error' ).style.display = 'block';
            return;
        }
    }

    /* Setup cameras */
    {
        camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    }

    /* Setup scenes */
    {
        colorScene = new THREE.Scene();
        colorScene.background = new THREE.Color( 0x000000 );
    }

    /* Setup Material */
        const mapTexture = new THREE.TextureLoader().load("images/NYMap.png");

        hyperbolicMaterial = new THREE.ShaderMaterial(hyperbolicShader);
        hyperbolicMaterial.uniforms = {
            uK: {value: 1},
            uTransX:{ value: 0.5 },
        	uTransY:{ value: 0.5 },
        	uXcntr:{ value: 0.5 },
        	uYcntr:{ value: 0.5 },
        	uScale:{ value: 0.5 },
            tDiffuse: {value: mapTexture}
        }
        
        const basicMaterial = new THREE.MeshBasicMaterial({
            map: mapTexture
        });
        
    
    /* Setup geometry in scene */
    
    var mapPlane = new THREE.PlaneBufferGeometry( 2, 2 );
    var mapQuad = new THREE.Mesh( mapPlane, hyperbolicMaterial );

    colorScene.add(mapQuad);


    /* Add lights */
    {
        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        colorScene.add( light );

        var light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( - 1, - 1, - 1 );
        colorScene.add( light );

        var light = new THREE.AmbientLight( 0x222222 );
        colorScene.add( light );

    }

    document.body.appendChild( renderer.domElement );

    /* Setting up controls */
    {
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );

        
        // var controlsEnabled	= true
        //     document.addEventListener('mousemove', function(event){
        //         // honor controlsEnabled
        //         if(controlsEnabled === false) return
            
        //         mouse.x	= (event.clientX / window.innerWidth ) - 0.5
        //         mouse.y	= (event.clientY / window.innerHeight) - 0.5
        //     }, false)
        //     updateFcts.push(function(delta, now){
        //         camera.position.x += (mouse.x*5 - camera.position.x) * (delta*3)
        //         camera.position.y += (mouse.y*5 - camera.position.y) * (delta*3)
        //         camera.lookAt( colorScene.position )
        //     })

        //     renderer.domElement.addEventListener('click', function(event){
        //         controlsEnabled	= controlsEnabled === true ? false : true
        // }, false)
    }
    /* Stats */
    {
        stats = new Stats();
        document.body.appendChild( stats.dom );
    }
    
    window.addEventListener( 'resize', onWindowResize, false );
    
    render();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    render();
}

function animate(nowMsec) {
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec
    requestAnimationFrame( animate );
    //delta = clock.getElapsedTime();
    controls.update();
    
    render(deltaMsec/1000, nowMsec/1000);
    stats.update();
}
function render(delta, now) {
    hyperbolicMaterial.uniforms.uK = {value: hbg.uK};
    hyperbolicMaterial.uniforms.uTransX = {value: hbg.uTransX};
    hyperbolicMaterial.uniforms.uTransY = {value: hbg.uTransY};
    hyperbolicMaterial.uniforms.uXcntr = {value: hbg.uXcntr};
    hyperbolicMaterial.uniforms.uYcntr = {value: hbg.uYcntr};
    hyperbolicMaterial.uniforms.uScale = {value: hbg.uScale};

    renderer.setRenderTarget(null);
    renderer.clear()
    renderer.render(colorScene, camera);
    //Finally, draw to the screen
}
