document.addEventListener("DOMContentLoaded", () => {
  const holes = document.querySelectorAll(".hole");
  const scoreText = document.getElementById("score");
  const timeText = document.getElementById("time");
  const bestScoreText = document.getElementById("bestScore");
  const messageText = document.getElementById("message");
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");

  let score = 0;
  let timeLeft = 30;
  let currentMole = -1;
  let gameTimer = null;
  let moleTimer = null;
  let isPlaying = false;

  // localStorageが使えないブラウザでも、ゲーム本体は動くようにします。
  function loadBestScore() {
    try {
      return Number(localStorage.getItem("whackBestScore")) || 0;
    } catch (error) {
      return 0;
    }
  }

  function saveBestScore(newBestScore) {
    try {
      localStorage.setItem("whackBestScore", newBestScore);
    } catch (error) {
      // 保存できなくてもゲームは続けられるので、ここでは何もしません。
    }
  }

  // 最高スコアはブラウザに保存して、次に開いたときも見られるようにします。
  let bestScore = loadBestScore();

  function updateScreen() {
    scoreText.textContent = score;
    timeText.textContent = timeLeft;
    bestScoreText.textContent = bestScore;
  }

  function hideMole() {
    holes.forEach((hole) => {
      hole.classList.remove("mole");
    });
    currentMole = -1;
  }

  function showMole() {
    hideMole();

    // 0から8までの数字をランダムに選び、9マスのどこかに出します。
    const randomIndex = Math.floor(Math.random() * holes.length);
    holes[randomIndex].classList.add("mole");
    currentMole = randomIndex;
  }

  function finishGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    hideMole();

    if (score > bestScore) {
      bestScore = score;
      saveBestScore(bestScore);
      messageText.textContent = `終了！最終スコアは ${score} 点です。最高スコア更新！`;
    } else {
      messageText.textContent = `終了！最終スコアは ${score} 点です。`;
    }

    startButton.disabled = false;
    updateScreen();
  }

  function startGame() {
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    score = 0;
    timeLeft = 30;
    isPlaying = true;
    messageText.textContent = "モグラをタップ！";
    startButton.disabled = true;
    updateScreen();
    showMole();

    // 0.8秒ごとにモグラの場所を変えます。
    moleTimer = setInterval(showMole, 800);

    // 1秒ごとに残り時間を減らします。
    gameTimer = setInterval(() => {
      timeLeft -= 1;
      updateScreen();

      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  holes.forEach((hole, index) => {
    hole.addEventListener("click", () => {
      if (!isPlaying || index !== currentMole) {
        return;
      }

      score += 1;
      hole.classList.add("hit");
      updateScreen();
      showMole();

      // 叩いた時の小さなアニメーションをすぐ外して、次も動くようにします。
      setTimeout(() => {
        hole.classList.remove("hit");
      }, 160);
    });
  });

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  updateScreen();
});
