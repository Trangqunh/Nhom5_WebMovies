const apiKey = '42e8a383317db0a25624e00585d30469';
const urlParams = new URLSearchParams(window.location.search);
const mediaId = urlParams.get('id');
const mediaType = urlParams.get('mediaType');

// Hàm lấy chi tiết phim để cập nhật tiêu đề
async function fetchMovieDetails() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const title = data.title || data.name || "Unknown Title";
        document.getElementById("movie-title").textContent = title;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        document.getElementById("movie-title").textContent = "Movie Title Unavailable";
    }
}

// Hàm lấy trailer và nhúng qua thẻ iframe
async function fetchTrailer() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const videos = data.results || [];
        // Tìm video có type "Trailer" và site là "YouTube"
        const trailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            document.getElementById("video-container").appendChild(iframe);
        } else {
            document.getElementById("video-container").textContent = "Trailer không có sẵn.";
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
        document.getElementById("video-container").textContent = "Có lỗi khi tải trailer.";
    }
}

window.onload = function () {
    fetchMovieDetails();
    fetchTrailer();
};

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