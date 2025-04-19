const apiKey = '42e8a383317db0a25624e00585d30469';

// --- Cấu hình Danh mục - Genre ---
const genres = [
    { id: 28, name: "Hành động" },
    { id: 35, name: "Hài hước" },
    { id: 18, name: "Tâm lý" },
    { id: 27, name: "Kinh dị" },
    { id: 10749, name: "Lãng mạn" },              
    { id: 878, name: "Khoa học viễn tưởng" },
    { id: 12, name: "Phiêu lưu" },
    { id: 53, name: "Hồi hộp" },
    { id: 99, name: "Phim tài liệu" }
];
// --- Cấu hình quốc gia (Country) ---
const countries = [
    { code: "US", name: "Mỹ" },
    { code: "KR", name: "Hàn Quốc" },
    { code: "JP", name: "Nhật Bản" },
    { code: "VN", name: "Việt Nam" },
    { code: "FR", name: "Pháp" },
    { code: "IN", name: "Ấn Độ" },
    { code: "CN", name: "Trung Quốc" },
];
// --- Cấu hình Danh mục tùy chỉnh ---
const customCategories = [
    { name: "Phim Thịnh Hành Trong Tuần", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Được Đánh Giá Cao", url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=vi&page=1®ion=VN` },
    { name: "Chương Trình TV Thịnh Hành", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Hoạt Hình Mới Nhất", url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc` },
];

const genreMenu = document.getElementById('genre-menu');
const categorySectionsContainer = document.getElementById('category-sections');



/* 1. JS hiển thị dropdown Genre ở navbar */
genres.forEach(genre => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#genre-${genre.id}" data-id="${genre.id}">${genre.name}</a>`;
    genreMenu.appendChild(li);
});

document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link'); 

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname.split('/').pop(); 

        link.classList.remove('active');
        link.removeAttribute('aria-current');

        if (currentPath === linkPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    const genreMenuItems = document.querySelectorAll('#genre-menu .dropdown-item');
    genreMenuItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
    });

    const countryMenuItems = document.querySelectorAll('#country-menu .dropdown-item');
    countryMenuItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
    });
});

const countryMenu = document.getElementById('country-menu');
countries.forEach(country => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#country-${country.code}" data-code="${country.code}">${country.name}</a>`;
    countryMenu.appendChild(li);
});

async function fetchAndDisplayFilteredMovies(title, apiUrl) {
    const heroSection = document.getElementById('hero-section');
    const container = document.getElementById('category-sections');

    if (heroSection) heroSection.style.display = 'none';
    container.innerHTML = '';

    const sectionTitle = document.createElement('h2');
    sectionTitle.classList.add('section-title', 'my-4');
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);

    const movieGrid = document.createElement('div');
    movieGrid.classList.add('movie-grid');
    container.appendChild(movieGrid);

    try {
        const pagePromises = [3, 4, 5].map(page =>
            fetch(apiUrl + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })
        );
        const pageResults = await Promise.all(pagePromises);
        const results = pageResults.flatMap(data => data.results || []);

        if (results.length === 0) {
            movieGrid.innerHTML = '<p class="text-muted">Không có nội dung.</p>';
            return;
        }

        results.forEach(item => {
            const card = createMediaCard(item, 'movie');
            movieGrid.appendChild(card);
        });
    } catch (error) {
        console.error(`Error fetching filtered movies:`, error);
        movieGrid.innerHTML = `<p class="text-danger">Lỗi tải danh mục.</p>`;
    }
}

