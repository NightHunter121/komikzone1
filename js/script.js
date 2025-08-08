let komikData = [];
let currentKomikId = null;
let currentChapterIndex = 0;
let bookmarks = JSON.parse(localStorage.getItem('komikBookmarks')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/komik.json')
        .then(res => res.json())
        .then(data => {
            komikData = data;
            renderKomikList(data);
        });

    const searchButton = document.getElementById('searchButton');
    const searchBox = document.getElementById('searchBox');
    searchButton.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            document.getElementById('searchInput').focus();
        }
    });

    const navItems = document.querySelectorAll('.nav-item:not(.disabled)');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            showPage(page);
        });
    });

    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.page) {
            if (state.page === 'home') {
                showPage('home');
            } else if (state.page === 'detail') {
                const komik = komikData.find(k => k.id === state.id);
                tampilkanDetail(komik);
            }
        } else {
            showPage('home');
        }
    });
    
    const modal = document.getElementById('authModal');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const closeBtn = document.querySelector('.modal .close-btn');
    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginSubmitForm = document.getElementById('login-form');
    const registerSubmitForm = document.getElementById('register-form');

    userProfileBtn.onclick = () => {
        modal.style.display = 'block';
    }

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    }
    
    showLoginBtn.onclick = (e) => {
        e.preventDefault();
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }

    showRegisterBtn.onclick = (e) => {
        e.preventDefault();
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    loginSubmitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.elements['login-username'].value;
        const password = e.target.elements['login-password'].value;
        console.log(`Login attempt: Username=${username}, Password=${password}`);
        alert('Ini hanya frontend. Logic backend untuk login perlu diimplementasi.');
    });

    registerSubmitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.elements['register-username'].value;
        const email = e.target.elements['register-email'].value;
        const password = e.target.elements['register-password'].value;
        console.log(`Register attempt: Username=${username}, Email=${email}, Password=${password}`);
        alert('Ini hanya frontend. Logic backend untuk registrasi perlu diimplementasi.');
    });
});

function showPage(pageName) {
    document.querySelectorAll('.page-section').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById('komikDetail').style.display = 'none';
    document.getElementById('chapterView').style.display = 'none';
    
    switch (pageName) {
        case 'home':
            document.getElementById('homePage').style.display = 'block';
            document.getElementById('sectionTitle').innerText = 'Komik Terbaru';
            renderKomikList(komikData);
            break;
        case 'library':
            document.getElementById('libraryPage').style.display = 'block';
            document.getElementById('sectionTitle').innerText = 'Library';
            renderBookmarkList();
            break;
    }
}

function saveBookmarks() {
    localStorage.setItem('komikBookmarks', JSON.stringify(bookmarks));
}

function updateBookmarkButton() {
    const btn = document.getElementById('bookmarkToggleBtn');
    if (!btn) return;
    if (bookmarks.includes(currentKomikId)) {
        btn.classList.add('bookmarked');
    } else {
        btn.classList.remove('bookmarked');
    }
}

function toggleBookmark() {
    if (bookmarks.includes(currentKomikId)) {
        bookmarks = bookmarks.filter(id => id !== currentKomikId);
    } else {
        bookmarks.push(currentKomikId);
    }
    saveBookmarks();
    updateBookmarkButton();
}

function renderKomikList(data) {
    const list = document.getElementById('komikList');
    list.innerHTML = '';
    data.forEach(komik => {
        const item = document.createElement('div');
        item.className = 'komik-item';
        item.innerHTML = `
            <img src="${komik.gambar}" alt="${komik.judul}">
            <div class="title">${komik.judul}</div>
        `;
        item.onclick = () => tampilkanDetail(komik);
        list.appendChild(item);
    });
}

function renderBookmarkList() {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';
    
    if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '<p style="text-align:center; margin-top:2rem;">Belum ada komik yang di-bookmark.</p>';
        return;
    }

    const bookmarkedKomik = komikData.filter(komik => bookmarks.includes(komik.id));
    bookmarkedKomik.forEach(komik => {
        const item = document.createElement('div');
        item.className = 'komik-item';
        item.innerHTML = `
            <img src="${komik.gambar}" alt="${komik.judul}">
            <div class="title">${komik.judul}</div>
        `;
        item.onclick = () => tampilkanDetail(komik);
        bookmarkList.appendChild(item);
    });
}

function tampilkanDetail(komik) {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('libraryPage').style.display = 'none';
    document.getElementById('komikDetail').style.display = 'block';
    
    currentKomikId = komik.id;
    
    document.getElementById('detailJudul').innerText = komik.judul;
    document.getElementById('detailSinopsis').innerText = komik.sinopsis;
    document.getElementById('detailGambar').src = komik.gambar;
    document.getElementById('detailStatus').innerText = komik.status;
    document.getElementById('detailRating').innerText = `⭐️ ${komik.rating}`;
    updateBookmarkButton();
    document.getElementById('bookmarkToggleBtn').onclick = toggleBookmark;

    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    komik.chapters.forEach((chapter, index) => {
        const li = document.createElement('li');
        li.innerText = chapter.judul;
        li.onclick = () => tampilkanChapter(komik.id, index);
        chapterList.appendChild(li);
    });
    
    window.history.pushState({page: 'detail', id: komik.id}, '', `#detail-${komik.id}`);
}

function tampilkanChapter(komikId, chapterIndex) {
    document.getElementById('komikDetail').style.display = 'none';
    document.getElementById('chapterView').style.display = 'block';

    const komik = komikData.find(k => k.id === komikId);
    currentKomikId = komikId;
    currentChapterIndex = chapterIndex;
    const chapter = komik.chapters[currentChapterIndex];

    document.getElementById('chapterTitle').innerText = chapter.judul;

    const container = document.getElementById('chapterImages');
    container.innerHTML = '';
    chapter.gambar.forEach(img => {
        const imageTag = document.createElement('img');
        imageTag.src = img;
        container.appendChild(imageTag);
    });
    
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    prevBtn.disabled = currentChapterIndex === 0;
    nextBtn.disabled = currentChapterIndex === komik.chapters.length - 1;
    
    window.history.pushState({page: 'chapter', id: komikId, chapter: chapterIndex}, '', `#chapter-${komikId}-${chapterIndex}`);
}

function navigateChapter(direction) {
    const komik = komikData.find(k => k.id === currentKomikId);
    let newIndex = currentChapterIndex + direction;

    if (newIndex >= 0 && newIndex < komik.chapters.length) {
        tampilkanChapter(currentKomikId, newIndex);
    }
}

function closeChapter() {
    const komik = komikData.find(k => k.id === currentKomikId);
    tampilkanDetail(komik);
}

function searchKomik() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const hasil = komikData.filter(k => k.judul.toLowerCase().includes(keyword));
    renderKomikList(hasil);
}

document.getElementById('chapterImages').addEventListener('click', () => {
    const topControls = document.getElementById('topControls');
    const bottomControls = document.getElementById('bottomControls');
    topControls.classList.toggle('hidden');
    bottomControls.classList.toggle('hidden');
});

document.getElementById('prevChapterBtn').addEventListener('click', () => navigateChapter(-1));
document.getElementById('nextChapterBtn').addEventListener('click', () => navigateChapter(1));
