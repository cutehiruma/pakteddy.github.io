(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  const nameScreen = document.getElementById("name-screen");
  const startScreen = document.getElementById("start-screen");
  const quizModal = document.getElementById("quiz-modal");
  const playerNameInput = document.getElementById("player-name-input");
  const displayName = document.getElementById("display-name-start");
  const endNameLose = document.getElementById("end-name-lose");
  const endNameWin = document.getElementById("end-name-win");
  const levelDisplay = document.getElementById("level-display");
  const scoreDisplay = document.getElementById("score-display");
  const livesDisplay = document.getElementById("lives-display");
  const touchControls = document.getElementById("touch-controls");

  const vocabulary = [
    ["apple", "apel"],
    ["brave", "berani"],
    ["bright", "cerah"],
    ["careful", "hati-hati"],
    ["clever", "pintar"],
    ["cloud", "awan"],
    ["dangerous", "berbahaya"],
    ["early", "awal"],
    ["empty", "kosong"],
    ["famous", "terkenal"],
    ["forest", "hutan"],
    ["friendly", "ramah"],
    ["happy", "senang"],
    ["healthy", "sehat"],
    ["journey", "perjalanan"],
    ["kind", "baik hati"],
    ["laugh", "tertawa"],
    ["mountain", "gunung"],
    ["quiet", "tenang"],
    ["strong", "kuat"],
    ["adventure", "petualangan"],
    ["ancient", "kuno"],
    ["curious", "penasaran"],
    ["discover", "menemukan"],
    ["excellent", "sangat baik"],
    ["freedom", "kebebasan"],
    ["generous", "murah hati"],
    ["honest", "jujur"],
    ["improve", "meningkatkan"],
    ["knowledge", "pengetahuan"],
    ["patient", "sabar"],
    ["protect", "melindungi"],
    ["responsible", "bertanggung jawab"],
    ["similar", "mirip"],
    ["suddenly", "tiba-tiba"],
    ["valuable", "berharga"],
    ["whisper", "berbisik"],
    ["wonderful", "luar biasa"],
    ["challenge", "tantangan"],
    ["confident", "percaya diri"],
  ];

  const zones = [
    {
      name: "Misty Meadow",
      sky: "#9fe3d2",
      ground: "#3d8b70",
      accent: "#f8c15c",
    },
    {
      name: "Crystal Caves",
      sky: "#8bb8db",
      ground: "#425d87",
      accent: "#a8f0e8",
    },
    {
      name: "Sunken Library",
      sky: "#d7a978",
      ground: "#805044",
      accent: "#ffe18a",
    },
    {
      name: "Cloud Kingdom",
      sky: "#b7c5f2",
      ground: "#5864a3",
      accent: "#ffffff",
    },
    {
      name: "Wordsmith Temple",
      sky: "#e99375",
      ground: "#693e5d",
      accent: "#ffd166",
    },
  ];

  const state = {
    playerName: "Player",
    level: 1,
    score: 0,
    lives: 3,
    wordIndex: 0,
    isPlaying: false,
    quizOpen: false,
    keys: { left: false, right: false, jump: false },
    player: {
      x: 80,
      y: 350,
      width: 42,
      height: 52,
      velocityY: 0,
      grounded: true,
    },
    stars: [],
    obstacles: [],
    collectedStars: 0,
    message: "",
    messageTimer: 0,
    camera: 0,
    challenge: 0,
    landmarks: [],
  };

  function setScreen(screen) {
    [
      nameScreen,
      startScreen,
      document.getElementById("level-complete-screen"),
      document.getElementById("game-over-screen"),
      document.getElementById("win-screen"),
    ].forEach((item) => item.classList.remove("active"));
    if (screen) screen.classList.add("active");
  }

  function updateHud() {
    levelDisplay.textContent = `Level ${state.level}`;
    scoreDisplay.textContent = `Score: ${state.score}  ★ ${state.collectedStars}`;
    livesDisplay.textContent = `Lives: ${"❤️".repeat(Math.max(0, state.lives))}`;
  }

  function createLevel() {
    const difficulty = state.level - 1;
    let seed = state.level * 101 + state.challenge * 37;
    const random = () => {
      const value = Math.sin(seed++) * 10000;
      return value - Math.floor(value);
    };
    const start = 260;
    const spacing = 190 + Math.floor(random() * 35);
    const count = 8 + difficulty + Math.floor(random() * 3);
    const finish = start + count * spacing + 190;
    const pattern =
      (state.challenge + state.level + Math.floor(random() * 3)) % 4;
    state.stars = [];
    state.obstacles = [];
    state.landmarks = [];
    let lastObstacleX = -Infinity;
    for (let index = 0; index < count; index += 1) {
      const x = start + index * spacing + Math.floor(random() * 36);
      let height = 325;
      if (pattern === 1) height = index % 2 === 0 ? 345 : 295;
      if (pattern === 2) height = 305 + Math.floor(random() * 45);
      if (pattern === 3) height = 335 - Math.min(index % 4, 3) * 13;
      state.stars.push({
        x,
        y: height,
        collected: false,
        spin: random() * Math.PI * 2,
      });
      const obstacleX = x - 55 + Math.floor(random() * 22);
      if (index > 0 && random() > 0.35 && obstacleX - lastObstacleX >= 220) {
        state.obstacles.push({
          x: obstacleX,
          y: 376,
          width: 22 + Math.floor(random() * 14),
          height: 18 + Math.floor(random() * 8),
          hit: false,
        });
        lastObstacleX = obstacleX;
      }
      if (random() > 0.45) {
        state.landmarks.push({
          x: x - 40 + Math.floor(random() * 80),
          kind: Math.floor(random() * 3),
          size: 24 + Math.floor(random() * 25),
        });
      }
    }
    state.finish = finish;
    state.message = `${zones[difficulty].name}  •  Kumpulkan bintang dan cari portal`;
    state.messageTimer = 180;
  }

  window.submitName = function submitName() {
    const enteredName = playerNameInput.value.trim();
    if (!enteredName) {
      playerNameInput.focus();
      playerNameInput.setCustomValidity("Masukkan nama terlebih dahulu.");
      playerNameInput.reportValidity();
      return;
    }
    playerNameInput.setCustomValidity("");
    state.playerName = enteredName;
    displayName.textContent = enteredName;
    endNameLose.textContent = enteredName;
    endNameWin.textContent = enteredName;
    setScreen(startScreen);
  };

  window.startGame = function startGame(level) {
    state.level = level;
    state.score = level === 1 ? 0 : state.score;
    state.lives = 3;
    state.wordIndex = (level - 1) * 8;
    state.isPlaying = true;
    state.quizOpen = false;
    state.player.x = 80;
    state.player.y = 350;
    state.player.velocityY = 0;
    state.collectedStars = 0;
    state.camera = 0;
    state.challenge = 0;
    createLevel();
    setScreen(null);
    quizModal.classList.remove("active");
    touchControls.style.display = "flex";
    updateHud();
  };

  window.nextLevel = function nextLevel() {
    if (state.level >= 5) {
      showWin();
      return;
    }
    window.startGame(state.level + 1);
  };

  function showWin() {
    state.isPlaying = false;
    touchControls.style.display = "none";
    document.getElementById("final-score-win").textContent =
      `Score: ${state.score}`;
    setScreen(document.getElementById("win-screen"));
  }

  function showGameOver() {
    state.isPlaying = false;
    touchControls.style.display = "none";
    document.getElementById("final-score-lose").textContent =
      `Score: ${state.score}`;
    setScreen(document.getElementById("game-over-screen"));
  }

  function openQuiz() {
    const current = vocabulary[state.wordIndex % vocabulary.length];
    const choices = [current[1]];
    while (choices.length < 3) {
      const candidate =
        vocabulary[Math.floor(Math.random() * vocabulary.length)][1];
      if (!choices.includes(candidate)) choices.push(candidate);
    }
    choices.sort(() => Math.random() - 0.5);
    document.getElementById("quiz-word-text").textContent = current[0];
    const options = document.getElementById("quiz-options");
    options.innerHTML = "";
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuiz(choice === current[1]));
      options.appendChild(button);
    });
    state.quizOpen = true;
    quizModal.classList.add("active");
  }

  function answerQuiz(correct) {
    if (correct) state.score += 10;
    else state.lives -= 1;
    state.wordIndex += 1;
    state.quizOpen = false;
    quizModal.classList.remove("active");
    updateHud();
    if (state.lives <= 0) showGameOver();
    else if (state.wordIndex >= state.level * 8) {
      state.isPlaying = false;
      touchControls.style.display = "none";
      setScreen(document.getElementById("level-complete-screen"));
    } else {
      state.challenge += 1;
      state.player.x = 80;
      state.player.y = 350;
      state.player.velocityY = 0;
      state.camera = 0;
      createLevel();
    }
  }

  function update() {
    if (!state.isPlaying || state.quizOpen) return;
    const player = state.player;
    if (state.keys.left) player.x -= 4.5;
    if (state.keys.right) player.x += 4.5;
    if (state.keys.jump && player.grounded) {
      player.velocityY = -11;
      player.grounded = false;
    }
    player.velocityY += 0.5;
    player.y += player.velocityY;
    if (player.y >= 350) {
      player.y = 350;
      player.velocityY = 0;
      player.grounded = true;
    }
    player.x = Math.max(20, Math.min(state.finish, player.x));
    state.stars.forEach((star) => {
      if (
        !star.collected &&
        Math.abs(player.x + player.width / 2 - star.x) < 32 &&
        Math.abs(player.y + player.height / 2 - star.y) < 48
      ) {
        star.collected = true;
        state.collectedStars += 1;
        state.score += 5;
        state.message = "+5  Bintang kosakata!";
        state.messageTimer = 70;
        updateHud();
      }
    });
    state.obstacles.forEach((obstacle) => {
      const overlaps =
        player.x + player.width > obstacle.x &&
        player.x < obstacle.x + obstacle.width &&
        player.y + player.height > obstacle.y &&
        player.y < obstacle.y + obstacle.height;
      if (overlaps && !obstacle.hit) {
        obstacle.hit = true;
        state.lives -= 1;
        state.message = "Aduh! Lompat melewati rintangan.";
        state.messageTimer = 90;
        player.x = obstacle.x - player.width - 8;
        updateHud();
        if (state.lives <= 0) showGameOver();
      }
    });
    const cameraTarget = Math.max(0, player.x - 220);
    state.camera += (cameraTarget - state.camera) * 0.18;
    if (player.x >= state.finish) {
      player.x = 80;
      state.camera = 0;
      openQuiz();
    }
    if (state.messageTimer > 0) state.messageTimer -= 1;
  }

  function draw() {
    const zone = zones[state.level - 1];
    const camera = state.camera;
    context.fillStyle = zone.sky;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.28)";
    for (let cloud = 0; cloud < 7; cloud += 1) {
      const cloudX = (cloud * 180 - camera * 0.18) % 920;
      context.beginPath();
      context.arc(cloudX, 85 + (cloud % 3) * 28, 24, 0, Math.PI * 2);
      context.arc(cloudX + 28, 85 + (cloud % 3) * 28, 32, 0, Math.PI * 2);
      context.arc(cloudX + 62, 88 + (cloud % 3) * 28, 22, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = zone.ground;
    context.fillRect(0, 402, canvas.width, 48);
    state.landmarks.forEach((landmark) => {
      const x = landmark.x - camera;
      const size = landmark.size;
      if (landmark.kind === 0) {
        context.fillStyle = "#704b35";
        context.fillRect(x - 5, 385 - size, 10, size);
        context.fillStyle = zone.accent;
        context.beginPath();
        context.arc(x, 373 - size, size * 0.65, 0, Math.PI * 2);
        context.fill();
      } else if (landmark.kind === 1) {
        context.fillStyle = "rgba(255, 255, 255, 0.35)";
        context.beginPath();
        context.moveTo(x, 388 - size * 1.7);
        context.lineTo(x + size * 0.7, 388);
        context.lineTo(x - size * 0.7, 388);
        context.closePath();
        context.fill();
      } else {
        context.fillStyle = "#8c5a44";
        context.fillRect(
          x - size * 0.65,
          380 - size * 0.7,
          size * 1.3,
          size * 0.7,
        );
        context.fillStyle = zone.accent;
        context.fillRect(
          x - size * 0.35,
          388 - size * 0.5,
          size * 0.7,
          size * 0.25,
        );
      }
    });
    context.fillStyle = zone.accent;
    context.beginPath();
    context.arc(730, 72, 34, 0, Math.PI * 2);
    context.fill();
    state.stars.forEach((star) => {
      if (star.collected) return;
      const x = star.x - camera;
      context.save();
      context.translate(x, star.y);
      context.rotate(performance.now() / 600 + star.spin);
      context.fillStyle = "#fff3a3";
      context.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const radius = point % 2 === 0 ? 13 : 5;
        const angle = -Math.PI / 2 + (point * Math.PI) / 5;
        context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      context.closePath();
      context.fill();
      context.restore();
    });
    state.obstacles.forEach((obstacle) => {
      context.fillStyle = obstacle.hit ? "#8d99ae" : "#e76f51";
      context.fillRect(
        obstacle.x - camera,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      );
      context.fillStyle = "#5c2d24";
      context.fillRect(obstacle.x - camera + 5, obstacle.y + 7, 18, 5);
    });
    const portalX = state.finish - camera;
    context.strokeStyle = zone.accent;
    context.lineWidth = 8;
    context.beginPath();
    context.arc(portalX, 365, 32, Math.PI, 0);
    context.stroke();
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.font = "bold 13px Segoe UI";
    context.fillText("PORTAL", portalX - 25, 340);
    context.fillStyle = "#ef476f";
    context.fillRect(
      state.player.x - camera,
      state.player.y,
      state.player.width,
      state.player.height,
    );
    context.fillStyle = "#2c3e50";
    context.fillRect(state.player.x - camera + 8, state.player.y + 12, 7, 7);
    context.fillRect(state.player.x - camera + 27, state.player.y + 12, 7, 7);
    context.fillStyle = "rgba(24, 35, 52, 0.78)";
    context.fillRect(18, 42, 350, 34);
    context.fillStyle = "#fff";
    context.font = "bold 16px Segoe UI";
    context.fillText(zone.name, 32, 64);
    if (state.messageTimer > 0) {
      context.fillStyle = "rgba(24, 35, 52, 0.82)";
      context.fillRect(220, 370, 360, 35);
      context.fillStyle = "#fff";
      context.font = "bold 15px Segoe UI";
      context.textAlign = "center";
      context.fillText(state.message, 400, 393);
      context.textAlign = "left";
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function bindControls() {
    const controlMap = {
      "btn-left": "left",
      "btn-right": "right",
      "btn-jump": "jump",
    };
    Object.entries(controlMap).forEach(([id, key]) => {
      const button = document.getElementById(id);
      button.addEventListener("pointerdown", () => {
        state.keys[key] = true;
      });
      button.addEventListener("pointerup", () => {
        state.keys[key] = false;
      });
      button.addEventListener("pointerleave", () => {
        state.keys[key] = false;
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") state.keys.left = true;
      if (event.key === "ArrowRight") state.keys.right = true;
      if (event.key === "ArrowUp" || event.key === " ") state.keys.jump = true;
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "ArrowLeft") state.keys.left = false;
      if (event.key === "ArrowRight") state.keys.right = false;
      if (event.key === "ArrowUp" || event.key === " ") state.keys.jump = false;
    });
  }

  bindControls();
  updateHud();
  loop();
})();
