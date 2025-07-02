import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor(GAME_HEIGHT, GAME_WIDTH, NUMBER_OF_ASTEROID_TYPES) {
    super("GameScene");

    this.GAME_HEIGHT = GAME_HEIGHT;
    this.GAME_WIDTH = GAME_WIDTH;
    this.NUMBER_OF_ASTEROID_TYPES = NUMBER_OF_ASTEROID_TYPES;
    this.sky = null;
    this.asteroidSpawnEventTime = null;
    this.asteroidSpawnDelay = 500;
    this.spaceship = null;
    this.spaceshipHorizontalVelocity = 1200;
    this.missiles = null;
    this.missileVelocity = 900;
    this.asteroids = null;
    this.asteroidVelocity = 250;
    this.missileSound = null;
    this.explosionSound = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
    this.gameOverMessage = null;
  }

  create() {
    this.createSky();
    this.createSpaceship();
    this.createAsteroidSpawnEventTime();
    this.createGroups();
    this.createCollisions();
    this.createAnimations();
    this.createSoundEffects();
    this.createCursors();
    this.createScore();
    this.createGameOver();
  }

  update() {
    if (!this.spaceship.body) return;

    this.sky.tilePositionY -= 24;

    const { left, right, space } = this.cursors;

    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);

    if (isSpaceJustDown) this.createMissiles();

    if (left.isDown) {
      this.spaceship
        .setVelocityX(-this.spaceshipHorizontalVelocity)
        .setTexture("spaceship-turning")
        .setFlipX(false);
    } else if (right.isDown) {
      this.spaceship
        .setVelocityX(this.spaceshipHorizontalVelocity)
        .setTexture("spaceship-turning")
        .setFlipX(true);
    } else {
      this.spaceship.setVelocityX(0).setTexture("spaceship-forward");
    }

    this.missiles.getChildren().forEach((missile) => {
      if (missile.getBounds().bottom < 0) missile.destroy();
    });

    this.asteroids.getChildren().forEach((asteroid) => {
      if (
        asteroid.getBounds().top > this.GAME_HEIGHT ||
        asteroid.getBounds().right < 0 ||
        asteroid.getBounds().left > this.GAME_WIDTH
      )
        asteroid.destroy();
    });
  }

  createSky() {
    this.sky = this.add
      .tileSprite(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT, "sky")
      .setOrigin(0);
  }

  createSpaceship() {
    this.spaceship = this.physics.add
      .sprite(this.GAME_WIDTH / 2, this.GAME_HEIGHT - 100, "spaceship-forward")
      .setOrigin(0.5, 0.5)
      .setScale(1.0)
      .setCollideWorldBounds(true);
  }

  createGroups() {
    this.missiles = this.physics.add.group({
      immovable: true,
      velocityY: -this.missileVelocity,
    });
    this.asteroids = this.physics.add.group({
      immovable: true,
      velocityY: this.asteroidVelocity,
    });
  }

  createAsteroidSpawnEventTime() {
    this.asteroidSpawnEventTime = this.time.addEvent({
      delay: this.asteroidSpawnDelay,
      callback: () => this.createAsteroid(),
      callbackScope: this,
      loop: true,
    });
  }

  createAsteroid() {
    const asteroidPositionX = Phaser.Math.Between(0, this.GAME_WIDTH);
    const asteroidTypeNumber = Phaser.Math.Between(
      1,
      this.NUMBER_OF_ASTEROID_TYPES
    );
    const asteroidVelocityX = Phaser.Math.Between(-10, 10);

    const asteroid = this.physics.add
      .sprite(asteroidPositionX, 0, `asteroid-${asteroidTypeNumber}`)
      .setScale(1.5);

    this.asteroids.add(asteroid);

    asteroid.setVelocityX(asteroidVelocityX);
  }

  createMissiles() {
    const leftMissile = this.physics.add
      .sprite(this.spaceship.x - 16, this.spaceship.body.y, "missile")
      .setScale(2);

    const rightMissile = this.physics.add
      .sprite(this.spaceship.x + 16, this.spaceship.body.y, "missile")
      .setScale(2);

    this.missileSound.play();

    this.missiles.add(leftMissile);
    this.missiles.add(rightMissile);
  }

  createCollisions() {
    this.physics.add.collider(
      this.missiles,
      this.asteroids,
      (missile, asteroid) => {
        missile.destroy();
        this.explosionSound.play();
        asteroid.body.enable = false;
        asteroid.anims.play("explosion");
        asteroid.on("animationcomplete", () => asteroid.destroy());
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    );

    this.physics.add.collider(
      this.asteroids,
      this.spaceship,
      (asteroid, spaceship) => {
        asteroid.destroy();
        this.asteroidSpawnEventTime.destroy();
        this.explosionSound.play();
        this.physics.pause();
        this.sky.tilePositionY = this.GAME_HEIGHT;
        this.gameOverText.setAlpha(1);
        this.gameOverMessage.setAlpha(1);
        spaceship.body.enable = false;
        spaceship.anims.play("explosion");
        spaceship.on("animationcomplete", () => spaceship.destroy());
      }
    );
  }

  createAnimations() {
    this.anims.create({
      key: "explosion",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 8,
      }),
      frameRate: 48,
      repeat: 1,
    });
  }

  createSoundEffects() {
    this.missileSound = this.sound.add("shoot");
    this.explosionSound = this.sound.add("explosion");
  }

  createCursors() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createScore() {
    this.scoreText = this.add
      .text(32, 32, `Score: ${this.score}`, {
        color: "#FFFFFF",
        fontSize: 32,
        fontStyle: "bold",
      })
      .setDepth(9999);
  }

  restartGame() {
    this.anims.remove("explosion");
    this.score = 0;
    this.scene.restart();
  }

  createGameOver() {
    this.gameOverText = this.add
      .text(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2, "Game Over", {
        color: "#FFFFFF",
        fontSize: 128,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(9999)
      .setAlpha(0);

    this.gameOverMessage = this.add
      .text(
        this.GAME_WIDTH / 2,
        this.GAME_HEIGHT / 2,
        "Click here to try again!",
        {
          color: "#FFFFFF",
          fontSize: 42,
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5, 0)
      .setDepth(9999)
      .setAlpha(0)
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => this.restartGame());
  }
}
