import './menu.css'

const menuItems = [
  {
    title: 'Arroz del Mediterráneo',
    description: 'Arroz meloso con marisco fresco, gambas y un toque de azafrán.',
    price: '18€',
  },
  {
    title: 'Pulpo a la brasa',
    description: 'Pulpo tierno con patata cremosa, pimentón y aceite de oliva.',
    price: '19€',
  },
  {
    title: 'Tartar de atún',
    description: 'Atún rojo, aguacate y soja cítrica con semillas tostadas.',
    price: '17€',
  },
  {
    title: 'Hamburguesa El CiD',
    description: 'Carne madurada, queso ahumado, cebolla caramelizada y patatas.',
    price: '16€',
  },
  {
    title: 'Caña fría',
    description: 'La cerveza más fría para acompañar tu comida.',
    price: '3€',
  },
  {
    title: 'Tarta de queso',
    description: 'Cremosa, suave y con mermelada de frutos rojos.',
    price: '7€',
  },
]

export default function Menu() {
  return (
    <section className="menuPage">
      <header className="menuPage__hero">
        <p className="menuPage__kicker">Carta</p>
        <h1 className="menuPage__title">Menú </h1>
        <p className="menuPage__subtitle">
          Platos pensados para disfrutar junto al mar, con productos frescos y el estilo del restaurante.
        </p>
      </header>

      <div className="menuPage__grid">
        {menuItems.map((item) => (
          <article key={item.title} className="menuPage__card">
            <div>
              <h2 className="menuPage__cardTitle">{item.title}</h2>
              <p className="menuPage__cardDescription">{item.description}</p>
            </div>
            <span className="menuPage__price">{item.price}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
