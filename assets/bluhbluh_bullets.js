/**
 *    Bluhbluh.js
 *    by cctjallorina
 *    Version B10: Release 1
 */

var keyLeft = 37;
var keyUp = 38;
var keyRight = 39;
var keyDown = 40;
var keyZ = 90;
var keyX = 88;
var keyShift = 16;
			
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var audio = new Audio('assets/playthis.mp3');

var keys = [];

var player = {
	x       : 250         ,
	y       : 450         ,
	size    : 30          ,
	velX    : 0           ,
	velY    : 0           ,
	speed   : 20          ,
	friction: 0.9         ,
	sprite  : new Image() ,
	kills   : 0           ,
	upgrade : 0           ,
	lives   : 5           ,
	bombs   : 3           ,
	noKill  : 100         ,
	hit     : false     
}

var Bullet = function() {
	this.x      = 250         ,
	this.y      = -10         ,
	this.radius = 10          ,
	this.velX   = 0           ,
	this.velY   = -5          ,
	this.angle  = 0           ,
	this.color  = "#FF0000"   ,
	this.owner  = "player"    ,
	this.sprite = new Image()
};

var Enemy = function() {
	this.x      = 100            ,
	this.y      = 20             ,
	this.hits   = 1              ,
	this.size   = 20             ,
	this.type   = 0              ,
	this.velX   = 1              ,
	this.velY   = 1              ,
	this.alive  = true           ,
	this.sprite = new Image()    
};

var initialized = false;

var bullets = [];
var bulletDelay = 20;
var bulletTimeout = bulletDelay;
var bombDelay = 1000;
var bombTimeout = bombDelay;
var bulletReady = true;
var bombReady = true;
var healthUpgrade = true;

var enemyCount       = 2;
var enemies          = [];
var enemyBulletDelay = 100;

var enemyBullets = [];

var waves = 1;
var gameState = 0;  //Game States: 0- Main Menu; 1- Help; 2- Main Game; 3- Death
var storyState = 0; //Story States: 0- Waves 1 to 5; 1- Cutscene 1; 2- Boss Battle; 3- Cutscene 2; 4- Waves 6 to 10; 5- Cutscene 3; 6- Boss Battle
var menuOption = 0;
var menuTimeout = 50;
var menuFire = true;

var backgroundSprite = new Image();
var mainMenu = new Image();
/*
	Important Notes:
	Upper Left Corner = 0,0
	Going +y = going south
	Going +x = going east
	Going -y = going north
	Going -x = going west
*/
function init()
	{
		console.log("Initialization.");
		var i;
		
		if (waves > 1 && waves % 5 == 0)
		{
			enemyCount = 2;
		}
		else
		{
			enemyCount = 2 + (2 * waves);
		}
		
		for (i = 0; i < enemyCount; i++)
		{
			enemies[i] = new Enemy();
			
			//enemy coords
			if (waves > 1 && waves % 5 == 0)
			{	
				enemies[i].type = 1;
				enemies[i].hits = 20 * (waves / 5);
				enemies[i].x = 250;
				enemies[i].y = 50;
			}
			else	
				enemies[i].x = Math.floor(Math.random() * (canvas.width + 1));
			
			if (waves > 0 && waves % 5 == 0)
				enemies[i].size = 60; //enemy size
			else
				enemies[i].size = 40;
			
			if (i < enemyCount / 2) //moving to the right
			{
				enemies[i].velX = 0.2;
				enemies[i].velY = 0.1;
			}
			else //moving to the left
			{
				enemies[i].velX = -0.2;
				enemies[i].velY = 0.1;
			}
		}
		
		document.getElementById("waveCounter").innerHTML = "Wave #" + waves;
	}
	
function reset()
	{
		waves = 1;
		menuOption = 0;
		gameState = 0;
		initialized = false;
		
		enemies.splice(0, enemies.length);
		bullets.splice(0, bullets.length);
		enemyBullets.splice(0, enemyBullets.length);
		
		player.lives = 5;
		player.bombs = 3;
		bombReady = false;
		bombTimeout = bombDelay;
		player.kills = 0;
		player.upgrade = 0;
		document.getElementById("playerKills").innerHTML = "Player Kills: " + player.kills;
		document.getElementById("playerBombs").innerHTML = "Player Bombs: " + player.bombs;
		document.getElementById("playerLives").innerHTML = "Player Lives: " + player.lives;
		bulletDelay = 20;
	}

