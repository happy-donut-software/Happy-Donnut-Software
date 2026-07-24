# language: es
Característica: Monitorear el acumulado mensual RUS
  Como propietaria quiero conocer la proximidad al límite tributario.

  Escenario: Acumular solamente boletas
    Dado un acumulado mensual de 4000 soles
    Cuando se procesa una BOLETA por 500 soles
    Entonces el acumulado RUS es 4500 soles
    Y se emite la alerta de proximidad al 90 por ciento

  Escenario: Excluir nota de pedido
    Dado un acumulado mensual de 4000 soles
    Cuando se procesa una NOTA_PEDIDO por 500 soles
    Entonces el acumulado RUS permanece en 4000 soles