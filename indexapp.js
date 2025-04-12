const apiKey = '42e8a383317db0a25624e00585d30469';

// --- Cấu hình Danh mục ---
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

const customCategories = [ 
    { name: "Phim Thịnh Hành Trong Tuần", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Được Đánh Giá Cao", url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=vi&page=1®ion=VN` },
    { name: "Chương Trình TV Thịnh Hành", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Hoạt Hình Mới Nhất", url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc` },
];

const genreMenu = document.getElementById('genre-menu');
const categorySectionsContainer = document.getElementById('category-sections');

// --- Render Genre Dropdown ---
genres.forEach(genre => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#genre-${genre.id}" data-id="${genre.id}">${genre.name}</a>`;
    genreMenu.appendChild(li);
});

// --- Hàm tạo thẻ phim ---
function createMediaCard(media, mediaType) {
    const { id, backdrop_path, poster_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';
    const imagePath = poster_path || backdrop_path;
    const card = document.createElement("div");
    card.classList.add("item");
    const imageUrl = imagePath ? `https://image.tmdb.org/t/p/w300${imagePath}` : 'https://via.placeholder.com/300x450?text=No+Image';
    card.innerHTML = `
      <div class="movie-item">
        <img src="${imageUrl}" alt="${movieTitle}" loading="lazy">
        <div class="title">
          <a href="watch.html?id=${id}&mediaType=${mediaType}" title="${movieTitle}">${movieTitle}</a>
        </div>
      </div>`;
    return card;
}

// --- Hàm khởi tạo Owl Carousel cho một ID ---
function initCategoryCarousel(carouselId) {
    const carouselElement = $(`#${carouselId}`);
    if (carouselElement.length > 0 && !carouselElement.hasClass('owl-loaded')) {
        carouselElement.owlCarousel({
            loop: false, margin: 15, nav: false, dots: false, lazyLoad: true,
            responsive: { 0:{items:2}, 576:{items:3}, 768:{items:4}, 992:{items:5}, 1200:{items:6} }
        });
        const section = carouselElement.closest('.category-section');
        if (section.length > 0) {
            section.find('.category-prev-btn').off('click').on('click', function () { carouselElement.trigger('prev.owl.carousel'); });
            section.find('.category-next-btn').off('click').on('click', function () { carouselElement.trigger('next.owl.carousel'); });
        } else { console.warn(`Could not find parent .category-section for carousel #${carouselId}`); }
    } else if (carouselElement.length === 0) { console.warn(`Carousel element #${carouselId} not found.`); }
}

// --- Hàm tạo HTML cho một Section Category ---
function createCategorySection(title, carouselId, anchorId = '') {
    const section = document.createElement('section');
    section.classList.add('category-section', 'my-5');
    if (anchorId) { section.id = anchorId; }
    section.innerHTML = `
        <div class="container">
            <div class="section-header d-flex justify-content-between align-items-center mb-4">
                <h2 class="section-title">${title}</h2>
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

         // Bước 5: Khởi tạo Owl Carousel
        if (container.hasClass('owl-loaded')) {
            container.trigger('destroy.owl.carousel');
        }
        if (container.children().length > 0) {
            container.owlCarousel({
                items: 1, loop: container.children().length > 1, nav: true, dots: false, autoplay: true, autoplayTimeout: 6000, autoplayHoverPause: true, lazyLoad: true,
                navText: ["<span class='owl-prev-icon'>❮</span>","<span class='owl-next-icon'>❯</span>"]
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
         if(category.name === "Phim Hoạt Hình Mới Nhất" || category.name === "Phim Được Đánh Giá Cao" || category.name === "Phim Thịnh Hành Trong Tuần") {
             mediaType = 'movie'; 
         } else if (category.name === "Chương Trình TV Thịnh Hành") {
             mediaType = 'tv';
         }
        fetchAndDisplayCategory(category.name, category.url, carouselId, mediaType);
    });

    // --- Xử lý sự kiện khác ---
    // Search Form
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
     if(searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                alert(`Chức năng tìm kiếm "${searchTerm}" chưa được triển khai.`);
            }
        });
    }
    // Scroll to Genre Section
     const animeLink = document.getElementById('anime-link');
     if(animeLink){
         animeLink.addEventListener('click', (e) => {
             e.preventDefault();
             const cartoonSection = Array.from(document.querySelectorAll('.category-section .section-title'))
                                        .find(titleEl => titleEl.textContent === "Phim Hoạt Hình Mới Nhất")
                                        ?.closest('.category-section');
             if(cartoonSection) cartoonSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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