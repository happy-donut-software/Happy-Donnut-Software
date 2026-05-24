// src/pages/Contact.jsx
export default function Contact() {
  return (
    <section className="py-12 bg-orange-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-6">Contáctanos</h2>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-600 mb-6">
            Puedes visitarnos en nuestra cafetería o escribirnos a través de nuestros canales oficiales.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <span className="font-semibold w-24">Dirección:</span>
              <span>Av. Principal #123, Centro Comercial Solari Plaza</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-24">Teléfono:</span>
              <span>+51 944 083 558</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-24">Email:</span>
              <span>info@happydonut.com</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-24">Horario:</span>
              <span>Lunes a Domingo: 8:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}