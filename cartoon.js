const apiKey = "42e8a383317db0a25624e00585d30469";

const genres = [
  { id: 16, name: "Top phim hoạt hình phổ biến nhất" },
  { id: 10751, name: "Phim hoạt hình đánh giá cao nhất" },
  { id: 35, name: "Phim hoạt hình hài hước" },
];

const genreMenu = document.getElementById("genre-menu");
const categorySectionsContainer = document.getElementById("category-sections");

genres.forEach((genre) => {
  const li = document.createElement("li");
  li.innerHTML = `<a class="dropdown-item" href="#genre-${genre.id}" data-id="${genre.id}">${genre.name}</a>`;
  genreMenu.appendChild(li);
});

function createMediaCard(media) {
  const { id, backdrop_path, poster_path, title, name } = media;
  const movieTitle = title || name || "Không rõ";
  const imagePath = poster_path || backdrop_path;
  const card = document.createElement("div");
  card.classList.add("item");
  const imageUrl = imagePath
    ? `https://image.tmdb.org/t/p/w300${imagePath}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  card.innerHTML = `
    <div class="movie-item"><a href="watch.html?id=${id}&mediaType=movie" style="text-decoration: none; color: inherit;">
      <img src="${imageUrl}" alt="${movieTitle}" loading="lazy">
      <div class="title">
        <b title="${movieTitle}">${movieTitle}</b>
      </div>
    </div>`;
  return card;
}


// --- Genre Dropdown Scroll Handler ---
document.addEventListener('DOMContentLoaded', function() {
  const genreMenuElement = document.getElementById('genre-menu');
  if (genreMenuElement) {
      genreMenuElement.addEventListener('click', function (e) {
          if (e.target.tagName === 'A' && e.target.classList.contains('dropdown-item')) {
              e.preventDefault(); 
              const targetHref = e.target.getAttribute('href'); 
              if (targetHref && targetHref.startsWith('#')) {
                  const targetId = targetHref.substring(1); 
                  const targetElement = document.getElementById(targetId); 
                  if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                      console.warn(`Element with ID '${targetId}' not found for scrolling.`);
                  }
              } else {
                   console.warn(`Invalid or missing href attribute for genre link: ${targetHref}`);
              }
          }
      });
  } else {
      console.warn("Genre menu element (#genre-menu) not found.");
  }
});


async function fetchAndDisplayCategory(title, apiUrl, carouselId, anchorId = '') { // <-- Thêm anchorId
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
          <button class="category-prev-btn" data-carousel="${carouselId}">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="category-next-btn" data-carousel="${carouselId}">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="owl-carousel owl-theme category-carousel" id="${carouselId}">
        <div class="text-center text-muted p-3">Đang tải...</div>
      </div>
    </div>`;
  categorySectionsContainer.appendChild(section);

  const container = document.getElementById(carouselId);
  const response = await fetch(apiUrl);
  const data = await response.json();
  container.innerHTML = "";

  data.results.slice(0, 20).forEach((item) => {
    if (!item.backdrop_path && !item.poster_path) return;

    const card = createMediaCard(item); 
    container.appendChild(card);
  });

   // Phần khởi tạo Owl Carousel và gắn event cho nút cũng giữ nguyên hoặc kiểm tra lại nếu cần
   $(`#${carouselId}`).owlCarousel({
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

    const sectionElement = $(`#${carouselId}`).closest('.category-section');
    if (sectionElement.length) {
        sectionElement.find(`.category-prev-btn[data-carousel="${carouselId}"]`).off('click').on('click', () => {
            $(`#${carouselId}`).trigger('prev.owl.carousel');
        });
        sectionElement.find(`.category-next-btn[data-carousel="${carouselId}"]`).off('click').on('click', () => {
            $(`#${carouselId}`).trigger('next.owl.carousel');
        });
    }
}


async function fetchHeroMovies() {
  const listUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc&page=1`;
  const container = $("#hero-carousel");
  container.empty();
  const listResponse = await fetch(listUrl);
  const listData = await listResponse.json();
  const shows = listData.results.slice(12, 18);

  shows.forEach((show) => {
    // Kiểm tra: nếu không có backdrop_path-> bỏ qua phim 
    if (!show.backdrop_path) return;

    const bgImage = `https://image.tmdb.org/t/p/original${show.backdrop_path}`;
    const item = `
      <div class="item" style="background-image: url('${bgImage}');">
        <div class="overlay">
          <h2>${show.title}</h2>
          <p>${show.overview}</p>
          <a href="watch.html?id=${show.id}&mediaType=movie" class="btn btn-warning">Xem ngay</a>
        </div>
      </div>`;
    container.append(item);
  });

  container.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
  });
}

function initCategoryCarousel(carouselId) {
  const carouselElement = $(`#${carouselId}`);
  if (carouselElement.length > 0 && !carouselElement.hasClass("owl-loaded")) {
    carouselElement.owlCarousel({
      loop: false,
      margin: 15,
      nav: true,
      dots: false,
      lazyLoad: true,
      responsive: {
        0: { items: 2 },
        576: { items: 3 },
        768: { items: 4 },
        992: { items: 5 },
        1200: { items: 6 },
      },
    });
  }
}

fetchHeroMovies();

genres.forEach((genre) => {
  const apiUrl =
    genre.name === "Top phim hoạt hình phổ biến nhất"
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=popularity.desc`
      : genre.name === "Phim hoạt hình đánh giá cao nhất"
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100`
      : genre.name === "Phim hoạt hình hài hước"
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=16,35&sort_by=popularity.desc` // Ví dụ sửa lại để lấy cả hài hước (16,35)
      : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=vi&with_genres=${genre.id}&sort_by=popularity.desc&page=1`; // Giữ nguyên cho các thể loại khác nếu có
  const anchorId = `genre-${genre.id}`;
  fetchAndDisplayCategory(genre.name, apiUrl, `carousel-${genre.id}`, anchorId);
});

// --- Navbar Active Link Handler ---
document.addEventListener('DOMContentLoaded', function() {
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

// --- Xử lý sự kiện khác ---
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