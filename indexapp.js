// --- START OF FILE indexapp.js ---

const apiKey = '42e8a383317db0a25624e00585d30469';

// --- Cấu hình Danh mục - Genre (Dùng cho Dropdown Lọc & Filter Bar) ---
const genres = [
    { id: 28, name: "Hành động" }, { id: 35, name: "Hài hước" }, { id: 18, name: "Tâm lý" },
    { id: 27, name: "Kinh dị" }, { id: 10749, name: "Lãng mạn" }, { id: 878, name: "Khoa học viễn tưởng" },
    { id: 12, name: "Phiêu lưu" }, { id: 53, name: "Hồi hộp" }, { id: 99, name: "Phim tài liệu" },
    { id: 16, name: "Hoạt Hình" }, { id: 10751, name: "Gia đình" }, { id: 14, name: "Giả tưởng" },
    { id: 36, name: "Lịch sử" }, { id: 10402, name: "Âm nhạc" }, { id: 9648, name: "Bí ẩn" },
    { id: 10752, name: "Chiến tranh" }, { id: 37, name: "Miền Tây" }
];
// --- Cấu hình quốc gia (Country) (Dùng cho Dropdown Lọc & Filter Bar) ---
const countries = [
    { code: "US", name: "Mỹ" }, { code: "KR", name: "Hàn Quốc" }, { code: "JP", name: "Nhật Bản" },
    { code: "VN", name: "Việt Nam" }, { code: "FR", name: "Pháp" }, { code: "IN", name: "Ấn Độ" },
    { code: "CN", name: "Trung Quốc" }, { code: "GB", name: "Anh" }, { code: "ES", name: "Tây Ban Nha" },
    { code: "TH", name: "Thái Lan" }
];
// --- Cấu hình Sắp xếp (Dùng cho Filter Bar) ---
const sortOptions = [
    { value: "popularity.desc", name: "Phổ biến nhất" },
    { value: "vote_average.desc", name: "Điểm cao nhất" },
    { value: "primary_release_date.desc", name: "Ngày ra mắt mới nhất (Phim)" },
    { value: "first_air_date.desc", name: "Ngày phát sóng mới nhất (TV)" },
];

// --- Cấu hình Danh mục chính hiển thị trên Trang chủ (Mặc định) ---
const mainPageCategories = [
    { name: "Phim Thịnh Hành Trong Tuần", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi`, mediaType: 'movie' },
    { name: "Phim Chiếu Rạp Mới Nhất", url: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=vi&page=1®ion=VN`, mediaType: 'movie' },
    { name: "Phim Lẻ Nổi Bật", url: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=vi&page=1®ion=VN`, mediaType: 'movie' },
    { name: "Phim Được Đánh Giá Cao", url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=vi&page=1®ion=VN`, mediaType: 'movie' },
    { name: "Chương Trình TV Thịnh Hành", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=vi`, mediaType: 'tv' },
    { name: "Phim Hoạt Hình Mới Nhất", url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc`, mediaType: 'movie' },
];

// --- Lấy phần tử DOM ---
const genreMenu = document.getElementById('genre-menu');
const countryMenu = document.getElementById('country-menu');
const categorySectionsContainer = document.getElementById('category-sections');
const heroSection = document.getElementById('hero-section');

/* --- START: Phần xử lý Dropdown và Navbar --- */

// --- Hiển thị dropdown Genre ở navbar ---
genres.forEach(genre => {
    const li = document.createElement('li');
    // Thêm thuộc tính để biết đây là link genre trên navbar
    li.innerHTML = `<a class="dropdown-item nav-genre-link" href="#" data-id="${genre.id}" data-name="${genre.name}">${genre.name}</a>`;
    genreMenu.appendChild(li);
});

// --- Hiển thị dropdown Country ở navbar ---
countries.forEach(country => {
    const li = document.createElement('li');
    // Thêm thuộc tính để biết đây là link country trên navbar
    li.innerHTML = `<a class="dropdown-item nav-country-link" href="#" data-code="${country.code}" data-name="${country.name}">${country.name}</a>`;
    countryMenu.appendChild(li);
});

