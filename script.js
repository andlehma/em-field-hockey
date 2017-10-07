const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var iW = window.innerWidth;
var iH = window.innerHeight;
canvas.width = iW;
canvas.height = iH;
var dragIndex;
var dragging;
canvas.addEventListener("mousedown", mouseDownListener, false);
var gamestate = 0; //gamestate 0 = paused, 1 = going

addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

function mouseDownListener(evt) {
    var i;
    var highestIndex = -1;

    //getting mouse position correctly, being mindful of resizing that may have occured in the browser:
    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    if (mouseX > startButton.x && mouseX < startButton.x + startButton.w && mouseY > startButton.y && mouseY < startButton.y + startButton.h){
        gamestate = 1;
    }

    if (mouseX > stopButton.x && mouseX < stopButton.x + stopButton.w && mouseY > stopButton.y && mouseY < stopButton.y + stopButton.h){
        gamestate = 0;
    }

    if (mouseX > resetButton.x && mouseX < resetButton.x + resetButton.w && mouseY > resetButton.y && mouseY < resetButton.y + resetButton.h){
        gamestate = 0;
        init();
    }

    //find which shape was clicked
    for (i=0; i < charges.length; i++) {
        if (hitTest(charges[i], mouseX, mouseY)) {
            if (gamestate == 0){
            dragging = true;
            }
            if (i > highestIndex) {
                //We will pay attention to the point on the object where the mouse is "holding" the object:
                dragHoldX = mouseX - charges[i].x;
                dragHoldY = mouseY - charges[i].y;
                highestIndex = i;
                dragIndex = i;
            }
        }
    }

    if (dragging) {
        window.addEventListener("mousemove", mouseMoveListener, false);
    }
    canvas.removeEventListener("mousedown", mouseDownListener, false);
    window.addEventListener("mouseup", mouseUpListener, false);

    //code below prevents the mouse down from having an effect on the main browser window:
    if (evt.preventDefault) {
        evt.preventDefault();
    } //standard
    else if (evt.returnValue) {
        evt.returnValue = false;
    } //older IE
    return false;
}

function mouseUpListener(evt) {
    canvas.addEventListener("mousedown", mouseDownListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    if (dragging) {
        dragging = false;
        window.removeEventListener("mousemove", mouseMoveListener, false);
    }
}

function mouseMoveListener(evt) {
    var posX;
    var posY;
    var shapeRad = charges[dragIndex].radius;
    var minX = shapeRad;
    var maxX = canvas.width - shapeRad;
    var minY = shapeRad;
    var maxY = canvas.height - shapeRad;
    //getting mouse position correctly
    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    //clamp x and y positions to prevent object from dragging outside of canvas
    posX = mouseX - dragHoldX;
    posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
    posY = mouseY - dragHoldY;
    posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

    charges[dragIndex].x = posX;
    charges[dragIndex].y = posY;
}

function hitTest(shape,mx,my) {

    var dx;
    var dy;
    dx = mx - shape.x;
    dy = my - shape.y;

    //a "hit" will be registered if the distance away from the center is less than the radius of the circular object
    return (dx*dx + dy*dy < shape.radius*shape.radius);
}

var puck = {
    x: 100,
    y: iH/2,
    dx: 0,
    dy: 0,

    update: function(){
        if (gamestate == 1){
            puck.x += puck.dx;
            puck.y += puck.dy;
        }
        if (puck.x < 0 || puck.y < 0 || puck.x > iW || puck.y > iH){
            gamestate = 0;
            initpuck();
        }
        this.draw();
    },

    draw: function(){
        ctx.beginPath();
        ctx.arc(puck.x, puck.y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    }
}

var goal = {
    x: iW - 100,
    y: iH/2,
    w: 10,
    h: 100,

    draw: function(){
        ctx.fillStyle = "green";
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
}

var pool = {
    x:iW - 150,
    y:0,
    w:150,
    h:150,

    draw: function(){
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="#000000";
        ctx.rect(iW - 150,0,150,150);
        ctx.stroke();
    }
}

var startImg = new Image();
startImg.src = 'images/start.png';
var startButton = {
    x: 100,
    y: iH - 55,
    w: 100,
    h: 50,

    draw: function(){
        ctx.drawImage(startImg, startButton.x, startButton.y);
    }
}

var stopImg = new Image();
stopImg.src = 'images/stop.png';
var stopButton = {
    x: 205,
    y: iH - 55,
    w: 100,
    h: 50,

    draw: function(){
        ctx.drawImage(stopImg, stopButton.x, stopButton.y);
    }
}

var resetImg = new Image();
resetImg.src = 'images/reset.png';
var resetButton = {
    x: 310,
    y: iH - 55,
    w: 100,
    h: 50,

    draw: function(){
        ctx.drawImage(resetImg, resetButton.x, resetButton.y);
    }
}

var charges = [];

function charge(x, y, ch) {
    this.x = x;
    this.y = y;
    this.fakecharge = ch;

    this.radius = 5;
    if (this.fakecharge < 0){
        this.color = "#0000FF";
    }else{
        this.color = "#FF0000";
    }


    this.draw = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function(){
        if (this.x > pool.x && this.y < pool.h){
            this.charge = 0;
        }else{
            this.charge = this.fakecharge; //nanocoulombs
        }
        this.draw();
        this.a = puck.x - this.x;
        this.b = puck.y - this.y;
        this.c = Math.sqrt(this.a*this.a + this.b*this.b);
        this.xAngle = Math.asin(this.a/this.c);
        this.yAngle = Math.asin(this.b/this.c);
        if (gamestate == 1){
            puck.dx += Math.sin(this.xAngle)*((8.987*this.charge)/(this.c*this.c));
            puck.dy += Math.sin(this.yAngle)*((8.987*this.charge)/(this.c*this.c));
        }
        if (this.c <= this.radius){
            gamestate = 0;
        }
    };
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    charges.forEach(charge => {
        charge.update();
    });

    puck.update();
    goal.draw();
    pool.draw();
    startButton.draw();
    stopButton.draw();
    resetButton.draw();

    function randomInt(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    function randomFloat(min,max){
        return Math.random()*(max-min+1)+min;
    }

    if (puck.x > goal.x && puck.x < goal.x + goal.w && puck.y > goal.y && puck.y < goal.y + goal.h){
        gamestate = 0;
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText("SUCCESS", iW/2, iH/2);
    }
}

function init(){
    puck.x = 100;
    puck.y = iH/2;
    puck.dx = 0;
    puck.dy = 0;

    charges = [];
    charges.push(new charge(iW - 100, 50, 250));
    charges.push(new charge(iW - 125, 50, 250));
    charges.push(new charge(iW - 75, 50, -250));
}

function initpuck(){
    puck.x = 100;
    puck.y = iH/2;
    puck.dx = 0;
    puck.dy = 0;
}


init();
animate();
