// Minimal client-side logic for Hugot submission, listing, and rating.
// Make sure WEB_APP_URL in index.html is set to your deployed Apps Script URL.

const form = document.getElementById('hugot-form');
const hugotText = document.getElementById('hugot-text');
const hugotAuthor = document.getElementById('hugot-author');
const submitMsg = document.getElementById('submit-msg');
const hugotListEl = document.getElementById('hugot-list');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = hugotText.value.trim();
  const author = hugotAuthor.value.trim();
  if (!text) return;

  submitMsg.textContent = 'Sending...';
  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'submit', hugot: text, author })
    });
    const data = await res.json();
    if (data.success) {
      submitMsg.textContent = 'Thanks! Your hugot was submitted.';
      hugotText.value = '';
      hugotAuthor.value = '';
      fetchHugots(); // reload list
    } else {
      submitMsg.textContent = 'Error: ' + (data.error || 'unknown');
    }
  } catch (err) {
    submitMsg.textContent = 'Network error: ' + err.message;
  }
});

async function fetchHugots() {
  hugotListEl.innerHTML = 'Loading...';
  try {
    const res = await fetch(WEB_APP_URL + '?action=list');
    const data = await res.json();
    renderHugots(data.hugots || []);
  } catch (err) {
    hugotListEl.innerHTML = 'Could not load hugots';
  }
}

function renderHugots(hugots) {
  if (!hugots.length) {
    hugotListEl.innerHTML = '<div class="muted">No hugots yet.</div>';
    return;
  }
  hugotListEl.innerHTML = '';
  hugots.forEach(h => {
    const item = document.createElement('div');
    item.className = 'hugot';
    item.innerHTML = `
      <p class="text">${escapeHtml(h.hugot)}</p>
      <div class="meta">
        <span class="author">${escapeHtml(h.author || 'Anonymous')}</span>
        <span class="time">${escapeHtml(h.ts || '')}</span>
        <span class="rating">Rating: <strong>${h.averageRating || 0}</strong> (${h.ratingsCount || 0})</span>
        <button class="btn-rate" data-id="${h.id}">+1</button>
      </div>
    `;
    hugotListEl.appendChild(item);
  });

  // attach rate handlers
  document.querySelectorAll('.btn-rate').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      sendRating(id, 1);
    });
  });
}

async function sendRating(id, rating) {
  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'rate', id, rating })
    });
    const data = await res.json();
    if (data.success) {
      fetchHugots();
    } else {
      alert('Could not update rating: ' + (data.error || 'unknown'));
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  }
}

// small helper to prevent XSS
function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
  );
}

// initial load
fetchHugots();
