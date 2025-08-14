let allUsers = [];
const gradients = [
  "linear-gradient(45deg, #ff6a00, #ee0979)",
  "linear-gradient(45deg, #36d1dc, #5b86e5)",
  "linear-gradient(45deg, #ff4e50, #f9d423)",
  "linear-gradient(45deg, #43cea2, #185a9d)",
  "linear-gradient(45deg, #f7971e, #ffd200)"
];

async function fetchUsers(forceRefresh = false) {
  const userContainer = document.getElementById('user-container');
  const errorMessage = document.getElementById('error-message');
  const loader = document.getElementById('loader');
  userContainer.innerHTML = '';
  errorMessage.innerHTML = '';
  loader.style.display = 'block';

  try {
    if (!forceRefresh && localStorage.getItem('cachedUsers')) {
      allUsers = JSON.parse(localStorage.getItem('cachedUsers'));
      displayUsers(allUsers);
      loader.style.display = 'none';
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const users = await response.json();
    allUsers = users;
    localStorage.setItem('cachedUsers', JSON.stringify(users));

    displayUsers(users);
  } catch (error) {
    if (localStorage.getItem('cachedUsers')) {
      allUsers = JSON.parse(localStorage.getItem('cachedUsers'));
      displayUsers(allUsers);
      errorMessage.innerHTML = `<div class="error">⚠ Loaded offline data: ${error.message}</div>`;
    } else {
      errorMessage.innerHTML = `<div class="error">⚠ Failed to fetch data: ${error.message}</div>`;
    }
  } finally {
    loader.style.display = 'none';
  }
}

function displayUsers(users) {
  const userContainer = document.getElementById('user-container');
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  document.getElementById('userCount').textContent = `Showing ${users.length} users`;

  userContainer.innerHTML = '';
  users.forEach((user, index) => {
    const randomGradient = gradients[index % gradients.length];
    const highlightedName = searchQuery
      ? user.name.replace(new RegExp(searchQuery, 'gi'), match => `<span class="highlight">${match}</span>`)
      : user.name;

    const card = document.createElement('div');
    card.classList.add('user-card');
    card.innerHTML = `
      <div class="card-header" style="background:${randomGradient}">${highlightedName}</div>
      <div class="content">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Address:</strong> ${user.address.street}, ${user.address.city}</p>
        <div class="details">
          <p><strong>Phone:</strong> ${user.phone}</p>
          <p><strong>Company:</strong> ${user.company.name}</p>
        </div>
      </div>
    `;
    card.addEventListener('click', () => {
      const details = card.querySelector('.details');
      details.style.display = details.style.display === 'block' ? 'none' : 'block';
    });
    userContainer.appendChild(card);
    setTimeout(() => card.classList.add('show'), index * 100);
  });
}

document.getElementById('searchInput').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  const filtered = allUsers.filter(u => u.name.toLowerCase().includes(query));
  displayUsers(filtered);
});

document.getElementById('sortSelect').addEventListener('change', e => {
  let sorted = [...allUsers];
  if (e.target.value === 'az') sorted.sort((a,b) => a.name.localeCompare(b.name));
  if (e.target.value === 'za') sorted.sort((a,b) => b.name.localeCompare(a.name));
  displayUsers(sorted);
});

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

document.getElementById('clearCache').addEventListener('click', () => {
  localStorage.removeItem('cachedUsers');
  alert('Cache cleared. Reload to fetch fresh data.');
});

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

fetchUsers();
