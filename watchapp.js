const apiKey = '42e8a383317db0a25624e00585d30469';
const urlParams = new URLSearchParams(window.location.search);
const mediaId = urlParams.get('id');
const mediaType = urlParams.get('mediaType');

async function fetchMediaDetails() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        const posterUrl = data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        document.getElementById('movie-poster').src = posterUrl;
        document.getElementById('movie-title').textContent = data.title || data.name || 'Unknown Title';
        document.getElementById('movie-overview').textContent = data.overview || 'No overview available.';
        document.getElementById('movie-release-date').textContent = data.release_date || 'N/A';
        document.getElementById('movie-rating').textContent = data.vote_average || 'N/A';

        //Thời lượng phim: movie-data.runtime, tv series-thời lượng tập đầu tiên (nếu có)
        let runtimeText = 'N/A';
        if (mediaType === "movie") {
            runtimeText = data.runtime ? `${data.runtime} minutes` : 'N/A';
        } else if (mediaType === "tv") {
            runtimeText =
                data.episode_run_time &&
                    data.episode_run_time.length > 0
                    ? `${data.episode_run_time[0]} minutes/ episode`
                    : 'N/A';
        }
        document.getElementById('movie-runtime').textContent = runtimeText;

        //data.production_countries
        let countryText = 'N/A';
        if (data.production_countries && data.production_countries.length > 0) {
            countryText = data.production_countries.map(country => country.name).join(', ');
        }
        document.getElementById('movie-country').textContent = countryText;
    } catch (error) {
        console.error("Error fetching media details:", error);
    }
}

//Thông tin trailer và mở YouTube
async function fetchAndWatchTrailer() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const videos = data.results || [];
        const trailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
            const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            window.open(youtubeUrl, "_blank");
        } else {
            alert("Trailer không có sẵn trên YouTube.");
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
        alert("Có lỗi khi lấy thông tin trailer.");
    }
}

window.onload = fetchMediaDetails;
document.getElementById("btn-watch").addEventListener("click", fetchAndWatchTrailer);
document.getElementById("btn-watch-now").addEventListener("click", function () {
    window.location.href = `movies.html?id=${mediaId}&mediaType=${mediaType}`;
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