/**func entityUpdate: update all entities other than the player*/	
function entityUpdate()
	{
		var i;
		for (i = 0; i < bullets.length; i++)
		{
            if (bullets[i].y > 0)
				bullets[i].y += bullets[i].velY;
            else
				bullets.splice(i, 1);
		}
		
		for (i = 0; i < enemyBullets.length; i++)
		{
            if (enemyBullets[i].y < canvas.height && enemyBullets[i].y > 0 && enemyBullets[i].x > 0 && enemyBullets[i].x < canvas.width)
				{
					enemyBullets[i].y += enemyBullets[i].velY;
					enemyBullets[i].x += enemyBullets[i].velX;
				}
            else
				enemyBullets.splice(i, 1);
		}
		
		for (i = 0; i < enemies.length; i++)
		{
			if (waves > 0 && waves % 5 == 0) //boss situation
			{
				if (enemies[i].x + enemies[i].size < canvas.width && enemies[i].y < canvas.height && enemies[i].x > 0 && enemies[i].y > 0)
				{
					enemies[i].x += enemies[i].velX;
					enemies[i].y += enemies[i].velY;
				}
				else
				{
					enemies[i].velX = -1 * enemies[i].velX;
					enemies[i].velY = -1 * enemies[i].velY;
					
					enemies[i].x += enemies[i].velX;
					enemies[i].y += enemies[i].velY;
				}
			}
			else
			{
				if (enemies[i].x < canvas.width && enemies[i].y < canvas.height && enemies[i].x > 0 && enemies[i].y > 0)
				{
					enemies[i].x += enemies[i].velX;
					enemies[i].y += enemies[i].velY;
				}
				else
				{
					enemies.splice(i, 1);
					enemyCount--;
				}
			}
		}
	}

/** func draw(): draws the game pieces*/
function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); //clears canvas
		backgroundSprite.src = "assets/Background lockers.png";
		if (gameState == 0) //Main Menu
		{
			mainMenu.src = "assets/RPG LOGO.png";
			ctx.save();
			ctx.drawImage(mainMenu , 50, 0, 400, 400);
			ctx.restore();
			
			if (menuOption == 0)
			{
				ctx.save();
				ctx.fillStyle = "#FF0000";
				ctx.font = "32px Comic Sans MS";
				ctx.fillText("Start [Z]", 100, 450);
				ctx.restore();
				
				ctx.save();
				ctx.fillStyle = "#000000";
				ctx.font = "32px Comic Sans MS";
				ctx.fillText("Help?", 300, 450);
				ctx.restore();
			}
			else if (menuOption == 1)
			{
				ctx.save();
				ctx.fillStyle = "#000000";
				ctx.font = "32px Comic Sans MS";
				ctx.fillText("Start [Z]", 100, 450);
				ctx.restore();
				
				ctx.save();
				ctx.fillStyle = "#FF0000";
				ctx.font = "32px Comic Sans MS";
				ctx.fillText("Help?", 300, 450);
				ctx.restore();
			}
		}
		if (gameState == 1) //Help Text
		{
			ctx.save();
			ctx.fillStyle = "#000000";
			ctx.font = "20px Comic Sans MS";
			ctx.fillText("Press Z to fire, Shift to slow down, X to use bombs (wait a while to recharge).", 10, 50, 450);
			ctx.restore();
			
			ctx.save();
			ctx.fillStyle = "#000000";
			ctx.font = "20px Comic Sans MS";
			ctx.fillText("Press Z to skip straight to the game!", 10, 100, 450);
			ctx.restore();
		}
		if (gameState == 2) //Main Game
		{
			if (player.lives > 0)
			{
				ctx.save();
				ctx.drawImage(backgroundSprite, 0, 0, 500, 500);
				ctx.restore();
				var i;
				
				//Player Drawing
				ctx.save();
				ctx.drawImage(player.sprite, player.x, player.y, player.size, player.size);
				ctx.restore();
				
				//Bullet Drawing
				for (i = 0; i < bullets.length; i++)
				{
					ctx.beginPath();
					ctx.fillStyle = bullets[i].color;
					ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, 2*Math.PI); //Syntax: arc(centerX, centerY, radius, startingAngleInRadians, endingAngleInRadians, isCounterClockwise)
					ctx.closePath();
					ctx.fill();
				}
				
				//Enemy Drawing
				for (i = 0; i < enemies.length; i++)
				{
					if (enemies[i].type == 1)
						enemies[i].sprite.src = "assets/Villain.png";
					else
						enemies[i].sprite.src = "assets/Prob Set.png";
					enemies[i].sprite.width = 1;
					ctx.drawImage(enemies[i].sprite, enemies[i].x, enemies[i].y, enemies[i].size, enemies[i].size);
				}
				
				//Enemy Bullet Drawing
				for (i = 0; i < enemyBullets.length; i++)
				{
					if (enemyBullets[i].owner == "phys_boss")
						enemyBullets[i].sprite.src = "assets/Rocket3.png";
					else
						enemyBullets[i].sprite.src = "assets/bullet_placeholder.png";
					enemyBullets[i].sprite.width = 1;

					ctx.drawImage(enemyBullets[i].sprite, enemyBullets[i].x, enemyBullets[i].y, enemyBullets[i].radius, enemyBullets[i].radius);
				}
				
				if (waves > 0 && waves % 5 == 0)
				{
					for (var x = 0; x < enemies.length; x++)
						document.getElementById("boss" + (x + 1)).innerHTML = "Hits Left On Boss " + (x + 1) + ": " + enemies[x].hits;
				}
				else
				{
					document.getElementById("boss1").innerHTML = "";
					document.getElementById("boss2").innerHTML = "";
				}
			}
			else
			{
				gameState = 3;
			}
		}
		if (gameState == 3)
		{
			ctx.font = "32px Comic Sans MS";
			ctx.fillText("You lost. Press Z to try again.", 10, 50);
		}
		
		ctx.save();
		ctx.fillStyle = "#FF0000";
		ctx.font = "12px Consolas";
		ctx.fillText("Version: Pre-Alpha Stable rc2", 1, 499);
		ctx.restore();
	}
	
