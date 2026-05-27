/**
 * Skillgram SPA Core Engine
 * Client-side MVC state controller
 */

const API_BASE = window.location.origin;

// Application State Store
const state = {
    token: localStorage.getItem('skillgram_token') || null,
    user: null,
    posts: [],
    claps: JSON.parse(localStorage.getItem('skillgram_claps') || '{}'),
    activeTagFilter: null,
    searchQuery: ''
};

// Avatar Seeds (Dicebear Bottts presets)
const AVATAR_SEEDS = [
    'SkillgramUser', 'Matrix', 'Neo', 'Trinity', 'Morpheus', 
    'AgentSmith', 'Spark', 'Pixel', 'Hex', 'Cyber', 
    'Glitch', 'Binary', 'Quantum', 'Synthetix', 'Astra', 'Echo'
];

// Document Elements
const el = {
    app: document.getElementById('app'),
    authView: document.getElementById('auth-view'),
    feedView: document.getElementById('feed-view'),
    
    // Forms
    loginCard: document.getElementById('login-card'),
    signupCard: document.getElementById('signup-card'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    showSignup: document.getElementById('show-signup'),
    showLogin: document.getElementById('show-login'),
    
    // Inputs
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    signupUsername: document.getElementById('signup-username'),
    signupEmail: document.getElementById('signup-email'),
    signupPassword: document.getElementById('signup-password'),
    feedSearch: document.getElementById('feed-search'),
    
    // Header & Actions
    btnLogout: document.getElementById('btn-logout'),
    btnNewPost: document.getElementById('btn-new-post'),
    quickPostTrigger: document.getElementById('quick-post-trigger'),
    
    // Profile Sidebar
    userAvatar: document.getElementById('user-avatar'),
    btnChangeAvatar: document.getElementById('btn-change-avatar'),
    userDisplayName: document.getElementById('user-display-name'),
    userHandle: document.getElementById('user-handle'),
    userBio: document.getElementById('user-bio'),
    userSkillsList: document.getElementById('user-skills-list'),
    btnEditProfile: document.getElementById('btn-edit-profile'),
    statPostsCount: document.getElementById('stat-posts-count'),
    statTotalClaps: document.getElementById('stat-total-claps'),
    
    // Feed content
    postsFeedContainer: document.getElementById('posts-feed-container'),
    feedFilterBar: document.getElementById('feed-filter-bar'),
    activeTagLabel: document.getElementById('active-tag-label'),
    btnClearFilter: document.getElementById('btn-clear-filter'),
    trendingSkillsList: document.getElementById('trending-skills-list'),
    
    // Modals
    editProfileModal: document.getElementById('edit-profile-modal'),
    editProfileForm: document.getElementById('edit-profile-form'),
    profileEmail: document.getElementById('profile-email'),
    profileBioInput: document.getElementById('profile-bio-input'),
    profileSkillsInput: document.getElementById('profile-skills-input'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal'),
    btnCancelProfile: document.getElementById('btn-cancel-profile'),
    
    createPostModal: document.getElementById('create-post-modal'),
    createPostForm: document.getElementById('create-post-form'),
    postTitle: document.getElementById('post-title'),
    postDesc: document.getElementById('post-desc'),
    postCode: document.getElementById('post-code'),
    postCodeLang: document.getElementById('post-code-lang'),
    btnClosePostModal: document.getElementById('btn-close-post-modal'),
    btnCancelPost: document.getElementById('btn-cancel-post'),
    
    avatarModal: document.getElementById('avatar-modal'),
    avatarPresetsGrid: document.getElementById('avatar-presets-grid'),
    btnCloseAvatarModal: document.getElementById('btn-close-avatar-modal')
};

// Toast Notifications System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Request Helper
async function request(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    const config = {
        method,
        headers
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (response.status === 401 || response.status === 403) {
            // Unauthorized or Forbidden - trigger logout
            handleLogout();
            throw new Error("Session expired or unauthorized");
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Server responded with an error');
        }
        
        // Handle empty bodies / text responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (err) {
        console.error(`Request to ${endpoint} failed:`, err);
        throw err;
    }
}

// SPA View Management
function navigateTo(view) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    
    if (view === 'auth') {
        el.authView.classList.add('active');
    } else if (view === 'feed') {
        el.feedView.classList.add('active');
    }
}

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================

async function handleLogin(username, password) {
    try {
        const response = await request('/auth/login', 'POST', { username, password });
        if (response && response.token) {
            state.token = response.token;
            localStorage.setItem('skillgram_token', response.token);
            showToast('Access granted! Loading your dashboard...', 'success');
            await initApp();
        } else {
            showToast('Invalid response from server.', 'error');
        }
    } catch (err) {
        showToast('Login failed. Check your username/password.', 'error');
    }
}

async function handleSignup(username, email, password) {
    try {
        await request('/auth/register', 'POST', { username, email, password });
        showToast('Account created successfully! Signing you in...', 'success');
        // Auto-login after registration
        await handleLogin(username, password);
    } catch (err) {
        showToast('Signup failed. Username or email might be taken.', 'error');
    }
}

function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('skillgram_token');
    navigateTo('auth');
    showToast('Logged out successfully.');
}

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

