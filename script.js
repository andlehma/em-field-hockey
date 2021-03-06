const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var iW = 600;
var iH = 600;
canvas.width = iW;
canvas.height = iH;
var dragIndex;
var dragging;
var dragHoldX;
var dragHoldY;
var mouseX;
var mouseY;
var gamestate = 0; //gamestate 0 = paused, 1 = going
var counter = 5;
var xArrowForce;
var yArrowForce;
var boolArrows = 0;
var charges = [];
var arrows = [];
var walls = []; //add walls in individual level scripts
canvas.addEventListener("mousedown", mouseDownListener, false);

//force vectors
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

//dragging code from http://rectangleworld.com/blog/archives/15
function mouseDownListener(evt) {
    var i;
    var highestIndex = -1;
    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    for (i=0; i < charges.length; i++) {
        if (hitTest(charges[i], mouseX, mouseY)) {
            if (gamestate == 0){
                dragging = true;
            }
            if (i > highestIndex) {
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

    if (evt.preventDefault) {
        evt.preventDefault();
    }
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
    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

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

//where the charges start
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
    this.tempcharge = ch;

    this.radius = 13;
    if (this.tempcharge < 0){
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
            this.charge = this.tempcharge; //nanocoulombs
        }
        this.draw();
        //force on the puck
        this.a = puck.x - this.x;
        this.b = puck.y - this.y;
        this.c = Math.sqrt(this.a*this.a + this.b*this.b);
        this.xAngle = Math.asin(this.a/this.c);
        this.yAngle = Math.asin(this.b/this.c);

        //end game if puck hits a charge
        if (this.c <= this.radius){
            gamestate = 0;
        }
    };
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    walls.forEach(wall => {
        wall.draw();
        if (puck.x > wall.x && puck.x < wall.x + wall.width && puck.y > wall.y && puck.y < wall.y + wall.height){
            gamestate = 0;
        }
    });

    var xForce = 0;
    var yForce = 0;

    charges.forEach(charge => {
        charge.update();
        xForce += Math.sin(charge.xAngle)*((8.987*charge.charge)/(charge.c*charge.c));
        yForce += Math.sin(charge.yAngle)*((8.987*charge.charge)/(charge.c*charge.c));
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
        //every 5 frames, add an arrow
        if (counter == 5){
            arrows.push(new arrow(puck.x, puck.y, puck.x + xArrowForce, puck.y + yArrowForce));
            counter = 0;
        }
        counter ++;
    }

    puck.update();
    goal.draw();
    pool.draw();

    //win condition
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

function init(){
    initpuck();
    initcharges();
}

init();
animate();

//button functions
function startButton(){
    initpuck();
    gamestate = 1;
    arrows = [];
}

function resetPuckButton(){
    gamestate = 0;
    initpuck();
}

function resetAllButton(){
    gamestate = 0;
    arrows = [];
    init();
}

function vectorsButton(){
    if (boolArrows == 1){
        boolArrows = 0;
    }else{
        boolArrows = 1;
    }
}
$(document).ready(function(){
    $('#start-button').click(function(){
        startButton();
    });
    $('#reset-puck-button').click(function(){
        resetPuckButton();
    });
    $('#reset-all-button').click(function(){
        resetAllButton();
    });
    $('#vectors-button').click(function(){
        vectorsButton();
    });
});
