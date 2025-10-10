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
        tag.style.fontSize='12px';
        tag.style.marginTop='6px';
        tag.textContent='Today';
        card.appendChild(tag);
      }

      card.addEventListener('click', ()=>{
        if(isUnlocked(d)){
          window.location.href = `character.html?day=${d}`;
        } else {
          card.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:300});
        }
      });

      calendarEl.appendChild(card);
    }
    refreshCards();
  }

  function isUnlocked(day){
    const now = getPSTNow();
    const month = now.getMonth() + 1;
    const pstDay = now.getDate();
    if(month === 10 && pstDay >= day) return true;
    if(month > 10) return true;
    return false;
  }

  function refreshCards(){
    const cards = document.querySelectorAll('.card');
    cards.forEach(card=>{
      const d = parseInt(card.dataset.day,10);
      const img = card.querySelector('img');
      const data = window.FAENOIR_BY_DAY[d] || {};
      const sil = data.silhouette || `silhouettes/day${d}.png`;
      const real = data.image || `images/day${d}.png`;
      if(isUnlocked(d)){
        card.classList.remove('locked');
        img.src = real;
      } else {
        card.classList.add('locked');
        img.src = sil;
      }
    });
  }

  function updateCountdown(){
    const now = getPSTNow();
    const nextPSTMidnight = new Date(now);
    nextPSTMidnight.setDate(now.getDate() + 1);
    nextPSTMidnight.setHours(0,0,0,0);
    const diff = Math.max(0, nextPSTMidnight - now);
    const hrs = Math.floor(diff / (1000*60*60));
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    if(countdownEl) countdownEl.textContent = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  function initIndex(){
    buildCalendar();
    setInterval(()=>{
      updateCountdown();
      refreshCards();
    },1000);
    updateCountdown();
  }

  async function initCharacterPage(){
    const params = new URLSearchParams(window.location.search);
    const day = parseInt(params.get('day'),10);
    if(!day || !window.FAENOIR_BY_DAY[day]){
      document.getElementById('char-title').textContent = 'Raffle — Not Found';
      return;
    }

    const data = window.FAENOIR_BY_DAY[day];
    document.getElementById('char-title').textContent = `${data.title} — Day ${day}`;
    const imgEl = document.getElementById('char-image');
    imgEl.src = isUnlocked(day) ? data.image : data.silhouette;

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
      entryResult.textContent = '';
      usernameInput.value = '';
      usernameInput.focus();
    });
    closeBtn.addEventListener('click', ()=>{
      modal.classList.add('hidden');
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
