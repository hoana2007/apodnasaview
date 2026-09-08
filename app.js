// Sử dụng API Key chuẩn phòng khi DEMO_KEY bị giới hạn
const API_KEY = 'DpHOsaDyixhZTF3v9hl5rcRtFLxATyvHVYJqnKCe';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';

let allFetchedItems = [];
let filteredItems = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 2; // Hiển thị 2 ảnh/trang

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const datePicker = document.getElementById('date-picker');
const categorySelect = document.getElementById('category-select');
const btnReload = document.getElementById('btn-reload');
const btnRandom = document.getElementById('btn-random');

const loadingState = document.getElementById('loading');
const errorState = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const galleryGrid = document.getElementById('gallery-grid');

const paginationNav = document.getElementById('pagination');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

const detailModal = document.getElementById('detail-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalDate = document.getElementById('modal-date');
const modalTag = document.getElementById('modal-tag');
const modalTitle = document.getElementById('modal-title');
const modalMediaContainer = document.getElementById('modal-media-container');
const modalExplanation = document.getElementById('modal-explanation');
const modalDownloadBtn = document.getElementById('modal-download');
const modalCopyBtn = document.getElementById('modal-copy');

let currentActiveMedia = null;

// ==========================================
// 1. Giao diện Light / Dark
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
}

// ==========================================
// 2. Phân loại ảnh theo chủ đề
// ==========================================
function detectCategory(item) {
  const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();

  if (text.includes('galaxy') || text.includes('spiral') || text.includes('milky way') || text.includes('ngc')) {
    return { id: 'galaxy', label: '🌀 Thiên hà' };
  }
  if (text.includes('nebula') || text.includes('cloud') || text.includes('dust') || text.includes('star')) {
    return { id: 'nebula', label: '✨ Tinh vân' };
  }
  if (text.includes('mars') || text.includes('jupiter') || text.includes('saturn') || text.includes('moon') || text.includes('sun') || text.includes('planet')) {
    return { id: 'solar', label: '🪐 Hệ Mặt Trời' };
  }
  if (text.includes('earth') || text.includes('aurora') || text.includes('sky') || text.includes('night') || text.includes('comet')) {
    return { id: 'earth', label: '🌍 Trái Đất' };
  }
  return { id: 'other', label: '🚀 Vũ trụ' };
}

// ==========================================
// 3. Tải Dữ Liệu An Toàn Từng API
// ==========================================
async function fetchApodList(params = '') {
  showLoading();
  try {
    const url = `${BASE_URL}?api_key=${API_KEY}${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NASA API gặp sự cố (${response.status}). Vui lòng thử lại!`);
    }

    let data = await response.json();
    allFetchedItems = Array.isArray(data) ? data : [data];

    // Gắn tag chủ đề cho từng phần tử
    allFetchedItems.forEach(item => {
      item.categoryInfo = detectCategory(item);
    });

    categorySelect.value = 'all'; // Reset lọc về tất cả
    applyCategoryFilter();
  } catch (err) {
    showError(err.message);
  }
}

// ==========================================
// 4. Lọc Dữ Liệu & Render Phân Trang
// ==========================================
function applyCategoryFilter() {
  const selectedCat = categorySelect.value;

  if (selectedCat === 'all') {
    filteredItems = [...allFetchedItems];
  } else {
    filteredItems = allFetchedItems.filter(item => item.categoryInfo.id === selectedCat);
  }

  currentPage = 1;
  renderCurrentPage();
}

