// ===== Config =====
const API_BASE = '/posts';

// ===== DOM Elements =====
const postForm = document.getElementById('post-form');
const formTitle = document.getElementById('form-title');
const postIdInput = document.getElementById('post-id');
const postTitleInput = document.getElementById('post-title');
const postContentInput = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const tagsCheckboxes = document.getElementById('tags-checkboxes');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const postsList = document.getElementById('posts-list');
const postsCount = document.getElementById('posts-count');
const filterTag = document.getElementById('filter-tag');
const notification = document.getElementById('notification');

// ===== State =====
let allTags = [];
let isEditing = false;

// ===== Notification =====
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 4000);
}

// ===== API Helpers =====
async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });

        if (res.status === 204) return null;

        const data = await res.json();

        if (!res.ok) {
            const errorMsg = data.error || data.message || `Errore ${res.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            throw new Error('Impossibile connettersi al server. Verifica che sia in esecuzione.');
        }
        throw err;
    }
}

// ===== Tags =====
async function loadTags() {
    try {
        // Carichiamo i post per estrarre i tag unici
        const posts = await apiFetch(API_BASE);
        const tagMap = new Map();

        if (Array.isArray(posts)) {
            posts.forEach(post => {
                if (Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        if (!tagMap.has(tag.id)) {
                            tagMap.set(tag.id, tag);
                        }
                    });
                }
            });
        }

        allTags = Array.from(tagMap.values());
        renderTagCheckboxes();
        renderTagFilter();
    } catch (err) {
        console.error('Errore caricamento tag:', err);
        tagsCheckboxes.innerHTML = '<span class="loading-text">Errore caricamento tag</span>';
    }
}

function renderTagCheckboxes() {
    if (allTags.length === 0) {
        tagsCheckboxes.innerHTML = '<span class="loading-text">Nessun tag disponibile</span>';
        return;
    }

    tagsCheckboxes.innerHTML = allTags.map(tag => `
        <label>
            <input type="checkbox" name="tags" value="${tag.id}">
            ${escapeHtml(tag.name || tag.label || `Tag #${tag.id}`)}
        </label>
    `).join('');
}

function renderTagFilter() {
    const currentValue = filterTag.value;
    // Mantieni la prima opzione
    filterTag.innerHTML = '<option value="">Tutti i post</option>';

    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.name || tag.label || `Tag #${tag.id}`;
        filterTag.appendChild(option);
    });

    filterTag.value = currentValue;
}

function getSelectedTagIds() {
    const checkboxes = tagsCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => Number(cb.value));
}

function setSelectedTagIds(tagIds) {
    const checkboxes = tagsCheckboxes.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = tagIds.includes(Number(cb.value));
    });
}

// ===== Posts CRUD =====

// READ - Lista post
async function loadPosts(tagFilter = '') {
    try {
        let url = API_BASE;
        if (tagFilter) {
            url += `?tags=${tagFilter}`;
        }

        const posts = await apiFetch(url);

        if (!Array.isArray(posts) || posts.length === 0) {
            postsList.innerHTML = '<div class="empty-state"><p>Nessun post trovato.</p></div>';
            postsCount.textContent = '0';
            return;
        }

        postsCount.textContent = posts.length;
        postsList.innerHTML = posts.map(post => renderPostCard(post)).join('');
    } catch (err) {
        postsList.innerHTML = `<div class="empty-state"><p>Errore: ${escapeHtml(err.message)}</p></div>`;
        showNotification(err.message, 'error');
    }
}

function renderPostCard(post) {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const tagsHtml = tags.map(tag =>
        `<span class="tag-badge">${escapeHtml(tag.name || tag.label || `Tag #${tag.id}`)}</span>`
    ).join('');

    const imageHtml = post.image
        ? `<img class="post-card-image" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" onerror="this.style.display='none'">`
        : '';

    return `
        <article class="post-card">
            <div class="post-card-header">
                <h3>${escapeHtml(post.title)}</h3>
                <span class="post-card-id">ID: ${post.id}</span>
            </div>
            ${imageHtml}
            <div class="post-card-content">${escapeHtml(post.content)}</div>
            ${tags.length > 0 ? `<div class="post-card-tags">${tagsHtml}</div>` : ''}
            <div class="post-card-actions">
                <button class="btn btn-warning btn-sm" onclick="editPost(${post.id})">Modifica</button>
                <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">Elimina</button>
            </div>
        </article>
    `;
}

// CREATE
async function createPost(postData) {
    try {
        const result = await apiFetch(API_BASE, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
        showNotification('Post creato con successo!');
        resetForm();
        await loadTags();
        await loadPosts(filterTag.value);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// UPDATE
async function updatePost(id, postData) {
    try {
        const result = await apiFetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        });
        showNotification('Post aggiornato con successo!');
        resetForm();
        await loadTags();
        await loadPosts(filterTag.value);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// DELETE
async function deletePost(id) {
    if (!confirm(`Sei sicuro di voler eliminare il post #${id}?`)) return;

    try {
        await apiFetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        showNotification('Post eliminato con successo!');
        await loadPosts(filterTag.value);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// EDIT - Carica i dati di un post nel form
async function editPost(id) {
    try {
        const post = await apiFetch(`${API_BASE}/${id}`);

        isEditing = true;
        postIdInput.value = post.id;
        postTitleInput.value = post.title;
        postContentInput.value = post.content;
        postImageInput.value = post.image || '';

        if (Array.isArray(post.tags)) {
            setSelectedTagIds(post.tags.map(t => t.id));
        }

        formTitle.textContent = `Modifica Post #${post.id}`;
        btnSubmit.textContent = 'Aggiorna Post';
        btnCancel.classList.remove('hidden');

        // Scrolla al form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// ===== Form =====
function resetForm() {
    postForm.reset();
    postIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Nuovo Post';
    btnSubmit.textContent = 'Crea Post';
    btnCancel.classList.add('hidden');
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const postData = {
        title: postTitleInput.value.trim(),
        content: postContentInput.value.trim(),
        image: postImageInput.value.trim() || null,
        tags: getSelectedTagIds(),
    };

    if (postData.title.length < 3) {
        showNotification('Il titolo deve avere almeno 3 caratteri.', 'error');
        return;
    }

    if (!postData.content) {
        showNotification('Il contenuto è obbligatorio.', 'error');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = isEditing ? 'Aggiornamento...' : 'Creazione...';

    if (isEditing) {
        await updatePost(postIdInput.value, postData);
    } else {
        await createPost(postData);
    }

    btnSubmit.disabled = false;
});

btnCancel.addEventListener('click', resetForm);

// ===== Filter =====
filterTag.addEventListener('change', () => {
    loadPosts(filterTag.value);
});

// ===== Utils =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ===== Init =====
async function init() {
    await loadTags();
    await loadPosts();
}

init();
