//TODO:set grid-cell cellSize
//set speed
//set dimensions of the board
//stop snake from going reverse taking two directions before turning(solved by keyBuffer)
//write collision logic
//write food logic
//add images and sound //snake oroboros
//food should not generate on the snake or on the wall
//snake speed should increase after eating fruit
//TODO: make snake head such that it faces in the moving direction
const foodImg = new Image()
const wallImg = new Image()
const snakeHeadUpImg = new Image()
const snakeHeadDownImg = new Image()
const snakeHeadRightImg = new Image()
const snakeHeadLeftImg = new Image()
foodImg.src = "img/food.png"
wallImg.src = "img/brick.jpg"
snakeHeadUpImg.src = "img/snake_head_up.png"
snakeHeadDownImg.src = "img/snake_head_down.png"
snakeHeadRightImg.src = "img/snake_head_right.png"
snakeHeadLeftImg.src = "img/snake_head_left.png"

let dead = new Audio()
let eat = new Audio()
let up = new Audio()
let right = new Audio()
let left = new Audio()
let down = new Audio()

dead.src = "audio/dead.mp3"
eat.src = "audio/eat.mp3"
up.src = "audio/up.mp3"
right.src = "audio/right.mp3"
left.src = "audio/left.mp3"
down.src = "audio/down.mp3"

class Wall {
  constructor(ctx, boardWidth, boardHeight, cellSize) {
    this.ctx = ctx,
      this.boardWidth = boardWidth,
      this.boardHeight = boardHeight,
      this.cellSize = cellSize
    this.wall = []
    //build wall around edges
    for (let i = 0; i <= boardWidth; i++) {
      this.wall.push({ cellX: i, cellY: 0 })
    }
    for (let i = 0; i <= boardWidth; i++) {
      this.wall.push({ cellX: i, cellY: boardHeight - 1 })
    }
    for (let i = 0; i <= boardHeight; i++) {
      this.wall.push({ cellX: 0, cellY: i })
    }
    for (let i = 0; i <= boardHeight; i++) {
      this.wall.push({ cellX: boardWidth - 1, cellY: i })
    }
  }

  paintWall() {
    this.wall.forEach((brick) => {
      //console.log(egg)
      // this.ctx.fillStyle = "#f78102"
      // this.ctx.fillRect(brick.cellX * this.cellSize + margin, brick.cellY * this.cellSize + margin, this.cellSize - 2 * margin, this.cellSize - 2 * margin)
      this.ctx.drawImage(wallImg, brick.cellX * this.cellSize, brick.cellY * this.cellSize, this.cellSize, this.cellSize);
    })
  }
}
class Fruit {
  constructor(ctx, boardWidth, boardHeight, cellSize) {
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
    this.cellSize = cellSize
    this.ctx = ctx
    this.first = 1
  }

  generateFruitLocation(snake, wall) {
    this.cellX = Math.round(Math.random() * (this.boardWidth * this.cellSize - this.cellSize) / this.cellSize)
    this.cellY = Math.round(Math.random() * (this.boardHeight * this.cellSize - this.cellSize) / this.cellSize)
    snake.snake.forEach((egg) => {
      if (egg.cellX === this.cellX && egg.cellY === this.cellY) {
        this.generateFruitLocation(snake, wall)
      }
    })

    wall.wall.forEach((brick) => {
      if (brick.cellX === this.cellX && brick.cellY === this.cellY) {
        this.generateFruitLocation(snake, wall)
      }
    })
  }

  paintFruit() {
    this.ctx.fillStyle = "red"
    //this.ctx.fillRect(this.cellX * this.cellSize, this.cellY * this.cellSize, this.cellSize, this.cellSize)
    this.ctx.drawImage(foodImg, this.cellX * this.cellSize, this.cellY * this.cellSize, this.cellSize, this.cellSize)
  }
}