// --- Hàm hiển thị danh sách phim và TV theo quốc gia ---
async function fetchAndDisplayFilteredMoviesAndTV(title, apiUrlMovie, apiUrlTV) {
    const heroSection = document.getElementById('hero-section');
    const container = document.getElementById('category-sections');

    if (heroSection) heroSection.style.display = 'none';
    container.innerHTML = '';

    const sectionTitle = document.createElement('h2');
    sectionTitle.classList.add('section-title', 'my-4');
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);

    const movieGrid = document.createElement('div');
    movieGrid.classList.add('movie-grid');
    container.appendChild(movieGrid);

    try {
        const moviePages = [2, 3].map(page =>
            fetch(apiUrlMovie + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })
        );
        const tvPages = [2, 4].map(page =>
            fetch(apiUrlTV + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })
        );
        const [movieResults, tvResults] = await Promise.all([
            Promise.all(moviePages),
            Promise.all(tvPages)
        ]);
        const results = [
            ...movieResults.flatMap(data => data.results || []),
            ...tvResults.flatMap(data => data.results || [])
        ];

        if (results.length === 0) {
            movieGrid.innerHTML = `<p class="text-muted text-center">Không tìm thấy phim hoặc chương trình TV cho quốc gia này.</p>`;
            return;
        }

        results.forEach(item => {
            const mediaType = item.title ? 'movie' : 'tv';
            const card = createMediaCard(item, mediaType);
            movieGrid.appendChild(card);
        });
    } catch (error) {
        console.error(`Error fetching filtered movies and TV:`, error);
        movieGrid.innerHTML = `<p class="text-danger">Lỗi tải danh mục.</p>`;
    }
}

// --- Hàm tạo thẻ phim (card) ---
function createMediaCard(media, mediaType) {
    const { id, backdrop_path, poster_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';
    let imagePath = poster_path || backdrop_path;
    let imageUrl = imagePath
        ? `https://image.tmdb.org/t/p/w300${imagePath}`
        : 'https://via.placeholder.com/300x450/222/fff?text=No+Image';

    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
        <a href="watch.html?id=${id}&mediaType=${mediaType}" class="text-decoration-none text-dark">
            <img src="${imageUrl}" alt="${movieTitle}" class="img-fluid rounded"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450/222/fff?text=No+Image';">
            <div class="movie-title mt-2 text-center">
                <b>${movieTitle}</b>
            </div>
        </a>
    `;
    return card;
}

// --- Xử lý sự kiện click vào thể loại ---
genreMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        const genreId = e.target.getAttribute('data-id');
        const genreName = e.target.textContent;
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=${genreId}&sort_by=popularity.desc`;
        fetchAndDisplayFilteredMovies(`Thể loại: ${genreName}`, apiUrl);
    }
});

// --- Xử lý sự kiện click vào quốc gia ---
countryMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        const countryCode = e.target.getAttribute('data-code');
        const countryName = e.target.textContent;
        const apiUrlMovie = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_origin_country=${countryCode}&sort_by=popularity.desc`;
        const apiUrlTV = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=vi&with_origin_country=${countryCode}&sort_by=popularity.desc`;

        fetchAndDisplayFilteredMoviesAndTV(`Quốc gia: ${countryName}`, apiUrlMovie, apiUrlTV);
    }
});