function updateProfileUI() {
    if (!state.user) return;
    
    el.userDisplayName.textContent = state.user.username;
    el.userHandle.textContent = `@${state.user.username}`;
    
    if (state.user.bio) {
        el.userBio.textContent = state.user.bio;
        el.userBio.classList.remove('text-muted');
    } else {
        el.userBio.textContent = 'No bio yet. Tell the community about your skillset!';
        el.userBio.classList.add('text-muted');
    }
    
    // Load skills
    el.userSkillsList.innerHTML = '';
    let parsedSkills = [];
    if (state.user.skillSet) {
        try {
            parsedSkills = state.user.skillSet.split(',').map(s => s.trim()).filter(Boolean);
            if (parsedSkills.length > 0) {
                parsedSkills.forEach(skill => {
                    const tag = document.createElement('span');
                    tag.className = 'skill-tag';
                    tag.textContent = `#${skill}`;
                    tag.addEventListener('click', () => setTagFilter(skill));
                    el.userSkillsList.appendChild(tag);
                });
            } else {
                el.userSkillsList.innerHTML = '<span class="empty-placeholder">No skills added yet</span>';
            }
        } catch(e) {
            el.userSkillsList.innerHTML = '<span class="empty-placeholder">No skills added yet</span>';
        }
    } else {
        el.userSkillsList.innerHTML = '<span class="empty-placeholder">No skills added yet</span>';
    }

    // Render Skill Radar Chart
    if (window.RadarChart) {
        window.RadarChart.render(parsedSkills);
    }
    
    // Set Avatar Vibe
    const seed = state.user.profileImageUrl || 'SkillgramUser';
    el.userAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    document.querySelectorAll('.avatar-sm').forEach(img => {
        img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    });
}

// ==========================================
// POSTS & FEED LOGIC
// ==========================================

async function fetchPosts() {
    try {
        state.posts = await request('/posts', 'GET');
        renderFeed();
        updateStats();
    } catch (err) {
        showToast('Failed to load skill feed.', 'error');
    }
}

function updateStats() {
    const userPosts = state.posts.filter(p => p.description && p.description.includes(`@${state.user?.username}`));
    // Since there's no true author field in standard Post, we'll estimate count or count all
    const postsCount = state.posts.length;
    let totalClaps = 0;
    Object.keys(state.claps).forEach(id => {
        totalClaps += (state.claps[id] || 0);
    });

    if (window.animateStat) {
        window.animateStat(el.statPostsCount, postsCount);
        window.animateStat(el.statTotalClaps, totalClaps);
    } else {
        el.statPostsCount.textContent = postsCount;
        el.statTotalClaps.textContent = totalClaps;
    }
}