class Snake {
  constructor(ctx, cellSize, startCellX = 0, startCellY = 0, snakeInitialSize, hub) {
    this.direction = "right"
    this.cellSize = cellSize
    this.ctx = ctx
    this.snakeInitialSize = snakeInitialSize
    this.snake = []
    this.keyBuffer = []
    this.headCellX = startCellX
    this.headCellY = startCellY
    for (let i = 0; i < snakeInitialSize; i++) {
      this.snake.push({ cellX: this.headCellX - i, cellY: this.headCellY })
    }
    this.begin = 0
    this.hub = hub
  }

  setDirection(direction) {
    this.direction = direction
  }

  keyBufferHandler(e) {
    //change controls here
    console.log(e)
    let keyCode = e.keyCode
    if (keyCode >= 37 && keyCode <= 40 && keyCode !== this.keyBuffer[this.keyBuffer.length - 1]) {
      this.begin = 1
      this.keyBuffer.push(keyCode);
      //this.keybuffer = this.keyBuffer.concat(keyCode)
      console.log(this.keyBuffer)
    }
    if (keyCode) e.preventDefault();
  }

  updateSnake(fruit, wall) {

    if (this.begin != 0) {
      //set direction
      var key = this.keyBuffer.shift();
      if (this.direction != 'right' && key === 37) {
        this.setDirection('left')
        left.play()
      } else if (this.direction != 'left' && key === 39) {
        this.setDirection('right')
        right.play()
      } else if (this.direction != 'down' && key === 38) {
        this.setDirection('up')
        up.play()
      } else if (this.direction != 'up' && key === 40) {
        this.setDirection('down')
        down.play()
      }

      if (this.direction == "right") {
        this.snake.unshift({ cellX: this.headCellX + 1, cellY: this.headCellY })
      }
      else if (this.direction == "left") {
        this.snake.unshift({ cellX: this.headCellX - 1, cellY: this.headCellY })
      }
      else if (this.direction == "up") {
        this.snake.unshift({ cellX: this.headCellX, cellY: this.headCellY - 1 })
      }
      else if (this.direction == "down") {
        this.snake.unshift({ cellX: this.headCellX, cellY: this.headCellY + 1 })
      }
      //when snake eats food
      if (fruit.cellX == this.snake[0].cellX && fruit.cellY == this.snake[0].cellY) {
        fruit.generateFruitLocation(this, wall)
        eat.play()
      }
      else {
        this.snake.pop() //pops tail if fruit not eaten
      }
      this.headCellX = this.snake[0].cellX
      this.headCellY = this.snake[0].cellY
      //colliding with snake itself
      for (let [index, egg] of this.snake.entries()) {
        if (index != 0 && egg.cellX === this.headCellX && egg.cellY === this.headCellY) {
          dead.play()
          this.hub.pub("snake:dead", {})
        }
        //colliding with wall
        wall.wall.forEach((brick) => {
          if (this.headCellX === brick.cellX && this.headCellY === brick.cellY) {
            dead.play()
            this.hub.pub("snake:dead", {})
          }
        })
      }
    }
  }

  paintSnake(margin) {
    this.snake.forEach((egg) => {
      //console.log(egg)
      const isSnakeHead = egg.cellX === this.headCellX && egg.cellY === this.headCellY
      if (!isSnakeHead) {
        this.ctx.fillStyle = "#88fc03"
        this.ctx.fillRect(egg.cellX * this.cellSize + margin,
          egg.cellY * this.cellSize + margin,
          this.cellSize - 2 * margin,
          this.cellSize - 2 * margin)
      }
    })
    //snake head
    // this.ctx.beginPath()
    // this.ctx.lineWidth = 4
    // this.ctx.strokeStyle = "red"
    // this.ctx.rect(this.headCellX * this.cellSize + margin, this.headCellY * this.cellSize + margin, this.cellSize - 2 * margin, this.cellSize - 2 * margin)
    // this.ctx.stroke()
    let head =
    {
      X: this.headCellX * this.cellSize,
      Y: this.headCellY * this.cellSize,
      width : this.cellSize,
      height : this.cellSize 
    }

    const args = [head.X,
      head.Y,
      head.height,
      head.width]

    if (this.direction === "up") {
      this.ctx.drawImage(
        snakeHeadUpImg,
        ...args)
    }
    else if (this.direction === "down") {
      this.ctx.drawImage(
        snakeHeadDownImg,
        ...args)
    }
    else if (this.direction === "right") {
      this.ctx.drawImage(
        snakeHeadRightImg,
        ...args)
    }
    else if (this.direction === "left") {
      this.ctx.drawImage(
        snakeHeadLeftImg,
        ...args)
    }
  }
}

