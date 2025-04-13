const apiKey = "42e8a383317db0a25624e00585d30469";

const genres = [
  { id: 27, name: "Top Rated" },
  { id: 28, name: "Popular" },
  { id: 35, name: "Airing Today" },
  { id: 18, name: "On TV" },
];

const genreMenu = document.getElementById("genre-menu");
const categorySectionsContainer = document.getElementById("category-sections");

genres.forEach((genre) => {
  const li = document.createElement("li");
  li.innerHTML = `<a class="dropdown-item" href="#genre-${genre.id}" data-id="${genre.id}">${genre.name}</a>`;
  genreMenu.appendChild(li);
});

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
    <div class="movie-item">
      <img src="${imageUrl}" alt="${movieTitle}" loading="lazy">
      <div class="title">
        <a href="watch.html?id=${id}&mediaType=${mediaType}" title="${movieTitle}">${movieTitle}</a>
      </div>
    </div>`;
  return card;
}

function initCategoryCarousel(carouselId) {
  const carouselElement = $(`#${carouselId}`);
  if (carouselElement.length > 0 && !carouselElement.hasClass("owl-loaded")) {
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
        1200: { items: 6 },
      },
    });
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
        <h2 class="section-title">${title}</h2>
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
  const container = $("#hero-carousel");
  container.empty();
  const listResponse = await fetch(listUrl);
  const listData = await listResponse.json();
  const shows = listData.results.slice(7, 13);

  shows.forEach((show) => {
    const bgImage = `https://image.tmdb.org/t/p/original${show.backdrop_path}`;
    const item = `
      <div class="item" style="background-image: url('${bgImage}');">
        <div class="overlay">
          <h2>${show.name}</h2>
          <p>${show.overview}</p>
          <a href="watch.html?id=${show.id}&mediaType=tv" class="btn btn-warning">Xem ngay</a>
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

// Fetch hero movies and all genres
fetchHeroMovies();

genres.forEach((genre) => {
  let apiPath = "";
  switch (genre.name) {
    case "Popular":
      apiPath = "/tv/popular";
      break;
    case "Top Rated":
      apiPath = "/tv/top_rated";
      break;
    case "On TV":
      apiPath = "/tv/on_the_air";
      break;
    case "Airing Today":
      apiPath = "/tv/airing_today";
      break;
    default:
      apiPath = "/tv/popular";
  }

  const apiUrl = `https://api.themoviedb.org/3${apiPath}?api_key=${apiKey}&language=vi&page=1`;
  fetchAndDisplayCategory(
    genre.name,
    apiUrl,
    "carousel-" + genre.id,
    "tv",
    "genre-" + genre.id
  );
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