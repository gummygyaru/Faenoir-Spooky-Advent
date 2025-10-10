// script.js
// Depends on data/characters.js being loaded first.

(function(){
  const WEBHOOK = "https://script.google.com/macros/s/AKfycbzK00IQ8SHrOv6JOeqC7MKHXAK2mNgvzRAUnpKpFKvEmJ5Bkv2hqMXj3jtDEPiycbsc/exec";

  function getPSTNow(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    return new Date(str);
  }

  const START_DAY = 14;
  const END_DAY = 31;
  const calendarEl = document.getElementById('calendar');
  const countdownEl = document.getElementById('countdown');

  // 🌸 create sparkles for reveal animation
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

  // 🎃 Build main calendar
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

  // 🕓 Unlock logic
  function isUnlocked(day){
    const now = getPSTNow();
    const month = now.getMonth() + 1;
    const pstDay = now.getDate();
    if (month < 10 || (month === 10 && pstDay < START_DAY)) return false;
    if(month === 10 && pstDay >= day) return true;
    if(month > 10) return true;
    return false;
  }

  // 🌷 Reveal animation on unlock
  function revealCard(card, newSrc){
    const img = card.querySelector('img');
    img.classList.add('reveal-fade');
    createSparkles(card);
    setTimeout(()=>{
      img.src = newSrc;
      img.classList.remove('reveal-fade');
    }, 400);
  }

  // 🌸 Refresh cards daily
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

  // ⏳ Countdown — includes pre-event waiting
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

    const nextPSTMidnight = new Date(now);
    nextPSTMidnight.setDate(day + 1);
    nextPSTMidnight.setHours(0, 0, 0, 0);
    const diff = nextPSTMidnight - nowTS;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `⏰ Next unlock in ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  // 🪞 Init index page
  function initIndex(){
    buildCalendar();
    setInterval(()=>{
      updateCountdown();
      refreshCards();
    }, 1000);
    updateCountdown();
  }

  // 🦋 Character page logic
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
    const imgEl = document.getElementById('char-image');
    imgEl.src = unlocked ? data.image : data.silhouette;

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
    const modal = document.getElementById('raffle-modal');
    const closeBtn = document.getElementById('modal-close');
    const submitBtn = document.getElementById('submit-entry');
    const usernameInput = document.getElementById('username-input');
    const entryResult = document.getElementById('entry-result');
    const winnerBox = document.getElementById('winner-display');

    if(!unlocked){
      enterBtn.classList.add('hidden');
      const notice = document.createElement('p');
      notice.className = 'locked-notice';
      notice.textContent = `🔒 Unlocks on October ${day}th!`;
      document.querySelector('.character-right').appendChild(notice);
    }

    async function checkWinner(){
      try {
        const res = await fetch(`${WEBHOOK}?day=${day}`);
        const json = await res.json();
        if(json && json.winner){
          winnerBox.textContent = `🎉 Winner: ${json.winner}`;
          winnerBox.classList.remove('hidden');
          enterBtn.classList.add('hidden');
        }
      } catch(e){
        console.warn('No winner yet.');
      }
    }

    enterBtn.addEventListener('click', ()=>{
      modal.classList.remove('hidden');
      modal.classList.add('fade-in');
      entryResult.textContent = '';
      usernameInput.value = '';
      usernameInput.focus();
    });
    closeBtn.addEventListener('click', ()=>{
      modal.classList.add('hidden');
      modal.classList.remove('fade-in');
    });

    submitBtn.addEventListener('click', async ()=>{
      const username = usernameInput.value.trim();
      if(!username){
        entryResult.textContent = 'Please enter your Toyhouse username.';
        entryResult.style.color = 'crimson';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      const payload = { day, username, timestamp: new Date().toISOString() };
      try{
        const res = await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        entryResult.textContent = '🎉 You are entered! Good luck!';
        entryResult.style.color = 'green';
        submitBtn.textContent = 'Submitted';
      }catch(err){
        console.error(err);
        entryResult.textContent = 'Error submitting. Try again later.';
        entryResult.style.color = 'crimson';
        submitBtn.textContent = 'Submit';
      } finally {
        submitBtn.disabled = false;
      }
    });

    await checkWinner();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('calendar')) initIndex();
    if(document.querySelector('.character-page')) initCharacterPage();
  });
})();