// --- Đánh dấu link active trên Navbar ---
function updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const linkUrl = new URL(link.href, window.location.origin);
        const linkPath = linkUrl.pathname.split('/').pop();

        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (currentPath === linkPath || ((currentPath === '' || currentPath === 'indexmovie.html') && linkPath === 'indexmovie.html')) {
            if (!link.classList.contains('dropdown-toggle')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        }
    });

    // Đảm bảo các dropdown item không bị active ban đầu
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
    });
}
document.addEventListener('DOMContentLoaded', updateActiveNavLink);

/* --- END: Phần xử lý Dropdown và Navbar --- */


/* --- START: Phần xử lý hiển thị nội dung --- */

// --- Hàm tạo thẻ phim/TV show (card) ---
function createMediaCard(media, mediaType) {
    const { id, backdrop_path, poster_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';
    let imagePath = poster_path || backdrop_path;
    let imageUrl = imagePath
        ? `https://image.tmdb.org/t/p/w300${imagePath}`
        : 'https://via.placeholder.com/300x450/222/fff?text=No+Image';

    const card = document.createElement('div');
    // Bỏ class 'item' nếu không dùng cho carousel
    card.classList.add('movie-card');
    card.innerHTML = `
        <a href="watch.html?id=${id}&mediaType=${mediaType}" class="text-decoration-none text-dark movie-item">
            <img src="${imageUrl}" alt="${movieTitle}" class="img-fluid rounded" loading="lazy"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450/222/fff?text=Error';">
            <div class="movie-title mt-2 text-center">
                <b>${movieTitle}</b>
            </div>
        </a>
    `;
    return card;
}

// --- Hàm khởi tạo Owl Carousel cho một danh mục (Trang chủ) ---
function initCategoryCarousel(carouselId) {
    const carouselElement = $(`#${carouselId}`);
    if (carouselElement.length > 0 && !carouselElement.hasClass('owl-loaded')) {
        carouselElement.owlCarousel({
            loop: false, margin: 15, nav: false, dots: false, lazyLoad: true,
            responsive: { 0: { items: 2 }, 576: { items: 3 }, 768: { items: 4 }, 992: { items: 5 }, 1200: { items: 6 } }
        });
        const section = carouselElement.closest('.category-section');
        if (section.length > 0) {
            const prevBtn = section.find('.category-prev-btn');
            const nextBtn = section.find('.category-next-btn');
            if (prevBtn.length > 0) prevBtn.off('click').on('click', () => carouselElement.trigger('prev.owl.carousel'));
            if (nextBtn.length > 0) nextBtn.off('click').on('click', () => carouselElement.trigger('next.owl.carousel'));
        } else { console.warn(`Could not find parent .category-section for carousel #${carouselId}`); }
    } else if (carouselElement.length === 0) { console.warn(`Carousel element #${carouselId} not found.`); }
}

// --- Hàm tạo cấu trúc HTML cho một Section Category (Trang chủ) ---
function createCategorySection(title, carouselId) {
    const section = document.createElement('section');
    section.classList.add('category-section', 'my-5');
    section.innerHTML = `
        <div class="container">
            <div class="section-header d-flex justify-content-between align-items-center mb-4">
                <h2 class="section-title">${title}</h2>
                <div class="custom-nav-buttons">
                    <button class="category-prev-btn" aria-label="Previous"><span class="carousel-nav-icon">❮</span></button>
                    <button class="category-next-btn" aria-label="Next"><span class="carousel-nav-icon">❯</span></button>
                </div>
            </div>
            <div class="owl-carousel owl-theme category-carousel" id="${carouselId}">
                 <div class="text-center text-muted p-5">Đang tải...</div>
            </div>
        </div>`;
    if (categorySectionsContainer) {
        categorySectionsContainer.appendChild(section);
    } else { console.error("Container #category-sections not found."); }
}

// --- Hàm fetch và hiển thị Category Carousel (Trang chủ) ---
async function fetchAndDisplayCategory(title, apiUrl, carouselId, mediaType) {
    createCategorySection(title, carouselId);
    await new Promise(resolve => setTimeout(resolve, 0));
    const container = document.getElementById(carouselId);
    if (!container) return;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${apiUrl}`);
        const data = await response.json();
        container.innerHTML = '';
        const results = data.results || [];
        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted ms-3">Không có nội dung.</p>'; return;
        }
        results.slice(0, 20).forEach(item => {
            let itemMediaType = mediaType;
            if (item.media_type && item.media_type !== 'person') itemMediaType = item.media_type;
            else if (!itemMediaType) itemMediaType = item.title ? 'movie' : (item.name ? 'tv' : 'movie');
            if (itemMediaType === 'person' || !itemMediaType) return;
            const card = createMediaCard(item, itemMediaType);
            card.classList.add('item'); // Thêm lại class 'item' cho carousel
            container.appendChild(card);
        });
        initCategoryCarousel(carouselId);
    } catch (error) {
        console.error(`Error fetching category "${title}":`, error);
        container.innerHTML = `<p class="text-danger ms-3">Lỗi tải danh mục: ${error.message}</p>`;
    }
}

// --- Hàm fetch Hero Section (Trang chủ) ---
async function fetchHeroMovies() {
    const listUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=vi&page=1`;
    const container = $('#hero-carousel');
    container.empty().addClass('loading');
    try {
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
        const listData = await listResponse.json();
        const topShowsBasic = listData.results.filter(tvShow => tvShow.backdrop_path).slice(0, 6);
        if (topShowsBasic.length === 0) {
            container.html('<p class="text-muted text-center p-5">Không tìm thấy TV shows phù hợp.</p>');
            container.removeClass('loading'); return;
        }
        const detailPromises = topShowsBasic.map(basicShow => {
            const detailUrl = `https://api.themoviedb.org/3/tv/${basicShow.id}?api_key=${apiKey}&language=vi&append_to_response=content_ratings`;
            return fetch(detailUrl).then(res => res.ok ? res.json() : null).catch(err => { console.error(err); return null; });
        });
        const detailedShowsData = await Promise.all(detailPromises);
        detailedShowsData.forEach((detailedShow, index) => {
            if (!detailedShow) return;
            const basicShow = topShowsBasic[index]; if (!basicShow) return;
            const bgImage = `https://image.tmdb.org/t/p/original${basicShow.backdrop_path}`;
            const name = detailedShow.name || basicShow.name || 'Không rõ';
            const overview = detailedShow.overview || basicShow.overview || "Chưa có mô tả.";
            const airDate = detailedShow.first_air_date; const year = airDate ? airDate.substring(0, 4) : '';
            const countryCodes = detailedShow.origin_country || []; const countryDisplay = countryCodes.length > 0 ? countryCodes[0] : '';
            const episodeCount = detailedShow.number_of_episodes;
            let ageRating = '';
            if (detailedShow.content_ratings?.results) {
                const ratings = detailedShow.content_ratings.results;
                const vnRating = ratings.find(r => r.iso_3166_1 === 'VN'); const usRating = ratings.find(r => r.iso_3166_1 === 'US');
                ageRating = vnRating?.rating || usRating?.rating || '';
                if (ageRating.startsWith('TV-')) ageRating = ageRating.substring(3);
            }
            const voteAvg = detailedShow.vote_average ? detailedShow.vote_average.toFixed(1) : '';
            const item = `
              <div class="item" style="background-image: url('${bgImage}');"> <div class="overlay"> <h3>${name}</h3> <div class="hero-metadata">
              ${year ? `<span>${year}</span>` : ''} ${ageRating ? `<span class="separator">•</span><span class="age-rating">${ageRating}</span>` : ''}
              ${episodeCount ? `<span class="separator">•</span><span>${episodeCount} tập</span>` : ''} ${countryDisplay ? `<span class="separator">•</span><span>${countryDisplay}</span>` : ''}
              ${voteAvg ? `<span class="separator">•</span><span><i class="fas fa-star star-icon"></i> ${voteAvg}</span>` : ''} </div>
              <p class="hero-overview">${overview.substring(0, 150)}${overview.length > 150 ? '...' : ''}</p>
              <a href="watch.html?id=${basicShow.id}&mediaType=tv" class="btn btn-warning mt-2 btn-hero-detail">Xem chi tiết</a> </div> </div>`;
            container.append(item);
        });
        if (container.hasClass('owl-loaded')) container.trigger('destroy.owl.carousel');
        if (container.children().length > 0) {
            container.owlCarousel({
                items: 1, loop: container.children().length > 1, nav: true, dots: false, autoplay: true,
                autoplayTimeout: 7000, autoplayHoverPause: true, lazyLoad: true,
                navText: ["<span class='owl-prev-icon'>❮</span>", "<span class='owl-next-icon'>❯</span>"]
            });
        } else { container.html('<p class="text-muted text-center p-5">Không có TV shows nào để hiển thị.</p>'); }
    } catch (error) {
        console.error("Error fetching hero TV shows:", error);
        container.html('<p class="text-danger text-center p-5">Lỗi khi tải TV shows nổi bật.</p>');
    } finally { container.removeClass('loading'); }
}

// --- Hàm hiển thị Grid kết quả (Dùng cho Lọc và Tìm kiếm) ---
function displayResultsGrid(results, containerElement) {
    containerElement.innerHTML = ''; // Xóa nội dung cũ (loading hoặc kết quả cũ)
    if (results.length === 0) {
        containerElement.innerHTML = '<p class="text-muted text-center p-5">Không tìm thấy kết quả phù hợp.</p>';
        return;
    }
    results.forEach(item => {
        const mediaType = item.title ? 'movie' : 'tv'; // Xác định type
        const card = createMediaCard(item, mediaType);
        // card.classList.remove('item'); // Đảm bảo không có class item khi ở grid
        containerElement.appendChild(card);
    });
}

// --- Hàm Lọc CHỈ theo Quốc gia (Click Country Navbar) ---
async function fetchAndDisplayFilteredByCountry(countryCode, countryName) {
    if (heroSection) heroSection.style.display = 'none';
    categorySectionsContainer.innerHTML = ''; // Xóa sạch nội dung

    // --- Tạo tiêu đề ---
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'category-filter-title';
    sectionTitle.textContent = `Quốc gia: ${countryName}`;
    categorySectionsContainer.appendChild(sectionTitle);
    const divider = document.createElement('hr');
    divider.className = 'category-filter-divider';
    categorySectionsContainer.appendChild(divider);

    // --- Tạo grid chứa kết quả ---
    const movieGrid = document.createElement('div');
    movieGrid.classList.add('movie-grid'); // Class cho grid layout
    categorySectionsContainer.appendChild(movieGrid);
    movieGrid.innerHTML = '<div class="text-center text-muted p-5">Đang tải kết quả lọc...</div>';

    // --- API URLs ---
    const apiUrlMovie = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&sort_by=popularity.desc&include_adult=false&with_origin_country=${countryCode}`;
    const apiUrlTV = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=vi&sort_by=popularity.desc&include_adult=false&with_origin_country=${countryCode}`;

    try {
        const moviePagePromises = [1, 2].map(page => fetch(apiUrlMovie + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
        const tvPagePromises = [1, 2].map(page => fetch(apiUrlTV + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
        const [moviePageResults, tvPageResults] = await Promise.all([Promise.all(moviePagePromises), Promise.all(tvPagePromises)]);
        const combinedResults = [...moviePageResults.flatMap(d => d.results || []), ...tvPageResults.flatMap(d => d.results || [])];
        displayResultsGrid(combinedResults, movieGrid); // Hiển thị kết quả
    } catch (error) {
        console.error(`Error fetching filtered by country results:`, error);
        movieGrid.innerHTML = `<p class="text-danger text-center p-5">Lỗi tải danh sách phim/TV.</p>`;
    }
}

// --- Hàm hiển thị Giao diện Lọc Đa Tiêu Chí (Click Genre Navbar)---
function displayMultiFilterInterface(genreId, genreName) {
    if (heroSection) heroSection.style.display = 'none';
    categorySectionsContainer.innerHTML = ''; // Xóa sạch nội dung

    // --- Tạo Tiêu đề Thể loại ---
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'category-filter-title';
    sectionTitle.textContent = `Thể loại: ${genreName}`;
    categorySectionsContainer.appendChild(sectionTitle);

    // --- Tạo Thanh Filter ---
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar container mb-4'; // Thêm class container và margin
    filterBar.id = 'multi-filter-bar';

    // --- Tạo các Dropdown cho thanh filter ---
    // 1. Định dạng
    let formatOptions = `<option value="">Định dạng</option><option value="movie">Phim Lẻ</option><option value="tv">Phim Bộ</option>`;
    // 2. Thể loại (Chọn sẵn genre đã click)
    let genreOptions = `<option value="">Thể loại</option>` + genres.map(g => `<option value="${g.id}" ${g.id == genreId ? 'selected' : ''}>${g.name}</option>`).join('');
    // 3. Quốc gia
    let countryOptions = `<option value="">Quốc gia</option>` + countries.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    // 4. Năm (Tạo động từ năm hiện tại về 1950)
    let yearOptions = `<option value="">Năm</option>`;
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1950; year--) {
        yearOptions += `<option value="${year}">${year}</option>`;
    }
    // 5. Sắp xếp
    let sortOptionsHTML = `<option value="">Sắp xếp</option>` + sortOptions.map(s => `<option value="${s.value}">${s.name}</option>`).join('');

    filterBar.innerHTML = `
        <div class="row g-2 justify-content-center">
            <div class="col-md-auto col-6"><select id="filter-format" class="form-select">${formatOptions}</select></div>
            <div class="col-md-auto col-6"><select id="filter-genre" class="form-select">${genreOptions}</select></div>
            <div class="col-md-auto col-6"><select id="filter-country" class="form-select">${countryOptions}</select></div>
            <div class="col-md-auto col-6"><select id="filter-year" class="form-select">${yearOptions}</select></div>
            <div class="col-md-auto col-12 col-md-2"><select id="filter-sort" class="form-select">${sortOptionsHTML}</select></div>
            <div class="col-md-auto col-12"><button id="filter-apply-btn" class="btn btn-warning w-100">Lọc phim</button></div>
        </div>
    `;
    categorySectionsContainer.appendChild(filterBar);

    // --- Thêm gạch ngang ---
    const divider = document.createElement('hr');
    divider.className = 'category-filter-divider';
    categorySectionsContainer.appendChild(divider);

    // --- Tạo grid chứa kết quả ---
    const movieGrid = document.createElement('div');
    movieGrid.id = 'filtered-results-grid'; // ID riêng cho grid này
    movieGrid.classList.add('movie-grid');
    categorySectionsContainer.appendChild(movieGrid);
    movieGrid.innerHTML = '<div class="text-center text-muted p-5">Đang tải kết quả...</div>';

    // --- Gắn Event Listener cho nút "Lọc phim" ---
    document.getElementById('filter-apply-btn').addEventListener('click', () => {
        fetchAndDisplayFilteredMultiCriteria(); // Gọi hàm fetch với các giá trị hiện tại
    });

    // --- Load kết quả ban đầu chỉ với thể loại đã chọn ---
    fetchAndDisplayFilteredMultiCriteria();
}

// --- Hàm Lọc Đa Tiêu Chí (Sử dụng bởi Thanh Filter) ---
async function fetchAndDisplayFilteredMultiCriteria() {
    const resultsGrid = document.getElementById('filtered-results-grid');
    if (!resultsGrid) return; // Thoát nếu grid chưa tồn tại
    resultsGrid.innerHTML = '<div class="text-center text-muted p-5">Đang tải kết quả lọc...</div>'; // Hiển thị loading

    // --- Lấy giá trị từ các select ---
    const format = document.getElementById('filter-format').value;
    const genreId = document.getElementById('filter-genre').value;
    const countryCode = document.getElementById('filter-country').value;
    const year = document.getElementById('filter-year').value;
    const sortBy = document.getElementById('filter-sort').value || 'popularity.desc'; // Mặc định sắp xếp theo phổ biến

    // --- Xây dựng URL API ---
    let baseApiUrlMovie = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&include_adult=false&sort_by=${sortBy}`;
    let baseApiUrlTV = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=vi&include_adult=false&sort_by=${sortBy}`;
    let queryParams = '';

    if (genreId) queryParams += `&with_genres=${genreId}`;
    if (countryCode) queryParams += `&with_origin_country=${countryCode}`;
    if (year) {
        // Thêm tham số năm phù hợp cho movie và tv
        baseApiUrlMovie += `&primary_release_year=${year}`;
        baseApiUrlTV += `&first_air_date_year=${year}`;
    }

    // --- Xác định API cần gọi dựa trên Định dạng ---
    let apiPromises = [];
    if (format === 'movie') {
        apiPromises = [1, 2, 3].map(page => fetch(baseApiUrlMovie + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
    } else if (format === 'tv') {
        apiPromises = [1, 2, 3].map(page => fetch(baseApiUrlTV + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
    } else { // Lấy cả movie và TV
        const moviePromises = [1, 2].map(page => fetch(baseApiUrlMovie + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
        const tvPromises = [1, 2].map(page => fetch(baseApiUrlTV + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] }));
        // Gộp promise lại để chạy song song
        apiPromises = [...moviePromises, ...tvPromises];
    }

    try {
        // Nếu format là 'movie' hoặc 'tv', kết quả trả về là mảng các trang
        // Nếu format là '', kết quả trả về là mảng [[trang movie], [trang tv]] (cần xử lý khác) -> Sửa lại cách gộp promise
        let pageResults;
        if (format === 'movie' || format === 'tv') {
            pageResults = await Promise.all(apiPromises);
        } else {
             // Gọi riêng và đợi từng loại
             const moviePageResults = await Promise.all([1, 2].map(page => fetch(baseApiUrlMovie + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })));
             const tvPageResults = await Promise.all([1, 2].map(page => fetch(baseApiUrlTV + queryParams + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })));
             pageResults = [...moviePageResults, ...tvPageResults]; // Gộp kết quả các trang lại
        }

        const combinedResults = pageResults.flatMap(data => data.results || []);
        displayResultsGrid(combinedResults, resultsGrid); // Hiển thị kết quả
    } catch (error) {
        console.error(`Error fetching multi-criteria filtered results:`, error);
        resultsGrid.innerHTML = `<p class="text-danger text-center p-5">Lỗi tải danh sách phim/TV.</p>`;
    }
}

// --- Xử lý sự kiện click vào Thể loại (Dropdown Navbar) ---
genreMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-genre-link')) { // Chỉ xử lý link genre trên navbar
        e.preventDefault();
        const genreId = e.target.getAttribute('data-id');
        const genreName = e.target.getAttribute('data-name');
        displayMultiFilterInterface(genreId, genreName); // Hiển thị giao diện lọc mới
    }
});

// --- Xử lý sự kiện click vào Quốc gia (Dropdown Navbar) ---
countryMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-country-link')) { // Chỉ xử lý link country trên navbar
        e.preventDefault();
        const countryCode = e.target.getAttribute('data-code');
        const countryName = e.target.getAttribute('data-name');
        fetchAndDisplayFilteredByCountry(countryCode, countryName); // Lọc chỉ theo quốc gia
    }
});

