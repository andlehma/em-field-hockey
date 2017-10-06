const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var iW = window.innerWidth;
var iH = window.innerHeight;
canvas.width = iW;
canvas.height = iH;
var dragIndex;
var dragging;
canvas.addEventListener("mousedown", mouseDownListener, false);
//gamestate 0 = paused, 1 = going
var gamestate = 0;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

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

    if (mouseX > 100 && mouseX < 200 && mouseY > iH - 55){
        gamestate = 1;
    }

    if (mouseX > 210 && mouseX < 310 && mouseY > iH - 55){
        gamestate = 0;
    }

    if (mouseX > 320 && mouseX < 430 && mouseY > iH - 55){
        gamestate = 0;
        init();
    }

    //find which shape was clicked
    for (i=0; i < charges.length; i++) {
        if	(hitTest(charges[i], mouseX, mouseY)) {
            dragging = true;
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
    dy: 0
}

function drawpuck(){
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
}

function updatepuck(dx, dy){
    if (gamestate == 1){
        puck.x += puck.dx;
        puck.y += puck.dy;
    }
    drawpuck();
    if (puck.x < 0 || puck.y < 0 || puck.x > iW || puck.y > iH){
        gamestate = 0;
        initpuck();
    }
}

var goal = {
    x: iW - 100,
    y: iH/2
}

function drawgoal(){
    ctx.fillStyle = "green";
    ctx.fillRect(goal.x, goal.y, 10, 50);
}



function charge(x, y, ch) {
    this.x = x;
    this.y = y;
    this.fakecharge = ch;
    if (this.x > iW - 150 && this.y < 150){
        this.charge = 0;
    }else{
        this.charge = this.fakecharge; //nanocoulombs
    }
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
        this.draw();
        this.a = puck.x - this.x;
        this.b = puck.y - this.y;
        this.c = Math.sqrt(this.a*this.a + this.b*this.b);
        this.xAngle = Math.asin(this.a/this.c);
        this.yAngle = Math.asin(this.b/this.c);
        if (gamestate == 1){
            puck.dx += Math.sin(this.xAngle)*((8.987*ch)/(this.c*this.c));
            puck.dy += Math.sin(this.yAngle)*((8.987*ch)/(this.c*this.c));
        }
    };
}

var charges = [];

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    charges.forEach(charge => {
        charge.update();
    });

    updatepuck();
    drawgoal();

    function randomInt(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    function randomFloat(min,max){
        return Math.random()*(max-min+1)+min;
    }

    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="#000000";
    ctx.rect(iW - 150,0,150,150);
    ctx.stroke();

    ctx.fillStyle = "blue";
    ctx.fillRect(100, iH - 55, 100, 50);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Begin",110,iH - 25);

    ctx.fillStyle = "red";
    ctx.fillRect(205, iH - 55, 100, 50);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Stop",220,iH - 25);

    ctx.fillStyle = "black";
    ctx.fillRect(310, iH - 55, 100, 50);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Reset",320,iH - 25);

    if (puck.x > goal.x && puck.x < goal.x + 10 && puck.y > goal.y && puck.y < goal.y + 50){
        gamestate = 0;
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText("SUCCESS", iW/2, iH/2);
        console.log('success');
    }
}

function init(){
    puck.x = 100;
    puck.y = iH/2;
    puck.dx = 0;
    puck.dy = 0;

    charges = [];
    charges.push(new charge(iW - 100, 50, 50));
    charges.push(new charge(iW - 125, 50, 50));
    charges.push(new charge(iW - 75, 50, -50));
}

function initpuck(){
    puck.x = 100;
    puck.y = iH/2;
    puck.dx = 0;
    puck.dy = 0;
}


init();
animate();
