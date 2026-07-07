import './menu.css'

const foodItems = [
  {
    title: 'Arroz del Mediterráneo',
    description: 'Arroz meloso con marisco fresco, gambas y un toque de azafrán.',
    price: '18€',
    featured: true,
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
    title: 'Tarta de queso',
    description: 'Cremosa, suave y con mermelada de frutos rojos.',
    price: '7€',
  },
]

const drinkItems = [
  {
    title: 'Caña fría 500ml',
    description: 'La cerveza más fría para acompañar tu comida.',
    price: '3€',
  },
]

export default function Menu() {
  return (
    <section className="menuPage">
      <header className="menuPage__hero">
        <p className="menuPage__kicker">Carta</p>
        <h1 className="menuPage__title">Menú </h1>
        <p className="menuPage__subtitle">
          Platos pensados para disfrutar, con productos frescos y el estilo del restaurante.
        </p>
      </header>

      <div className="menuPage__sections">
        <section className="menuPage__group">
          <div className="menuPage__groupHeader">
            <h2 className="menuPage__groupTitle">Comida</h2>
            <p className="menuPage__groupSubtitle">Entrantes, platos principales y postres.</p>
          </div>

          <div className="menuPage__grid">
            {foodItems.map((item) => (
              <article key={item.title} className="menuPage__card menuPage__card--food">
                {item.featured ? <span className="menuPage__badge">Especialidad</span> : null}
                <div>
                  <h3 className="menuPage__cardTitle">{item.title}</h3>
                  <p className="menuPage__cardDescription">{item.description}</p>
                </div>
                <span className="menuPage__price">{item.price}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="menuPage__group">
          <div className="menuPage__groupHeader">
            <h2 className="menuPage__groupTitle">Bebida</h2>
            <p className="menuPage__groupSubtitle">Opciones para acompañar cualquier plato.</p>
          </div>

          <div className="menuPage__grid menuPage__grid--single">
            {drinkItems.map((item) => (
              <article key={item.title} className="menuPage__card">
                <div>
                  <h3 className="menuPage__cardTitle">{item.title}</h3>
                  <p className="menuPage__cardDescription">{item.description}</p>
                </div>
                <span className="menuPage__price">{item.price}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
