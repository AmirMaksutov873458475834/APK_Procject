import Bullet from './Bullet.js';

export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 300;
        this.jumpForce = 600; 
        this.vx = 0;
        this.vy = 0;
        this.hp = 100;
        this.alive = true;
        this.onGround = false;
    }

    update(dt, keys, mapWidth, mapHeight, gravity, platforms) {
        if (!this.alive) return;

        this.vx = 0;
        if (keys["KeyA"]) this.vx = -this.speed;
        if (keys["KeyD"]) this.vx = this.speed;

        this.vy += gravity * dt;

        if (keys["Space"] && this.onGround) {
            this.vy = -this.jumpForce;
            this.onGround = false;
        }

        this.x += this.vx * dt;
        this.checkPlatformCollisionX(platforms);

        this.y += this.vy * dt;
        this.onGround = false; 
        this.checkPlatformCollisionY(platforms);

        if (this.x - this.size < 0) this.x = this.size;
        if (this.x + this.size > mapWidth) this.x = mapWidth - this.size;
        
        if (this.y + this.size > mapHeight) {
            this.y = mapHeight - this.size;
            this.vy = 0;
            this.onGround = true;
        }
        if (this.y - this.size < 0) {
            this.y = this.size;
            this.vy = 0;
        }

        if (this.hp <= 0) this.alive = false;
    }

    checkPlatformCollisionX(platforms) {
        for (const p of platforms) {
            if (this.x + this.size > p.x && this.x - this.size < p.x + p.w &&
                this.y + this.size > p.y && this.y - this.size < p.y + p.h) {
                if (this.vx > 0) this.x = p.x - this.size;
                if (this.vx < 0) this.x = p.x + p.w + this.size;
            }
        }
    }

    checkPlatformCollisionY(platforms) {
        for (const p of platforms) {
            if (this.x + this.size > p.x && this.x - this.size < p.x + p.w &&
                this.y + this.size > p.y && this.y - this.size < p.y + p.h) {
                if (this.vy > 0) {
                    this.y = p.y - this.size;
                    this.vy = 0;
                    this.onGround = true;
                }
                else if (this.vy < 0) {
                    this.y = p.y + p.h + this.size;
                    this.vy = 0;
                }
            }
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (!this.alive) return;
        ctx.fillStyle = "deepskyblue";
        ctx.beginPath();
        ctx.arc(this.x - cameraX, this.y - cameraY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    shoot(mouseX, mouseY, cameraX, cameraY) {
        const targetX = mouseX + cameraX;
        const targetY = mouseY + cameraY;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const len = Math.hypot(dx, dy) || 1;

        return new Bullet(this.x, this.y, (dx / len) * 600, (dy / len) * 600, 5, "yellow");
    }
}