let font

let tilesX = 4
let tilesY = 4
let tileW
let tileH

let vw = window.innerWidth * 0.01

QuickSettings.useExtStyleSheet()
var settings = QuickSettings.create(20, 20, 'Controls')
  .addRange('Text Size', 10, 45, 30, 1, setTextSize)
  .addRange('Color', 0, 360, 80, 20, setTextCol)
  .addRange('Repeats', 1, 9, 3, 1, setRepeater)
  .addDropDown(
    'Track',
    ['BASS', 'SNARE', 'KICK', 'PERC', 'ARPEG', 'LEAD', 'CHORD'],
    setDropDown
  )
  .addRange('Num Columns', 2, 80, 4, 2, setTileX)
  .addRange('Num Rows', 2, 80, 4, 2, setTileY)
  .addRange('Amplitude', 50, 500, 100, 10, setMultiplier)
  .addRange('Tempo', 0.025, 0.55, 0.125, 0.025, setWave)

// Quick Settings variables
let message = 'BASS' //Initial
let multiplier = 100
let wave = 0.125
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

    img.text(message, i * 100, i * -100)
    img.pop()
    repeats.push(img)
  }
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
  backgroundColor = value
  setUpGraphics()
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
  //   Two dimensional grid, going left to right (y first), top to bottom (x second)
  for (let yDir = 0; yDir < tilesY; yDir++) {
    for (let xDir = 0; xDir < tilesX; xDir++) {
      //       SINE TIME
      let distortionX =
        tan(frameCount * wave + xDir * wave + yDir * wave) * multiplier
      let distortionY =
        tan(frameCount * (wave / 2) + xDir * yDir * wave) * multiplier

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
