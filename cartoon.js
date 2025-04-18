const apiKey = "42e8a383317db0a25624e00585d30469";

const genreMenu = document.getElementById("genre-menu");
const countryMenu = document.getElementById("country-menu");
const movieListContainer = document.getElementById("movie-list");
const heroContainer = document.getElementById("hero-carousel");
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

const genresForCartoon = [
  { id: 35, name: "Hài hước" },
  { id: 28, name: "Hành động" },
  { id: 10751, name: "Gia đình" },
  { id: 14, name: "Giả tưởng" },
  { id: 18, name: "Tâm lý" }
];

const countries = [
  { code: "JP", name: "Nhật Bản" },
  { code: "US", name: "Hoa Kỳ" },
  { code: "KR", name: "Hàn Quốc" },
  { code: "CN", name: "Trung Quốc" },
  { code: "FR", name: "Pháp" }
];

let currentFilter = { genreId: null, countryCode: null };

function loadCartoonGenres() {
  genresForCartoon.forEach((genre) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.classList.add("dropdown-item");
    a.href = "#";
    a.textContent = genre.name;
    a.dataset.genreId = genre.id;
    a.addEventListener("click", () => {
      currentFilter.genreId = genre.id;
      filterCartoon({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
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
      filterCartoon({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
    });
    li.appendChild(a);
    countryMenu.appendChild(li);
  });
}

function updateFilterDescription({ genreId = null, countryCode = null }) {
  const descDiv = document.getElementById("filter-description");
  const divider = document.getElementById("filter-divider");
  const cartoonTitle = document.getElementById("cartoon-title");
  let desc = "";

  // Lấy tên thể loại
  let genreName = null;
  if (genreId) {
    const genre = genresForCartoon.find(g => g.id === genreId);
    if (genre) genreName = genre.name;
  }

  // Lấy tên quốc gia
  let countryName = null;
  if (countryCode) {
    const country = countries.find(c => c.code === countryCode);
    if (country) countryName = country.name;
  }

  if (genreName && countryName) {
    desc = `Thể loại: phim hoạt hình ${genreName.toLowerCase()} | Quốc gia: ${countryName}`;
  } else if (genreName) {
    desc = `Thể loại: phim hoạt hình ${genreName.toLowerCase()}`;
  } else if (countryName) {
    desc = `Quốc gia: ${countryName}`;
  } 

  descDiv.textContent = desc;
  divider.style.display = "block";
  // Ẩn tiêu đề khi có filter
  cartoonTitle.style.display = (genreName || countryName) ? "none" : "block";
}

function filterCartoon({ genreId = null, countryCode = null }) {
  heroContainer.innerHTML = "";
  movieListContainer.innerHTML = "";

  updateFilterDescription({ genreId, countryCode });

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&language=vi&sort_by=popularity.desc`;
  if (genreId) url += `&with_genres=16,${genreId}`;
  if (countryCode) url += `&with_origin_country=${countryCode}`;

  fetch(url)
    .then(res => res.json())
    .then(data => renderMovies(data.results))
    .catch(error => console.error("Lỗi khi lọc phim:", error));
}

function renderMovies(movies) {
  movieListContainer.innerHTML = "";
  if (movies.length === 0) {
    movieListContainer.innerHTML = '<p class="text-muted text-center">Không có phim nào để hiển thị.</p>';
    return;
  }
  movies.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("col");
    div.innerHTML = `
      <div class="card h-100 bg-dark text-white">
        <a href="watch.html?id=${movie.id}&mediaType=movie" style="text-decoration: none; color: inherit;">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
          </div>
        </a>
      </div>
    `;
    movieListContainer.appendChild(div);
  });
}


async function fetchHeroMovies() {
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&language=vi`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.results.length === 0) {
      heroContainer.innerHTML = '<p class="text-muted text-center">Không có phim nổi bật để hiển thị.</p>';
      return;
    }
    data.results.slice(4, 11).forEach((movie) => {
      const bgImage = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      const title = movie.title || "Không rõ";
      const overview = movie.overview || "Chưa có mô tả.";

      const item = `
        <div class="item" style="background-image: url('${bgImage}');">
          <div class="overlay">
            <h3>${title}</h3>
            <p class="hero-overview">${overview.substring(0, 120)}${overview.length > 120 ? "..." : ""}</p>
            <a href="watch.html?id=${movie.id}&mediaType=movie" class="btn btn-warning mt-2">Xem ngay</a>
          </div>
        </div>
      `;
      heroContainer.innerHTML += item;
    });

    $("#hero-carousel").owlCarousel({
      items: 1,
      loop: true,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      lazyLoad: true,
      navText: ["<span class='owl-prev-icon'>❮</span>", "<span class='owl-next-icon'>❯</span>"]
    });
  } catch (error) {
    console.error("Lỗi khi tải phim nổi bật:", error);
    heroContainer.innerHTML = '<p class="text-danger text-center">Lỗi khi tải phim nổi bật.</p>';
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  loadCartoonGenres();
  loadCountries();
  fetchHeroMovies();
  filterCartoon({ genreId: currentFilter.genreId, countryCode: currentFilter.countryCode });
});
