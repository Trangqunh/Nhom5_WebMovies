const apiKey = '42e8a383317db0a25624e00585d30469';

// --- Hàm fetch Hero ---
async function fetchHeroMovies() {
    const listUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=vi&page=1`;
    const container = $('#hero-carousel');
    container.empty().addClass('loading');

    try {
        // Bước 1: Fetch danh sách cơ bản
        const listResponse = await fetch(listUrl);
        if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
        const listData = await listResponse.json();
    
        const topShowsBasic = listData.results
            .filter(tvShow => tvShow.backdrop_path)
            .slice(0, 6);

        if (topShowsBasic.length === 0) {
            container.html('<p class="text-muted text-center">Không tìm thấy TV shows phù hợp.</p>');
            container.removeClass('loading');
            return;
        }

        // Bước 2: Tạo promises fetch chi tiết
        const detailPromises = topShowsBasic.map(basicShow => {
            const detailUrl = `https://api.themoviedb.org/3/tv/${basicShow.id}?api_key=${apiKey}&language=vi&append_to_response=content_ratings`;
            return fetch(detailUrl).then(res => res.ok ? res.json() : null)
                   .catch(error => { console.error(`Error fetching detail for ${basicShow.id}:`, error); return null; });
        });

        // Bước 3: Đợi promises hoàn thành
        const detailedShowsData = await Promise.all(detailPromises);

        // Bước 4: Tạo HTML
        detailedShowsData.forEach((detailedShow, index) => {
            if (!detailedShow) return;
            const basicShow = topShowsBasic[index];
            if (!basicShow) return;

            const bgImage = `https://image.tmdb.org/t/p/original${basicShow.backdrop_path}`;
            const name = detailedShow.name || basicShow.name;
            const overview = detailedShow.overview || basicShow.overview || "Chưa có mô tả.";
            const airDate = detailedShow.first_air_date;
            const year = airDate ? airDate.substring(0, 4) : '';
            const countryCodes = detailedShow.origin_country || basicShow.origin_country || [];
            const countryDisplay = countryCodes.length > 0 ? countryCodes[0] : '';
            const episodeCount = detailedShow.number_of_episodes;
            let ageRating = '';
            if (detailedShow.content_ratings?.results) {
                 const ratings = detailedShow.content_ratings.results;
                 const vnRating = ratings.find(r => r.iso_3166_1 === 'VN');
                 const usRating = ratings.find(r => r.iso_3166_1 === 'US');
                 ageRating = vnRating?.rating || usRating?.rating || '';
                 if (ageRating.startsWith('TV-')) ageRating = ageRating.substring(3);
            }

            const item = `
              <div class="item" style="background-image: url('${bgImage}');">
                <div class="overlay">
                  <h3>${name}</h3>
                  <div class="hero-metadata">
                    ${year ? `<span>${year}</span>` : ''}
                    ${ageRating ? `<span class="separator">•</span><span class="age-rating">${ageRating}</span>` : ''}
                    ${episodeCount ? `<span class="separator">•</span><span>${episodeCount} tập</span>` : ''}
                    ${countryDisplay ? `<span class="separator">•</span><span>${countryDisplay}</span>` : ''}
                    ${detailedShow.vote_average ? `<span class="separator">•</span><span><i class="fas fa-star star-icon"></i> ${detailedShow.vote_average.toFixed(1)}</span>` : ''}
                  </div>
                  <p class="hero-overview">${overview.substring(0, 120)}${overview.length > 120 ? '...' : ''}</p>
                  <a href="watch.html?id=${basicShow.id}&mediaType=tv" class="btn btn-warning mt-2 btn-hero-detail">Xem chi tiết</a>
                </div>
              </div>
            `;
            container.append(item);
        });

         // Bước 5: Khởi tạo Owl Carousel
        if (container.hasClass('owl-loaded')) {
            container.trigger('destroy.owl.carousel');
        }
        if (container.children().length > 0) {
            container.owlCarousel({
                items: 1, loop: container.children().length > 1, nav: true, dots: false, autoplay: true, autoplayTimeout: 6000, autoplayHoverPause: true, lazyLoad: true,
                navText: ["<span class='owl-prev-icon'>❮</span>","<span class='owl-next-icon'>❯</span>"]
            });
        } else {
             container.html('<p class="text-muted text-center">Không có TV shows nào để hiển thị.</p>');
        }

    } catch (error) {
        console.error("Error fetching hero TV shows (overall):", error);
        container.html('<p class="text-danger text-center">Lỗi khi tải TV shows nổi bật.</p>');
    } finally {
        container.removeClass('loading');
    }
}

fetchHeroMovies()

