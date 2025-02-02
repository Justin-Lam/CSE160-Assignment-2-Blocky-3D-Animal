const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform float u_Size;
	void main() {
		gl_Position = a_Position;
		gl_PointSize = u_Size;
	}
`;
const FSHADER_SOURCE = `
	precision mediump float;
	uniform vec4 u_FragColor;
	void main() {
		gl_FragColor = u_FragColor;
	}
`;

let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;

function getCanvasAndContext() {
	canvas = document.getElementById("webgl");
	gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
	if (!gl) {
		throw new Error("Failed to get the rendering context for WebGL");
	}
	gl.enable(gl.DEPTH_TEST);
}

function compileShadersAndConnectVariables() {
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		throw new Error("Failed to intialize shaders");
	}

	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		throw new Error("Failed to get the storage location of a_Position");
	}

	u_Size = gl.getUniformLocation(gl.program, "u_Size");
	if (!u_Size) {
		throw new Error("Failed to get the storage location of u_Size");
	}

	u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (!u_FragColor) {
		throw new Error("Failed to get the storage location of u_FragColor");
	}
}

function main() {
	getCanvasAndContext();
	compileShadersAndConnectVariables();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	renderAllShapes();
}

function renderAllShapes() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// test triangle
	drawTriangle3D([-1.0, 0.0, 0.0,		-0.5, -1.0, 0.0,		0.0, 0.0, 0.0]);

	// test cube
	const cube = new Cube();
	cube.color = [1.0, 0.0, 0.0, 1.0];	// red
	cube.render();
}