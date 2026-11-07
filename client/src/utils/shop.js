export const money=n=>Number(n||0).toLocaleString('vi-VN')+'₫';
export const imageUrl=id=>id?.startsWith('http')?id:`https://images.unsplash.com/${id||'photo-1608248543803-ba4f8c70ae0b'}?auto=format&fit=crop&w=800&q=80`;
export const readStore=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
export const routeNow=()=>{const raw=decodeURIComponent(location.hash.replace(/^#\/?/,''));if(!raw)return {page:'home'};const [page,...rest]=raw.split('/');return {page,id:rest.join('/')}};
