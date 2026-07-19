import Bullet from './Bullet.js';

export default class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 120;
        this.h = 80;
        this.hp = 500;
        this.alive = true;
        this.speed = 120;
        this.shootCooldown = 0.4;
        this.shootTimer = 0;
    }

    update(dt, playerX, playerY, mapWidth, mapHeight) {
        if (!this.alive) return null;

        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 1) {
            this.x += (dx / distance) * this.speed * dt;
            this.y += (dy / distance) * this.speed * dt;
        }

        if (this.x - this.w / 2 < 0) this.x = this.w / 2;
        if (this.x + this.w / 2 > mapWidth) this.x = mapWidth - this.w / 2;
        if (this.y - this.h / 2 < 0) this.y = this.h / 2;
        if (this.y + this.h / 2 > mapHeight) this.y = mapHeight - this.h / 2;

        this.shootTimer += dt;
        if (this.shootTimer >= this.shootCooldown) {
            this.shootTimer = 0;
            return this.shoot(playerX, playerY);
        }

        return null;
    }

    draw(ctx, cameraX, cameraY) {
        if (!this.alive) return;
        ctx.fillStyle = "crimson";
        ctx.fillRect(this.x - this.w / 2 - cameraX, this.y - this.h / 2 - cameraY, this.w, this.h);
    }

    shoot(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const length = Math.hypot(dx, dy) || 1;

        return new Bullet(this.x, this.y, (dx / length) * 500, (dy / length) * 500, 15, "orange");
    }

    checkHit(bullet) {
        return bullet.x > this.x - this.w / 2 &&
               bullet.x < this.x + this.w / 2 &&
               bullet.y > this.y - this.h / 2 &&
               bullet.y < this.y + this.h / 2;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) this.alive = false;
    }
}