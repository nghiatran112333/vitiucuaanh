import { imageUrl, money } from '../utils/shop.js';
import brandWordmark from '../vitiu-logo.svg';

export default function SiteHeader({ navigate, query, setQuery, searchOpen, setSearchOpen, menuOpen, setMenuOpen, user, favorites, itemCount, products }) {
  const matches = query ? products.filter(p => `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];
  return <>
    <div className="promo-bar"><span>🎀 Ưu đãi nàng mới — giảm 15% đơn từ 499K</span><button onClick={() => navigate('offers')}>Xem ưu đãi <span>→</span></button></div>
    <header className="site-header">
      <button className="logo" onClick={() => navigate('home')} aria-label="Vịtiu trang chủ"><img className="brand-wordmark" src={brandWordmark} alt=""/></button>
      <div className="header-search">
        <input value={query} onFocus={() => setSearchOpen(true)} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} onKeyDown={e => e.key === 'Enter' && navigate('products')} placeholder="Tìm sản phẩm, thương hiệu..." aria-label="Tìm sản phẩm" />
        <button onClick={() => navigate('products')} aria-label="Tìm kiếm">⌕</button>
        {searchOpen && query && <div className="search-results">{matches.length ? matches.map(p => <button key={p._id} onClick={() => { setQuery(''); navigate(`product/${p._id}`); }}><img src={imageUrl(p.image)} alt=""/><span><b>{p.name}</b><small>{p.brand} · {money(p.price)}</small></span></button>) : <p>Chưa tìm thấy sản phẩm phù hợp.</p>}<button className="search-all" onClick={() => navigate('products')}>Xem tất cả kết quả →</button></div>}
      </div>
      <div className="header-actions">
        <button className="header-action account-link" onClick={() => navigate(user ? 'account' : 'login')} onDoubleClick={() => { if (user?.role === 'admin') navigate('admin'); }} title={user?.role === 'admin' ? 'Nhấp đúp để vào trang quản trị' : undefined}><span>♙</span><small>{user?.name || 'Tài khoản'}<b>{user ? 'Hồ sơ của bạn' : 'Đăng nhập / Đăng ký'}</b></small></button>
        <button className="header-action wishlist-link" onClick={() => navigate('wishlist')} aria-label="Sản phẩm yêu thích"><span>♡</span><i>{favorites.length}</i></button>
        <button className="header-action cart-link" onClick={() => navigate('cart')}><span>🛍</span><b>Giỏ hàng</b><i>{itemCount}</i></button>
        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở danh mục">☰</button>
      </div>
    </header>
    <nav className={`category-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Danh mục chính">
      <button onClick={() => navigate('products')}>Tất cả sản phẩm</button>
      <button onClick={() => navigate('category/Chăm sóc da')}>Chăm sóc da</button>
      <button onClick={() => navigate('category/Trang điểm')}>Trang điểm</button>
      <button onClick={() => navigate('category/Chăm sóc tóc')}>Chăm sóc tóc</button>
      <button className="nav-sale" onClick={() => navigate('offers')}>Ưu đãi hôm nay ✨</button>
      <button onClick={() => navigate('about')}>Câu chuyện Vịtiu</button><button onClick={() => navigate('stores')}>Hệ thống cửa hàng</button>
    </nav>
    {searchOpen && <button className="search-backdrop" aria-label="Đóng tìm kiếm" onClick={() => setSearchOpen(false)} />}
  </>;
}
