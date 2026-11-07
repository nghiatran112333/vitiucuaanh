const values = [
  {
    number: '01',
    icon: '☼',
    title: 'Lắng nghe làn da',
    text: 'Mỗi làn da có một nhịp điệu riêng. Hãy bắt đầu bằng việc hiểu điều da cần, rồi chọn cho mình một routine vừa vặn.'
  },
  {
    number: '02',
    icon: '✿',
    title: 'Nâng niu điều lành',
    text: 'Vịtiu hướng đến những lựa chọn chăm sóc được cân nhắc kỹ, thông tin rõ ràng và trải nghiệm mua sắm thật dễ chịu.'
  },
  {
    number: '03',
    icon: '♡',
    title: 'Rạng rỡ theo cách riêng',
    text: 'Không có một khuôn mẫu nào dành cho vẻ đẹp. Nàng có quyền dịu dàng, nổi bật, đổi thay — và luôn là chính mình.'
  }
];

export default function AboutPage({ navigate }) {
  return <article className="brand-story-page">
    <section className="brand-story-hero">
      <div className="brand-story-visual">
        <span className="story-flower story-flower-one">✿</span>
        <span className="story-flower story-flower-two">✳</span>
        <div className="story-monogram">V<span>.</span></div>
        <span className="story-visual-label">A SOFT PLACE TO BLOOM</span>
        <blockquote>“Rạng rỡ nhất là khi nàng thôi cố giống bất kỳ ai.”</blockquote>
        <small>MỘT LỜI HẸN CÙNG VỊTIU</small>
      </div>
      <div className="brand-story-copy">
        <span className="eyebrow">CÂU CHUYỆN CỦA VỊTIU</span>
        <h1>Một vẻ đẹp được viết nên bởi <em>chính nàng.</em></h1>
        <p>Vịtiu bắt đầu từ một niềm tin dịu dàng: vẻ đẹp không phải điều nàng cần trở thành, mà là điều vốn đã ở đó, chờ được nâng niu.</p>
        <p>Như cô gái tuổi đôi mươi mang trong mình bao sắc độ — trong trẻo, mộng mơ, dám thử và không ngại đổi thay — Vịtiu tin mỗi người đều có một cách riêng để nở rộ.</p>
        <button className="button-primary" onClick={() => navigate('products')}>Tìm món dành cho nàng <span>↗</span></button>
        <div className="story-signature">Thương mến,<br/><b>Vịtiu</b> <span>♡</span></div>
      </div>
    </section>

    <section className="story-belief">
      <span className="eyebrow">VẺ ĐẸP CỦA TUỔI ĐÔI MƯƠI</span>
      <h2>Không chỉ là thanh xuân.<br/><em>Là những ngày nàng học cách yêu mình.</em></h2>
      <p>Có ngày nàng rạng rỡ như nắng đầu hè. Có ngày nàng muốn chậm lại, nép mình bên ô cửa nghe mưa rơi. Dù là phiên bản nào, nàng vẫn xứng đáng được chăm sóc bằng sự dịu dàng — không vì phải hoàn hảo, mà vì nàng đáng được yêu thương.</p>
      <span className="story-belief-mark">V</span>
    </section>

    <section className="story-values-section">
      <div className="story-section-heading">
        <span className="eyebrow">ĐIỀU VỊTIU TIN</span>
        <h2>Những điều nhỏ bé<br/><em>làm nên một vẻ đẹp bền lâu.</em></h2>
      </div>
      <div className="story-value-grid">{values.map(value => <article className="story-value-card" key={value.number}>
        <div><span>{value.icon}</span><small>{value.number} / 03</small></div>
        <h3>{value.title}</h3>
        <p>{value.text}</p>
      </article>)}</div>
    </section>

    <section className="story-ritual">
      <div className="story-ritual-art"><span>✿</span><b>một chút<br/>dịu dàng</b><small>EVERYDAY, YOUR WAY</small></div>
      <div className="story-ritual-copy">
        <span className="eyebrow">NGHI THỨC CỦA RIÊNG NÀNG</span>
        <h2>Từ một phút chăm da,<br/><em>thêm một phút thương mình.</em></h2>
        <p>Vịtiu mong mỗi lần nàng mở nắp một món chăm sóc sẽ là một khoảng nghỉ nhỏ giữa ngày dài: chậm rãi lắng nghe làn da, chọn điều khiến mình dễ chịu, rồi mỉm cười với người trong gương.</p>
        <p>Bởi đôi khi, tự tin không đến từ một thay đổi lớn. Tự tin nảy mầm từ những điều nàng kiên nhẫn làm cho chính mình, mỗi ngày.</p>
      </div>
    </section>

    <section className="story-closing">
      <span className="eyebrow">VỊTIU — CHẠM VÀO ĐIỀU DỊU DÀNG</span>
      <h2>Nàng cứ là nàng.<br/><em>Phần rạng rỡ, để Vịtiu cùng nâng niu.</em></h2>
      <button className="button-primary" onClick={() => navigate('products')}>Bắt đầu hành trình yêu mình <span>↗</span></button>
      <span className="story-closing-flower">✿</span>
    </section>
  </article>;
}
