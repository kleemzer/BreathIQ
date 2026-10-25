// Extrait de ebola.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
function switchAudience(audience) {
    const patSection = document.getElementById('section-patient');
    const hcwSection = document.getElementById('section-hcw');
    const tabPat = document.getElementById('tab-patient');
    const tabHcw = document.getElementById('tab-hcw');

    if (audience === 'patient') {
      patSection.style.display = '';
      hcwSection.style.display = 'none';
      tabPat.classList.add('active-patient');
      tabPat.classList.remove('active-hcw');
      tabHcw.className = 'audience-tab';
      tabPat.setAttribute('aria-selected', 'true');
      tabHcw.setAttribute('aria-selected', 'false');
    } else {
      hcwSection.style.display = '';
      patSection.style.display = 'none';
      tabHcw.classList.add('active-hcw');
      tabHcw.classList.remove('active-patient');
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
