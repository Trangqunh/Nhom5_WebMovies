$(document).ready(() => {
    $('#hamburger-menu').click(() => {
        $('#hamburger-menu').toggleClass('active')
        $('#nav-menu').toggleClass('active')
    })

    // setting owl carousel

    let navText = ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"]

    $('#hero-carousel').owlCarousel({
        items: 1,
        dots: false,
        loop: true,
        nav:true,
        navText: navText,
        autoplay: true,
        autoplayHoverPause: true
    })

    $('#top-movies-slide').owlCarousel({
        items: 2,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            500: {
                items: 3
            },
            1280: {
                items: 4
            },
            1600: {
                items: 6
            }
        }
    })

    $('.movies-slide').owlCarousel({
        items: 2,
        dots: false,
        nav:true,
        navText: navText,
        margin: 15,
        responsive: {
            500: {
                items: 2
            },
            1280: {
                items: 4
            },
            1600: {
                items: 6
            }
        }
    })
})


// Đoạn mã JavaScript dưới đây sử dụng Fetch API để lấy dữ liệu từ The Movie Database (TMDb) và hiển thị thông tin phim 
// và series trên trang web. Nó bao gồm các hàm để tạo thẻ card cho từng media, gọi API và xử lý dữ liệu trả về.
const apiKey = '42e8a383317db0a25624e00585d30469';

    // Định nghĩa các URL endpoint cho từng phần, với tham số language=en
    const endpoints = {
      popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en&page=1`,
      nowPlayingMovies: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en&page=1`,
      popularSeries: `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en&page=1`
    };

    /**
     * Hàm tạo thẻ card hiển thị thông tin media (phim hoặc series)
     * @param {Object} media - Đối tượng media
     * @param {String} mediaType - Loại media ('movie' hoặc 'tv')
     */
    function createMediaCard(media, mediaType) {
      const { id, backdrop_path } = media;
      // Sử dụng title cho phim và name cho series
      const title = media.title || media.name;
      const card = document.createElement("div");
      card.classList.add("movie-item");

      // Xây dựng link ảnh; dùng ảnh thay thế nếu không có backdrop_path
      const imageUrl = backdrop_path
          ? `https://image.tmdb.org/t/p/w500${backdrop_path}`
          : 'https://via.placeholder.com/500x281?text=No+Image';

      // Gán nội dung HTML cho card với liên kết có tham số mediaType
      card.innerHTML = `
        <img src="${imageUrl}" alt="${title}">
        <div class="title">
          <a href="watch.html?id=${id}&mediaType=${mediaType}">${title}</a>
        </div>
      `;
      return card;
    }

    /**
     * Hàm fetch dữ liệu từ API và render card vào container chỉ định
     * @param {String} url - URL endpoint API cần gọi
     * @param {String} containerSelector - Bộ chọn CSS của container
     * @param {String} mediaType - Loại media, dùng khi tạo card ('movie' hoặc 'tv')
     */
    async function fetchAndRender(url, containerSelector, mediaType) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Lỗi khi fetch dữ liệu");
        }
        const data = await response.json();
        const container = document.querySelector(containerSelector + " .list-items");

        data.results.forEach(item => {
          const card = createMediaCard(item, mediaType);
          container.appendChild(card);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Gọi fetch cho từng phần tương ứng
    fetchAndRender(endpoints.popularMovies, "#popular-section", 'movie');
    fetchAndRender(endpoints.nowPlayingMovies, "#movies-section", 'movie');
    fetchAndRender(endpoints.popularSeries, "#series-section", 'tv');
