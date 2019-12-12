window.onload = function() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var delay = 100;
    var blockSize = 30;
    var widthInBlocks = 30;
    var heightInBlocks = 20;
    var canvasWidth = widthInBlocks * blockSize;
    var canvasHeight = heightInBlocks * blockSize;
    var timeout;
    var score;
    var snake;
    var apple;

    class Apple {
        constructor(position) {
            this.position = position;
            this.draw = function() {
                context.save();
                context.fillStyle = "#33cc33";
                context.beginPath();
                var radius = blockSize / 2;
                var x = this.position[0] * blockSize + radius;
                var y = this.position[1] * blockSize + radius;
                context.arc(x, y, radius, 0, Math.PI*2, true);
                context.fill();
                context.restore();
            }
            this.setNewPosition = function() {
                var newX = Math.round(Math.random() * (widthInBlocks - 1));
                var newY = Math.round(Math.random() * (heightInBlocks - 1));
                this.position = [newX, newY];
            }
            this.isOnSnake = function(snakeToCheck) {
                var isOnSnake = false;
                for(var i = 0; i < snakeToCheck.body.length-1; i++) {
                    if(this.position[0] == snakeToCheck.body[i][0] && this.position[1] == snakeToCheck.body[i][1]) {
                        isOnSnake = true;
                    }
                }
                return isOnSnake;
            }
        }
    }

    class Snake {
        constructor(body, direction) {
            this.body = body;
            this.direction = direction;
            this.ateApple = false;
            this.draw = function () {
                context.save();
                context.fillStyle = "#ff0000";
                for (var i = 0; i < this.body.length; i++) {
                    drawBlock(context, this.body[i]);
                }
                context.restore();
            }
            this.forward = function() {
                var nextPosition = this.body[0].slice();
                switch(this.direction) {
                    case "right": 
                        nextPosition[0]++;
                        break;
                    case "down":
                        nextPosition[1]++;
                        break;
                    case "left": 
                        nextPosition[0]--;
                        break;
                    case "up":
                        nextPosition[1]--;
                        break;
                    default: 
                        throw("Invalid direction");
                }
                this.body.unshift(nextPosition);
                if(!this.ateApple) {
                    this.body.pop();
                } else {
                    this.ateApple = false;
                }
            }
            this.setDirection = function(newDirection) {
                var allowedDirections;
                switch(this.direction) {
                    case "left":
                    case "right":
                        allowedDirections = ["up", "down"];
                        break;
                    case "down":
                    case "up":
                        allowedDirections = ["left", "right"];
                        break;
                    default: 
                        throw("Invalid direction");
                }
                if(allowedDirections.indexOf(newDirection) > -1) {
                    this.direction = newDirection;
                }
            }
            this.checkCollision = function() {
                var wallCollision = false;
                var bodyCollision = false;

                var head = this.body[0];
                var rest = this.body.slice(1);

                var headX = head[0];
                var headY = head[1];

                var minX = 0;
                var minY = 0;

                var maxX = widthInBlocks - 1;
                var maxY = heightInBlocks - 1;

                var isNotBetweenHorizontalWalls = ((headX < minX) || (headX > maxX));
                var isNotBetweenVerticalWalls = ((headY < minY) || (headY > maxY));

                if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                    wallCollision = true;
                }

                for(var i = 0; i < rest.length ; i++) {
                    if((headX === rest[i][0]) && (headY === rest[i][1])) {
                        bodyCollision = true;
                    }
                }

                return wallCollision || bodyCollision;
            }
            this.isEatingApple = function(appleToEat) {
                var head = this.body[0];
                if((head[0] === appleToEat.position[0]) && (head[1] === appleToEat.position[1])) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch(key) {
            case 37: 
                newDirection = "left";
                break;
            case 38: 
                newDirection = "up";
                break;
            case 39: 
                newDirection = "right";
                break;
            case 40: 
                newDirection = "down";
                break;
            case 32: 
                restart();
                return;
            default: 
                return;
        }
        snake.setDirection(newDirection);
    }

    init();

    function init() {
        score = 0;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#dddddd";
        document.body.appendChild(canvas);
        snake = new Snake([[3,4],[2,4],[1,4]], "right");
        apple = new Apple([10,10]);
        refreshCanvas();
    }

    function refreshCanvas() {
        snake.forward();
        if(snake.checkCollision()) {
            gameOver();
        } else {
            if(snake.isEatingApple(apple)) {
                score++;
                snake.ateApple = true;
                do {
                    apple.setNewPosition();
                } while(apple.isOnSnake(snake));
            }
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snake.draw();
            apple.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    function gameOver() {
        context.save();
        context.font = "bold 80px sans-serif";
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.strokeStyle = "white";
        context.textBaseline = "middle";
        context.lineWidth = 4;
        var middleX = canvasWidth / 2;
        var middleY = canvasHeight / 2;
        context.fillText("Game Over", middleX, middleY - 180);
        context.strokeText("Game Over", middleX, middleY - 180);
        context.font = "bold 40px sans-serif";
        context.lineWidth = 2;
        context.fillText("Play Space to try again.", middleX, middleY - 120);
        context.strokeText("Play Space to try again.", middleX, middleY - 120);
        context.restore();
    }

    function drawScore() {
        context.save();
        context.font = "bold 200px sans-serif";
        context.fillStyle = "gray";
        context.textAlign = "center";
        context.textBaseline = "middle";
        var middleX = canvasWidth / 2;
        var middleY = canvasHeight / 2;
        context.fillText(score.toString(), middleX, middleY);
        context.restore();
    }

    function restart() {
        score = 0;
        clearTimeout(timeout);
        snake = new Snake([[3,4],[2,4],[1,4]], "right");
        apple = new Apple([10,10]);
        refreshCanvas();
    }
}