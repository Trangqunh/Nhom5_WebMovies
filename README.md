# WebMovies

Trang web WebMovies cung cấp dịch vụ xem phim trực tuyến với chất lượng cao. Tại đây, người dùng có thể:
- Duyệt và tìm kiếm các bộ phim theo thể loại, năm sản xuất, và quốc gia.
- Xem trailer và đánh giá phim từ cộng đồng.
- Lưu danh sách phim yêu thích và nhận đề xuất tự động.

## Quy trình Git Flow

Các bước khi code tính năng mới:
1. Tạo nhánh mới cho tính năng cần phát triển.
2. Code và commit trên nhánh đó.
3. Checkout nhánh main và pull các thay đổi mới nhất.
4. Quay lại nhánh tính năng, merge nhánh main.
5. Push nhánh tính năng và tạo merge request.

Ví dụ lệnh Git Flow:
```bash
git checkout -b feature/my-feature
# ...code changes...
git add .
git commit -m "Thêm tính năng mới"
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main
git push -u origin feature/my-feature
# Tạo merge request qua giao diện quản lý repo.
```