function paintCanvas(ctx, originX, originY, width, height) {
  ctx.fillStyle = "black"
  ctx.fillRect(originX, originY, width, height)
}

function drawGrid(ctx, originX, originY, boardWidth, boardHeight, cellSize) {
  let x = originX
  let y = originY
  let borderWidth = 1
  for (let i = 1; i < boardWidth; i++) {
    x += cellSize
    ctx.fillStyle = "green"
    ctx.fillRect(x - borderWidth / 2, cellSize, borderWidth, (boardHeight - 2) * cellSize)
  }

  for (let i = 1; i < boardHeight; i++) {
    y += cellSize
    ctx.fillStyle = "green"
    ctx.fillRect(cellSize, y - borderWidth / 2, (boardWidth - 2) * cellSize, borderWidth)
  }
}

function draw(snake, fruit, wall, ctx, originX, originY, boardWidth, boardHeight, cellSize) {
  console.log("tick")
  snake.updateSnake(fruit, wall)
  if (fruit.first == 1) {
    fruit.generateFruitLocation(snake, wall)
    fruit.first = 0
  }

  paintCanvas(ctx, originX, originY, boardWidth * cellSize, boardHeight * cellSize)
  wall.paintWall(3)
  drawGrid(ctx, originX, originY, boardWidth, boardHeight, cellSize)
  snake.paintSnake(3)
  fruit.paintFruit()
}

const main = () => {
  var cellSize = 20,
    originX = 0,
    originY = 0,
    startCellX = 3,
    startCellY = 2,
    loopTime = 1000, //
    snakeInitialSize = 3
  var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    boardWidth = 20,
    boardHeight = 20;

  canvas.height = boardHeight * cellSize
  canvas.width = boardWidth * cellSize

  const hub = PubSub()

  let wall = new Wall(ctx, boardWidth, boardHeight, cellSize)
  let snake = new Snake(ctx, cellSize, startCellX, startCellY, snakeInitialSize, hub)
  let fruit = new Fruit(ctx, boardWidth, boardHeight, cellSize)
  document.onkeydown = snake.keyBufferHandler.bind(snake)

  const game_loop = setInterval(() => draw(snake, fruit, wall, ctx, originX, originY, boardWidth, boardHeight, cellSize), loopTime)



  const gameOver = (loop) => {
    clearInterval(loop)
  }

  hub.sub("snake:dead", () => {
    gameOver(game_loop)
  })
  // initialize the timer variables and start the animation
  // const start = () => {
  //   ctx.save()
  //   draw(snake, fruit, ctx, originX, originY, boardWidth, boardHeight, cellSize)
  //   ctx.restore()
  //   window.requestAnimationFrame(start)
  // } 
  // start()
}


const PubSub = () => {
  const map = {}
  return {
    sub: (eventName, cb) => {
      map[eventName] = Reflect.has(map, eventName)
        ? map[eventName].concat([cb])
        : [cb]
      console.log(map)
    },

    pub: (eventName, data) => {
      if (!Reflect.has(map, eventName)) {
        return 0
      }

      map[eventName].forEach((cb) => {
        cb.call(null, data)
      })
      console.log(map)
      return map[eventName].length
    }
  }
}


