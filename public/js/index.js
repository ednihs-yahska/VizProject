import {hyperbolicShader} from './shaders/hyperbolicShader.js'
import {vec3, vec4, mat4} from "./gl-matrix/src/index";


if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

let colorScene, camera, hyperbolicMaterial; 
let renderer, controls, stats;
let mouse	= {x : 0, y : 0}
let lastTimeMsec = 0;
let mapQuad;
let Controls = function(){
    this.calls = 0.2;
    this.latitude = 0.2;
    this.longitude = 0.2;
    this.time = 2;
}

let hbg;

fetch("http://localhost:3000/data").then((response)=>{
    response.json().then((data)=>{
        init(data);
        animate();
    })
})


function init(data) {
    let loader = new THREE.FontLoader();
    /* Setup gui */
    {
        hbg = new Controls()
        let gui = new dat.GUI();
        const calls = gui.add(hbg, "calls", 0.0, 1.0);
        const latitude =gui.add(hbg, "latitude", 0.0, 1.0);
        const longitude =gui.add(hbg, "longitude", 0.0, 1.0);
        const time =gui.add(hbg, "time", 0.0, 10.0);

        calls.onChange((value)=>{hbg.calls = value})
        latitude.onChange((value)=>{hbg.latitude = value})
        longitude.onChange((value)=>{hbg.longitude = value})
        time.onChange((value)=>{hbg.time = value})
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
        //camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 800;
        camera.position.y = 800;

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

        let dataMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
        
    
    /* Setup geometry in scene */
    
    var mapPlane = new THREE.PlaneBufferGeometry( 2048, 1024, 1, 1 );
    mapQuad = new THREE.Mesh( mapPlane, hyperbolicMaterial );
    mapQuad.rotation.x =  -Math.PI / 2;
    mapQuad.rotation.z = 6.31;

    colorScene.add(mapQuad);

    {        
        for ( var i = 0; i < data.length; i ++ ) {
            //if(data[i].num_calls<hbg.calls && data[i].latitude<hbg.latitude && data[i].longitude<hbg.longitude && data[i]<hbg.time){
                loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

                    var fontGeometry = new THREE.TextGeometry( data[i].latitude+' '+data[i].longitude, {
                        font: font,
                        size: 80,
                        height: 5,
                        curveSegments: 12,
                        bevelEnabled: true,
                        bevelThickness: 10,
                        bevelSize: 8,
                        bevelOffset: 0,
                        bevelSegments: 5
                    } );

                    fontGeometry.position.x = (data[i].longitude * 2048)-1024;
                    fontGeometry.position.y = data[i].num_calls*20;//( Math.random() - 0.5 ) * 1000; //
                    fontGeometry.position.z = (data[i].latitude * 1024)-512;
                    
                    colorScene.add(fontGeometry);
                } );
                console.log((data[i].latitude*(40.915618 - 40.499275)+40.499275) +' '+(data[i].longitude*(-73.465838-(-74.463894))+(-74.463894)));
                console.log("Adding data")
                var geometry = new THREE.CylinderBufferGeometry( 5, 5, data[i].num_calls*20, 8, 1 );
                
                var mesh = new THREE.Mesh( geometry, dataMaterial );
                
                mesh.position.x = (data[i].longitude * 2048)-1024;
                mesh.position.y = data[i].num_calls*10;//( Math.random() - 0.5 ) * 1000; //
                mesh.position.z = (-data[i].latitude * 1024)+512;
                
                mesh.updateMatrix();
                mesh.matrixAutoUpdate = false;
                
                colorScene.add( mesh );
            //}
        }


    }


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
    //mapQuad.rotation.z +=  0.005;
    console.log("Rotation "+mapQuad.rotation.z);

    renderer.setRenderTarget(null);
    renderer.clear()
    renderer.render(colorScene, camera);
    //Finally, draw to the screen
}
