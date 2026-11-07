import { useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { categories } from '../data/products.js';
import { money } from '../utils/shop.js';

export default function CatalogPage({ category, products, resultCount, filters, setFilters, navigate, onAdd, favorites, onFavorite }) {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { type, brands, sort, budget } = filters;
  const setBrand = (brand, checked) => setFilters(old => ({ ...old, brands: checked ? [...old.brands, brand] : old.brands.filter(x => x !== brand) }));
  return <>
    <section className="catalog-banner">
      <div className="catalog-banner-copy"><span className="eyebrow">VỊTIU BEAUTY EDIT · 01</span><h1>{category || 'Tất cả sản phẩm'}</h1><p>Chọn món chăm da hợp với bạn — nhẹ nhàng như một lời yêu thương dành riêng cho làn da.</p><span className="catalog-banner-promise"><i>✦</i> Chăm da dịu dàng · Yêu mình mỗi ngày</span></div>
      <div className="catalog-banner-visual"><img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85" alt="Sản phẩm chăm sóc da trong khung cảnh sáng dịu"/><span className="catalog-banner-badge"><b>V</b><small>GLOW WITH CARE</small></span><span className="catalog-banner-sparkle" aria-hidden="true">✧</span></div>
      <span className="catalog-flower" aria-hidden="true">✿</span>
    </section>
    <div className={`catalog-layout${filtersVisible ? '' : ' filters-hidden'}`}>
      {filtersVisible && <aside className="filter-panel" id="catalog-filter-panel"><div className="filter-title"><h2>Bộ lọc</h2><button onClick={() => setFilters({ type:'all', brands:[], sort:'default', budget:600000 })}>Xóa lọc</button></div>
        <fieldset><legend>Danh mục</legend>{categories.slice(1).map(([name]) => <button className={`filter-category ${category===name?'active':''}`} key={name} onClick={() => navigate(`category/${encodeURIComponent(name)}`)}>{name}</button>)}</fieldset>
        <fieldset><legend>Thương hiệu</legend>{[...new Set(products.map(p=>p.brand))].map(brand => <label className="filter-check" key={brand}><input type="checkbox" checked={brands.includes(brand)} onChange={e=>setBrand(brand,e.target.checked)}/><span>{brand}</span></label>)}</fieldset>
        <fieldset><legend>Khoảng giá</legend><div className="budget-value">Tối đa {money(budget)}</div><input className="budget-range" type="range" min="100000" max="600000" step="50000" value={budget} onChange={e=>setFilters(old=>({...old,budget:Number(e.target.value)}))}/></fieldset>
        <fieldset><legend>Sắp xếp</legend><select value={sort} onChange={e=>setFilters(old=>({...old,sort:e.target.value}))}><option value="default">Nổi bật</option><option value="low">Giá thấp đến cao</option><option value="high">Giá cao đến thấp</option></select></fieldset>
      </aside>}
      <section className="catalog-results"><div className="catalog-toolbar"><div className="catalog-toolbar-main"><span>{resultCount} sản phẩm</span><button className="filter-toggle" aria-expanded={filtersVisible} aria-controls="catalog-filter-panel" onClick={() => setFiltersVisible(visible => !visible)}>{filtersVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'} <span aria-hidden="true">{filtersVisible ? '←' : '☷'}</span></button></div><div className="filter-pills">{[['all','Tất cả'],['bestseller','Bán chạy'],['new','Mới về'],['sale','Ưu đãi']].map(([key,label])=><button className={type===key?'active':''} key={key} onClick={()=>setFilters(old=>({...old,type:key}))}>{label}</button>)}</div></div>
        {products.length ? <div className="product-grid">{products.map(p=><ProductCard key={p._id} product={p} onAdd={onAdd} onOpen={p=>navigate(`product/${p._id}`)} isFavorite={favorites.includes(String(p._id))} onFavorite={onFavorite}/>)}</div> : <div className="empty-state"><span>🧸</span><h2>Chưa tìm thấy sản phẩm</h2><p>Thử bỏ bớt bộ lọc hoặc chọn danh mục khác nhé.</p><button className="button-primary" onClick={()=>setFilters({type:'all',brands:[],sort:'default',budget:600000})}>Xóa bộ lọc</button></div>}
      </section>
    </div>
  </>;
}