function renderCurrentPage() {
  if (!filteredItems || filteredItems.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px 0;">
        <p>⚠️ Không tìm thấy ảnh nào thuộc chủ đề này trong bộ 10 ảnh hiện tại.</p>
        <button onclick="categorySelect.value='all'; applyCategoryFilter();" class="btn btn-sm" style="margin-top: 10px;">Xem lại tất cả ảnh</button>
      </div>`;
    paginationNav.classList.add('hidden');
    showContent();
    return;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filteredItems.slice(startIndex, endIndex);

  renderGallery(pageItems);
  updatePaginationUI();
}

function updatePaginationUI() {
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    paginationNav.classList.add('hidden');
    return;
  }

  paginationNav.classList.remove('hidden');
  pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
  
  btnPrev.disabled = (currentPage === 1);
  btnNext.disabled = (currentPage === totalPages);
}

// ==========================================
// 5. Render Thẻ Ảnh
// ==========================================
function renderGallery(items) {
  galleryGrid.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'Box apod-card';
    const imageUrl = item.hdurl || item.url;

    card.innerHTML = `
      <div class="Box-header card-header-flex">
        <div>
          <span class="Label">${item.date || 'NASA'}</span>
          <span class="Label Label--accent">${item.categoryInfo.label}</span>
          <h2 class="card-title">${item.title || 'Không có tiêu đề'}</h2>
        </div>
        <div class="card-actions">
          ${item.media_type === 'image' ? `
            <button class="btn btn-sm btn-download" data-url="${imageUrl}" data-title="${item.title}">
              ⬇️ Tải
            </button>
          ` : ''}
          <button class="btn btn-sm btn-copy" data-url="${imageUrl}">📋 Copy</button>
        </div>
      </div>

      <div class="Box-body media-wrapper" title="Click để xem chi tiết">
        ${item.media_type === 'image' 
          ? `<img src="${item.url}" alt="${item.title}" loading="lazy" />`
          : `<iframe src="${item.url}" title="${item.title}" allowfullscreen></iframe>`
        }
      </div>

      <div class="Box-footer">
        <p class="explanation-text">${item.explanation || 'Không có mô tả.'}</p>
      </div>
    `;

    const mediaWrapper = card.querySelector('.media-wrapper');
    mediaWrapper.addEventListener('click', () => openDetailModal(item));

    galleryGrid.appendChild(card);
  });

  attachCardEvents();
  showContent();
}

// ==========================================
// 6. Modal & Tải Ảnh
// ==========================================
function openDetailModal(item) {
  currentActiveMedia = item;
  modalDate.textContent = item.date || 'N/A';
  modalTag.textContent = item.categoryInfo.label;
  modalTitle.textContent = item.title || '';
  modalExplanation.textContent = item.explanation || '';
  modalMediaContainer.innerHTML = '';

  const imageUrl = item.hdurl || item.url;

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = item.title;
    modalMediaContainer.appendChild(img);
    modalDownloadBtn.classList.remove('hidden');
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = item.url;
    iframe.allowFullscreen = true;
    modalMediaContainer.appendChild(iframe);
    modalDownloadBtn.classList.add('hidden');
  }

  detailModal.classList.remove('hidden');
}

function closeModal() {
  detailModal.classList.add('hidden');
  modalMediaContainer.innerHTML = '';
}

window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeModal(); });
modalCloseBtn.addEventListener('click', closeModal);

async function downloadImage(url, title, buttonEl) {
  const originalText = buttonEl.textContent;
  buttonEl.textContent = '⏳ Đang tải...';

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${(title || 'nasa_image').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    buttonEl.textContent = '✅ Thành công!';
  } catch (err) {
    window.open(url, '_blank');
    buttonEl.textContent = '✅ Đã mở gốc';
  }

  setTimeout(() => buttonEl.textContent = originalText, 2500);
}

function attachCardEvents() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = e.target.getAttribute('data-url');
      navigator.clipboard.writeText(url);
      e.target.textContent = '✅ Đã chép!';
      setTimeout(() => e.target.textContent = '📋 Copy', 2000);
    });
  });

  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = e.target.getAttribute('data-url');
      const title = e.target.getAttribute('data-title');
      downloadImage(url, title, e.target);
    });
  });
}

modalDownloadBtn.addEventListener('click', () => {
  if (currentActiveMedia) {
    const url = currentActiveMedia.hdurl || currentActiveMedia.url;
    downloadImage(url, currentActiveMedia.title, modalDownloadBtn);
  }
});

modalCopyBtn.addEventListener('click', () => {
  if (currentActiveMedia) {
    const url = currentActiveMedia.hdurl || currentActiveMedia.url;
    navigator.clipboard.writeText(url);
    modalCopyBtn.textContent = '✅ Đã chép!';
    setTimeout(() => modalCopyBtn.textContent = '📋 Copy Link', 2000);
  }
});

// Trạng thái hiển thị
function showLoading() {
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  galleryGrid.classList.add('hidden');
  paginationNav.classList.add('hidden');
}

function showError(msg) {
  errorMessage.textContent = msg;
  loadingState.classList.add('hidden');
  errorState.classList.remove('hidden');
  galleryGrid.classList.add('hidden');
  paginationNav.classList.add('hidden');
}

function showContent() {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  galleryGrid.classList.remove('hidden');
}

// Sự kiện
themeToggleBtn.addEventListener('click', toggleTheme);
categorySelect.addEventListener('change', applyCategoryFilter);

btnPrev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderCurrentPage();
  }
});

btnNext.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderCurrentPage();
  }
});

datePicker.addEventListener('change', (e) => {
  if (e.target.value) {
    fetchApodList(`&date=${e.target.value}`);
  }
});

btnReload.addEventListener('click', () => {
  fetchApodList('&count=10');
});

btnRandom.addEventListener('click', () => {
  fetchApodList('&count=10');
});

function setMaxDate() {
  const today = new Date().toISOString().split('T')[0];
  datePicker.max = today;
}

// Init Khởi tạo ứng dụng
initTheme();
setMaxDate();
fetchApodList('&count=10'); // Mặc định tải 10 ảnh