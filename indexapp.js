const apiKey = '42e8a383317db0a25624e00585d30469';

const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 16, name: "Cartoon" },
    { id: 878, name: "Sci-fi" },
    { id: 12, name: "Adventure" },
    { id: 53, name: "Thriller" }
];

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
    <a href="watch.html?id=${id}&mediaType=${mediaType}" style="text-decoration: none; color: inherit; font-weight: bold;">
    <img src="${imageUrl}" alt="${movieTitle}">
    <div class="title">${movieTitle}</div>
    </a>
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
    document.getElementById('movie-type').textContent = genres.find(genre => genre.id === parseInt(genreId))?.name || 'N/A';
}

// Lắng nghe chọn thể loại
genreMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('dropdown-item')) {
        const genreId = e.target.getAttribute('data-id');
        fetchMoviesByGenre(genreId);
    }
});

// Hàm fetch phim phổ biến
async function fetchPopularMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        const container = document.querySelector("#movies-section .list-items");
        container.innerHTML = '';

        data.results.forEach(movie => {
            const card = createMediaCard(movie, 'movie');
            container.appendChild(card);
        });

        document.getElementById('movie-type').textContent = "Popular Movies";
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

// Load mặc định phim phổ biến khi mở trang
fetchPopularMovies();



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
      <a href="watch.html?id=${movie.id}&mediaType=movie" class="btn btn-warning mt-2">Detail</a>
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
        const movieTypeElement = document.getElementById('movie-type'); // Lấy phần tử <h2> cần cập nhật
        if (e.target.textContent === 'TV Series') {
            movieTypeElement.textContent = 'TV Series'; // Cập nhật nội dung
            fetchTVSeries(); // Gọi hàm fetch TV Series
        } else if (e.target.textContent === 'Anime') {
            movieTypeElement.textContent = 'Anime'; // Cập nhật nội dung
            fetchAnime(); // Gọi hàm fetch Anime
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
        console.error('Error fetching cartoon movies:', error);
    }
}

// Initialize the cartoon carousel
function initCartoonCarousel() {
    $('#cartoon-carousel').owlCarousel({
        items: 5,
        loop: true,
        margin: 15,
        nav: false,
        dots: false,
        autoplay: false,
        responsive: {
            0: {
                items: 1
            },
            576: {
                items: 2
            },
            768: {
                items: 3
            },
            992: {
                items: 4
            },
            1200: {
                items: 5
            }
        }
    });

    // Custom navigation buttons
    $('.nav-prev-btn').click(function () {
        $('#cartoon-carousel').trigger('prev.owl.carousel');
    });

    $('.nav-next-btn').click(function () {
        $('#cartoon-carousel').trigger('next.owl.carousel');
    });
}

$(document).ready(() => {
    fetchLatestCartoon();
});