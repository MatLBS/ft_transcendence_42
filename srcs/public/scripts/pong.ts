import { Scene, Engine, SceneLoader, FreeCamera, Vector3, HemisphericLight, CannonJSPlugin, MeshBuilder, PhysicsImpostor, ArcRotateCamera, PointLight, StandardMaterial, Color3, AbstractMesh, ActionManager, SetValueAction, ExecuteCodeAction, FlowGraphConsoleLogBlock, KeyboardEventTypes, TrailMesh, ParticleSystem, Color4, Texture, StorageBuffer } from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import * as GUI from "@babylonjs/gui";

const WINPOINT = 5;
class FirstPersonController {
	scene: Scene;
	engine: Engine;
	paddle1!: AbstractMesh;
	paddle2!: AbstractMesh;
	ball!: AbstractMesh;
	private local:boolean;
	private predictDir = 0;
	private player1Score: number;
	private player2Score: number;
	private player1name: string = "";
	private player2name: string = "";
	private win: boolean = false;
	private scoreText!: GUI.TextBlock;
	private explosionEffect!: ParticleSystem;

	constructor(isLocal:boolean) {
		console.log("start");
		const canvas = document.getElementById("renderCanvas");
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new Error("Element with id 'renderCanvas' is not a canvas element.");
		}
		this.local = isLocal;
		const gameType = canvas.getAttribute('canva-game');
		this.engine = new Engine(canvas, true);
		this.scene = this.CreateScene();
		this.scene.getPhysicsEngine()!.setTimeStep(1 / 60);
		this.player1Score = 0;
		this.player2Score = 0;

		fetch('/getUser', {
			method: 'GET',
			credentials: 'include',
		})
			.then(async (response) => {
				const data = await response.json();
				this.player1name = data.user.username as string;
			})
		if (isLocal === true)
		{
			const usernameElement = document.getElementById("username") as HTMLInputElement | null;
			const player2 = usernameElement?.value;
			this.player2name = player2 || "Player 2";
		}
		else{
			this.player2name = "The machiavelic computer";
		}
		this.CreateMeshes();
		this.createExplosionEffect();
		if (this.local === false)
		{
			setInterval(() => {
				//this.predictBall()
				console.log ("predic funct = ", this.predictBallXAtZ(-8))
				this.predictDir = this.predictBallXAtZ(-8);
				//console.log ("predic = ", this.predictDir);
			} , 1000);
		}
		this.engine.runRenderLoop(() => {
			this.createGame();
		});

