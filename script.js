// Helper functions
function isOdd(t) {
    return ( (t % 2) == 1 ? t : isOdd(t-1) )
}

function roundNumber(value, precision) {
    let multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// Script

function block(x, y, s, n = false) {
    this.x = x;
    this.y = y;
    this.s = width / s;
    this.p = (this.x === 0 && this.y === 0);
    this.path = this.generatePath(n);
}

block.prototype.draw = function() {
    noStroke();
    fill('#35495D');
    rect(-(this.s * this.x), -(this.s * this.y), this.s, this.s);
    this.drawPath(-(this.s * this.x), -(this.s * this.y));
}

block.prototype.getColor = function() {
    let color = '#ecf0f1';
    if(this.p) color = '#e67e22';
    if(this.p && (
        (this.x == 0 && this.y == 0) ||
        (this.x > -1 && this.x < 1 && this.y > -1 && this.y < 1)
    )) {
        color = 'rgb(231, 76, 60)';
    }
    return color;
}

block.prototype.drawPath = function(x, y) {
    let ratio = roundNumber(this.s/3,0);
    push();
    translate(x, y);
    let color = this.getColor();
    fill(color);
    noStroke();

    let core = this.path.filter(obj => (obj == true));
    if(core.length) {
        if(this.path[0] == 1) rect(0,-ratio,ratio,ratio);
        if(this.path[1] == 1) rect(ratio,0,ratio,ratio);
        if(this.path[2] == 1) rect(0,ratio,ratio,ratio);
        if(this.path[3] == 1) rect(-ratio,0,ratio,ratio);
        rect(0,0,ratio,ratio); // center rectangle
    } else {
        ellipse(0,0,ratio,ratio); // blank spots are filled with circles
    }
    pop();
}

block.prototype.generatePath = function(n = false) {
    let path = [];
    for(let i = 0;i < 4; i++) {
        let result = Math.round(Math.random(1));
        if(n && this.x === 0 && this.y === 0) result = 1;
        else if(n && (this.x == 0 || this.y == 0)) result = 1;
        path.push(result);
    }
    return path;
}

block.prototype.align = function() {
    this.x = roundNumber(this.x, 2);
    this.y = roundNumber(this.y, 2);

    if(!this.p) {
        this.p = (this.x === 0 && this.y === 0);
        if(this.p) {
            mLength[0].innerHTML = parseInt(mLength[0].innerHTML) + 1;
        }
    }
}

block.prototype.move = function(offsetX = 0, offsetY = 0) {
    this.x = this.x + -offsetX;
    this.y = this.y + -offsetY;
}





class Environment {
    constructor() {
        this.blocks = [];
        this.lock = false; // If true disables all keyboard input

        for(let y = -Math.floor(dim/2); y <= Math.floor(dim/2);y++) {
            for(let x = -Math.floor(dim/2); x <= Math.floor(dim/2);x++) {
                this.blocks.push(new block(x, y, dim, true));
            }
        }
    }

    draw() {
        let s = -Math.floor(dim/2)-1,
            l = Math.floor(dim/2)+1;

        let blocks = this.blocks.filter(
            obj => (obj.x > s && obj.x < l && obj.y > s && obj.y < l)
        );

        for (let key in blocks) {
            blocks[key].draw();
        }
    }

    addRow(x, dirx, diry) {
        if(dirx == 0 && diry == 0) return;

        let skip;
        if(dirx != 0) skip = this.blocks.filter(obj => (obj.p == true && obj.x == x));
        else skip = this.blocks.filter(obj => (obj.p == true && obj.y == x));

        for(let y = -Math.floor(dim/2); y <= Math.floor(dim/2);y++) {
            let e = false;
            for(var key in skip) {
                if(dirx != 0 && roundNumber(skip[key].y, 0) == y) e = true;
                if(diry != 0 && roundNumber(skip[key].x, 0) == y) e = true;
            }
            if(!e) {
                let p = {};
                if(dirx != 0) {
                    p.x = x;
                    p.y = y;
                } else {
                    p.x = y;
                    p.y = x;
                }
                this.blocks.push(new block(p.x,p.y,dim));
            }
        }
    }

    removeRow(x, dirx, diry) {
        if(dirx == 0 && diry == 0) return;

        let b;
        for(var i = this.blocks.length-1; i >= 0; i--){
            if(this.blocks[i].p) continue;
            if(diry != 0) b = this.blocks[i].y;
            else b = this.blocks[i].x;
            if(Math.round(b) != x) continue;
            this.blocks.splice(i, 1);
        }
    }

    update(x,y) {
        for (let key in this.blocks) {
            this.blocks[key].move(x/frames, y/frames);
        }
        redraw();
    }

    permitted(x, y) {
        let current = this.blocks.filter(obj => (obj.x == 0 && obj.y == 0));
        let target = this.blocks.filter(obj => (obj.x == 0+x && obj.y == 0+y));

        let ci, ti;
        switch((x + ' ' + y)) {
            case '-1 0':
                ci=1,ti=3;
                break;
            case '1 0':
                ci=3,ti=1;
                break;
            case '0 1':
                ci=0,ti=2;
                break;
            case '0 -1':
                ci=2,ti=0;
                break;
        }
        return (current[0].path[ci] && target[0].path[ti]);
    }

    move(e) {
        let pos, neg, x = 0, y = 0;

        switch(e.keyCode) {
            case 37: // Left
                pos = Math.floor(dim/2)+1;
                neg = -( Math.floor(dim/2) )-1;
                x = 1; y = 0;
                break;
            case 38: // Up
                pos = Math.floor(dim/2)+1;
                neg = -(Math.floor(dim/2))-1;
                x = 0; y = 1;
                break;
            case 39: // Right
                pos = -(Math.floor(dim/2))-1;
                neg = Math.floor(dim/2)+1;
                x = -1; y = 0;
                break;
            case 40: // Down
                pos = -(Math.floor(dim/2))-1;
                neg = Math.floor(dim/2)+1;
                x = 0; y = -1;
                break;
        }

        if(x != 0 || y != 0) {
            this.lock = true;

            if(this.permitted(x, y)) {
                this.addRow(pos, x, y);
                for(let i = 0;i <= frames; i++) {
                    if(i == frames) {
                        setTimeout(function(){
                            env.removeRow(neg, x, y);
                            for (let key in env.blocks) {
                                env.blocks[key].align();
                            }
                            redraw();
                            env.lock = false;
                        }, 5*i);
                    } else {
                        setTimeout(function(){ env.update(x,y); }, 5*i);
                    }
                }
                steps[0].innerHTML = parseInt(steps[0].innerHTML) + 1;
            } else {
                this.lock = false;
            }
        }
    }
}

let env, dim,
    size = 60,
    frames = Math.floor(size/2);
    debug = document.getElementById('debug'),
    steps = debug.getElementsByClassName('steps'),
    mLength = debug.getElementsByClassName('length');

function setup() {
    let wMulti = isOdd(Math.floor(window.innerWidth / size));
    let hMulti = isOdd(Math.floor(window.innerHeight / size));
    let fMulti = (wMulti > hMulti ? hMulti : wMulti);
    createCanvas(size*fMulti, size*fMulti);
    rectMode('center');

    dim = width/size;

    env = new Environment();
}

function draw() {
    background('#35495D');
    translate(width / 2, height / 2);
    env.draw();
    noLoop();
}

function keyPressed(e) {
    if(env.lock) return false;
    env.move(e);
}
