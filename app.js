// Mock Data
let events = [
    {
        id: 1,
        title: "Konser Musik Jazz Malam",
        date: "2025-12-15",
        time: "19:00",
        location: "Jakarta Convention Center",
        category: "musik",
        price: 250000,
        description: "Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional.",
        icon: "🎵"
    },
    {
        id: 2,
        title: "Workshop Web Development",
        date: "2025-12-10",
        time: "09:00",
        location: "Tech Hub Bandung",
        category: "teknologi",
        price: 150000,
        description: "Belajar membuat website modern dengan teknologi terkini. Cocok untuk pemula hingga menengah.",
        icon: "💻"
    },
    {
        id: 3,
        title: "Marathon Jakarta 2025",
        date: "2025-12-20",
        time: "05:00",
        location: "Bundaran HI, Jakarta",
        category: "olahraga",
        price: 100000,
        description: "Ikuti marathon tahunan terbesar di Jakarta. Tersedia kategori 5K, 10K, dan 21K.",
        icon: "🏃"
    },
    {
        id: 4,
        title: "Pameran Seni Kontemporer",
        date: "2025-12-08",
        time: "10:00",
        location: "Galeri Nasional Indonesia",
        category: "seni",
        price: 50000,
        description: "Pameran karya seni kontemporer dari seniman lokal dan internasional.",
        icon: "🎨"
    },
    {
        id: 5,
        title: "Startup Pitch Competition",
        date: "2025-12-18",
        time: "13:00",
        location: "Surabaya Business Center",
        category: "bisnis",
        price: 0,
        description: "Kompetisi pitch untuk startup. Hadiah total 500 juta rupiah!",
        icon: "💼"
    },
    {
        id: 6,
        title: "Festival Kuliner Nusantara",
        date: "2025-12-25",
        time: "11:00",
        location: "Lapangan Banteng, Jakarta",
        category: "makanan",
        price: 0,
        description: "Jelajahi kekayaan kuliner Indonesia dari Sabang sampai Merauke.",
        icon: "🍜"
    }
];

// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const searchBtn = document.getElementById('searchBtn');
const eventModal = document.getElementById('eventModal');
const createEventModal = document.getElementById('createEventModal');
const createEventBtn = document.getElementById('createEventBtn');
const closeCreateModal = document.getElementById('closeCreateModal');
const createEventForm = document.getElementById('createEventForm');

// Initialize
displayEvents(events);

// Event Listeners
searchBtn.addEventListener('click', filterEvents);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterEvents();
});
categoryFilter.addEventListener('change', filterEvents);

createEventBtn.addEventListener('click', () => {
    createEventModal.style.display = 'block';
});

closeCreateModal.addEventListener('click', () => {
    createEventModal.style.display = 'none';
});

createEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    createNewEvent();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
    if (e.target === createEventModal) {
        createEventModal.style.display = 'none';
    }
});

// Functions
function displayEvents(eventsToDisplay) {
    eventsGrid.innerHTML = '';
    
    if (eventsToDisplay.length === 0) {
        eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Tidak ada event ditemukan.</p>';
        return;
    }
    
    eventsToDisplay.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.onclick = () => showEventDetails(event);
    
    const formattedDate = formatDate(event.date);
    const formattedPrice = event.price === 0 ? 'GRATIS' : `Rp ${event.price.toLocaleString('id-ID')}`;
    
    card.innerHTML = `
        <div class="event-image">${event.icon}</div>
        <div class="event-content">
            <span class="event-category">${event.category.toUpperCase()}</span>
            <h4 class="event-title">${event.title}</h4>
            <p class="event-date">📅 ${formattedDate} • ${event.time}</p>
            <p class="event-location">📍 ${event.location}</p>
            <p class="event-price">${formattedPrice}</p>
        </div>
    `;
    
    return card;
}

function showEventDetails(event) {
    const formattedDate = formatDate(event.date);
    const formattedPrice = event.price === 0 ? 'GRATIS' : `Rp ${event.price.toLocaleString('id-ID')}`;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="text-align: center; font-size: 5rem; margin-bottom: 1rem;">${event.icon}</div>
        <h2>${event.title}</h2>
        <span class="event-category">${event.category.toUpperCase()}</span>
        <p style="margin-top: 1rem;"><strong>📅 Tanggal:</strong> ${formattedDate}</p>
        <p><strong>🕐 Waktu:</strong> ${event.time} WIB</p>
        <p><strong>📍 Lokasi:</strong> ${event.location}</p>
        <p><strong>💰 Harga:</strong> ${formattedPrice}</p>
        <p style="margin-top: 1rem; line-height: 1.8;">${event.description}</p>
        <button class="btn-submit" style="margin-top: 1.5rem; width: 100%;">Daftar Sekarang</button>
    `;
    
    eventModal.style.display = 'block';
}

function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    let filtered = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm) ||
                            event.location.toLowerCase().includes(searchTerm);
        const matchesCategory = category === '' || event.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    displayEvents(filtered);
}

function createNewEvent() {
    const newEvent = {
        id: events.length + 1,
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        category: document.getElementById('eventCategory').value,
        price: parseInt(document.getElementById('eventPrice').value) || 0,
        description: document.getElementById('eventDescription').value,
        icon: getCategoryIcon(document.getElementById('eventCategory').value)
    };
    
    events.unshift(newEvent);
    displayEvents(events);
    createEventModal.style.display = 'none';
    createEventForm.reset();
    
    alert('Event berhasil dibuat!');
}

function getCategoryIcon(category) {
    const icons = {
        'musik': '🎵',
        'teknologi': '💻',
        'olahraga': '🏃',
        'seni': '🎨',
        'bisnis': '💼',
        'makanan': '🍜'
    };
    return icons[category] || '🎉';
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
}

// Close modal buttons
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});
