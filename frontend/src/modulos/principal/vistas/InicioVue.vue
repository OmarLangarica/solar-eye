<template>
  <div class="landing-container">
    <nav class="navbar">
      <div class="logo">Solar Eye</div>
      <router-link to="/login" class="btn-login"><i class="bi bi-person-workspace"> Personal</i></router-link>
    </nav>

    <header class="hero">
      <h1>Energía Solar a tu Alcance</h1>
      <p>Calcula, simula y optimiza tus proyectos fotovoltaicos con precisión profesional.</p>
      <router-link to="/login" class="btn-cta">Comenzar ahora</router-link>
    </header>

    <section class="features">
      <div class="feature-card">
        <h3>Simulación Precisa</h3>
        <p>Algoritmos avanzados para calcular el rendimiento energético basado en ubicación.</p>
      </div>
      <div class="feature-card">
        <h3>Gestión de Clientes</h3>
        <p>Mantén un historial organizado de todas tus cotizaciones y proyectos.</p>
      </div>
      <div class="feature-card">
        <h3>Reportes Instantáneos</h3>
        <p>Genera resultados listos para presentar a tus clientes en segundos.</p>
      </div>
    </section>
  </div>
  <section class="details">
  <div class="detail-item">
    <div class="detail-text">
      <h2>Simulación Precisa con Mapas</h2>
      <p>
        Utilizamos tecnología geoespacial para que puedas trazar el área real del techo. 
        Calculamos automáticamente la irradiación, horas sol pico y factores climáticos 
        específicos de la ubicación.
      </p>
    </div>
    <div class="detail-image">
      <img src="@/assets/images/inicio_captura.jpg" alt="Simulación en mapa">
    </div>
  </div>

  <div class="detail-item inverted">
    <div class="detail-text">
      <h2>Gestión Centralizada de Clientes</h2>
      <p>
        Mantén un control total de tu cartera. Organiza expedientes, realiza un seguimiento 
        de múltiples simulaciones por cliente y accede a la información de contacto en un solo clic.
      </p>
    </div>
    <div class="detail-image">
      <img src="@/assets/images/inicio_captura_2.jpg" alt="Panel de gestión de clientes">
    </div>
  </div>
</section>
</template>

<style scoped>
.landing-container { font-family: sans-serif; color: #333; }
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 5%; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.logo { font-size: 1.5rem; font-weight: bold; color: #FF7043; }
.hero {
    text-align: center;
    padding: 120px 20px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
                      url('@/assets/images/inicio_fondo.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed; 
    color: white; 
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); /* Sombra para mayor legibilidad */
}

.hero p {
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto 2rem auto;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
}
.btn-login { text-decoration: none; color: #FF7043; font-weight: 600; }
.btn-cta {
  display: inline-block; background: #FF7043; color: white;
  padding: 12px 30px; border-radius: 5px; text-decoration: none;
  font-weight: bold; margin-top: 20px;
}
.features {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px; padding: 50px 5%;
}
.feature-card {
  padding: 30px; border-radius: 10px; background: #f9f9f9; text-align: center;
}
.details {
  padding: 60px 5%;
  background-color: #ffffff;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 50px;
  margin-bottom: 80px;
}


.detail-item.inverted {
  flex-direction: row-reverse;
}

.detail-text {
  flex: 1;
}

.detail-text h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.detail-text p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
}

.detail-image {
  flex: 1.2;
}

.detail-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); 
  border: 1px solid #eee;
  transition: transform 0.3s ease;
}

.detail-image img:hover {
  transform: scale(1.02); 
}


@media (max-width: 768px) {
  .detail-item, .detail-item.inverted {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
}
</style>