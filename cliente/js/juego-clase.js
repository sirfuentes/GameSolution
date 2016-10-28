
var player;
var platforms;
var cursors;
var cielo;

var Meteoritos;
var score = 0;
var scoreText;
var timer;
var tiempo=0;
var tiempoText;
var stateText;
var fireButton;
var bullets;
var bulletTime=0;
var explosions;
var grenadeSound;


var maxNiveles=3;
var ni;

inicializarCoordenadas();

function crearNivel(nivel){
	ni=parseInt(nivel);
	if(ni<maxNiveles)
	{
		game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
	}
	else{
		noHayNiveles();
	}
}


function preload() {
		game.load.image('sky', 'assets/sky.png');
		game.load.image('ground', 'assets/platform.png'); //suelo grupo floor
		game.load.image('ground2', 'assets/platform2.png'); //baldosa grupo platforms
		game.load.image('meteorito', 'assets/meteorito.png');
		game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
		//game.load.image('cielo','assets/heaven.png');
		game.load.image('cielo','assets/mascara.png');
		game.load.image('apple','assets/apple.png');
		game.load.spritesheet('dude1', 'assets/dude1.png', 32, 48);
		game.load.image('bullet', 'assets/bullet.png');
		game.load.spritesheet('kaboom', 'assets/explode.png', 60, 60);
		game.load.audio('grenadeSound', 'assets/grenadeSound.mp3');
		game.load.audio('liveSound', 'assets/liveSound.mp3');
		game.load.audio('gameOver', 'assets/gameOver.mp3');
		game.load.audio('loseLive', 'assets/loseLive.mp3');
}



function create() {

		//  We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//  A simple background for our game
		game.add.sprite(0, 0, 'sky');

		//  The platforms group contains the ground and the 2 ledges we can jump on
		platforms = game.add.group();
		suelo = game.add.group();
		cielo = game.add.group();
		grenadeSound = game.add.audio('grenadeSound');
		grenadeSound.allowMultiple = true;

		liveSound = game.add.audio('liveSound');
		liveSound.allowMultiple = false;

		loseLive = game.add.audio('loseLive');
		loseLive.allowMultiple = false;

		gameOver = game.add.audio('gameOver');
		

		//disparos
		bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;
	    bullets.createMultiple(30, 'bullet');
	    //bullets.setAll('anchor.x', 0.5);
	    //bullets.setAll('anchor.y', 1);
	    bullets.setAll('outOfBoundsKill', true);
	    bullets.setAll('checkWorldBounds', true);

		//  We will enable physics for any object that is created in this group
		platforms.enableBody = true;
		suelo.enableBody = true;
		cielo.enableBody = true;

		//var fin=cielo.create(0,-15,'cielo');
		//fin.scale.setTo(2,1);

		ponerObjetivo();
		//var fin=cielo.create(0,0,'cielo');

		// Here we create the ground.
		var ground = suelo.create(0, game.world.height - 5, 'ground');

		//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
		ground.scale.setTo(2, 2);

		//  This stops it from falling away when you jump on it
		ground.body.immovable = true;

		//  Now let's create two ledges
		var ledge;// = platforms.create(400, 400, 'ground');
		//ledge.body.immovable = true;

		for(var i=0;i<coordenadas[ni].length;i++){
			ledge = platforms.create(coordenadas[ni][i].x,coordenadas[ni][i].y, 'ground2');
			ledge.body.immovable = true;            
		}
		/*
		ledge = platforms.create(-150, 250, 'ground');
		ledge.body.immovable = true;

		ledge =platforms.create(320,100,'ground2');
		ledge.body.immovable = true;

		*/

		// The player and its settings
		player = game.add.sprite(32, game.world.height - 150, 'dude');
		player.vidas=5;

		//  We need to enable physics on the player
		game.physics.arcade.enable(player);

		//  Player physics properties. Give the little guy a slight bounce.
		player.body.bounce.y = 0.2;
		player.body.gravity.y = 300;
		player.body.collideWorldBounds = true;

		//  Our two animations, walking left and right.
		player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right', [5, 6, 7, 8], 10, true);

		//  Finally some Meteoritos to collect
		meteoritos = game.add.group();
		

		//  We will enable physics for any Meteorito that is created in this group
		meteoritos.enableBody = true;
		meteoritos.physicsBodyType = Phaser.Physics.ARCADE;
		//  Here we'll create 12 of them evenly spaced apart
		for (var i = 0; i < 10; i++)
		{
			//  Create a star inside of the 'stars' group
			var meteorito = meteoritos.create(i * 80, 0, 'meteorito');

			//  Let gravity do its thing
			var y=Math.floor(Math.random()*200+1);
			meteorito.body.gravity.y = y;

			//  This just gives each Meteorito a slightly random bounce value
			//star.body.bounce.y = 0.7 + Math.random() * 0.2;
			//star.checkWorldBounds = true;
		}

		apples = game.add.group();

		apples.enableBody = true;
		apples.physicsBodyType = Phaser.Physics.ARCADE;
		for (var i = 0; i < 2; i++)
		{
			//  Create a star inside of the 'stars' group
			var apple = apples.create(i * 300, 0, 'apple');

			//  Let gravity do its thing
			apple.body.gravity.y = 90;

			//  This just gives each Meteorito a slightly random bounce value
			//star.body.bounce.y = 0.7 + Math.random() * 0.2;
			//star.checkWorldBounds = true;
		}


		//  The score
		scoreText = game.add.text(16, 22, 'Vidas: 5', { fontSize: '32px', fill: '#000' });

		tiempoText=game.add.text(16,55,'Tiempo:0',{ fontSize: '32px', fill: '#000' });
		tiempo=0;
		timer=game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);


		stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = false;

		explosions = game.add.group();
	    explosions.createMultiple(60, 'kaboom');
	    explosions.forEach(setupInvader, this);

		//  Our controls.
		cursors = game.input.keyboard.createCursorKeys();
		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
	}


