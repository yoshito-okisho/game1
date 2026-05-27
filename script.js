document.addEventListener("DOMContentLoaded", () => {
  const holes = document.querySelectorAll(".hole");
  const scoreText = document.getElementById("score");
  const timeText = document.getElementById("time");
  const bestScoreText = document.getElementById("bestScore");
  const messageText = document.getElementById("message");
  const startButton = document.getElementById("startButton");
  const restartButton = document.getElementById("restartButton");
  const congratsScreen = document.getElementById("congratsScreen");
  const closeCongratsButton = document.getElementById("closeCongratsButton");

  let score = 0;
  let timeLeft = 30;
  let currentMole = -1;
  let currentMoleType = "";
  let bossHitsLeft = 0;
  let gameTimer = null;
  let moleTimer = null;
  let isPlaying = false;
  const moleTypes = {
    zako: {
      name: "雑魚モグラ",
      image: "assets/zako-mole.jpg",
      hitsToDefeat: 1
    },
    boss: {
      name: "ボスモグラ",
      image: "assets/boss-mole.jpg",
      hitsToDefeat: 3
    }
  };

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

  function hideCongratsScreen() {
    congratsScreen.classList.add("hidden");
  }

  function showCongratsScreen() {
    congratsScreen.classList.remove("hidden");
  }

  function hideMole() {
    holes.forEach((hole, index) => {
      const moleImage = hole.querySelector(".mole-image");
      const bossHp = hole.querySelector(".boss-hp");

      hole.classList.remove("mole", "zako", "boss", "hit");
      hole.setAttribute("aria-label", `${index + 1}番のマス`);
      moleImage.removeAttribute("src");
      moleImage.alt = "";
      bossHp.textContent = "";
    });
    currentMole = -1;
    currentMoleType = "";
    bossHitsLeft = 0;
  }

  function showMole() {
    hideMole();

    // 0から8までの数字をランダムに選び、9マスのどこかに出します。
    const randomIndex = Math.floor(Math.random() * holes.length);
    // ボスは少しレアにして、出たら3回叩くまで倒せないようにします。
    const moleType = Math.random() < 0.25 ? "boss" : "zako";
    const mole = moleTypes[moleType];
    const hole = holes[randomIndex];
    const moleImage = hole.querySelector(".mole-image");
    const bossHp = hole.querySelector(".boss-hp");

    hole.classList.add("mole", moleType);
    hole.setAttribute("aria-label", `${mole.name}が出ているマス`);
    moleImage.src = mole.image;
    moleImage.alt = mole.name;
    currentMole = randomIndex;
    currentMoleType = moleType;
    bossHitsLeft = mole.hitsToDefeat;

    if (moleType === "boss") {
      bossHp.textContent = `あと${bossHitsLeft}`;
      messageText.textContent = "ボスモグラは3回叩いて倒そう！";
    } else {
      messageText.textContent = "雑魚モグラは1回で倒せる！";
    }
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

    // 40点以上取れたときだけ、お祝い画面を表示します。
    if (score >= 40) {
      showCongratsScreen();
    }
  }

  function startGame() {
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    hideCongratsScreen();
    hideMole();
    score = 0;
    timeLeft = 30;
    isPlaying = true;
    messageText.textContent = "モグラをタップ！";
    startButton.disabled = true;
    updateScreen();
    showMole();

    // 雑魚はすぐ場所を変えます。ボスは倒すまで同じ場所に残します。
    moleTimer = setInterval(() => {
      if (currentMoleType !== "boss") {
        showMole();
      }
    }, 850);

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
      const bossHp = hole.querySelector(".boss-hp");

      hole.classList.add("hit");
      updateScreen();

      if (currentMoleType === "boss") {
        bossHitsLeft -= 1;

        if (bossHitsLeft > 0) {
          bossHp.textContent = `あと${bossHitsLeft}`;
          messageText.textContent = `ボスモグラに命中！あと${bossHitsLeft}回！`;
        } else {
          messageText.textContent = "ボスモグラを倒した！";
          showMole();
        }
      } else {
        messageText.textContent = "雑魚モグラを倒した！";
        showMole();
      }

      // 叩いた時の小さなアニメーションをすぐ外して、次も動くようにします。
      setTimeout(() => {
        hole.classList.remove("hit");
      }, 160);
    });
  });

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  closeCongratsButton.addEventListener("click", startGame);
  updateScreen();
});