/* 2. Làm JS hiển thị Hero Section và Film Categories */
// --- Hàm tạo cấu trúc HTML cho một thẻ phim (item) dựa trên dữ liệu từ API ---
function createMediaCard(media, mediaType) {
    const { id, backdrop_path, poster_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';
    const imagePath = poster_path || backdrop_path;
    const imageUrl = imagePath ? `https://image.tmdb.org/t/p/w300${imagePath}` : 'https://via.placeholder.com/300x450?text=No+Image';

    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
        <a href="watch.html?id=${id}&mediaType=${mediaType}" class="text-decoration-none text-dark">
            <img src="${imageUrl}" alt="${movieTitle}" class="img-fluid rounded">
            <div class="movie-title mt-2 text-center">
                <b>${movieTitle}</b>
            </div>
        </a>
    `;
    return card;
}

// --- Hàm khởi tạo Owl Carousel cho một ID (danh mục phim cụ thể) sau khi đã thêm các thẻ phim vào. ---
function initCategoryCarousel(carouselId) {
    const carouselElement = $(`#${carouselId}`);
    if (carouselElement.length > 0 && !carouselElement.hasClass('owl-loaded')) {
        carouselElement.owlCarousel({
            loop: false, margin: 15, nav: false, dots: false, lazyLoad: true,
            responsive: { 0: { items: 2 }, 576: { items: 3 }, 768: { items: 4 }, 992: { items: 5 }, 1200: { items: 6 } }
        });
        const section = carouselElement.closest('.category-section');
        if (section.length > 0) {
            section.find('.category-prev-btn').off('click').on('click', function () { carouselElement.trigger('prev.owl.carousel'); });
            section.find('.category-next-btn').off('click').on('click', function () { carouselElement.trigger('next.owl.carousel'); });
        } else { console.warn(`Could not find parent .category-section for carousel #${carouselId}`); }
    } else if (carouselElement.length === 0) { console.warn(`Carousel element #${carouselId} not found.`); }
}

// --- Hàm tạo cấu trúc HTML cho một Section Category ---
function createCategorySection(title, carouselId, anchorId = '') {
    const section = document.createElement('section');
    section.classList.add('category-section', 'my-5');
    if (anchorId) { section.id = anchorId; }
    section.innerHTML = `
        <div class="container">
            <div class="section-header d-flex justify-content-between align-items-center mb-4">
                <h2 class="section-title" id="${anchorId}">${title}</h2>
                <div class="custom-nav-buttons">
                    <button class="category-prev-btn"><span class="carousel-nav-icon">❮</span></button>
                    <button class="category-next-btn"><span class="carousel-nav-icon">❯</span></button>
                </div>
            </div>
            <div class="owl-carousel owl-theme category-carousel" id="${carouselId}">
                 <div class="text-center text-muted p-3">Đang tải...</div>
            </div>
        </div>`;
    if (categorySectionsContainer) { categorySectionsContainer.appendChild(section); }
    else { console.error("Container #category-sections not found."); }
}

// --- Hàm fetch dữ liệu và hiển thị cho một category ---
async function fetchAndDisplayCategory(title, apiUrl, carouselId, mediaType = 'movie', anchorId = '') {
    createCategorySection(title, carouselId, anchorId);  
    await new Promise(resolve => setTimeout(resolve, 0));
    const container = document.getElementById(carouselId);
    if (!container) { console.error(`Container #${carouselId} not found for ${title}.`); return; }
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${apiUrl}`);
        const data = await response.json();
        container.innerHTML = '';
        const results = data.results || [];
        if (results.length === 0) { container.innerHTML = '<p class="text-muted ms-3">Không có nội dung.</p>'; return; }
        results.slice(0, 20).forEach(item => {
            let itemMediaType = mediaType;
            if (item.media_type && (!mediaType || mediaType !== item.media_type)) {
                itemMediaType = item.media_type;
            } else if (!mediaType) {
                itemMediaType = item.title ? 'movie' : (item.name ? 'tv' : 'movie');
            }

            if (itemMediaType === 'person') return;

            const card = createMediaCard(item, itemMediaType);
            container.appendChild(card);
        });
        initCategoryCarousel(carouselId);
    } catch (error) {
        console.error(`Error fetching category "${title}":`, error);
        container.innerHTML = `<p class="text-danger ms-3">Lỗi tải danh mục.</p>`;
    }
}

// --- Hàm fetch Hero ---
async function fetchHeroMovies() {
    const listUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=vi&page=1`;
    const container = $('#hero-carousel');
    container.empty().addClass('loading');

    try {
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
        const listData = await listResponse.json();

        const topShowsBasic = listData.results
            .filter(tvShow => tvShow.backdrop_path)
            .slice(0, 6);

        if (topShowsBasic.length === 0) {
            container.html('<p class="text-muted text-center">Không tìm thấy TV shows phù hợp.</p>');
            container.removeClass('loading');
            return;
        }
        const detailPromises = topShowsBasic.map(basicShow => {
            const detailUrl = `https://api.themoviedb.org/3/tv/${basicShow.id}?api_key=${apiKey}&language=vi&append_to_response=content_ratings`;
            return fetch(detailUrl).then(res => res.ok ? res.json() : null)
                .catch(error => { console.error(`Error fetching detail for ${basicShow.id}:`, error); return null; });
        });

        const detailedShowsData = await Promise.all(detailPromises);

        detailedShowsData.forEach((detailedShow, index) => {
            if (!detailedShow) return;
            const basicShow = topShowsBasic[index];
            if (!basicShow) return;

            const bgImage = `https://image.tmdb.org/t/p/original${basicShow.backdrop_path}`;
            const name = detailedShow.name || basicShow.name;
            const overview = detailedShow.overview || basicShow.overview || "Chưa có mô tả.";
            const airDate = detailedShow.first_air_date;
            const year = airDate ? airDate.substring(0, 4) : '';
            const countryCodes = detailedShow.origin_country || basicShow.origin_country || [];
            const countryDisplay = countryCodes.length > 0 ? countryCodes[0] : '';
            const episodeCount = detailedShow.number_of_episodes;
            let ageRating = '';
            if (detailedShow.content_ratings?.results) {
                const ratings = detailedShow.content_ratings.results;
                const vnRating = ratings.find(r => r.iso_3166_1 === 'VN');
                const usRating = ratings.find(r => r.iso_3166_1 === 'US');
                ageRating = vnRating?.rating || usRating?.rating || '';
                if (ageRating.startsWith('TV-')) ageRating = ageRating.substring(3);
            }

            const item = `
              <div class="item" style="background-image: url('${bgImage}');">
                <div class="overlay">
                  <h3>${name}</h3>
                  <div class="hero-metadata">
                    ${year ? `<span>${year}</span>` : ''}
                    ${ageRating ? `<span class="separator">•</span><span class="age-rating">${ageRating}</span>` : ''}
                    ${episodeCount ? `<span class="separator">•</span><span>${episodeCount} tập</span>` : ''}
                    ${countryDisplay ? `<span class="separator">•</span><span>${countryDisplay}</span>` : ''}
                    ${detailedShow.vote_average ? `<span class="separator">•</span><span><i class="fas fa-star star-icon"></i> ${detailedShow.vote_average.toFixed(1)}</span>` : ''}
                  </div>
                  <p class="hero-overview">${overview.substring(0, 120)}${overview.length > 120 ? '...' : ''}</p>
                  <a href="watch.html?id=${basicShow.id}&mediaType=tv" class="btn btn-warning mt-2 btn-hero-detail">Xem chi tiết</a>
                </div>
              </div>
            `;
            container.append(item);
        });

        // Khởi tạo Owl Carousel cho hero section: 
        if (container.hasClass('owl-loaded')) {
            container.trigger('destroy.owl.carousel');
        }
        if (container.children().length > 0) {
            container.owlCarousel({
                items: 1, loop: container.children().length > 1, nav: true, dots: false, autoplay: true, autoplayTimeout: 6000, autoplayHoverPause: true, lazyLoad: true,
                navText: ["<span class='owl-prev-icon'>❮</span>", "<span class='owl-next-icon'>❯</span>"]
            });
        } else {
            container.html('<p class="text-muted text-center">Không có TV shows nào để hiển thị.</p>');
        }

    } catch (error) {
        console.error("Error fetching hero TV shows (overall):", error);
        container.html('<p class="text-danger text-center">Lỗi khi tải TV shows nổi bật.</p>');
    } finally {
        container.removeClass('loading');
    }
}

// --- Hàm khởi tạo ứng dụng ---
let selectedGenreId = null;
let selectedGenreName = null;
let selectedCountryCode = null;
let selectedCountryName = null;33

// --- Hàm hiển thị danh sách phim theo thể loại và/hoặc quốc gia ---
async function fetchAndDisplayFilteredMoviesCombined() {
    const heroSection = document.getElementById('hero-section');
    const container = document.getElementById('category-sections');
    if (heroSection) heroSection.style.display = 'none';
    container.innerHTML = '';

    // Tạo tiêu đề lọc động
    let title = '';
    if (selectedGenreName && selectedCountryName) {
        title = `Thể loại: ${selectedGenreName} | Quốc gia: ${selectedCountryName}`;
    } else if (selectedGenreName) {
        title = `Thể loại: ${selectedGenreName}`;
    } else if (selectedCountryName) {
        title = `Quốc gia: ${selectedCountryName}`;
    } else {
        title = 'Tất cả phim';
    }

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'category-filter-title';
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);

    const divider = document.createElement('hr');
    divider.className = 'category-filter-divider';
    container.appendChild(divider);

    const movieGrid = document.createElement('div');
    movieGrid.classList.add('movie-grid');
    container.appendChild(movieGrid);

    let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&sort_by=popularity.desc`;
    if (selectedGenreId) apiUrl += `&with_genres=${selectedGenreId}`;
    if (selectedCountryCode) apiUrl += `&with_origin_country=${selectedCountryCode}`;

    try {
        const pagePromises = [1, 2, 3].map(page =>
            fetch(apiUrl + `&page=${page}`).then(res => res.ok ? res.json() : { results: [] })
        );
        const pageResults = await Promise.all(pagePromises);
        const results = pageResults.flatMap(data => data.results || []);

        if (results.length === 0) {
            movieGrid.innerHTML = '<p class="text-muted">Không có nội dung.</p>';
            return;
        }

        results.forEach(item => {
            const card = createMediaCard(item, 'movie');
            movieGrid.appendChild(card);
        });
    } catch (error) {
        console.error(`Error fetching filtered movies:`, error);
        movieGrid.innerHTML = `<p class="text-danger">Lỗi tải danh mục.</p>`;
    }
}

// --- Xử lý sự kiện click vào thể loại ---
genreMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        selectedGenreId = e.target.getAttribute('data-id');
        selectedGenreName = e.target.textContent;
        fetchAndDisplayFilteredMoviesCombined();
    }
});

// --- Xử lý sự kiện click vào quốc gia ---
countryMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        selectedCountryCode = e.target.getAttribute('data-code');
        selectedCountryName = e.target.textContent;
        fetchAndDisplayFilteredMoviesCombined();
    }
});

function initializeApp() {
    fetchHeroMovies();

    genres.forEach(genre => {
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=${genre.id}&sort_by=popularity.desc`;
        const carouselId = `genre-${genre.id}-carousel`;
        const anchorId = `genre-${genre.id}`;
        fetchAndDisplayCategory(genre.name, apiUrl, carouselId, 'movie', anchorId);
    });

    customCategories.forEach((category, index) => {
        const carouselId = `custom-category-${index}-carousel`;
        let mediaType = '';
        if (category.name === "Phim Hoạt Hình Mới Nhất" || category.name === "Phim Được Đánh Giá Cao" || category.name === "Phim Thịnh Hành Trong Tuần") {
            mediaType = 'movie';
        } else if (category.name === "Chương Trình TV Thịnh Hành") {
            mediaType = 'tv';
        }
        fetchAndDisplayCategory(category.name, category.url, carouselId, mediaType);
    });

    /* ---4.  Xử lý sự kiện khác */
    // Search Form
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Chuyển hướng đến trang search.html với query parameter
                window.location.href = `search.html?query=${encodeURIComponent(searchTerm)}`;
            } else {
                // Tùy chọn: thông báo cho người dùng nhập từ khóa hoặc focus vào input
                searchInput.focus();
                // Hoặc: alert('Vui lòng nhập từ khóa tìm kiếm.');
            }
        });
    }
    // Scroll to Genre Section
    const animeLink = document.getElementById('anime-link');
    if (animeLink) {
        animeLink.addEventListener('click', (e) => {
            e.preventDefault();
            const cartoonSection = Array.from(document.querySelectorAll('.category-section .section-title'))
                .find(titleEl => titleEl.textContent === "Phim Hoạt Hình Mới Nhất")
                ?.closest('.category-section');
            if (cartoonSection) cartoonSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            else alert("Không tìm thấy mục Phim Hoạt Hình Mới Nhất.");
        });
    }
    genreMenu.addEventListener('click', function (e) {
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}



// --- Chạy khi DOM sẵn sàng ---
$(document).ready(initializeApp);  