function renderFeed() {
    el.postsFeedContainer.innerHTML = '';
    
    let filtered = state.posts;
    
    // Apply tag filter
    if (state.activeTagFilter) {
        const query = state.activeTagFilter.toLowerCase();
        filtered = filtered.filter(p => 
            (p.title && p.title.toLowerCase().includes(query)) || 
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    // Apply search query
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            (p.title && p.title.toLowerCase().includes(query)) || 
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    if (filtered.length === 0) {
        el.postsFeedContainer.innerHTML = `
            <div class="glass-card text-center" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                <p>No skill posts match your criteria.</p>
                <small style="color: var(--text-muted);">Be the first to share something new!</small>
            </div>
        `;
        return;
    }
    
    // Sort posts by ID descending (newest first)
    filtered.sort((a, b) => b.id - a.id);
    
    filtered.forEach(post => {
        // Extract hashtags from description
        const descHtml = highlightHashtags(post.description || '');
        const postClaps = state.claps[post.id] || 0;
        const hasClapped = postClaps > 0;
        const avatarSeed = post.title ? (post.title.length + 3) : 'Post';

        // Build code snippet block if present
        let codeBlock = '';
        if (post.codeSnippet && post.codeSnippet.trim()) {
            const lang = post.language || 'javascript';
            const escapedCode = escapeHtml(post.codeSnippet);
            codeBlock = `
                <div class="code-snippet-card">
                    <div class="code-snippet-header">
                        <span class="lang-badge lang-${lang}">${lang.toUpperCase()}</span>
                        <button class="copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>
                    </div>
                    <pre class="language-${lang} code-pre"><code class="language-${lang}">${escapedCode}</code></pre>
                </div>
            `;
        }
        
        const card = document.createElement('article');
        card.className = 'glass-card post-card';
        card.setAttribute('data-post-id', post.id);
        card.innerHTML = `
            <div class="post-header">
                <div class="post-author-meta">
                    <img class="avatar-sm" src="https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}" alt="Avatar">
                    <div class="post-author-info">
                        <h4>Community Builder</h4>
                        <span class="post-time">Post #${post.id}</span>
                    </div>
                </div>
                <span class="post-badge">${post.codeSnippet ? '<i class="fa-solid fa-code"></i> Code Post' : 'Skill Share'}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title || '')}</h3>
            <p class="post-description">${descHtml}</p>
            ${codeBlock}
            <div class="post-footer">
                <div class="post-actions">
                    <button class="btn-action clap-btn ${hasClapped ? 'clap-active' : ''}" data-post-id="${post.id}">
                        <i class="fa-solid fa-hands-clapping"></i>
                        <span>Clap (<strong class="clap-count">${postClaps}</strong>)</span>
                    </button>
                </div>
            </div>
        `;
        
        // Prism highlight code blocks
        if (post.codeSnippet) {
            card.querySelectorAll('pre code').forEach(block => {
                if (window.Prism) Prism.highlightElement(block);
            });
            const preEl = card.querySelector('pre');
            if (preEl && window.attachCopyBtn) window.attachCopyBtn(preEl);
        }
        
        // Add clap event listener with particle burst
        const clapBtn = card.querySelector('.clap-btn');
        clapBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = clapBtn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            if (window.ClapBurst) window.ClapBurst.burst(cx, cy);
            handleClap(post.id, clapBtn);
        });
        
        // Add hashtag click listeners
        card.querySelectorAll('.post-hashtag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                setTagFilter(tag.textContent.substring(1));
            });
        });
        
        el.postsFeedContainer.appendChild(card);
    });
}

function highlightHashtags(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/#(\w+)/g, '<a href="#" class="post-hashtag">#$1</a>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleClap(postId, btn) {
    if (!state.claps[postId]) {
        state.claps[postId] = 0;
    }
    state.claps[postId]++;
    localStorage.setItem('skillgram_claps', JSON.stringify(state.claps));
    
    // Update count in DOM directly
    const countEl = btn.querySelector('.clap-count');
    countEl.textContent = state.claps[postId];
    btn.classList.add('clap-active');
    
    updateStats();
    
    // Show quick visual particle feedback
    showToast(`Appreciated post #${postId}!`, 'info');
}

function setTagFilter(tag) {
    state.activeTagFilter = tag;
    el.activeTagLabel.textContent = `#${tag}`;
    el.feedFilterBar.classList.remove('hidden');
    renderFeed();
}

function clearTagFilter() {
    state.activeTagFilter = null;
    el.feedFilterBar.classList.add('hidden');
    renderFeed();
}

// ==========================================
// INITIALIZATION
// ==========================================

async function initApp() {
    if (state.token) {
        try {
            // Load user data
            state.user = await request('/auth/me', 'GET');
            updateProfileUI();
            navigateTo('feed');
            
            // Load feed
            await fetchPosts();
        } catch (err) {
            console.error("Initialization failed:", err);
            handleLogout();
        }
    } else {
        navigateTo('auth');
    }
}

