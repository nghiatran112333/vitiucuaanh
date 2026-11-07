import { useEffect, useMemo, useState } from 'react';
import SiteHeader from './components/SiteHeader.jsx';
import { Footer } from './components/SiteFooter.jsx';
import FloatingChat from './components/FloatingChat.jsx';
import { starterProducts } from './data/products.js';
import { readStore, routeNow } from './utils/shop.js';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { ProductDetail, CartPage, CheckoutPage, SuccessPage } from './pages/ShoppingPages.jsx';
import { AuthPage, AccountPage, OrdersPage, TrackPage } from './pages/AccountPages.jsx';
import { OffersPage, QuizPage, StoresPage, SupportPage } from './pages/InfoPages.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProductCard from './components/ProductCard.jsx';
import { money } from './utils/shop.js';
import { apiRequest, mergeServerProducts } from './utils/api.js';

const defaultFilters = { type:'all', brands:[], sort:'default', budget:600000 };

export default function App() {
  const [products,setProducts]=useState(()=>readStore('vitiu-products',starterProducts));
  const [route,setRoute]=useState(routeNow);
  const [query,setQuery]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [cart,setCart]=useState(()=>readStore('vitiu-cart',[]));
  const [favorites,setFavorites]=useState(()=>readStore('vitiu-favorites',[]));
  const [orders,setOrders]=useState([]);
  const [user,setUser]=useState(null);
  const [authReady,setAuthReady]=useState(false);
  const [toast,setToast]=useState('');
  const [coupon,setCoupon]=useState('');
  const [couponActive,setCouponActive]=useState(false);
  const [filters,setFilters]=useState(defaultFilters);

  const navigate=path=>{history.pushState({},'',`#/${path}`);setRoute(routeNow());setSearchOpen(false);setMenuOpen(false);setFilters(defaultFilters);window.scrollTo({top:0,behavior:'smooth'})};
  const notify=message=>setToast(message);
  useEffect(()=>{const sync=()=>setRoute(routeNow());window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}},[]);
  useEffect(()=>{localStorage.setItem('vitiu-products',JSON.stringify(products))},[products]);
  useEffect(()=>{localStorage.setItem('vitiu-cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem('vitiu-favorites',JSON.stringify(favorites))},[favorites]);
  useEffect(()=>{let mounted=true;localStorage.removeItem('vitiu-user');localStorage.removeItem('vitiu-orders');apiRequest('/api/auth/me').then(data=>{if(mounted)setUser(data.user)}).catch(()=>{if(mounted)setUser(null)}).finally(()=>{if(mounted)setAuthReady(true)});return()=>{mounted=false}},[]);
  useEffect(()=>{let mounted=true;apiRequest('/api/products').then(rows=>{if(mounted&&rows.length)setProducts(current=>mergeServerProducts(current,rows))}).catch(()=>{});return()=>{mounted=false}},[]);
  useEffect(()=>{if(!user){setOrders([]);return}if(!['account','orders','track','success'].includes(route.page))return;let mounted=true;apiRequest('/api/orders/mine').then(data=>{if(mounted)setOrders(data.orders)}).catch(error=>{if(mounted)notify(error.message)});return()=>{mounted=false}},[user?.id,route.page]);
  useEffect(()=>{const aliases=new Map(products.filter(p=>p.legacyId&&String(p.legacyId)!==String(p._id)).map(p=>[String(p.legacyId),String(p._id)]));if(!aliases.size)return;setCart(current=>{let changed=false;const next=current.map(item=>{const id=aliases.get(String(item.id));if(!id)return item;changed=true;return {...item,id}});return changed?next:current});setFavorites(current=>{let changed=false;const next=[...new Set(current.map(id=>{const mapped=aliases.get(String(id));if(mapped)changed=true;return mapped||id}))];return changed?next:current})},[products]);
  useEffect(()=>{if(route.page!=='success'||!user||orders.some(order=>order.id===route.id))return;let mounted=true;apiRequest(`/api/orders/${encodeURIComponent(route.id)}`).then(data=>{if(mounted)setOrders(current=>current.some(order=>order.id===data.order.id)?current:[data.order,...current])}).catch(()=>{});return()=>{mounted=false}},[route.page,route.id,user?.id,orders]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2400);return()=>clearTimeout(timer)},[toast]);

  const activeProducts=products.filter(p=>p.active!==false);
  const itemCount=cart.reduce((n,item)=>n+item.qty,0);
  const subtotal=cart.reduce((n,item)=>n+item.qty*(products.find(p=>String(p._id)===String(item.id))?.price||0),0);
  const discount=couponActive?Math.round(subtotal*.1):0;
  const shipping=subtotal-discount>=499000||!subtotal?0:30000;
  const total=subtotal-discount+shipping;
  const productById=id=>products.find(p=>String(p._id)===String(id));
  const addToCart=product=>{setCart(old=>{const found=old.find(i=>String(i.id)===String(product._id));return found?old.map(i=>String(i.id)===String(product._id)?{...i,qty:i.qty+1}:i):[...old,{id:product._id,qty:1}]});notify(`Đã thêm ${product.name} vào giỏ ♡`)};
  const changeQty=(id,delta)=>setCart(old=>old.map(i=>String(i.id)===String(id)?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  const toggleFavorite=product=>{const id=String(product._id);const exists=favorites.includes(id);setFavorites(old=>exists?old.filter(x=>x!==id):[...old,id]);notify(exists?'Đã bỏ khỏi yêu thích':'Đã lưu vào yêu thích ♡')};
  const displayedProducts=useMemo(()=>{const category=route.page==='category'?route.id:'';let rows=activeProducts.filter(p=>(!category||p.category===category)&&(!query||`${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()))&&(filters.type==='all'||p.type===filters.type)&&(filters.brands.length===0||filters.brands.includes(p.brand))&&Number(p.price)<=filters.budget);if(filters.sort==='low')rows.sort((a,b)=>a.price-b.price);if(filters.sort==='high')rows.sort((a,b)=>b.price-a.price);return rows},[activeProducts,route,query,filters]);
  const placeOrder=async e=>{e.preventDefault();if(!user){notify('Đăng nhập để đặt hàng và theo dõi đơn nhé.');navigate('login');return}const data=new FormData(e.currentTarget);try{const result=await apiRequest('/api/orders',{method:'POST',body:JSON.stringify({items:cart.map(item=>({productId:String(item.id),qty:item.qty})),payment:data.get('payment'),bankName:data.get('bankName')||'',coupon:couponActive?'VITIU10':'',customer:{name:data.get('name'),phone:data.get('phone'),email:data.get('email'),address:data.get('address'),ward:data.get('ward'),district:data.get('district'),city:data.get('city'),note:data.get('note')}})});const order=result.order;setOrders(current=>[order,...current.filter(item=>item.id!==order.id)]);setCart([]);setCouponActive(false);setCoupon('');apiRequest('/api/products').then(rows=>setProducts(current=>mergeServerProducts(current,rows))).catch(()=>{});navigate(`success/${encodeURIComponent(order.id)}`)}catch(error){notify(error.message||'Không thể tạo đơn hàng. Thử lại giúp mình nhé.')}};

  let page;
  if(route.page==='home')page=<HomePage products={activeProducts} addToCart={addToCart} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} notify={notify}/>;
  else if(route.page==='products'||route.page==='category')page=<CatalogPage category={route.page==='category'?route.id:''} products={displayedProducts} resultCount={displayedProducts.length} filters={filters} setFilters={setFilters} navigate={navigate} onAdd={addToCart} favorites={favorites} onFavorite={toggleFavorite}/>;
  else if(route.page==='product'){const product=productById(route.id);page=product?<ProductDetail product={product} onAdd={addToCart} favorite={favorites.includes(String(product._id))} onFavorite={()=>toggleFavorite(product)} onBack={()=>history.back()} notify={notify}/>:<EmptyPage navigate={navigate}/>}
  else if(route.page==='cart')page=<CartPage cart={cart} products={products} changeQty={changeQty} navigate={navigate} subtotal={subtotal} coupon={coupon} setCoupon={setCoupon} couponActive={couponActive} setCouponActive={setCouponActive} discount={discount} shipping={shipping} total={total} notify={notify}/>;
  else if(route.page==='checkout')page=!authReady?<LoginRequiredPage loading/>:user?<CheckoutPage cart={cart} products={products} subtotal={subtotal} discount={discount} shipping={shipping} total={total} placeOrder={placeOrder} navigate={navigate}/>:<LoginRequiredPage navigate={navigate}/>;
  else if(route.page==='success')page=<SuccessPage order={orders.find(o=>o.id===route.id)} navigate={navigate}/>;
  else if(route.page==='wishlist')page=<section className="content-section page-content"><div className="section-heading"><div><span className="eyebrow">MÓN NÀNG THƯƠNG</span><h2>Sản phẩm yêu thích ♡</h2></div></div><div className="product-grid">{activeProducts.filter(p=>favorites.includes(String(p._id))).map(p=><ProductCard key={p._id} product={p} onAdd={addToCart} onOpen={p=>navigate(`product/${p._id}`)} isFavorite onFavorite={toggleFavorite}/>)}</div>{!favorites.length&&<EmptyPage navigate={navigate} message="Bạn chưa lưu sản phẩm nào."/>}</section>;
  else if(route.page==='login'||route.page==='register')page=<AuthPage mode={route.page} onMode={navigate} onLogin={async credentials=>{const endpoint=credentials.register?'register':'login';const data=await apiRequest(`/api/auth/${endpoint}`,{method:'POST',body:JSON.stringify(credentials)});setUser(data.user);navigate(data.user.role==='admin'?'admin':'account');notify(`Xin chào ${data.user.name} ♡`)}}/>;
  else if(route.page==='account')page=<AccountPage user={user} orders={orders} onLogout={async()=>{try{await apiRequest('/api/auth/logout',{method:'POST'})}catch{}finally{setUser(null);navigate('home');notify('Bạn đã đăng xuất')}}} navigate={navigate}/>;
  else if(route.page==='orders')page=user?<OrdersPage orders={orders} navigate={navigate}/>:<LoginRequiredPage navigate={navigate}/>;
  else if(route.page==='track')page=user?<TrackPage orders={orders} navigate={navigate} orderId={route.id||''}/>:<LoginRequiredPage navigate={navigate}/>;
  else if(route.page==='offers')page=<OffersPage navigate={navigate} products={activeProducts} addToCart={addToCart}/>;
  else if(route.page==='quiz')page=<QuizPage products={activeProducts} navigate={navigate}/>;
  else if(route.page==='stores')page=<StoresPage/>;
  else if(route.page==='about')page=<AboutPage navigate={navigate}/>;
  else if(route.page==='support')page=<SupportPage/>;
  else if(route.page==='admin')page=!authReady?<AdminAccessPage loading/>:!user?<AdminAccessPage navigate={navigate}/>:user.role!=='admin'?<AdminAccessPage forbidden navigate={navigate}/>:<AdminPage products={products} setProducts={setProducts} navigate={navigate}/>;
  else page=<EmptyPage navigate={navigate}/>;

  if(route.page==='admin')return <>{page}{toast&&<div className="toast-message">{toast}</div>}</>;
  return <><SiteHeader navigate={navigate} query={query} setQuery={setQuery} searchOpen={searchOpen} setSearchOpen={setSearchOpen} menuOpen={menuOpen} setMenuOpen={setMenuOpen} user={user} favorites={favorites} itemCount={itemCount} products={activeProducts}/><main>{page}</main><Footer navigate={navigate} onAdmin={()=>navigate('admin')}/><FloatingChat notify={notify}/>{toast&&<div className="toast-message">{toast}</div>}</>;
}

function EmptyPage({navigate,message='Không tìm thấy nội dung.'}){return <section className="empty-state page-content"><span>🌷</span><h2>{message}</h2><button className="button-primary" onClick={()=>navigate('products')}>Về cửa hàng</button></section>}

function LoginRequiredPage({navigate,loading=false}){return <section className="empty-state page-content"><span>🔐</span><h2>{loading?'Đang kiểm tra đăng nhập':'Đăng nhập để tiếp tục'}</h2><p>{loading?'Vịtiu đang kiểm tra tài khoản của bạn.':'Đăng nhập để đặt hàng và xem đơn hàng gắn với tài khoản.'}</p>{!loading&&<button className="primary-btn" onClick={()=>navigate('login')}>Đăng nhập / Đăng ký ↗</button>}</section>}

function AdminAccessPage({navigate,loading=false,forbidden=false}){return <section className="admin-access"><span className="logo-mark">V</span><span className="eyebrow">KHU VỰC QUẢN TRỊ</span><h1>{loading?'Đang kiểm tra phiên đăng nhập':forbidden?'Tài khoản chưa có quyền Admin':'Đăng nhập để quản lý cửa hàng'}</h1><p>{loading?'Vịtiu đang xác thực tài khoản của bạn.':forbidden?'Vui lòng dùng tài khoản quản trị viên để tiếp tục.':'Trang quản trị chỉ dành cho tài khoản đã được cấp quyền.'}</p>{!loading&&<div><button className="primary-btn" onClick={()=>navigate('login')}>Đăng nhập ↗</button><button className="secondary-btn" onClick={()=>navigate('home')}>Về cửa hàng</button></div>}</section>}
