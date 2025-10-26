// script.js
// Depends on data/characters.js being loaded first.

(function(){
  // 🎀 Link to your Google Form for entries
  const GOOGLE_FORM = "https://forms.gle/SsUmm7B1GuHGMLT87";

  // ✨ MANUAL WINNER LIST ✨
  // Add winners here manually:
  const MANUAL_WINNERS = {
    14: "_TheRatKing_",   // Example — Day 14 winner
    15: "Hibycus",          // Leave blank until known
    16: "JaxMaw",
    17: "Priffu",
    18: "Invalid_Name",
    19: "Luckyhope56",
    20: "Jackofsometrades",
    21: "Rye_Bread1234",
    22: "SeraphimGutz",
    23: "SmileySpace",
    24: "CharlotteFantasy",
    25: "iletaituneforet",
    26: "",
    27: "",
    28: "",
    29: "",
    30: "",
    31: ""
  };

  function getPSTNow(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    return new Date(str);
  }

  const START_DAY = 14;
  const END_DAY = 31;
  const calendarEl = document.getElementById('calendar');
  const countdownEl = document.getElementById('countdown');

  // 🌸 Sparkle effect
  function createSparkles(target){
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      sparkleContainer.appendChild(s);
    }
    target.appendChild(sparkleContainer);
    setTimeout(() => sparkleContainer.remove(), 1500);
  }

  // 🎃 Calendar builder
  function buildCalendar(){
    if(!calendarEl) return;
    calendarEl.innerHTML = '';

    for(let d = START_DAY; d <= END_DAY; d++){
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.day = d;

      const daylabel = document.createElement('div');
      daylabel.className = 'daylabel';
      daylabel.textContent = `${d}th`;
      card.appendChild(daylabel);

      const img = document.createElement('img');
      const meta = window.FAENOIR_BY_DAY[d] || {};
      const sil = meta.silhouette || `silhouettes/day${d}.png`;
      const real = meta.image || `images/day${d}.png`;
      img.src = sil;
      img.alt = `day ${d}`;
      card.appendChild(img);

      const now = getPSTNow();
      const pstDay = now.getDate();
      if(pstDay === d){
        card.classList.add('today');
        const tag = document.createElement('div');
        tag.className = 'today-tag';
        tag.textContent = 'Today 🎃';
        card.appendChild(tag);
      }

      card.addEventListener('click', ()=>{
        window.location.href = `character.html?day=${d}`;
      });

      calendarEl.appendChild(card);
    }
    refreshCards();
  }

  function isUnlocked(day){
    const now = getPSTNow();
    const month = now.getMonth() + 1;
    const pstDay = now.getDate();
    if (month < 10 || (month === 10 && pstDay < START_DAY)) return false;
    if(month === 10 && pstDay >= day) return true;
    if(month > 10) return true;
    return false;
  }

  function revealCard(card, newSrc){
    const img = card.querySelector('img');
    img.classList.add('reveal-fade');
    createSparkles(card);
    setTimeout(()=>{
      img.src = newSrc;
      img.classList.remove('reveal-fade');
    }, 400);
  }

  function refreshCards(){
    const cards = document.querySelectorAll('.card');
    cards.forEach(card=>{
      const d = parseInt(card.dataset.day,10);
      const img = card.querySelector('img');
      const data = window.FAENOIR_BY_DAY[d] || {};
      const sil = data.silhouette || `silhouettes/day${d}.png`;
      const real = data.image || `images/day${d}.png`;
      const unlocked = isUnlocked(d);

      if(unlocked && img.src.includes('silhouettes/')){
        card.classList.remove('locked');
        revealCard(card, real);
      } else if(!unlocked && !img.src.includes('silhouettes/')){
        card.classList.add('locked');
        img.src = sil;
      }
    });
  }

  // 🕛 Countdown
  function updateCountdown(){
    if(!countdownEl) return;
    const now = getPSTNow();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const eventStart = new Date(`${year}-10-${String(START_DAY).padStart(2,'0')}T00:00:00-07:00`);
    const nowTS = now.getTime();

    if (month < 10 || (month === 10 && day < START_DAY)) {
      const diff = eventStart - nowTS;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      countdownEl.textContent = `🎀 Event starts in ${days}d ${hrs}h ${mins}m ${secs}s`;
      return;
    }

    const nextMidnight = new Date(now);
    nextMidnight.setDate(day + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const diff = nextMidnight - nowTS;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `⏰ Next unlock in ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  function initIndex(){
    buildCalendar();
    setInterval(()=>{
      updateCountdown();
      refreshCards();
    }, 1000);
    updateCountdown();
  }

  // 🦋 Character page
  async function initCharacterPage(){
    const params = new URLSearchParams(window.location.search);
    const day = parseInt(params.get('day'),10);
    if(!day || !window.FAENOIR_BY_DAY[day]){
      document.getElementById('char-title').textContent = 'Raffle — Not Found';
      return;
    }

    const data = window.FAENOIR_BY_DAY[day];
    const unlocked = isUnlocked(day);

    document.getElementById('char-title').textContent = `${data.title || 'Raffle'} — Day ${day}`;
    document.getElementById('char-image').src = unlocked ? data.image : data.silhouette;
    document.getElementById('ml-number').textContent = data.mlNumber || 'ML';
    document.getElementById('ml-link').href = data.toyhouse || '#';
    document.getElementById('toyhouse-link').href = data.toyhouse || '#';
    document.getElementById('designer').textContent = data.designer || '-';
    document.getElementById('species').textContent = data.species || '-';

    const traitsEl = document.getElementById('traits');
    traitsEl.innerHTML = '';
    (data.traits || []).forEach(t=>{
      const li = document.createElement('li');
      li.textContent = t;
      traitsEl.appendChild(li);
    });

    const enterBtn = document.getElementById('enter-button');
    const winnerBox = document.getElementById('winner-display');

    if(!unlocked){
      enterBtn.classList.add('hidden');
      const notice = document.createElement('p');
      notice.className = 'locked-notice';
      notice.textContent = `🔒 Unlocks on October ${day}th!`;
      document.querySelector('.character-right').appendChild(notice);
    }

    // 🎉 Manual Winner Display
    const winner = MANUAL_WINNERS[day];
    if (winner && winner.trim() !== "") {
      winnerBox.textContent = `🎉 Winner: ${winner}`;
      winnerBox.classList.remove('hidden');
      enterBtn.classList.add('hidden');
    }

    enterBtn.addEventListener('click', ()=>{
      window.open(GOOGLE_FORM, '_blank');
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('calendar')) initIndex();
    if(document.querySelector('.character-page')) initCharacterPage();
  });

  // 🕸️ Background music control
  document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-music');
    const toggle = document.getElementById('music-toggle');
    if (!audio || !toggle) return;

    const muted = localStorage.getItem('musicMuted') === 'true';
    audio.volume = 0.5;
    audio.muted = muted;
    toggle.textContent = muted ? '🔇' : '🔊';

    const tryPlay = () => {
      audio.play().catch(() => {});
      document.removeEventListener('click', tryPlay);
    };
    document.addEventListener('click', tryPlay);

    toggle.addEventListener('click', () => {
      audio.muted = !audio.muted;
      localStorage.setItem('musicMuted', audio.muted);
      toggle.textContent = audio.muted ? '🔇' : '🔊';
    });
  });
})();
