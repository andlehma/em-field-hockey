//walls = [];
walls.push(new wall(iW/2, iH/2 - 100, 10, 200));

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

animate();
