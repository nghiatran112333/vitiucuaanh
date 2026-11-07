import ProductCard from '../components/ProductCard.jsx';
import { categories } from '../data/products.js';
import { Newsletter } from './InfoPages.jsx';

function ProductRow({ title, eyebrow, products, onAdd, navigate, favorites, onFavorite }) {
  return <section className="content-section">
    <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="plain-link" onClick={() => navigate('products')}>Xem tất cả <span>↗</span></button></div>
    <div className="product-grid">{products.slice(0, 4).map(p => <ProductCard key={p._id} product={p} onAdd={onAdd} onOpen={p => navigate(`product/${p._id}`)} isFavorite={favorites.includes(String(p._id))} onFavorite={onFavorite} />)}</div>
  </section>;
}

export default function HomePage({ products, addToCart, navigate, favorites, toggleFavorite, notify }) {
  return <>
    <section className="hero-section">
      <div className="hero-copy"><span className="eyebrow"><i /> BEAUTY, MADE PERSONAL</span><h1>Chăm da dịu dàng.<br/><em>Yêu mình mỗi ngày.</em></h1><p>Chọn điều lành cho làn da — những món chăm sóc được tuyển chọn cho routine của bạn.</p><button className="button-primary" onClick={() => navigate('products')}>Khám phá sản phẩm <span>↗</span></button><div className="hero-note"><span>✦ ◉ ✿</span><b>12.000+</b> nàng đã tìm thấy routine của mình</div></div>
      <div className="hero-visual"><div className="hero-photo"/><div className="hero-stamp"><small>GLOW</small><b>your way</b><span>✿</span></div><span className="hero-image-caption">THE EVERYDAY GLOW EDIT　·　01—04</span></div>
      <span className="hero-sparkle sparkle-one">✿</span><span className="hero-sparkle sparkle-two">♡</span>
    </section>
    <section className="trust-strip"><div><span>✿</span><b>Chọn lọc kỹ càng</b><small>An tâm chăm sóc da</small></div><div><span>♧</span><b>Giao hàng tận nơi</b><small>Theo dõi đơn dễ dàng</small></div><div><span>↺</span><b>Hỗ trợ đổi trả</b><small>Chính sách rõ ràng</small></div><div><span>♡</span><b>Tư vấn tận tâm</b><small>Chọn đúng cho da bạn</small></div></section>
    <section className="brand-invitation"><div className="brand-invitation-seal">V<span>✿</span></div><div><span className="eyebrow">MỘT LỜI HẸN CÙNG VỊTIU</span><h2>Nàng cứ là nàng,<br/><em>rồi sẽ nở rộ theo cách riêng.</em></h2><p>Khám phá câu chuyện về vẻ đẹp dịu dàng, tự tin và luôn thuộc về chính nàng.</p></div><button className="button-secondary" onClick={() => navigate('about')}>Câu chuyện Vịtiu <span>↗</span></button></section>
    <section className="content-section category-section"><div className="section-heading"><div><span className="eyebrow">TÌM ĐIỀU DA BẠN CẦN</span><h2>Mua sắm theo danh mục</h2></div><button className="plain-link" onClick={() => navigate('products')}>Tất cả danh mục ↗</button></div><div className="category-grid">{categories.map(([name,icon,sub]) => <button key={name} className="category-tile" onClick={() => navigate(name === 'Tất cả' ? 'products' : `category/${encodeURIComponent(name)}`)}><span>{icon}</span><b>{name}</b><small>{sub}</small></button>)}</div></section>
    <ProductRow eyebrow="LÀN DA ĐANG MÊ" title="Món được yêu thích" products={products.filter(p => p.type === 'bestseller')} onAdd={addToCart} navigate={navigate} favorites={favorites} onFavorite={toggleFavorite}/>
    <section className="campaign-card"><span className="campaign-icon">🎀</span><div><span className="eyebrow">VỊTIU PINK DAYS</span><h2>Tuần lễ yêu làn da</h2><p>Ưu đãi xinh và những món chăm sóc dịu dàng đang chờ nàng.</p></div><button className="button-secondary" onClick={() => navigate('offers')}>Khám phá ưu đãi ↗</button></section>
    <ProductRow eyebrow="VỪA LÊN KỆ" title="Món mới nàng sẽ thích" products={products.filter(p => p.type === 'new')} onAdd={addToCart} navigate={navigate} favorites={favorites} onFavorite={toggleFavorite}/>
    <section className="routine-card"><div className="routine-photo"/><div className="routine-copy"><span className="eyebrow">A LITTLE SELF-CARE GOES A LONG WAY</span><h2>Da bạn có một câu chuyện.<br/><em>Cùng lắng nghe nhé.</em></h2><p>Trả lời vài câu hỏi nhỏ để tìm gợi ý routine chăm sóc da.</p><button className="button-primary" onClick={() => navigate('quiz')}>Tìm routine của mình <span>↗</span></button><small>Miễn phí · Chỉ mất 2 phút</small></div></section>
    <section className="service-strip"><div>🧴 <b>Chăm da có chọn lọc</b></div><div>🚚 <b>Giao hàng tận nơi</b></div><div>🎁 <b>Ưu đãi dành cho nàng</b></div></section>
    <Newsletter notify={notify}/>
  </>;
}
