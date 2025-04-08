const apiKey = '42e8a383317db0a25624e00585d30469';
const urlParams = new URLSearchParams(window.location.search);
const mediaId = urlParams.get('id');
const mediaType = urlParams.get('mediaType');

// Lấy thông tin chi tiết của phim/TV series
async function fetchMediaDetails() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en`;
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
}

// Lấy thông tin trailer và mở YouTube
async function fetchAndWatchTrailer() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const videos = data.results || [];

        // Tìm video có type là Trailer và site là YouTube
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

// Khi trang load, lấy thông tin chi tiết của phim
window.onload = fetchMediaDetails;

// Gắn xử lý sự kiện cho nút Watch Now
document.getElementById("btn-watch").addEventListener("click", fetchAndWatchTrailer);