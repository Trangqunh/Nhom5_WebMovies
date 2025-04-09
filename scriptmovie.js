
  const apiKey = '42e8a383317db0a25624e00585d30469';

  const genres = [
    { id: 28, name: "Hành động" },
    { id: 35, name: "Hài hước" },
    { id: 18, name: "Tâm lý" },
    { id: 27, name: "Kinh dị" },
    { id: 10749, name: "Lãng mạn" },
    { id: 16, name: "Hoạt hình" },
    { id: 878, name: "Khoa học viễn tưởng" },
    { id: 12, name: "Phiêu lưu" },
    { id: 53, name: "Hồi hộp" }
  ];
  // Tạo menu thể loại
  const genreMenu = document.getElementById('genre-menu');
  
  genres.forEach(genre => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#" data-id="${genre.id}">${genre.name}</a>`;
    genreMenu.appendChild(li);
  });

  // Hàm tạo thẻ phim
  function createMediaCard(media, mediaType) {
    const { id, backdrop_path, title, name } = media;
    const movieTitle = title || name || 'Không rõ';

    const card = document.createElement("div");
    card.classList.add("movie-item");

    const imageUrl = backdrop_path
      ? `https://image.tmdb.org/t/p/w500${backdrop_path}`
      : 'https://via.placeholder.com/500x281?text=No+Image';

    card.innerHTML = `
      <img src="${imageUrl}" alt="${movieTitle}">
      <div class="title">
        <a href="watch.html?id=${id}&mediaType=${mediaType}">${movieTitle}</a>
      </div>
    `;
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
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  const container = $('#hero-carousel');

  data.results.slice(0, 6).forEach(movie => {
    const bgImage = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Image';

    const item = `
      <div class="item" style="background-image: url('${bgImage}');">
        <div class="overlay">
          <h3>${movie.title}</h3>
          <p>${movie.overview.substring(0, 150)}...</p>
          <a href="watch.html?id=${movie.id}&mediaType=movie" class="btn btn-warning mt-2">Xem ngay</a>
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
// Gọi khi trang load
$(document).ready(() => {
  fetchHeroMovies();
});
