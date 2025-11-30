let font

let tilesX = 4
let tilesY = 4
let tileW
let tileH

let vw = window.innerWidth * 0.01

// Quick Settings variables
let message = 'BASS' //Initial
let multiplier = 100
let wave = 0.075
let loopNum = 3
let fontsize = 30
let visible = true

// Colors
let textHue = 80
let backgroundColor = textHue + 180
let hslCol

// Repeater
let wordRepeat = 3
let repeats = []

QuickSettings.useExtStyleSheet()
var settings = QuickSettings.create(20, 20, 'Controls')
	.addRange('Text Size', 10, 45, fontsize, 1, setTextSize)
	.addRange('Color', 0, 360, textHue, 20, setTextCol)
	.addRange('Repeats', 1, 9, wordRepeat, 1, setRepeater)
	.addDropDown(
		'Track',
		[`${message}`, 'SNARE', 'KICK', 'PERC', 'ARPEG', 'LEAD', 'CHORD'],
		setDropDown
	)
	.addRange('Num Columns', 2, 80, tilesY, 2, setTileX)
	.addRange('Num Rows', 2, 80, tilesX, 2, setTileY)
	.addRange('Amplitude', 50, 500, multiplier, 10, setMultiplier)
	.addRange('Tempo', 0.025, 0.35, wave, 0.025, setWave)

function preload() {
	font = loadFont('font/graphik-medium.otf')
}

function setup() {
	colorMode(HSL)

	frameRate(30)

	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	pixelDensity(1)

	createCanvas(windowWidth, windowHeight)

	setUpGraphics()

	addEffects(
		blur2d(3, 4, 5),
		// motionBlur(0, 0.003),
		// hsvToRgb(vec4(getComp(rgbToHsv(fColor()), 'z'), 1, 1, 1)),
		// noiseDisplacement(1.125),
		// contrast(5),
		edge()
		// oldFilm()
		// vignette()
	)
	addChannels(null)
}

// Initial Value
function setUpGraphics() {
	hslCol = color(`hsl(${textHue}, 100%, 50%)`)
	background(color(`hsl(${backgroundColor}, 100%, 20%)`))

	repeats.length = 0 // clears Array
	for (let i = 0; i < wordRepeat; i++) {
		let img = createGraphics(windowWidth, windowHeight)
		img.push()
		/*------- DEBUG WRAPPER -------- */
		//     pg.background('rgba(255, 0, 0, 0.4)')
		//     pg.stroke('red')
		//     pg.strokeWeight(4)
		/*------- DEBUG WRAPPER -------- */
		img.textFont(font)
		img.textSize(vw * fontsize)
		img.translate(windowWidth / 2, windowHeight / 2)
		img.textAlign(CENTER, CENTER)

		if (i != 0) {
			img.noFill()
			img.stroke(hslCol)
			img.strokeWeight(3)
		} else {
			img.noStroke()
			img.fill(hslCol)
		}

		img.text(message, i * 200, i * -100)
		img.pop()
		repeats.push(img)
	}

	addEffects(
		// blur2d(1, 0, 2),
		// motionBlur(0, 0.3),
		// hsvToRgb(vec4(getComp(rgbToHsv(fColor()), 'z'), 1, 1.5, 0.75)),
		noiseDisplacement(0.8)
		// contrast(5),
		// edge(-1)
		// oldFilm()
		// vignette()
	)
}

function setRepeater(value) {
	wordRepeat = value
	setUpGraphics()
}

function setTextSize(value) {
	fontsize = value
	setUpGraphics()
}

function setTextCol(value) {
	textHue = value

	if (textHue < 180 || textHue === 0) {
		backgroundColor = textHue + 180
	} else if (textHue > 180 || textHue === 360) {
		backgroundColor = textHue - 180
	}

	setUpGraphics()
}

function setTileY(value) {
	tilesY = value
	//  Updates since tileWidth is set in draw function
}

function setTileX(value) {
	tilesX = value
	//  Updates since tileWidth is set in draw function
}

function setMessage(value) {
	message = value
	setUpGraphics()
}

function setBgColor(value) {
	if (value != backgroundColor) {
		backgroundColor = value
		setUpGraphics()
	} else {
		return
	}
}

function setTypeColor(value) {
	textColor = value
	setUpGraphics()
}

function setDropDown(track) {
	message = track.value
	setUpGraphics()
}

function setMultiplier(value) {
	multiplier = value

	return multiplier
}

function setWave(value) {
	wave = value

	return wave
}

function vwUnit() {
	let vwUnit
	vwUnit = window.innerWidth * 0.01

	return vwUnit
}

function tileWidth(tileXPos) {
	let width
	width = window.innerWidth / tileXPos

	return width
}

function tileHeight(tileYPos) {
	let height
	height = window.innerHeight / tileYPos

	return height
}

function draw() {
	//   console.log('hslCol: ' + hslCol)
	//   console.log('textHue: ' + textHue)

	vw = vwUnit()
	tileW = tileWidth(tilesX)
	tileH = tileHeight(tilesY)

	background(color(`hsl(${backgroundColor}, 100%, 20%)`))

	// Pre-calculate a value common to all tiles
	let baseTime = frameCount * wave

	//   Two dimensional grid, going left to right (y first), top to bottom (x second)
	for (let yDir = 0; yDir < tilesY; yDir++) {
		for (let xDir = 0; xDir < tilesX; xDir++) {
			//       SINE TIME
			// let distortionX =
			// 	sin(frameCount * wave + xDir * wave + yDir * wave) * multiplier
			let distortionX = sin(baseTime + xDir * wave + yDir * wave) * multiplier
			let distortionY = cos(baseTime / 2 + xDir * yDir * wave) * multiplier

			//       SOURCE
			let sx = xDir * tileW + distortionX
			let sy = yDir * tileH + distortionY
			let sw = tileW /* + distortionY */
			let sh = tileH

			//       DESTINATION
			let dx = xDir * tileW
			let dy = yDir * tileH
			let dw = tileW
			let dh = tileH

			for (let i = 0; i < repeats.length; i++) {
				image(repeats[i], dx, dy, dw, dh, sx, sy, sw, sh)
			}
		}
	}
}

function resizeEverything() {
	resizeCanvas(windowWidth, windowHeight)
	//   pg.clear()
	setUpGraphics()
}

function windowResized() {
	resizeEverything()
}

function keyPressed() {
	if (keyCode === UP_ARROW) {
		visible = !visible
		if (visible) {
			//       hide controls
			settings.hide()
		} else {
			//       show controls
			settings.show()
		}
	}
	return false
}
