// Extrait de marburg.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
function switchAudience(audience) {
    const patSection = document.getElementById('section-patient');
    const hcwSection = document.getElementById('section-hcw');
    const tabPat = document.getElementById('tab-patient');
    const tabHcw = document.getElementById('tab-hcw');
    if (audience === 'patient') {
      patSection.style.display = '';
      hcwSection.style.display = 'none';
      tabPat.classList.add('active-patient');
      tabHcw.className = 'audience-tab';
      tabPat.setAttribute('aria-selected', 'true');
      tabHcw.setAttribute('aria-selected', 'false');
    } else {
      hcwSection.style.display = '';
      patSection.style.display = 'none';
      tabHcw.classList.add('active-hcw');
      tabPat.className = 'audience-tab';
      tabHcw.setAttribute('aria-selected', 'true');
      tabPat.setAttribute('aria-selected', 'false');
    }
  }
  function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    answer.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
  }