/* --- END: Phần xử lý hiển thị nội dung --- */


/* --- START: Phần xử lý sự kiện khác và Khởi tạo --- */

// --- Hàm hiển thị giao diện Trang chủ Mặc định ---
function displayDefaultHomepage() {
    if (heroSection) heroSection.style.display = 'block'; // Hiện lại Hero
    categorySectionsContainer.innerHTML = ''; // Xóa nội dung cũ (lọc, etc.)

    // Hiển thị các danh mục chính
    mainPageCategories.forEach((category, index) => {
        const carouselId = `main-category-${index}-carousel`;
        fetchAndDisplayCategory(category.name, category.url, carouselId, category.mediaType);
    });
}

// --- Hàm khởi tạo ứng dụng ---
function initializeApp() {
    // 1. Hiển thị Hero Section
    fetchHeroMovies();

    // 2. Hiển thị giao diện trang chủ mặc định
    displayDefaultHomepage();

    // 3. Xử lý sự kiện cho Form tìm kiếm
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `search.html?query=${encodeURIComponent(searchTerm)}`;
            } else {
                searchInput.focus();
            }
        });
    }

    // 4. Xử lý click vào Logo/Home để quay về trang chủ mặc định
    const homeLinks = document.querySelectorAll('a[href="indexmovie.html"]');
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Chỉ xử lý nếu đang ở trang indexmovie.html
            if (window.location.pathname.endsWith('indexmovie.html') || window.location.pathname === '/') {
                e.preventDefault(); // Ngăn chuyển trang nếu đang ở trang chủ
                displayDefaultHomepage(); // Hiển thị lại giao diện mặc định
                updateActiveNavLink(); // Cập nhật lại active link
            }
            // Nếu không phải trang chủ, cứ để nó chuyển trang bình thường
        });
    });
}

// --- Chạy hàm khởi tạo khi DOM sẵn sàng ---
$(document).ready(initializeApp);

// --- END: Phần xử lý sự kiện khác và Khởi tạo ---

// --- END OF FILE indexapp.js ---