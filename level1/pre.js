function initpuck(){
    puck.x = 100;
    puck.y = iH / 2;
    puck.dx = 0;
    puck.dy = 0;
}

var goal = {
    x: 500,
    y: 250,
    w: 50,
    h: 100,

    draw: function(){
        ctx.fillStyle = 'rgba(0, 255, 50, .5)';
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
};

function initcharges(){
    charges = [];
    charges.push(new charge(iW - 100, 50, 100));
    charges.push(new charge(iW - 125, 50, 100));
    charges.push(new charge(iW - 75, 50, -100));
    charges.push(new charge(iW - 50, 50, -100));
}