function update() {

		//  Collide the player and the stars with the platforms
		game.physics.arcade.collide(player, platforms);
		game.physics.arcade.collide(player, suelo);
		//game.physics.arcade.collide(stars, platforms);

		//  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
		game.physics.arcade.overlap(player, meteoritos, collectMeteorito, null, this);

		game.physics.arcade.overlap(player, apples, collectApples, null, this);

		game.physics.arcade.overlap(player, cielo, terminaNivel, null, this);

		game.physics.arcade.overlap(suelo,meteoritos,muereMeteorito,null,this);

		game.physics.arcade.overlap(suelo,apples,muereApple,null,this);

		game.physics.arcade.overlap(bullets,meteoritos,explosionMeteorito,null,this);

		//  Reset the players velocity (movement)
		player.body.velocity.x = 0;

		if (cursors.left.isDown)
		{
			//  Move to the left
			player.body.velocity.x = -150;

			player.animations.play('left');
		}
		else if (cursors.right.isDown)
		{
			//  Move to the right
			player.body.velocity.x = 150;

			player.animations.play('right');
		}
		else
		{
			//  Stand still
			player.animations.stop();

			player.frame = 4;
		}
		if (fireButton.isDown)
        {
            fireBullet();
        }
		
		//  Allow the player to jump if they are touching the ground.
		if (cursors.up.isDown && player.body.touching.down)
		{
			player.body.velocity.y = -350;
		}

}



function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function lanzarMeteorito(){
	var x=Math.floor(Math.random()*765+1);
	var y=Math.floor(Math.random()*200+1)+50;

	var meteorito = meteoritos.create(x, 0, 'meteorito');
	meteorito.body.gravity.y = y;
}


function updateTiempo(){
	tiempo++;

	tiempoText.setText('Tiempo: '+tiempo);


}

function ponerObjetivo(){
	if (ni==0){
	//var x=Math.floor(Math.random()*600+100);
	var fin=cielo.create(300,0,'cielo');
	}
	else if (ni==1){
	//var x=Math.floor(Math.random()*600+100);
	var fin=cielo.create(300,0,'cielo');
	}
	else if (ni==2){
	//var x=Math.floor(Math.random()*600+100);
	var fin=cielo.create(600,350,'cielo');
	}

}

function collectMeteorito (player, meteorito) {       
		// Removes the Meteorito from the screen
		meteorito.kill();

		//  Add and update the score
		player.vidas=player.vidas-1;
		loseLive.play();
		scoreText.text = 'Vidas: ' + player.vidas;
		if (player.vidas==0){
			player.kill();
			game.time.events.remove(timer);
			gameOver.play();
			stateText.text="  GAME OVER \n Intentelo de nuevo";
			stateText.visible = true;
			setTimeout(reiniciar, 4000);
			//game.input.onTap.addOnce(restart,this);
			
		}
}


function explosionMeteorito (bullet, meteorito) {       
		// Removes the Meteorito from the screen
		bullet.kill();
		meteorito.kill();
		lanzarMeteorito();
		var explosion = explosions.getFirstExists(false);
	    explosion.reset(meteorito.body.x+ 15, meteorito.body.y);
	    explosion.play('kaboom', 30, false, true);
	    grenadeSound.play();
		
}

function collectApples (player, apple) {       
		// Removes the Meteorito from the screen
		apple.kill();

		//  Add and update the score
		player.vidas=player.vidas+1;
		liveSound.play();

		scoreText.text = 'Vidas: ' + player.vidas;
		//player.velocity = 
}

function reiniciar(){
	location.reload();
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function terminaNivel(player,final){
	// llamar a nivelCompletado y pasar tiempo y vidas
	//console.log("Nivel completado");
	player.kill();
	final.kill();
	game.time.events.remove(timer);
	stateText.text = " Nivel completado";
	stateText.visible = true;


	setTimeout(siguiente, 2000);
	//the "click to restart" handler
	//game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).addOnce(nivelCompletado(tiempo),this);
	//firebutton=game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	//if (firebutton.isDown)
	//{
	//	nivelCompletado(tiempo)
   // }
	//;
}

function siguiente(){
	nivelCompletado(tiempo);
}

function muereMeteorito(suelo,meteorito){
	meteorito.kill();
	lanzarMeteorito();
}

function muereApple(suelo,apple){
	apple.kill();
	//lanzarApple();
	var t=Math.floor(Math.random()*5+1) +5;
	setTimeout(lanzarApple, t);
}

function lanzarApple(){ //sin comprobar
	var x=Math.floor(Math.random()*765+1);
	var y=Math.floor(Math.random()*200+1)+50;
	//var t=Math.floor(Math.random()*10+1) +5;
	
	//setTimeout(3000);
	var apple = apples.create(x, 0, 'apple');
	apple.body.gravity.y = y;
	
}
