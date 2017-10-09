const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var iW = window.innerWidth;
var iH = window.innerHeight;
canvas.width = iW;
canvas.height = iH;
var dragIndex;
var dragging;
var dragHoldX;
var dragHoldY;
canvas.addEventListener("mousedown", mouseDownListener, false);
var gamestate = 0; //gamestate 0 = paused, 1 = going
var counter = 5;
var xArrowForce;
var yArrowForce;
var arrows = [];
var boolArrows = 0;
var walls = [];
var mouseX;
var mouseY;
var charges = [];

function arrow(fromx, fromy, tox, toy){
    this.angle = Math.atan2(toy-fromy,tox-fromx);
    this.per = Math.atan2(-1 * (tox-fromx), toy - fromy);
    this.arrowx = tox - (10 * Math.cos(this.angle));
    this.arrowy = toy - (10 * Math.sin(this.angle));
    this.draw = function(){
        ctx.strokeStyle = "#000000";
        if (Math.sqrt((fromx - tox) * (fromx - tox) + (fromy - toy) * (fromy - toy)) > 10){
            ctx.fillStyle = "#000000";
            ctx.fillRect(fromx - 2, fromy - 2, 4, 4);
        }
        ctx.lineWidth="1";
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.arrowx, this.arrowy);
        ctx.lineTo(this.arrowx + (5 * Math.cos(this.per)), this.arrowy + (5 * Math.sin(this.per)));
        ctx.lineTo(tox, toy);
        ctx.moveTo(this.arrowx, this.arrowy);
        ctx.lineTo(this.arrowx - (5 * Math.cos(this.per)), this.arrowy - (5 * Math.sin(this.per)));
        ctx.lineTo(tox, toy);
        ctx.fillStyle = "#000000";
        ctx.stroke();
        ctx.fill();
    };
}

addEventListener('resize', () => {
    canvas.width = iW;
    canvas.height = iH;
});

function mouseDownListener(evt) {
    var i;
    var highestIndex = -1;

    //getting mouse position correctly, being mindful of resizing that may have occured in the browser:
    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    if (mouseX > startButton.x && mouseX < startButton.x + startButton.w && mouseY > startButton.y && mouseY < startButton.y + startButton.h){
        initpuck();
        gamestate = 1;
        arrows = [];
    }

    if (mouseX > stopButton.x && mouseX < stopButton.x + stopButton.w && mouseY > stopButton.y && mouseY < stopButton.y + stopButton.h){
        gamestate = 0;
        initpuck();
    }

    if (mouseX > resetButton.x && mouseX < resetButton.x + resetButton.w && mouseY > resetButton.y && mouseY < resetButton.y + resetButton.h){
        gamestate = 0;
        arrows = [];
        init();
    }

    if (mouseX > arrowsButton.x && mouseX < arrowsButton.x + arrowsButton.w && mouseY > arrowsButton.y && mouseY < arrowsButton.y + arrowsButton.h){
        if (boolArrows == 1){
            boolArrows = 0;
        }else{
            boolArrows = 1;
        }
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
        ctx.arc(puck.x, puck.y, 13, 0, Math.PI * 2, false);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    }
};

var goal = {
    x: iW - 100,
    y: (iH/2) - (10/2),
    w: 50,
    h: 100,

    draw: function(){
        ctx.fillStyle = 'rgba(0, 255, 50, .5)';
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
};

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
};

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
};

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
};

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
};

var arrowsDarkImg = new Image();
arrowsDarkImg.src = 'images/arrows-dark.png';
var arrowsLightImg = new Image();
arrowsLightImg.src = 'images/arrows-light.png';
var arrowsButton = {
    x: 415,
    y: iH - 55,
    w: 100,
    h: 50,

    draw: function(){
        if (boolArrows == 1){
            ctx.drawImage(arrowsDarkImg, arrowsButton.x, arrowsButton.y);
        }else{
            ctx.drawImage(arrowsLightImg, arrowsButton.x, arrowsButton.y);
        }
    }
};

function wall(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.draw = function(){
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}


function charge(x, y, ch) {
    this.x = x;
    this.y = y;
    this.fakecharge = ch;

    this.radius = 13;
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

        if (this.c <= this.radius){
            gamestate = 0;
        }
    };
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var xForce = 0;
    var yForce = 0;

    charges.forEach(charge => {
        charge.update();
        xForce += Math.sin(charge.xAngle)*((8.987*charge.charge)/(charge.c*charge.c));
        yForce += Math.sin(charge.yAngle)*((8.987*charge.charge)/(charge.c*charge.c));
    });

    walls.forEach(wall => {
        wall.draw();
        if (puck.x > wall.x && puck.x < wall.x + wall.width && puck.y > wall.y && puck.y < wall.y + wall.height){
            gamestate = 0;
        }
    });

    if (boolArrows == 1){
        arrows.forEach(arrow => {
            arrow.draw();
        });
    }

    xArrowForce = 300 * xForce;
    yArrowForce = 300 * yForce;

    if (gamestate == 1){
        puck.dx += xForce;
        puck.dy += yForce;
        if (counter == 5){
            arrows.push(new arrow(puck.x, puck.y, puck.x + xArrowForce, puck.y + yArrowForce));
            counter = 0;
        }
        counter ++;
    }

    puck.update();
    goal.draw();
    pool.draw();
    startButton.draw();
    stopButton.draw();
    resetButton.draw();
    arrowsButton.draw();

    if (puck.x > goal.x && puck.x < goal.x + goal.w && puck.y > goal.y && puck.y < goal.y + goal.h){
        gamestate = 0;
        ctx.textAlign="center";
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.lineWidth = "10";
        ctx.font = "bold 90px Arial";
        ctx.strokeText("SUCCESS", iW/2, iH/2);
        ctx.fillText("SUCCESS", iW/2, iH/2);
    }
}

function initpuck(){
    puck.x = 100;
    puck.y = iH/2;
    puck.dx = 0;
    puck.dy = 0;
}

function initcharges(){
    charges = [];
    charges.push(new charge(iW - 100, 50, 250));
    charges.push(new charge(iW - 125, 50, 250));
    charges.push(new charge(iW - 75, 50, -250));
    charges.push(new charge(iW - 50, 50, -250));
}

function init(){
    initpuck();
    initcharges();
}

init();
animate();
