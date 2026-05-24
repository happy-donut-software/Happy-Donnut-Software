// src/pages/About.jsx
export default function About() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-6">Sobre Nosotros</h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6">
            Desde 2020, Happy Donut ha sido una empresa dedicada a la elaboración de deliciosas donas artesanales. 
            Nuestra pasión por la repostería y la calidad de nuestros ingredientes nos ha permitido crecer y convertirnos 
            en una de las cafeterías favoritas de los niños y adolescentes.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Cada una de nuestras donas es elaborada con amor, utilizando recetas tradicionales y los mejores ingredientes. 
            Nos enorgullece ofrecer productos frescos, coloridos y deliciosos que alegran el día de nuestros clientes.
          </p>
          <p className="text-lg text-gray-600">
            ¡Únete a nuestra familia Happy Donut y descubre por qué somos la mejor opción para endulzar tu vida!
          </p>
        </div>
      </div>
    </section>
  );
}