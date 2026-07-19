import Player from './Player.js';
import Boss from './Boss.js';
import { LEVEL_MAP, TILE_SIZE } from './config.js'; // Импортируем карту

export default class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        
        // Видимый размер экрана (окно просмотра)
        this.screenWidth = this.canvas.width;
        this.screenHeight = this.canvas.height;

        // Автоматически вычисляем размеры мира на основе массива из config.js
        this.mapHeight = LEVEL_MAP.length * TILE_SIZE;
        this.mapWidth = LEVEL_MAP[0].length * TILE_SIZE;

        // Физические константы
        this.gravity = 1500; 

        // Камера
        this.camera = { x: 0, y: 0 };

        this.player = new Player(100, this.mapHeight - 100);
        this.boss = new Boss(this.mapWidth / 2, 200);

        // Список платформ теперь генерируется автоматически из файла конфигурации
        this.platforms = [];
        this.parseLevelMap(); 

        this.playerBullets = [];
        this.bossBullets = [];
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.lastTime = 0; // Инициализируем нулем

        this.initInput();
    }

    parseLevelMap() {
        for (let row = 0; row < LEVEL_MAP.length; row++) {
            let currentPlatform = null;

            for (let col = 0; col < LEVEL_MAP[row].length; col++) {
                const char = LEVEL_MAP[row][col];

                if (char === '#') {
                    if (!currentPlatform) {
                        currentPlatform = {
                            x: col * TILE_SIZE,
                            y: row * TILE_SIZE,
                            w: TILE_SIZE,
                            h: TILE_SIZE
                        };
                    } else {
                        currentPlatform.w += TILE_SIZE;
                    }
                } else {
                    if (currentPlatform) {
                        this.platforms.push(currentPlatform);
                        currentPlatform = null;
                    }
                }
            }
            if (currentPlatform) {
                this.platforms.push(currentPlatform);
            }
        }
    }

    initInput() {
        window.addEventListener("keydown", e => this.keys[e.code] = true);
        window.addEventListener("keyup", e => this.keys[e.code] = false);

        this.canvas.addEventListener("mousemove", e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener("mousedown", () => {
            if (this.player.alive) {
                // Передаем камеру, чтобы пуля летела точно туда, куда целится мышь на экране
                const bullet = this.player.shoot(this.mouse.x, this.mouse.y, this.camera.x, this.camera.y);
                this.playerBullets.push(bullet);
            }
        });
    }

    update(dt) {
        // Ограничиваем максимальный шаг времени, чтобы при лагах объекты не пролетали сквозь стены
        if (dt > 0.1) dt = 0.1;

        // Обновляем игрока с учетом гравитации и платформ
        this.player.update(dt, this.keys, this.mapWidth, this.mapHeight, this.gravity, this.platforms);
        
        // Обновляем босса
        const newBossBullet = this.boss.update(dt, this.player.x, this.player.y, this.mapWidth, this.mapHeight);
        if (newBossBullet) this.bossBullets.push(newBossBullet);

        // Логика камеры: центрируем её на игроке
        this.camera.x = this.player.x - this.screenWidth / 2;
        this.camera.y = this.player.y - this.screenHeight / 2;

        // Не даем камере выходить за границы масштабной карты
        this.camera.x = Math.max(0, Math.min(this.mapWidth - this.screenWidth, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapHeight - this.screenHeight, this.camera.y));

        // Коллизия игрока с боссом
        if (this.player.alive && this.boss.alive) {
            if (this.player.x > this.boss.x - this.boss.w / 2 &&
                this.player.x < this.boss.x + this.boss.w / 2 &&
                this.player.y > this.boss.y - this.boss.h / 2 &&
                this.player.y < this.boss.y + this.boss.h / 2) {
                this.player.alive = false;
            }
        }

        // Пули игрока
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const b = this.playerBullets[i];
            b.update(dt, this.mapWidth, this.mapHeight);

            if (this.boss.alive && this.boss.checkHit(b)) {
                this.boss.takeDamage(10);
                this.playerBullets.splice(i, 1);
                continue;
            }
            if (b.shouldDestroy()) this.playerBullets.splice(i, 1);
        }

        // Пули босса
        for (let i = this.bossBullets.length - 1; i >= 0; i--) {
            const b = this.bossBullets[i];
            b.update(dt, this.mapWidth, this.mapHeight);

            if (this.player.alive) {
                const dx = b.x - this.player.x;
                const dy = b.y - this.player.y;
                if (Math.hypot(dx, dy) < this.player.size + b.r) {
                    this.player.hp -= 10;
                    this.bossBullets.splice(i, 1);
                    continue;
                }
            }
            if (b.shouldDestroy()) this.bossBullets.splice(i, 1);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);

        // Рисуем задний фон (сетка мира для ощущения масштаба)
        this.ctx.strokeStyle = "#222";
        this.ctx.lineWidth = 1;
        const gridSize = 100;
        
        // Рисуем сетку с поправкой на камеру
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;

        for (let x = startX; x < startX + this.screenWidth + gridSize; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - this.camera.x, 0);
            this.ctx.lineTo(x - this.camera.x, this.screenHeight);
            this.ctx.stroke();
        }
        for (let y = startY; y < startY + this.screenHeight + gridSize; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y - this.camera.y);
            this.ctx.lineTo(this.screenWidth, y - this.camera.y);
            this.ctx.stroke();
        }

        // Рисуем платформы
        this.ctx.fillStyle = "#555";
        for (const p of this.platforms) {
            this.ctx.fillRect(
                p.x - this.camera.x,
                p.y - this.camera.y,
                p.w,
                p.h
            );
        }

        // Рисуем персонажей и снаряды (все принимают камеру)
        this.boss.draw(this.ctx, this.camera.x, this.camera.y);
        this.player.draw(this.ctx, this.camera.x, this.camera.y);
        this.playerBullets.forEach(b => b.draw(this.ctx, this.camera.x, this.camera.y));
        this.bossBullets.forEach(b => b.draw(this.ctx, this.camera.x, this.camera.y));

        // Статический интерфейс на экране (не зависит от камеры)
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Boss HP: " + Math.max(0, this.boss.hp), 20, 30);
        this.ctx.fillText("Player HP: " + Math.max(0, this.player.hp), 20, 60);

        if (!this.boss.alive) {
            const winEl = document.getElementById("winScreen");
            if (winEl) winEl.style.display = "block";
        }
        if (!this.player.alive) {
            const loseEl = document.getElementById("LoseScreen");
            if (loseEl) loseEl.style.display = "block";
        }
    }

    loop(time) {
        // Защита от критического скачка dt в первом кадре
        if (!this.lastTime) this.lastTime = time;

        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        requestAnimationFrame(t => this.loop(t));
    }

    start() {
        this.lastTime = 0; // Сбрасываем таймер перед запуском цикла
        requestAnimationFrame(t => this.loop(t));
    }
}