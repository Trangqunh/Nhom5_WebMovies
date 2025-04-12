const apiKey = '42e8a383317db0a25624e00585d30469';

//Cấu hình Danh mục
const genres = [ // Danh sách thể loại cho cả dropdown và section
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

const customCategories = [ // Các danh mục tùy chỉnh
    { name: "Phim Thịnh Hành Trong Tuần", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Được Đánh Giá Cao", url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=vi&page=1®ion=VN` },
    { name: "Chương Trình TV Thịnh Hành", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=vi` },
    { name: "Phim Hoạt Hình Mới Nhất", url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc` },
];

const genreMenu = document.getElementById('genre-menu');
const categorySectionsContainer = document.getElementById('category-sections');


//Render Genre Dropdown
genres.forEach(genre => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#genre-${genre.id}" data-id="${genre.id}">${genre.name}</a>`;
    genreMenu.appendChild(li);
});


//Hàm tạo thẻ phim
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

// Hàm fetch phim theo thể loại
async function fetchMoviesByGenre(genreId) {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en&with_genres=${genreId}`;
    const response = await fetch(url);
    const data = await response.json();

    const container = document.querySelector("#movies-section .list-items");
    container.innerHTML = '';

    data.results.forEach(movie => {
        const card = createMediaCard(movie, 'movie');
        container.appendChild(card);
    });
    document.getElementById('movie-type').textContent = genres.find(genre => genre.id === parseInt(genreId))?.name + " genre" || 'N/A';
}

// Lắng nghe chọn thể loại
genreMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        const genreId = e.target.getAttribute('data-id');
        fetchMoviesByGenre(genreId);
    }
});

// Load mặc định thể loại đầu tiên khi mở trang
fetchMoviesByGenre(genres[0].id);

// Hàm fetch phim đang chiếu
async function fetchHeroMovies() {
    const listUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=vi&page=1`;
    const container = $('#hero-carousel');
    container.empty().addClass('loading');

    try {
        //Fetch danh sách cơ bản
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

        //Tạo promises fetch chi tiết
        const detailPromises = topShowsBasic.map(basicShow => {
            const detailUrl = `https://api.themoviedb.org/3/tv/${basicShow.id}?api_key=${apiKey}&language=vi&append_to_response=content_ratings`;
            return fetch(detailUrl).then(res => res.ok ? res.json() : null)
                   .catch(error => { console.error(`Error fetching detail for ${basicShow.id}:`, error); return null; });
        });

        //Đợi promises hoàn thành
        const detailedShowsData = await Promise.all(detailPromises);

        //Tạo HTML
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

    $('#hero-carousel').owlCarousel({
        items: 1,
        loop: true,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        navText: [
            "<span class='owl-prev-icon'>&#10094;</span>",  // ‹
            "<span class='owl-next-icon'>&#10095;</span>"   // ›
        ]
    });
}

// Function to fetch TV series
async function fetchTVSeries() {
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en`;
    const response = await fetch(url);
    const data = await response.json();

    const container = document.querySelector("#movies-section .list-items");
    container.innerHTML = '';

    data.results.forEach(tv => {
        const card = createMediaCard(tv, 'tv');
        container.appendChild(card);
    });
}

// Function to fetch Anime
async function fetchAnime() {
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en&with_genres=16`;
    const response = await fetch(url);
    const data = await response.json();

    const container = document.querySelector("#movies-section .list-items");
    container.innerHTML = '';

    data.results.forEach(anime => {
        const card = createMediaCard(anime, 'tv');
        container.appendChild(card);
    });
}

// Event listeners for TV Series and Anime links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (e.target.textContent === 'TV Series') {
            fetchTVSeries();
        } else if (e.target.textContent === 'Anime') {
            fetchAnime();
        }
    });
});

// Gọi khi trang load
$(document).ready(() => {
    fetchHeroMovies();
});


// Function to fetch latest cartoon movies
async function fetchLatestCartoon() {
 
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const container = $('#cartoon-carousel');
            container.empty(); // Clear any existing content

            // Add each cartoon movie to the carousel
            data.results.forEach(movie => {
                const item = createMediaCard(movie, 'movie');
                container.append(item);
            });

            // Initialize Owl Carousel for cartoon section
            initCartoonCarousel();
        }

    } catch (error) {
        console.error("Error fetching hero TV shows (overall):", error);
        container.html('<p class="text-danger text-center">Lỗi khi tải TV shows nổi bật.</p>');
    } finally {
        container.removeClass('loading');
    }
}


//Hàm khởi tạo ứng dụng
function initializeApp() {
    fetchHeroMovies(); // Fetch hero động

    // Fetch các category từ danh sách genres
    genres.forEach(genre => {
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=${genre.id}&sort_by=popularity.desc`;
        const carouselId = `genre-${genre.id}-carousel`;
        const anchorId = `genre-${genre.id}`;
        fetchAndDisplayCategory(genre.name, apiUrl, carouselId, 'movie', anchorId);
    });

    // Fetch các category tùy chỉnh (bao gồm cả hoạt hình đã thêm vào)
    customCategories.forEach((category, index) => {
        const carouselId = `custom-category-${index}-carousel`;
        // Xác định mediaType cẩn thận hơn
         let mediaType = ''; // Để trống để tự xác định nếu là trending
         if(category.name === "Phim Hoạt Hình Mới Nhất" || category.name === "Phim Được Đánh Giá Cao" || category.name === "Phim Thịnh Hành Trong Tuần") {
             mediaType = 'movie'; // Hoạt hình, Top Rated Movie, Trending Movie chắc chắn là movie
         } else if (category.name === "Chương Trình TV Thịnh Hành") {
             mediaType = 'tv'; // Trending TV chắc chắn là tv
         }
         // Nếu thêm category trending/all, mediaType nên để trống ''

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
    // Scroll links (TV, Anime, Dropdown)
    const tvLink = document.getElementById('tv-series-link');
    if(tvLink) {
        tvLink.addEventListener('click', (e) => {
            e.preventDefault();
            const tvSection = Array.from(document.querySelectorAll('.category-section .section-title'))
                                     .find(titleEl => titleEl.textContent === "Chương Trình TV Thịnh Hành")
                                     ?.closest('.category-section');
            if(tvSection) tvSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            else alert("Không tìm thấy mục Chương Trình TV Thịnh Hành.");
        });
    }
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


//Chạy khi DOM sẵn sàng
$(document).ready(initializeApp);