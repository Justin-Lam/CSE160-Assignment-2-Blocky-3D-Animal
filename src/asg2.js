const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform mat4 u_ModelMatrix;
	uniform mat4 u_GlobalRotationMatrix;
	void main() {
		gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_FragColor;
let u_GlobalRotationMatrix;

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

	const identity = new Matrix4();

	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		throw new Error("Failed to get the storage location of a_Position");
	}

	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	if (!u_ModelMatrix) {
		throw new Error("Failed to get the storage location of u_ModelMatrix");
	}
	gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);

	u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (!u_FragColor) {
		throw new Error("Failed to get the storage location of u_FragColor");
	}

	u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotationMatrix");
	if (!u_GlobalRotationMatrix) {
		throw new Error("Failed to get the storage location of u_GlobalRotationMatrix");
	}
	gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, identity.elements);
}

let g_globalRotation = 0;
function createUIEvents() {
	document.getElementById("globalRotationSlider").addEventListener("mousemove", function() {
		g_globalRotation = this.value;
		renderAllShapes();
	});
}

function main() {
	getCanvasAndContext();
	compileShadersAndConnectVariables();
	createUIEvents();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	renderAllShapes();
}

function renderAllShapes() {
	const globalRotationMatrix = new Matrix4();
	globalRotationMatrix.rotate(g_globalRotation, 0, 1, 0);
	gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotationMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const body = new Cube();
	body.color = [1.0, 0.0, 0.0, 1.0];	// red
	body.matrix.translate(-0.25, -0.5, 0);
	body.matrix.scale(0.5, 1, 0.5);
	body.render();

	const arm_l = new Cube();
	arm_l.color = [1, 1, 0, 1];	// yellow
	arm_l.matrix.translate(0.7, 0, 0);
	arm_l.matrix.rotate(45, 0, 0, 1);
	arm_l.matrix.scale(0.25, 0.7, 0.5);
	arm_l.render();
}