function entityHitDetection()
	{
		for (var i = 0; i < bullets.length; i++)
		{
            for (var j = 0; j < enemies.length; j++)
            {
				if (bullets[i] != undefined)
				{
					if (((bullets[i].x + (bullets[i].radius)) >= (enemies[j].x)) && ((bullets[i].x) <= (enemies[j].x + enemies[j].size))) //check x axis
					{
						if ((bullets[i].y) <= (enemies[j].y + enemies[j].size) && (bullets[i].y + bullets[i].radius) >= (enemies[j].y)) //check y axis
						{
							if (enemies[j].hits < 1)
							{
								bullets.splice(i, 1);
								enemies.splice(j, 1);
								player.kills++;
								document.getElementById("playerKills").innerHTML = "Player Kills: " + player.kills;
								enemyCount--;
								break;
							}
							else
							{
								enemies[j].hits--;
								bullets.splice(i, 1);
							}
						}
					}
                }
			}
		}
		
		if (!player.hit || player.noKill < 1)
		{
			player.noKill = 100;
			player.hit = false;
			
			for (var i = 0; i < enemyBullets.length; i++)
			{
				if (player.lives > 0)
				{
					if ((enemyBullets[i].x + (enemyBullets[i].radius / 2)) >= (player.x) && (enemyBullets[i].x) <= (player.x + (player.size / 2))) //check x axis
					{
						if ((enemyBullets[i].y) <= (player.y + player.size / 2) && (enemyBullets[i].y + (enemyBullets[i].radius / 2) >= (player.y))) //check y axis
						{
							enemyBullets.splice(i, 1);
							player.lives--;
							player.hit = true;
							document.getElementById("playerLives").innerHTML = "Player Lives: " + player.lives;
							break;
						}
					}
				}
			}
		}
		else
		{
			player.noKill--;
		}
	}

function enemyFire()
	{
		var last;
		var bpa = 16 * (waves / 5);//Bullets per Attack (for use in cases 1 and up)
		
		for (var i = 0; i < enemies.length; i++)
		{
			switch (enemies[i].type)
			{
				case 0:
					last = enemyBullets.length;
					
					enemyBullets.push(new Bullet())
					enemyBullets[last].y     = enemies[i].y;
					enemyBullets[last].x     = enemies[i].x + (enemies[i].size /  2 );
					enemyBullets[last].owner = "enemy";
					enemyBullets[last].velY  = Math.floor(Math.random() * 9) + 1;
				break;
				
				case 1: //First Special Enemy
					for (var j = 0; j < bpa; j++)
					{
						last = enemyBullets.length;
						enemyBullets.push(new Bullet());
						//deg per bullet
						enemyBullets[last].x     = enemies[i].x + (enemies[i].size * (Math.cos(((360 / bpa) * j) * (Math.PI / 180))));
						enemyBullets[last].y     = enemies[i].y + (enemies[i].size * (Math.sin(((360 / bpa) * j) * (Math.PI / 180))));
						enemyBullets[last].angle = ((360 / bpa) * j) * (Math.PI / 180);
						enemyBullets[last].velX  = 5 * Math.cos((j * (360 / bpa)) * (Math.PI / 180));
						enemyBullets[last].velY  = 5 * Math.sin((j * (360 / bpa)) * (Math.PI / 180));
						enemyBullets[last].owner = "phys_boss";
						enemyBullets[last].radius= 15;
					}
				break;
			}
		}
	}
	
