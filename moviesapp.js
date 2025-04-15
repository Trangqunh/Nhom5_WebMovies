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
async function fetchEpisodes() {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        let totalEpisodes = data.number_of_episodes;

        // Nếu số tập là N/A hoặc không xác định, mặc định là 1
        if (!totalEpisodes || totalEpisodes === "N/A") {
            totalEpisodes = 1;
        }

        renderEpisodes(totalEpisodes);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        document.getElementById("episodes-container").textContent = "Unable to load episodes.";
    }
}

function renderEpisodes(totalEpisodes) {
    const episodesContainer = document.getElementById("episodes-container");
    episodesContainer.innerHTML = "";

    for (let i = 1; i <= totalEpisodes; i++) {
        const episodeButton = document.createElement("button");
        episodeButton.className = "episode-button";
        episodeButton.textContent = i; // Hiển thị số tập trực tiếp (1, 2, 3, ...)

        // Xử lý sự kiện khi nhấn vào nút tập
        episodeButton.addEventListener("click", () => {
            document.querySelectorAll(".episode-button").forEach(btn => btn.classList.remove("selected"));
            episodeButton.classList.add("selected");

            // Thực hiện hành động khi chọn tập (ví dụ: phát tập phim)
            console.log(`Selected Episode: ${i}`);
        });

        episodesContainer.appendChild(episodeButton);
    }
}

// Gọi hàm fetchEpisodes khi trang được tải
window.onload = function () {
    fetchMovieDetails();
    fetchTrailer();
    fetchEpisodes();
};

// Thêm sự kiện cho nút chuyển
document.getElementById("prev-btn").addEventListener("click", () => {
    const container = document.getElementById("episodes-container");
    container.scrollBy({ left: -200, behavior: "smooth" });
});

document.getElementById("next-btn").addEventListener("click", () => {
    const container = document.getElementById("episodes-container");
    container.scrollBy({ left: 200, behavior: "smooth" });
});

document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => {
        // Xóa lớp 'selected' khỏi tất cả các tập
        document.querySelectorAll('.episode-card').forEach(c => c.classList.remove('selected'));
        // Thêm lớp 'selected' vào tập được chọn
        card.classList.add('selected');
    });
});