// Modal open/close actions
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// Set up UI event listeners
function setupListeners() {
    // Auth Switchers
    el.showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        el.loginCard.classList.add('hidden');
        el.signupCard.classList.remove('hidden');
    });
    
    el.showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        el.signupCard.classList.add('hidden');
        el.loginCard.classList.remove('hidden');
    });
    
    // Submit Auth
    el.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(el.loginUsername.value, el.loginPassword.value);
    });
    
    el.signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup(el.signupUsername.value, el.signupEmail.value, el.signupPassword.value);
    });
    
    el.btnLogout.addEventListener('click', handleLogout);
    
    // Post trigger button
    el.btnNewPost.addEventListener('click', () => {
        el.postTitle.value = '';
        el.postDesc.value = '';
        openModal(el.createPostModal);
    });
    el.quickPostTrigger.addEventListener('click', () => {
        el.postTitle.value = '';
        el.postDesc.value = '';
        openModal(el.createPostModal);
    });
    
    // Profile Modal
    el.btnEditProfile.addEventListener('click', () => {
        el.profileEmail.value = state.user.email || '';
        el.profileBioInput.value = state.user.bio || '';
        el.profileSkillsInput.value = state.user.skillSet || '';
        openModal(el.editProfileModal);
    });
    
    el.editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const updated = await request('/auth/me', 'PUT', {
                email: el.profileEmail.value,
                bio: el.profileBioInput.value,
                skillSet: el.profileSkillsInput.value
            });
            state.user = updated;
            updateProfileUI();
            closeModal(el.editProfileModal);
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        }
    });
    
    // Create Post submit
    el.createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codeVal = el.postCode ? el.postCode.value.trim() : '';
        const langVal = el.postCodeLang ? el.postCodeLang.value : '';
        const postPayload = {
            title: el.postTitle.value,
            description: el.postDesc.value,
        };
        if (codeVal) {
            postPayload.codeSnippet = codeVal;
            postPayload.language = langVal || 'javascript';
        }
        try {
            await request('/posts', 'POST', postPayload);
            closeModal(el.createPostModal);
            // Clear code fields
            if (el.postCode) el.postCode.value = '';
            if (el.postCodeLang) el.postCodeLang.value = '';
            showToast('New update posted to the feed! 🎉', 'success');
            await fetchPosts();
        } catch (err) {
            showToast('Failed to publish post.', 'error');
        }
    });
    
    // Close modals
    el.btnCloseProfileModal.addEventListener('click', () => closeModal(el.editProfileModal));
    el.btnCancelProfile.addEventListener('click', () => closeModal(el.editProfileModal));
    el.btnClosePostModal.addEventListener('click', () => closeModal(el.createPostModal));
    el.btnCancelPost.addEventListener('click', () => closeModal(el.createPostModal));
    el.btnCloseAvatarModal.addEventListener('click', () => closeModal(el.avatarModal));
    
    // Avatar Preset Vibe Selector
    el.btnChangeAvatar.addEventListener('click', () => {
        el.avatarPresetsGrid.innerHTML = '';
        AVATAR_SEEDS.forEach(seed => {
            const item = document.createElement('div');
            item.className = `avatar-preset-item ${state.user.profileImageUrl === seed ? 'selected' : ''}`;
            item.innerHTML = `<img src="https://api.dicebear.com/7.x/bottts/svg?seed=${seed}" alt="${seed}">`;
            item.addEventListener('click', async () => {
                try {
                    const updated = await request('/auth/me', 'PUT', { profileImageUrl: seed });
                    state.user = updated;
                    updateProfileUI();
                    closeModal(el.avatarModal);
                    showToast('Vibe selected!', 'success');
                } catch(e) {
                    showToast('Failed to update avatar.', 'error');
                }
            });
            el.avatarPresetsGrid.appendChild(item);
        });
        openModal(el.avatarModal);
    });
    
    // Clear Tag Filter
    el.btnClearFilter.addEventListener('click', clearTagFilter);
    
    // Search Bar Input
    el.feedSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderFeed();
    });
    
    // Side trending items
    document.querySelectorAll('.trending-list li').forEach(item => {
        item.addEventListener('click', () => {
            const skill = item.getAttribute('data-skill');
            setTagFilter(skill);
        });
    });
}

// Expose feed refresh for real-time banner
window._skillgramRefreshFeed = () => fetchPosts();

// Start
document.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    initApp().then(() => {
        // Connect WebSocket after login
        if (state.token && window.RealtimeFeed) {
            window.RealtimeFeed.connect((newPost) => {
                // Prepend new post to state without full reload
                const already = state.posts.find(p => p.id === newPost.id);
                if (!already) {
                    state.posts.unshift(newPost);
                    renderFeed();
                    updateStats();
                }
            });
        }
    });
});
