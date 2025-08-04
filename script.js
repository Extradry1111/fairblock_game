document.addEventListener('DOMContentLoaded', () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDy4w3ZuMwA01k4o3F-N7ew6gKnRMi3xTE",
    authDomain: "fairblock-b7f0f.firebaseapp.com",
    projectId: "fairblock-b7f0f",
    storageBucket: "fairblock-b7f0f.appspot.com",
    messagingSenderId: "284701781928",
    appId: "1:284701781928:web:2a5a1ebe7071244e29b79d"
  };

  // Инициализация Firebase
  firebase.initializeApp(firebaseConfig);

  // Инициализация Firestore
  const db = firebase.firestore();

  let score = 0, timeLeft = 30, gameInterval, moleTimeout;
  const holes = document.querySelectorAll('.hole');
  const scoreDisplay = document.getElementById('score');
  const timeDisplay = document.getElementById('time');
  const gameOverScreen = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const startBtn = document.getElementById('startBtn');
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const leaderboardScreen = document.getElementById('leaderboard');
  const leaderboardList = document.getElementById('leaderboardList');
  const backBtn = document.getElementById('backBtn');
  const nameForm = document.getElementById('nameForm');
  const playerNameInput = document.getElementById('playerName');
  const playAgainBtn = document.getElementById('playAgainBtn');

  let currentMole = null;
  let scoreSubmitted = false; // чтоб нельзя было отправлять 2 раза

  function startGame(){
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = 'Score: 0';
    timeDisplay.textContent = 'Time: 30s';
    gameOverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    startBtn.classList.add('hidden');
    playAgainBtn.classList.add('hidden');
    nameForm.classList.add('hidden');
    playerNameInput.value = '';
    scoreSubmitted = false;
    clearTimeout(moleTimeout);
    if (currentMole) {
      currentMole.remove();
      currentMole = null;
    }
    gameInterval = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = `Time: ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
    popMole();
  }

  function popMole(){
    if(timeLeft <= 0) return;
    if(currentMole) {
      currentMole.remove();
      currentMole = null;
    }
    const index = Math.floor(Math.random() * holes.length);
    const hole = holes[index];
    const mole = document.createElement('div');
    mole.classList.add('mole');
    mole.addEventListener('click', () => {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      mole.remove();
      currentMole = null;
      clearTimeout(moleTimeout);
      popMole();
    });
    hole.appendChild(mole);
    currentMole = mole;
    moleTimeout = setTimeout(() => {
      if(currentMole) {
        currentMole.remove();
        currentMole = null;
      }
      popMole();
    }, 800);
  }

  function endGame(){
    clearInterval(gameInterval);
    clearTimeout(moleTimeout);
    if(currentMole) {
      currentMole.remove();
      currentMole = null;
    }
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
    startBtn.classList.add('hidden');
    playAgainBtn.classList.add('hidden');
    nameForm.classList.remove('hidden');
    playerNameInput.focus();
  }

  nameForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (scoreSubmitted) {
      alert('You already submitted your score!');
      return;
    }
    const playerName = playerNameInput.value.trim();
    if(!playerName) return alert('Please enter your name!');

    try {
      await db.collection('leaderboard').add({
        name: playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Score saved! You can check the leaderboard.');
      nameForm.classList.add('hidden');
      playAgainBtn.classList.remove('hidden');
      scoreSubmitted = true;
    } catch (error) {
      alert('Error saving score: ' + error.message);
    }
  });

  playAgainBtn.addEventListener('click', () => {
    startGame();
  });

  leaderboardBtn.addEventListener('click', showLeaderboard);

  backBtn.addEventListener('click', () => {
    leaderboardScreen.classList.add('hidden');
    startBtn.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
  });

  async function showLeaderboard(){
    leaderboardScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    startBtn.classList.add('hidden');
    nameForm.classList.add('hidden');
    playAgainBtn.classList.add('hidden');

    leaderboardList.innerHTML = '<li>Loading...</li>';

    try {
      const snapshot = await db.collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(5)
        .get();

      if (snapshot.empty) {
        leaderboardList.innerHTML = '<li>No scores yet.</li>';
        return;
      }

      leaderboardList.innerHTML = '';
      let rank = 1;
      snapshot.forEach(doc => {
        const data = doc.data();
        leaderboardList.innerHTML += `<li>${rank}. <strong>${escapeHtml(data.name)}</strong>: ${data.score}</li>`;
        rank++;
      });
    } catch (error) {
      leaderboardList.innerHTML = '<li>Error loading leaderboard.</li>';
    }
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Vanta фон
  VANTA.WAVES({
    el: "body",
    mouseControls: true,
    touchControls: true,
    shininess: 50.0,
    waveHeight: 20.0,
    waveSpeed: 1.0,
    color: 0x0074D9,
    backgroundColor: 0x001f3f
  });

  startBtn.addEventListener('click', startGame);
});
