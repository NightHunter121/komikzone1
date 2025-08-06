let komikData = [];

// Load data dari JSON
fetch('data/komik.json')
    .then(res => res.json())
    .then(data => {
        komikData = data;
        renderKomikList(data);
    });

// --- JAVASCRIPT UNTUK FITUR BOOKMARK ---
let bookmarks = JSON.parse(localStorage.getItem('komikBookmarks')) || [];
let currentKomikId = null;

function saveBookmarks() {
    localStorage.setItem('komikBookmarks', JSON.stringify(bookmarks));
}

function updateBookmarkButton() {
    const btn = document.getElementById('bookmarkToggleBtn');
    if (bookmarks.includes(currentKomikId)) {
        btn.innerText = 'Dihapus dari Bookmark';
        btn.classList.add('bookmarked');
    } else {
        btn.innerText = 'Tambah ke Bookmark';
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

function renderBookmarkList() {
    const bookmarkList = document.getElementById('bookmarkList');
    const sectionTitle = document.getElementById('sectionTitle');
    
    document.getElementById('komikList').style.display = 'none';
    document.getElementById('komikDetail').style.display = 'none';
    document.getElementById('chapterView').style.display = 'none';
    bookmarkList.style.display = 'grid';
    
    sectionTitle.innerText = 'Daftar Bookmark';
    sectionTitle.classList.add('bookmark-title');
    
    bookmarkList.innerHTML = '';
    if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '<p style="text-align:center;">Belum ada komik yang di-bookmark.</p>';
        return;
    }

    const bookmarkedKomik = komikData.filter(komik => bookmarks.includes(komik.id));
    bookmarkedKomik.forEach(komik => {
        const item = document.createElement('div');
        item.className = 'komik-item';
        item.innerHTML = `
            <img src="${komik.gambar}" alt="${komik.judul}">
            <div class="komik-info">
                <h3>${komik.judul}</h3>
                <p class="chapter-info">${komik.chapters[0].judul}</p>
            </div>
        `;
        item.onclick = () => tampilkanDetail(komik);
        bookmarkList.appendChild(item);
    });
}
// --- AKHIR JAVASCRIPT FITUR BOOKMARK ---


function renderKomikList(data) {
    const list = document.getElementById('komikList');
    list.innerHTML = '';
    data.forEach(komik => {
        const item = document.createElement('div');
        item.className = 'komik-item';
        item.innerHTML = `
            <img src="${komik.gambar}" alt="${komik.judul}">
            <div class="komik-info">
                <h3>${komik.judul}</h3>
                <p class="chapter-info">${komik.chapters[0].judul}</p>
            </div>
        `;
        item.onclick = () => tampilkanDetail(komik);
        list.appendChild(item);
    });
}

function tampilkanDetail(komik) {
    document.getElementById('komikList').style.display = 'none';
    document.getElementById('bookmarkList').style.display = 'none';
    document.getElementById('komikDetail').style.display = 'block';
    document.getElementById('chapterView').style.display = 'none';

    document.getElementById('detailJudul').innerText = komik.judul;
    document.getElementById('detailGambar').src = komik.gambar;
    
    currentKomikId = komik.id;
    updateBookmarkButton();

    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    komik.chapters.forEach(chapter => {
        const li = document.createElement('li');
        li.innerText = chapter.judul;
        li.onclick = () => tampilkanChapter(chapter);
        chapterList.appendChild(li);
    });
}

function tampilkanChapter(chapter) {
    document.getElementById('komikDetail').style.display = 'none';
    document.getElementById('chapterView').style.display = 'block';

    document.getElementById('chapterTitle').innerText = chapter.judul;

    const container = document.getElementById('chapterImages');
    container.innerHTML = '';
    chapter.gambar.forEach(img => {
        const imageTag = document.createElement('img');
        imageTag.src = img;
        container.appendChild(imageTag);
    });
}

function closeDetail() {
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle.classList.contains('bookmark-title')) {
        renderBookmarkList();
    } else {
        document.getElementById('komikDetail').style.display = 'none';
        document.getElementById('komikList').style.display = 'grid';
    }
}

function closeChapter() {
    document.getElementById('chapterView').style.display = 'none';
    document.getElementById('komikDetail').style.display = 'block';
}

function searchKomik() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const hasil = komikData.filter(k => k.judul.toLowerCase().includes(keyword));
    renderKomikList(hasil);
}

document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');

    searchButton.addEventListener('click', function() {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        }
    });

    const bookmarkToggleBtn = document.getElementById('bookmarkToggleBtn');
    if (bookmarkToggleBtn) {
        bookmarkToggleBtn.addEventListener('click', toggleBookmark);
    }

    const showBookmarkBtn = document.getElementById('showBookmarkBtn');
    if (showBookmarkBtn) {
        showBookmarkBtn.addEventListener('click', renderBookmarkList);
    }
});