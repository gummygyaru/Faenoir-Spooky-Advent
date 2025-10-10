// script.js
// Depends on data/characters.js being loaded first.

(function(){
  // Utility: get PST now as a Date object by using toLocaleString in America/Los_Angeles
  function getPSTNow(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    return new Date(str);
  }

  // CONFIG
  const START_DAY = 14;
  const END_DAY = 31;
  const MONTH = 10; // October (1-index in JS? we use getMonth+1 when needed)
  const calendarEl = document.getElementById('calendar');
  const countdownEl = document.getElementById('countdown');

  // Build calendar (index.html)
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
      // default file paths: if not present, will be missing; use silhouette
      const sil = (meta.silhouette) ? meta.silhouette : `silhouettes/day${d}.png`;
      const real = (meta.image) ? meta.image : `images/day${d}.png`;
      img.src = sil;
      img.alt = `day ${d}`;
      card.appendChild(img);

      // mark today
      const now = getPSTNow();
      const pstDay = now.getDate();
      if(pstDay === d){
        card.classList.add('today');
        const tag = document.createElement('div'); tag.style.fontSize='12px'; tag.style.marginTop='6px'; tag.textContent='Today'; card.appendChild(tag);
      }

      // click behavior
      card.addEventListener('click', ()=>{
        const unlocked = isUnlocked(d);
        if(unlocked){
          // open character page
          window.location.href = `character.html?day=${d}`;
        } else {
          // do a little shake or pulse
          card.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:300});
        }
      });

      calendarEl.appendChild(card);
    }
    // apply initial unlocked state
    refreshCards();
  }

  // Determine unlocked based on PST current date
  function isUnlocked(day){
    const now = getPSTNow();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const pstDay = now.getDate();
    // Only unlock if the current month is October and current PST day >= day
    if(month === 10 && pstDay >= day) return true;
    // if someone views after October (or before), behave sensibly:
    // if month > 10 then all unlocked; if < 10 none unlocked.
    if(month > 10) return true;
    return false;
  }

  // Swap silhouettes for real images for unlocked cards
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

  // Countdown: time until next midnight PST (when next day unlocks)
  function updateCountdown(){
    const now = getPSTNow();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    // Next midnight in PST:
    const nextPSTMidnight = new Date(now);
    nextPSTMidnight.setDate(day + 1);
    nextPSTMidnight.setHours(0,0,0,0);
    // convert nextPSTMidnight (which is already in local representation of PST) to a Date object we can diff with current local time representation
    // to compute difference, use timestamps:
    const nowTS = now.getTime();
    const nextTS = nextPSTMidnight.getTime();
    let diff = Math.max(0, nextTS - nowTS);
    const hrs = Math.floor(diff / (1000*60*60));
    diff -= hrs * (1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins * (1000*60);
    const secs = Math.floor(diff / 1000);
    if(countdownEl) countdownEl.textContent = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  // Index page init
  function initIndex(){
    buildCalendar();
    // update every second
    setInterval(()=>{
      updateCountdown();
      refreshCards();
    },1000);
    updateCountdown();
  }

  // CHARACTER PAGE logic
  function initCharacterPage(){
    const params = new URLSearchParams(window.location.search);
    const day = parseInt(params.get('day'),10);
    if(!day || !window.FAENOIR_BY_DAY[day]) {
      // show a friendly message or redirect to index
      document.getElementById('char-title').textContent = 'Raffle — Not Found';
      return;
    }
    const data = window.FAENOIR_BY_DAY[day];
    // populate page
    document.getElementById('char-title').textContent = `${data.title} — Day ${day}`;
    const imgEl = document.getElementById('char-image');
    imgEl.src = (isUnlocked(day) ? data.image : data.silhouette);

    document.getElementById('ml-number').textContent = data.mlNumber || 'ML';
    document.getElementById('ml-link').href = data.toyhouse || '#';
    document.getElementById('toyhouse-link').href = data.toyhouse || '#';
    document.getElementById('designer').textContent = data.designer || '-';
    document.getElementById('species').textContent = data.species || '-';
    const traitsEl = document.getElementById('traits');
    traitsEl.innerHTML = '';
    (data.traits || []).forEach(t=>{
      const li = document.createElement('li'); li.textContent = t; traitsEl.appendChild(li);
    });

    // modal logic
    const enterBtn = document.getElementById('enter-button');
    const modal = document.getElementById('raffle-modal');
    const closeBtn = document.getElementById('modal-close');
    const submitBtn = document.getElementById('submit-entry');
    const usernameInput = document.getElementById('username-input');
    const entryResult = document.getElementById('entry-result');

    enterBtn.addEventListener('click', ()=>{
      modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
      entryResult.textContent = '';
      usernameInput.value = '';
      usernameInput.focus();
    });
    closeBtn.addEventListener('click', ()=>{ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); });

    // Submit: send to raffle webhook (Google Apps Script)
    submitBtn.addEventListener('click', async ()=>{
      const username = usernameInput.value.trim();
      if(!username){ entryResult.textContent = 'Please enter your Toyhouse username.'; entryResult.style.color='crimson'; return; }
      // show loading
      submitBtn.disabled = true; submitBtn.textContent = 'Submitting...';
      const payload = { day: day, username: username, timestamp: new Date().toISOString() };
      // webhook URL should be in data.raffleWebhook
      const webhook = data.raffleWebhook || '';
      if(!webhook){
        entryResult.textContent = 'Raffle not configured yet. Contact the organizer.';
        submitBtn.disabled = false; submitBtn.textContent = 'Submit';
        return;
      }
      try{
        const res = await fetch(webhook, {
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
  }

  // boot
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('calendar')) initIndex();
    if(document.querySelector('.character-page')) initCharacterPage();
  });

})();

