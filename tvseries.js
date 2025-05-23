const apiKey = "42e8a383317db0a25624e00585d30469";

const genres = [
  { id: 28, name: "Hành động" },
  { id: 35, name: "Hài hước" },
  { id: 18, name: "Tâm lý" },
  { id: 10749, name: "Lãng mạn" },
  { id: 10751, name: "Gia đình" },
  { id: 16, name: "Hoạt hình" },
  { id: 80, name: "Hình sự" },
  { id: 9648, name: "Bí ẩn" },
  { id: 10759, name: "Phiêu lưu" }
];

const countries = [
  { code: "US", name: "Hoa Kỳ" },
  { code: "KR", name: "Hàn Quốc" },
  { code: "JP", name: "Nhật Bản" },
  { code: "CN", name: "Trung Quốc" },
  { code: "FR", name: "Pháp" }
];

let currentFilter = { genreId: null, countryCode: null };

const genreMenu = document.getElementById("genre-menu");
const countryMenu = document.getElementById("country-menu");
const tvseriesListContainer = document.getElementById("tvseries-list");

function loadTvGenres() {
  genres.forEach((genre) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.classList.add("dropdown-item");
    a.href = "#";
    a.textContent = genre.name;
    a.dataset.genreId = genre.id;
    a.addEventListener("click", () => {
      currentFilter.genreId = genre.id;
      filterTvSeries({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
    });
    li.appendChild(a);
    genreMenu.appendChild(li);
  });
}

function loadCountries() {
  countries.forEach((country) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.classList.add("dropdown-item");
    a.href = "#";
    a.textContent = country.name;
    a.dataset.countryCode = country.code;
    a.addEventListener("click", () => {
      currentFilter.countryCode = country.code;
      filterTvSeries({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
    });
    li.appendChild(a);
    countryMenu.appendChild(li);
  });
}

function createMediaCard(media, mediaType) {
  const { id, backdrop_path, poster_path, title, name } = media;
  const movieTitle = title || name || "Không rõ";
  const imagePath = poster_path || backdrop_path;
  const card = document.createElement("div");
  card.classList.add("item");
  const imageUrl = imagePath
    ? `https://image.tmdb.org/t/p/w300${imagePath}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  card.innerHTML = `
    <div class="movie-item"><a href="watch.html?id=${id}&mediaType=${mediaType}" style="text-decoration: none;  color: inherit;">
      <img src="${imageUrl}" alt="${movieTitle}" loading="lazy">
      <div class="title">
          <b title="${movieTitle}">${movieTitle}</b>
      </div>
      </a>
    </div>`;
  return card;
}

// --- Hàm khởi tạo Owl Carousel cho một ID ---
function initCategoryCarousel(carouselId) {
  const carouselElement = $(`#${carouselId}`);
  if (carouselElement.length > 0 && !carouselElement.hasClass('owl-loaded')) {
    carouselElement.owlCarousel({
      loop: false,
      margin: 15,
      nav: false,
      dots: false,
      lazyLoad: true,
      responsive: {
        0: { items: 2 },
        576: { items: 3 },
        768: { items: 4 },
        992: { items: 5 },
        1200: { items: 6 }
      }
    });
    const section = carouselElement.closest('.category-section');
    if (section.length > 0) {
      section.find('.category-prev-btn').off('click').on('click', function () {
        carouselElement.trigger('prev.owl.carousel');
      });
      section.find('.category-next-btn').off('click').on('click', function () {
        carouselElement.trigger('next.owl.carousel');
      });
    } else {
      console.warn(`Could not find parent .category-section for carousel #${carouselId}`);
    }
  } else if (carouselElement.length === 0) {
    console.warn(`Carousel element #${carouselId} not found.`);
  }
}

function createCategorySection(title, carouselId, anchorId = "") {
  const section = document.createElement("section");
  section.classList.add("category-section", "my-5");
  if (anchorId) {
    section.id = anchorId;
  }
  section.innerHTML = `
    <div class="container">
      <div class="section-header d-flex justify-content-between align-items-center mb-4">
        <h2 class="section-title" id="${anchorId}">${title}</h2>
        <div class="custom-nav-buttons">
          <button class="category-prev-btn">❮</button>
          <button class="category-next-btn">❯</button>
        </div>
      </div>
      <div class="owl-carousel owl-theme category-carousel" id="${carouselId}">
        <div class="text-center text-muted p-3">Đang tải...</div>
      </div>
    </div>`;
  categorySectionsContainer.appendChild(section);
}

async function fetchAndDisplayCategory(
  title,
  apiUrl,
  carouselId,
  mediaType = "movie",
  anchorId = ""
) {
  createCategorySection(title, carouselId, anchorId);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const container = document.getElementById(carouselId);
  const response = await fetch(apiUrl);
  const data = await response.json();
  container.innerHTML = "";
  data.results.slice(0, 20).forEach((item) => {
    let type = item.media_type || (item.title ? "movie" : "tv");
    if (type === "person") return;
    const card = createMediaCard(item, type);
    container.appendChild(card);
  });
  initCategoryCarousel(carouselId);
}

async function fetchHeroMovies() {
  const listUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=vi&page=1`;
  const container = $('#hero-carousel');
  container.empty().addClass('loading');

  try {
    const listResponse = await fetch(listUrl);
    if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
    const listData = await listResponse.json();

    const topShows = listData.results.slice(10, 16); 

    if (topShows.length === 0) {
      container.html('<p class="text-muted text-center">Không tìm thấy TV shows phù hợp.</p>');
      container.removeClass('loading');
      return;
    }

    topShows.forEach(show => {
      const bgImage = `https://image.tmdb.org/t/p/original${show.backdrop_path}`;
      const name = show.name || "Không rõ";
      const overview = show.overview || "Chưa có mô tả.";
      const airDate = show.first_air_date;
      const year = airDate ? airDate.substring(0, 4) : '';
      const voteAverage = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';

      const item = `
        <div class="item" style="background-image: url('${bgImage}');">
          <div class="overlay">
            <h3>${name}</h3>
            <div class="hero-metadata">
              ${year ? `<span>${year}</span>` : ''}
              ${voteAverage ? `<span class="separator">•</span><span><i class="fas fa-star star-icon"></i> ${voteAverage}</span>` : ''}
            </div>
            <p class="hero-overview">${overview.substring(0, 120)}${overview.length > 120 ? '...' : ''}</p>
            <a href="watch.html?id=${show.id}&mediaType=tv" class="btn btn-warning mt-2 btn-hero-detail">Xem chi tiết</a>
          </div>
        </div>
      `;
      container.append(item);
    });

    // Khởi tạo Owl Carousel cho Hero Section
    if (container.hasClass('owl-loaded')) {
      container.trigger('destroy.owl.carousel');
    }
    if (container.children().length > 0) {
      container.owlCarousel({
        items: 1,
        loop: container.children().length > 1,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        lazyLoad: true,
        navText: ["<span class='owl-prev-icon'>❮</span>", "<span class='owl-next-icon'>❯</span>"]
      });
    } else {
      container.html('<p class="text-muted text-center">Không có TV shows nào để hiển thị.</p>');
    }
  } catch (error) {
    console.error("Error fetching hero TV shows:", error);
    container.html('<p class="text-danger text-center">Lỗi khi tải TV shows nổi bật.</p>');
  } finally {
    container.removeClass('loading');
  }
}

