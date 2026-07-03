document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchAdminEvents();

    document.getElementById('create-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const folderId = document.getElementById('event-folder').value;

        // POST to your backend controller
        try {
            const res = await fetch('http://localhost:3000/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, folderId })
            });
            if(res.ok) {
                document.getElementById('create-modal').classList.add('hidden');
                fetchAdminEvents();
            }
        } catch (error) {
            console.error('Failed to create event', error);
        }
    });
});

async function fetchAdminEvents() {
    // Mocking initial UI load based on campus context until API is wired
    const mockEvents = [
        { id: 1, title: 'SHRUTHI 2026 Cultural Fest', date: '2026-02-14', status: 'Published' },
        { id: 2, title: 'Out of Syllabus', date: '2025-09-05', status: 'Published' } // Event honoring retiring faculty
    ];
    
    renderEventTable(mockEvents);
}

function renderEventTable(events) {
    const tbody = document.getElementById('admin-event-list');
    tbody.innerHTML = '';
    
    events.forEach(event => {
        tbody.innerHTML += `
            <tr>
              <td class="p-4 font-medium">${event.title}</td>
              <td class="p-4 text-gray-500">${event.date}</td>
              <td class="p-4"><span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${event.status}</span></td>
              <td class="p-4">
                <button class="text-gray-400 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
              </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

