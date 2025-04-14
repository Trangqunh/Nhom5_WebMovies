const apiKey = '42e8a383317db0a25624e00585d30469';
const searchResultsContainer = document.getElementById('search-results-container');
const searchTitleElement = document.getElementById('search-title');

// --- Hàm tạo thẻ phim (Copy từ indexapp.js hoặc tạo file utils.js) ---
function createMediaCard(media, mediaType) {
    const { id, backdrop_path, poster_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';
    // Ưu tiên poster_path, nếu không có thì dùng backdrop_path
    const imagePath = poster_path || backdrop_path;
    const card = document.createElement("div");
    card.classList.add("item"); // Thêm class item để phù hợp grid/carousel styling
    const imageUrl = imagePath
        ? `https://image.tmdb.org/t/p/w300${imagePath}` // w300 là kích thước hợp lý cho grid
        : 'https://via.placeholder.com/300x450?text=No+Image'; // Placeholder

    card.innerHTML = `
      <div class="movie-item">
        <a href="watch.html?id=${id}&mediaType=${mediaType}" style="text-decoration: none; color: inherit;">
          <img src="${imageUrl}" alt="${movieTitle}" loading="lazy">
          <div class="title">
            <b title="${movieTitle}">${movieTitle}</b>
          </div>
        </a>
      </div>`;
    return card;
}

// --- Hàm lấy và hiển thị kết quả tìm kiếm ---
async function fetchSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (!query) {
        searchTitleElement.textContent = "Vui lòng nhập từ khóa tìm kiếm.";
        searchResultsContainer.innerHTML = ''; // Clear results
        return;
    }

    searchTitleElement.innerHTML = `Kết quả tìm kiếm cho: <span>"${query}"</span>`; // Update title
    searchResultsContainer.innerHTML = '<div class="text-center text-muted p-3">Đang tải kết quả...</div>'; // Loading state

    // Sử dụng endpoint /search/multi để tìm cả phim và TV shows
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=vi&query=${encodeURIComponent(query)}&page=1&include_adult=false`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const results = data.results || [];

        searchResultsContainer.innerHTML = ''; // Clear loading state

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p class="no-results">Không tìm thấy kết quả nào phù hợp.</p>';
            return;
        }

        // Lọc và hiển thị kết quả (chỉ lấy movie và tv)
        results.forEach(item => {
            // Bỏ qua nếu không phải movie hoặc tv, hoặc không có poster/backdrop
            if ((item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path)) {
                 // Xác định đúng mediaType cho link watch.html
                 const mediaType = item.media_type; // 'movie' hoặc 'tv'
                 const card = createMediaCard(item, mediaType);
                 searchResultsContainer.appendChild(card);
            }
            // Bạn có thể xử lý item.media_type === 'person' nếu muốn
        });

    } catch (error) {
        console.error("Error fetching search results:", error);
        searchResultsContainer.innerHTML = '<p class="text-danger text-center">Đã xảy ra lỗi khi tìm kiếm.</p>';
        searchTitleElement.textContent = "Lỗi tìm kiếm"; // Update title on error
    }
}


// --- Xử lý sự kiện tìm kiếm trên trang search.html (nếu người dùng tìm kiếm lại từ đây) ---
function setupSearchFormListener() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Chuyển hướng đến chính trang search.html với query mới
                window.location.href = `search.html?query=${encodeURIComponent(searchTerm)}`;
            } else {
                // Có thể thêm thông báo yêu cầu nhập từ khóa
                searchInput.focus();
            }
        });
    } else {
         console.error("Search form or input not found on search page.");
    }
}


// --- Navbar Active Link Handler (Copy từ file khác hoặc utils.js) ---
function handleNavbarActiveLink() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname.split('/').pop();

        link.classList.remove('active');
        link.removeAttribute('aria-current');

        // Trang search không thuộc mục nào nên không cần active
        // Xử lý active cho các trang khác nếu người dùng điều hướng từ trang search
        if (currentPath === linkPath && currentPath !== 'search.html') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else if ((currentPath === '' || currentPath === 'indexmovie.html') && linkPath === 'indexmovie.html') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
     // Đảm bảo dropdown "Genre" không bao giờ có trạng thái active
    const genreDropdown = document.getElementById('genreDropdown');
    if (genreDropdown) {
        genreDropdown.classList.remove('active');
        genreDropdown.removeAttribute('aria-current');
    }
}

// --- Populate Genre Dropdown (Optional - Có thể copy logic từ indexapp.js nếu cần) ---
function populateGenreDropdown() {
    // Bạn có thể copy phần render genre dropdown từ indexapp.js vào đây
    // Hoặc để đơn giản, bạn có thể copy các thẻ <li> tĩnh từ indexmovie.html vào ul#genre-menu-search
    // và ul#footer-genre-links-search trong search.html
    console.log("Populate Genre Dropdown (Search Page) - Implementation needed if dynamic genres are required here.");
    // Ví dụ copy tĩnh: Tìm ul#genre-menu-search và thêm các <li>...</li> vào đó.
}

// --- Khởi chạy khi trang tải xong ---
document.addEventListener('DOMContentLoaded', () => {
    handleNavbarActiveLink();
    setupSearchFormListener(); // Thêm listener cho form trên trang này
    fetchSearchResults(); // Bắt đầu tìm kiếm dựa trên URL
    populateGenreDropdown(); // Gọi hàm để tạo dropdown genre (nếu cần)
});