function updateFilterDescription({ genreId = null, countryCode = null }) {
  const descDiv = document.getElementById("filter-description");
  const divider = document.getElementById("filter-divider");
  const tvseriesTitle = document.getElementById("tvseries-title");
  const heroSection = document.getElementById("hero-section");
  let desc = "";

  // Lấy tên thể loại
  let genreName = null;
  if (genreId) {
    const genre = genres.find(g => g.id == genreId);
    if (genre) genreName = genre.name;
  }

  // Lấy tên quốc gia
  let countryName = null;
  if (countryCode) {
    const country = countries.find(c => c.code === countryCode);
    if (country) countryName = country.name;
  }

  if (genreName && countryName) {
    desc = `Thể loại: ${genreName} | Quốc gia: ${countryName}`;
  } else if (genreName) {
    desc = `Thể loại: ${genreName}`;
  } else if (countryName) {
    desc = `Quốc gia: ${countryName}`;
  }

  descDiv.textContent = desc;
  divider.style.display = "block";
  tvseriesTitle.style.display = (genreName || countryName) ? "none" : "block";
  // Ẩn hero section khi có filter
  if (heroSection) heroSection.style.display = (genreName || countryName) ? "none" : "block";
}

function filterTvSeries({ genreId = null, countryCode = null }) {
  tvseriesListContainer.innerHTML = "";
  updateFilterDescription({ genreId, countryCode });

  let url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=vi&sort_by=popularity.desc`;
  if (genreId) url += `&with_genres=${genreId}`;
  if (countryCode) url += `&with_origin_country=${countryCode}`;

  fetch(url)
    .then(res => res.json())
    .then(data => renderTvSeries(data.results))
    .catch(error => console.error("Lỗi khi lọc TV Series:", error));
}

function renderTvSeries(series) {
  tvseriesListContainer.innerHTML = ""; // Xóa nội dung cũ
  if (!series || series.length === 0) {
    tvseriesListContainer.innerHTML = '<div class="tvseries-empty-message text-center text-muted p-5">Không có TV Series nào để hiển thị.</div>'; // Cải thiện thông báo
    return;
  }

  series.forEach((item) => {
    const { id, backdrop_path, poster_path, name } = item; // TV series dùng 'name'
    const movieTitle = name || "Không rõ"; // Lấy tên TV series
    let imagePath = poster_path || backdrop_path; // Ưu tiên poster
    let imageUrl = imagePath
      ? `https://image.tmdb.org/t/p/w300${imagePath}` // Dùng w300 giống indexapp
      : 'https://via.placeholder.com/300x450/222/fff?text=No+Image'; // Placeholder

    const card = document.createElement('div');
    // Sử dụng class 'movie-card' từ indexstyle.css
    card.classList.add('movie-card');
    card.innerHTML = `
        <a href="watch.html?id=${id}&mediaType=tv" class="text-decoration-none text-dark movie-item">
            <img src="${imageUrl}" alt="${movieTitle}" class="img-fluid rounded" loading="lazy"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450/222/fff?text=Error';">
            <div class="movie-title mt-2 text-center">
                <b title="${movieTitle}">${movieTitle}</b>
            </div>
        </a>
    `;
    tvseriesListContainer.appendChild(card); // Thêm thẻ mới vào container
  });
}

