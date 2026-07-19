export default class Bullet {
    constructor(x, y, vx, vy, radius, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.r = radius;
        this.color = color;
        this.bounces = 0; 
        this.maxBounces = 2; 
        this.bounceEfficiency = 0.9; 
    }

    update(dt, mapWidth, mapHeight) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x - this.r < 0) { this.x = this.r; this.vx = -this.vx * this.bounceEfficiency; this.bounces++; }
        else if (this.x + this.r > mapWidth) { this.x = mapWidth - this.r; this.vx = -this.vx * this.bounceEfficiency; this.bounces++; }

        if (this.y - this.r < 0) { this.y = this.r; this.vy = -this.vy * this.bounceEfficiency; this.bounces++; }
        else if (this.y + this.r > mapHeight) { this.y = mapHeight - this.r; this.vy = -this.vy * this.bounceEfficiency; this.bounces++; }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - cameraX, this.y - cameraY, this.r, 0, Math.PI * 2);
        ctx.fill();
    }

    shouldDestroy() {
        return this.bounces > this.maxBounces;
    }
}