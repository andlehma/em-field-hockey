function initpuck(){
    puck.x = 100;
    puck.y = 100;
    puck.dx = 0;
    puck.dy = 0;
}

var goal = {
    x: 500,
    y: 400,
    w: 50,
    h: 100,

    draw: function(){
        ctx.fillStyle = 'rgba(0, 255, 50, .5)';
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    }
};