function playerMovement()
	{
		var limit = canvas.width - player.size;
		if (keys[keyUp]) 
		{
			if (player.velY > -player.speed) 
			{
				player.velY--;
			}
		}
		
		if (keys[keyDown]) 
		{
			if (player.velY < player.speed) 
			{
				player.velY++;
			}
		}
		if (keys[keyRight]) 
		{
			if (player.velX < player.speed) 
			{
				player.velX++;
			}
		}
		if (keys[keyLeft]) 
		{
			if (player.velX > -player.speed) 
			{
				player.velX--;
			}
		}
		
		if (keys[keyShift])
		{
			player.friction = 0.5;
		}
		else
		{
			player.friction = 0.7;
		}
		
		//Attack
		if (keys[keyZ])
		{
            if (bulletReady == true)
            {
                var last = bullets.length;
                
                bullets.push(new Bullet())
                bullets[last].y     = player.y;
				bullets[last].x     = player.x + (player.size /  2 );
				bullets[last].radius= 3;
				bulletReady = false;
            }
		}
		
		if (keys[keyX])
		{
			if (player.bombs > 0 && bombTimeout == 0 || bombReady)
			{
				var deleteAmount = enemyBullets.length;
				
				enemyBullets.splice(0, deleteAmount);
				enemyCount = 0;
				
				player.bombs--;
				player.kills += enemyCount;
				enemyCount = 0;
				enemies.splice(0, enemies.length);
				document.getElementById("playerKills").innerHTML = "Player Kills: " + player.kills;
				document.getElementById("playerBombs").innerHTML = "Player Bombs: " + player.bombs;
				
				bombTimeout = bombDelay;
				bombReady = false;
			}
		}

		player.velY *= player.friction;
		player.y += player.velY;
		player.velX *= player.friction;
		player.x += player.velX;

		if (player.x >= limit) {
			player.x = limit;
		} else if (player.x <= 0) {
			player.x = 0;
		}

		if (player.y > limit) {
			player.y = limit;
		} else if (player.y <= 0) {
			player.y = 0;
		}
		
		if (player.kills > 0 && player.kills % 10 == 0)
		{
			player.upgrade++;
			bulletDelay = 20 / ((player.upgrade / 10) + 1);
		}
		
		if (player.kills > 0 && player.kills % 100 == 0 && healthUpgrade)
		{
			healthUpgrade = false;
			player.health += 1;
		}
		else
		{
			healthUpgrade = true;
		}
	}
	
function menuSelection()
	{
		if (menuTimeout == 0 || menuFire)
		{
			menuFire = true;
			if (gameState == 0)
			{
				if (keys[keyLeft])
				{
					if (menuOption == 1)
						menuOption--;
					else
						menuOption = 1;
					
					menuFire = false;
					menuTimeout = 50;
				}
				if (keys[keyRight])
				{
					if (menuOption == 0)
						menuOption++;
					else
						menuOption = 0;
					
					menuFire = false;
					menuTimeout = 50;
				}
				if (keys[keyZ])
				{
					if (menuOption == 0)
						gameState = 2; //Main Game
					if (menuOption == 1)
						gameState = 1; //Help or Flavor Text
					
					menuFire = false;
					menuTimeout = 50;
				}
			}
			else //dead
			{
				if (keys[keyZ])
				{
					audio.pause();
					initialized = false;
					reset(); //Restart the game
				}
			}
		}
		else
		{
			menuTimeout--;
		}
	}
	
function gameLoop()
	{
		if (gameState < 2 || gameState > 2)
		{
			menuSelection();
			var random = Math.round(Math.random());
			
			if (random == 0)
			{
				player.sprite.src = "assets/Female copy.png";
			}
			else
			{
				player.sprite.src = "assets/Male3 copy.png";
			}
		}
		if (gameState == 2)
		{
			if (!initialized)
			{
				initialized = true;
				audio.play();
				audio.loop = true;
				init();
			}
			
			playerMovement();
			
			if (enemyBulletDelay > 0)
			{
				enemyBulletDelay--;
			}
			else
			{
				enemyFire();
				enemyBulletDelay = 100;
			}
			
			if (bulletReady == false && bulletTimeout > 0)
			{
				bulletTimeout--;
			}
			else
			{
				bulletTimeout = bulletDelay;
				bulletReady = true;
			}
			
			if (bombTimeout > 0 && bombReady == false)
			{
				bombTimeout--;
				bombReady = false;
			}
			else
			{
				bombReady = true;
				document.getElementById("playerBombs").innerHTML = "Player Bombs: " + player.bombs + " | BOMB READY!";
			}
			
			if (enemyCount == 0)
			{
				waves++;
				init();
			}
			
			entityHitDetection();
			entityUpdate();
		}
		
		draw();
		setTimeout(gameLoop, 20);
	}
	
gameLoop();

//Event Listeners
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});