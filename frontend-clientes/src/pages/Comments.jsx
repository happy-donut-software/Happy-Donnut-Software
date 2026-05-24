import { useState } from "react";
import { MessageCircle, Send, Star } from "lucide-react";

export default function Comments() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se procesaría el envío del comentario
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment("");
      setRating(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-12 h-12 text-orange-500" />
            <h1 className="text-5xl text-orange-500">Queremos Saber Tu Opinión</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu experiencia es muy importante para nosotros. Comparte tus comentarios, 
            sugerencias o cualquier detalle que nos ayude a mejorar. ¡Nos encantaría 
            escucharte y hacer de Happy Donut tu lugar favorito!
          </p>
        </div>

        {/* Formulario de comentarios */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-primary/10 p-8 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl text-primary mb-3">¡Gracias por tu comentario!</h3>
                <p className="text-lg text-muted-foreground">
                  Tu opinión nos ayuda a mejorar cada día
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Calificación con estrellas */}
                <div>
                  <label className="block mb-3 text-lg text-foreground">
                    ¿Cómo calificarías tu experiencia?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                        className={`w-10 h-10 ${
                            star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-lg text-muted-foreground">
                        {rating === 5 && "¡Excelente!"}
                        {rating === 4 && "Muy bueno"}
                        {rating === 3 && "Bueno"}
                        {rating === 2 && "Regular"}
                        {rating === 1 && "Necesita mejorar"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block mb-2 text-lg text-foreground">
                    Tu Comentario <span className="text-primary">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Cuéntanos sobre tu experiencia en Happy Donut..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary focus:outline-none bg-white transition-colors resize-none"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Mínimo 10 caracteres ({comment.length}/10)
                  </p>
                </div>

                {/* Botón de enviar */}
                <button
                type="submit"
                disabled={comment.length < 10 || rating === 0}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl
                            disabled:opacity-50 disabled:hover:bg-orange-500"
                >
                Enviar comentario
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