// Fetch hero movies and all genres
fetchHeroMovies();

genres.forEach((genre) => {
  const apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=vi&with_genres=${genre.id}&sort_by=popularity.desc`;
  fetchAndDisplayCategory(
    genre.name,
    apiUrl,
    "carousel-" + genre.id,
    "tv",
    "genre-" + genre.id
  );
});


// --- Navbar Active Link Handler ---
document.addEventListener('DOMContentLoaded', function () {
  const currentPath = window.location.pathname.split('/').pop(); // Lấy tên file hiện tại (e.g., 'tvseries.html')
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname.split('/').pop(); // Lấy tên file từ href của link

    // Xóa lớp active cũ (nếu có) và aria-current
    link.classList.remove('active');
    link.removeAttribute('aria-current');

    // So sánh tên file hiện tại với tên file của link
    if (currentPath === linkPath) {
      // Nếu trùng khớp, thêm lớp active và aria-current
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    // Xử lý trường hợp đặc biệt cho trang index (có thể là '' hoặc 'indexmovie.html')
    else if ((currentPath === '' || currentPath === 'indexmovie.html') && linkPath === 'indexmovie.html') {
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

});

// Xử lý SearchFrom
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

document.addEventListener("DOMContentLoaded", () => {
  loadTvGenres();
  loadCountries();
  fetchHeroMovies();
  filterTvSeries({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
});