		// Exemple d'arrêt automatique lorsque l'utilisateur quitte la page
	}

	createGame(): void {
		this.scene.render();
		if (this.local === false)
			this.playAI();
		if (this.player1Score === WINPOINT && this.win == false) {
			this.win = true;
			console.log("player1 won");
			this.showWinScreen(this.player1name);
		}
		if (this.player2Score === WINPOINT && this.win == false) {
			this.win = true;
			console.log("player2 won");
			this.showWinScreen(this.player2name);
		}

	}

	CreateScene(): Scene {
		const scene = new Scene(this.engine);
		const hemilight = new HemisphericLight("hemilight", new Vector3(0, 1, 0), scene);
		hemilight.intensity = 1;

		const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.scoreText = new GUI.TextBlock();
		this.scoreText.text = "0 - 0";
		this.scoreText.color = "white";
		this.scoreText.fontSize = 48;
		this.scoreText.top = -250;
		advancedTexture.addControl(this.scoreText);

		scene.enablePhysics(new Vector3(0, 0, 0), new CannonJSPlugin(true, 0, CANNON));

		const camera = new ArcRotateCamera("camera", Math.PI, Math.PI / 4, 20, Vector3.Zero(), scene);
		//camera.attachControl(this.canvas, true);

		//const light = new PointLight("light", new Vector3(0, 5, 0), scene);

		scene.collisionsEnabled = true; // To check if relevant here
		this.countDown();

		return scene;
	}

	countDown(): void {
		// Test du compte a rebour 
		if (this.player1Score >= WINPOINT || this.player2Score >= WINPOINT)
			return;
		const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		const countdownText = new GUI.TextBlock();
		countdownText.text = "";
		countdownText.color = "white";
		countdownText.fontSize = 128;
		advancedTexture.addControl(countdownText);

		// Fonction de compte à rebours
		let count = 3;
		const countdown = () => {
			if (count > 0) {
				countdownText.text = count.toString();
				count--;
				setTimeout(countdown, 500);
			} else {
				countdownText.text = "";
				let rand = Math.random();
				if (rand > 0.45 && rand < 0.55)
					rand = 0.45;
				const startDirection = new Vector3(
					rand > 0.5 ? 1 : -1,
					0,
					(rand - 0.5) * 10.0
				).normalize();
				this.ball.physicsImpostor!.setLinearVelocity(startDirection.scale(5));
			}
		};
		// Démarrer le compte à rebours
		setTimeout(countdown, 500);
		// fin test
	}

	CreateMeshes(): void {
		// Sol
		const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 200 }, this.scene);
		const blackMaterial = new StandardMaterial("blackMat", this.scene);
		blackMaterial.diffuseColor = new Color3(0, 0, 0);  // Noir pur
		blackMaterial.specularColor = new Color3(0, 0, 0); // Pas de reflets

		// Appliquer au sol
		ground.material = blackMaterial;

		// Matériau néon (émissif)
		const neonMaterial = new StandardMaterial("neon", this.scene);
		neonMaterial.emissiveColor = new Color3(0, 1, 1);  // Cyan néon
		neonMaterial.diffuseColor = new Color3(0, 1, 1);

		const paddleMaterial = new StandardMaterial("paddle", this.scene);
		paddleMaterial.emissiveColor = new Color3(1, 1, 1);  // Cyan néon
		paddleMaterial.diffuseColor = new Color3(1, 1, 1);

		const createWall = (name: string, size: Vector3, position: Vector3) => {
			const wall = MeshBuilder.CreateBox(name, { width: size.x, height: size.y, depth: size.z }, this.scene);
			wall.position = position;
			wall.material = neonMaterial;
			if (wall.name === "topWall" || wall.name === "bottomWall") {
				wall.rotation = new Vector3(0, Math.PI / 2, 0);
				wall.rotation.y = Math.PI / 2;
			}
			wall.physicsImpostor = new PhysicsImpostor(wall, PhysicsImpostor.BoxImpostor, {
				mass: 0,
				restitution: 1
			});
			return wall;
		};

		const leftWall = createWall("leftWall", new Vector3(10, 0.5, 0.5), new Vector3(0, 0, 10));
		const rightWall = createWall("rightWall", new Vector3(10, 0.5, 0.5), new Vector3(0, 0, -10));
		const topWall = createWall("topWall", new Vector3(20, 0.5, 0.5), new Vector3(5, 0, 0));
		const bottomWall = createWall("bottomWall", new Vector3(20, 0.5, 0.5), new Vector3(-5, 0, 0));

		const createGoal = (zPosition: number) => {
			const goal = MeshBuilder.CreateBox("goal", { width: 10, height: 10, depth: 1 }, this.scene);
			goal.position.z = zPosition;
			goal.isVisible = false;
			goal.physicsImpostor = new PhysicsImpostor(goal, PhysicsImpostor.BoxImpostor, {
				mass: 0,
				restitution: 0
			});
			return goal;
		};

		const leftGoal = createGoal(10); // to double check 
		const rightGoal = createGoal(-10);

		this.paddle1 = MeshBuilder.CreateBox("paddle1", { width: 2, height: 0.5, depth: 0.2 }, this.scene);
		this.paddle1.position.y = 0.3;
		this.paddle1.position.z = 8;
		this.paddle1.material = paddleMaterial;

		const clonedPaddle = this.paddle1.clone("paddle2", null);
		if (!clonedPaddle) {
			throw new Error("Failed to clone paddle1");
		}
		this.paddle2 = clonedPaddle;
		this.paddle2.position.z = -8;

		[this.paddle1, this.paddle2].forEach(paddle => {
			paddle.physicsImpostor = new PhysicsImpostor(
				paddle,
				PhysicsImpostor.BoxImpostor,
				{ mass: 0, restitution: 1.2 } // Restitution >1 pour accélérer après impact
			);
		});


		this.ball = MeshBuilder.CreateSphere("sphere", { diameter: 0.8 });
		this.ball.position = new Vector3(0, 0.5, 0);

		this.ball.physicsImpostor = new PhysicsImpostor(
			this.ball,
			PhysicsImpostor.SphereImpostor,
			{
				mass: 1,
				restitution: 1,
				friction: 0,
			}
		);

		this.scene.onBeforeStepObservable.add(() => {
			const velocity = this.ball.physicsImpostor!.getLinearVelocity();
			velocity!.y = 0; // Bloquer l'axe Y
			velocity!.normalize().scaleInPlace(10); // Vitesse constante
			this.ball.physicsImpostor!.setLinearVelocity(velocity);
		});

		this.CreateAction();
		//this.addBallTrail();
		this.handleCollision(topWall, bottomWall);
		this.handleGoalCollisions(leftGoal, rightGoal);


	}

	private handleGoalCollisions(leftGoal: AbstractMesh, rightGoal: AbstractMesh): void {
		// Handle left goal (player 2 scores)
		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			leftGoal.physicsImpostor!,
			() => this.handleGoalScored(2)
		);

		// Handle right goal (player 1 scores)
		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			rightGoal.physicsImpostor!,
			() => this.handleGoalScored(1)
		);
	}

	private handleGoalScored(scoringPlayer: number): void {
		// Trigger explosion at ball position
		this.explosionEffect.emitter = this.ball.position.clone();
		this.explosionEffect.start();

		// Stop after 1 second
		setTimeout(() => {
			this.explosionEffect.stop();
		}, 1000);

		// Hide ball temporarily
		this.ball.setEnabled(false);

		// Update score
		if (scoringPlayer === 1) {
			this.player1Score++;
		} else {
			this.player2Score++;
		}
		this.scoreText.text = `${this.player1Score} - ${this.player2Score}`;

		// Reset ball after explosion
		setTimeout(() => {
			this.resetBall();
			this.ball.setEnabled(true);
		}, 1500);

	}

	private resetBall(): void {
		// Stop ball and center position
		this.ball.position = new Vector3(0, 0.5, 0);
		this.ball.physicsImpostor!.setLinearVelocity(Vector3.Zero());

		// Start countdown again
		this.countDown();
	}

	private handleCollision(topWall: AbstractMesh, bottomWall: AbstractMesh): void {
		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			this.paddle1.physicsImpostor!,
			(collider, collidedAgainst, point) => {
				this.handlePaddleCollision(collidedAgainst);
			}
		);
		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			this.paddle2.physicsImpostor!,
			(collider, collidedAgainst, point) => {
				this.handlePaddleCollision(collidedAgainst);
			}
		);

		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			topWall.physicsImpostor!,
			(collider, collidedAgainst, point) => {
				const velocity = this.ball.physicsImpostor!.getLinearVelocity();
				if (velocity) {
					velocity.x *= -1;
					this.ball.physicsImpostor!.setLinearVelocity(velocity);
				}
			}
		);

		this.ball.physicsImpostor!.registerOnPhysicsCollide(
			bottomWall.physicsImpostor!,
			(collider, collidedAgainst, point) => {
				const velocity = this.ball.physicsImpostor!.getLinearVelocity();
				if (velocity) {
					velocity.x *= -1; 
					this.ball.physicsImpostor!.setLinearVelocity(velocity);
				}
			}
		);
	}

	private handlePaddleCollision(paddle: PhysicsImpostor) {
		const paddleMesh = paddle.object as AbstractMesh;
		const paddleHeight = paddleMesh.scaling.x;
		const hitPosition = (this.ball.position.x - paddleMesh.position.x) / (paddleHeight / 2);
		// Facteur d'impact entre -1 (bas) et 1 (haut)
		const impactFactor = Math.max(-1, Math.min(1, hitPosition));
		const currentVelocity = this.ball.physicsImpostor!.getLinearVelocity();
		if (!currentVelocity) return;

		const newVelocity = new Vector3(
			impactFactor * 2.5, 
			0,
			-currentVelocity.z,
		);
		let speed = currentVelocity.length() * 1.1;
		if (speed < 10)
			speed = 10;
		if (speed > 35)
			speed = 35;
		console.log("speed = ", speed);
		newVelocity.normalize().scaleInPlace(speed);

		this.ball.physicsImpostor!.setLinearVelocity(newVelocity);
	}

	CreateAction(): void {
		// Configuration des entrées clavier
		this.scene.onKeyboardObservable.add((kbInfo) => {
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
				// Limites de déplacement pour les raquettes
				const minX = -3.75;  // -5 + 1 (moitié de la largeur)
				const maxX = 3.75;   // 5 - 1

				// Contrôles raquette 1
				if (kbInfo.event.key === "w" || kbInfo.event.key === "W") {
					this.paddle1.position.x = Math.min(this.paddle1.position.x + 0.4, maxX);
				}
				if (kbInfo.event.key === "s" || kbInfo.event.key === "S") {
					this.paddle1.position.x = Math.max(this.paddle1.position.x - 0.4, minX);
				}

				// Contrôles raquette 2
				if (this.local === true)
				{
					if (kbInfo.event.key === "ArrowUp") {
						this.paddle2.position.x = Math.min(this.paddle2.position.x + 0.4, maxX);
					}
					if (kbInfo.event.key === "ArrowDown") {
						this.paddle2.position.x = Math.max(this.paddle2.position.x - 0.4, minX);
					}
				}
			}
		});
	}

	private addBallTrail(): void {
		const trail = new TrailMesh("ballTrail", this.ball, this.scene, 0.3, 30, true);
		const trailMaterial = new StandardMaterial("trailMat", this.scene);
		trailMaterial.emissiveColor = Color3.Red();
		trail.material = trailMaterial;
	}

	private createExplosionEffect(): void {
		// Create particle system
		this.explosionEffect = new ParticleSystem("explosion", 1000, this.scene);

		// Texture for particles
		this.explosionEffect.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);

		// Where the particles come from
		this.explosionEffect.emitter = new Vector3(0, 0, 0);
		this.explosionEffect.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
		this.explosionEffect.maxEmitBox = new Vector3(0.5, 0.5, 0.5);

		// Colors
		this.explosionEffect.color1 = new Color4(1, 0.8, 0, 1.0);
		this.explosionEffect.color2 = new Color4(1, 0.2, 0, 1.0);
		this.explosionEffect.colorDead = new Color4(0, 0, 0, 0.0);

		// Size
		this.explosionEffect.minSize = 0.1;
		this.explosionEffect.maxSize = 0.5;

		// Lifetime
		this.explosionEffect.minLifeTime = 0.3;
		this.explosionEffect.maxLifeTime = 0.8;

		// Emission
		this.explosionEffect.emitRate = 1000;
		this.explosionEffect.blendMode = ParticleSystem.BLENDMODE_ONEONE;

		// Speed
		this.explosionEffect.minEmitPower = 2;
		this.explosionEffect.maxEmitPower = 4;
		this.explosionEffect.gravity = new Vector3(0, -2, 0);

		// Angular speed
		this.explosionEffect.minAngularSpeed = 0;
		this.explosionEffect.maxAngularSpeed = Math.PI;

		// Disable by default
		this.explosionEffect.stop();
	}

	// Function to display the win screen
	private showWinScreen(winner: string): void {
		const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

		// Create a fullscreen rectangle for background
		const backgroundRect = new GUI.Rectangle();
		backgroundRect.width = "100%";
		backgroundRect.height = "100%";
		backgroundRect.background = "#000000CC"; // black with 80% opacity (CC = alpha)
		backgroundRect.thickness = 0;
		backgroundRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		backgroundRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		advancedTexture.addControl(backgroundRect);

		// Create a text block for the win message
		const winText = new GUI.TextBlock();
		winText.text = winner + " Win!";
		winText.color = "white";
		winText.fontSize = 48;
		winText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		winText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		advancedTexture.addControl(winText);



		// Create a button to allow restarting the game
		const restartButton = GUI.Button.CreateSimpleButton("restartButton", "Restart Game");
		restartButton.width = "200px";
		restartButton.height = "50px";
		restartButton.color = "white";
		restartButton.cornerRadius = 20;
		restartButton.background = "green";
		restartButton.top = "100px";  // Position the button a bit below the win message
		restartButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		restartButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

		// Attach click event to the button
		restartButton.onPointerUpObservable.add(() => {
			// Clear UI elements (if you have other screens, manage them accordingly)
			advancedTexture.dispose();
			this.player2Score = 0;
			this.player1Score = 0;
			this.win = false;

			// Reset ball and paddles
			this.resetBall();
			this.paddle1.position.x = 0;
			this.paddle2.position.x = 0;

			// to be redone 
		});

		advancedTexture.addControl(restartButton);
	}

	private predictBall():number{
		let dirX = 0;
		let dirZ = 0;
		dirZ = this.ball.physicsImpostor!.getLinearVelocity()?.z || 0;
		dirX = this.ball.position.x;
		if (dirZ > 0)
			dirX = 0;
		this.predictDir = dirX;
		return dirX;
	}

	private predictBallXAtZ(targetZ: number): number {
		const currentPos = this.ball.position.clone();
		const velocity = this.ball.physicsImpostor!.getLinearVelocity();
		
		if (!velocity || velocity.z === 0) return currentPos.x;
	
		// Temps nécessaire pour atteindre la cible Z
		const timeToTarget = (targetZ - currentPos.z) / velocity.z;
		if (timeToTarget <= 0) return currentPos.x;
	
		let remainingTime = timeToTarget;
		let predictedX = currentPos.x;
		let currentVx = velocity.x;
		const wallsX: [number, number] = [-5, 5]; // Murs gauche/droite
	
		while (remainingTime > 0 && currentVx !== 0) {
			// Calcul du prochain mur à heurter
			const [leftWall, rightWall] = wallsX;
			const movingRight = currentVx > 0;
			
			// Distance jusqu'au mur et temps de collision
			const distanceToWall = movingRight 
				? rightWall - predictedX 
				: leftWall - predictedX;
				
			const timeToWall = distanceToWall / currentVx;
	
			if (timeToWall > remainingTime) {
				// Pas de collision avant la cible Z
				predictedX += currentVx * remainingTime;
				break;
			} else {
				// Collision avec le mur
				predictedX += currentVx * timeToWall;
				remainingTime -= timeToWall;
				currentVx *= -1; // Inversion de la direction X
			}
		}
	
		return predictedX;
	}

	private playAI():void
	{
		const minX = -3.75;
		const maxX = 3.75;
		const dirDiff = this.paddle2.position.x - this.predictDir;
		if (dirDiff + 0.4 < 0) {
			this.paddle2.position.x = Math.min(this.paddle2.position.x + 0.4, maxX);
		}
		else if (dirDiff - 0.4 > 0) {
			this.paddle2.position.x = Math.max(this.paddle2.position.x - 0.4, minX);
		}
	}

	stop(): void {
		console.log("Arrêt du jeu");
		// Arrêter la boucle de rendu
		this.engine.stopRenderLoop();
		// Libérer les ressources de la scène et du moteur
		this.scene.dispose();
		this.engine.dispose();
	}
}

let currentGameInstance: FirstPersonController | null = null;

const gameElement = document.getElementById('game');
if (gameElement) {
    gameElement.addEventListener('stop', () => {
        console.log("Stop event received");
        if (currentGameInstance) {
            currentGameInstance.stop();
            currentGameInstance = null; // Nullify the instance after stopping
        }
    });
}

function createNewGame(isLocal:boolean): void {
    // If there is an existing game instance, stop and delete it
	console.log("going to script new");
    if (currentGameInstance) {
        currentGameInstance.stop();
    }

    // Create a new game instance
    currentGameInstance = new FirstPersonController(isLocal);
}

document.addEventListener('click', (event) => {
	const target = event.target as HTMLElement;
	if (target && target.id === 'soloButton') {
		createNewGame(false);
	}
});

document.addEventListener('click', (event) => {
	const target = event.target as HTMLElement;
	if (target && target.id === 'buttonValidation') {
		createNewGame(true);
	}
});
