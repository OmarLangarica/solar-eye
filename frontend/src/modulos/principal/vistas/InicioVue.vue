<template>
  <div class="landing-wrapper">

    <nav class="navbar">
      <div class="navbar-brand">
        <img src="@/assets/images/LogoSolarEye.png" alt="Solar Eye" class="navbar-logo" />
      </div>
      <div class="navbar-links">
        <a href="#caracteristicas" class="nav-link-item">Características</a>
        <a href="#como-funciona" class="nav-link-item">¿Cómo funciona?</a>
        <a href="#para-quien" class="nav-link-item">¿Para quién?</a>
      </div>
      <router-link to="/login" class="btn-nav-cta">Iniciar sesión →</router-link>
    </nav>

    <header class="hero">
      <div class="hero-content">
        <div class="hero-badge">Plataforma SaaS para instaladores solares</div>
        <h1>El sistema operativo de tu empresa solar</h1>
        <p>
          Desde la primera visita hasta la instalación final. Solar Eye digitaliza
          cada paso de tu proceso: simulaciones, cotizaciones, inventario, agenda y más.
        </p>
        <div class="hero-ctas">
          <router-link to="/login" class="btn-primary">Comenzar ahora →</router-link>
          <a href="#caracteristicas" class="btn-secondary">Ver características</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-valor">5 min</span>
            <span class="stat-label">de cotización a propuesta</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-valor">NASA</span>
            <span class="stat-label">datos climáticos reales</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-valor">100%</span>
            <span class="stat-label">en la nube, sin instalación</span>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/images/inicio_captura.jpg" alt="Solar Eye Dashboard" class="hero-img" />
        <div class="hero-img-badge">
          <span class="badge-dot"></span>
          Sistema funcionando en tiempo real
        </div>
      </div>
    </header>

    <section class="features-section" id="caracteristicas">
      <div class="section-header">
        <span class="section-tag">Todo en uno</span>
        <h2>Todo lo que tu empresa solar necesita</h2>
        <p>Deja de usar Excel, WhatsApp y papel. Solar Eye centraliza cada parte de tu operación.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card featured">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/></svg>
          </div>
          <h3>Simulador solar con mapas</h3>
          <p>Traza el techo del cliente directamente en el mapa satelital. Calcula automáticamente área útil, paneles necesarios y producción estimada usando datos reales de la NASA.</p>
          <ul class="feature-list">
            <li>Datos climáticos NASA POWER</li>
            <li>Cálculo de HSP por ubicación</li>
            <li>Retorno de inversión a 25 años</li>
          </ul>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h3>Lector de recibos CFE</h3>
          <p>Sube una foto del recibo de luz y el sistema extrae automáticamente el consumo, tarifa y costo. Elimina el ingreso manual de datos.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          </div>
          <h3>Reportes PDF profesionales</h3>
          <p>Genera propuestas listas para entregar al cliente con gráficas de producción, proyección tarifaria e impacto ambiental con un solo clic.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <h3>Control de inventario</h3>
          <p>Gestiona paneles, inversores, baterías, estructuras y materiales. Registra entradas, salidas y ventas. Recibe alertas de bajo stock.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <h3>Agenda de citas</h3>
          <p>Calendario visual con vistas de día, semana y mes. Agenda visitas técnicas, llamadas y videollamadas directamente desde la cotización del cliente.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <h3>Gestión de trabajadores</h3>
          <p>Asigna roles a tu equipo. Los administradores tienen control total mientras los técnicos solo acceden a lo que necesitan.</p>
        </div>
      </div>
    </section>

    <section class="how-section" id="como-funciona">
      <div class="section-header light">
        <span class="section-tag light">Proceso simplificado</span>
        <h2>De prospecto a instalación en un solo sistema</h2>
        <p>Cuatro pasos que reemplazan horas de trabajo manual.</p>
      </div>

      <div class="steps-grid">
        <div class="step">
          <div class="step-number">01</div>
          <div class="step-content">
            <h3>Registra al cliente</h3>
            <p>Agrega los datos de contacto y sube el recibo de CFE. El sistema detecta automáticamente su consumo y tarifa.</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">02</div>
          <div class="step-content">
            <h3>Traza el techo</h3>
            <p>Dibuja el área del techo en el mapa satelital. Solar Eye consulta la NASA y calcula la producción real del sistema.</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">03</div>
          <div class="step-content">
            <h3>Genera la propuesta</h3>
            <p>Descarga el reporte PDF con análisis económico, gráficas y proyección a 25 años listo para presentar.</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">04</div>
          <div class="step-content">
            <h3>Agenda e instala</h3>
            <p>Programa la visita técnica, asigna materiales del inventario y registra la instalación con el técnico responsable.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="gallery-section">
      <div class="section-header">
        <span class="section-tag">El sistema en acción</span>
        <h2>Diseñado para ser simple y potente</h2>
        <p>Mira cómo Solar Eye se ve en uso real.</p>
      </div>

      <div class="gallery-grid">
        <div class="gallery-card tall">
          <img src="@/assets/images/inicio_captura.jpg" alt="Simulador con mapa satelital" />
          <div class="gallery-label">Simulador solar con mapa satelital</div>
        </div>
        <div class="gallery-card">
          <img src="@/assets/images/inicio_captura_2.jpg" alt="Resultados y reporte PDF" />
          <div class="gallery-label">Resultados y reporte PDF</div>
        </div>
        <div class="gallery-card">
          <img src="@/assets/images/inicio_captura_3.jpg" alt="Control de inventario" />
          <div class="gallery-label">Control de inventario</div>
        </div>
        <div class="gallery-card">
          <img src="@/assets/images/inicio_captura_4.jpg" alt="Agenda de citas" />
          <div class="gallery-label">Agenda de citas</div>
        </div>
        <div class="gallery-card">
          <img src="@/assets/images/inicio_captura_5.jpg" alt="Gestión de clientes" />
          <div class="gallery-label">Gestión de clientes</div>
        </div>
      </div>
    </section>

    <!-- DETALLE VISUAL 1 -->
    <section class="details-section">
      <div class="detail-item">
        <div class="detail-text">
          <span class="section-tag">Simulador inteligente</span>
          <h2>Cotizaciones precisas en menos de 5 minutos</h2>
          <p>
            Olvídate de las hojas de cálculo. Solar Eye hace los cálculos de ingeniería solar
            por ti: paneles necesarios, potencia del sistema, ahorro mensual y retorno de inversión,
            todo basado en la ubicación real del cliente y datos climatológicos de la NASA.
          </p>
          <div class="detail-bullets">
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Trazado de techo en mapa satelital
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Cálculo automático de HSP e irradiación
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Proyección económica a 25 años
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Impacto ambiental en CO₂ y árboles equivalentes
            </div>
          </div>
        </div>
        <div class="detail-image">
          <img src="@/assets/images/inicio_captura.jpg" alt="Simulador Solar Eye" />
        </div>
      </div>

      <div class="detail-item inverted">
        <div class="detail-text">
          <span class="section-tag">Gestión completa</span>
          <h2>Tu equipo, tus clientes, tu inventario — todo conectado</h2>
          <p>
            Solar Eye no es solo un simulador. Es la plataforma completa para operar tu empresa:
            gestiona a tus técnicos, controla el stock de materiales, agenda citas desde
            la cotización y mantén toda la información de tus clientes en un solo lugar.
          </p>
          <div class="detail-bullets">
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Roles de administrador y trabajador
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Inventario con alertas de bajo stock
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Agenda de citas integrada al cliente
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Multi-empresa: cada empresa con su espacio
            </div>
          </div>
        </div>
        <div class="detail-image">
          <img src="@/assets/images/inicio_captura_2.jpg" alt="Gestión Solar Eye" />
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-text">
          <span class="section-tag">Inventario y agenda</span>
          <h2>Control total de materiales y tiempos</h2>
          <p>
            Desde el stock de paneles e inversores hasta la programación de visitas técnicas.
            Solar Eye te da visibilidad completa de tu operación en tiempo real, sin importar
            desde dónde trabaje tu equipo.
          </p>
          <div class="detail-bullets">
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Registro de entradas, salidas y ventas
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Categorías: paneles, inversores, baterías, estructuras
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Calendario de citas por día, semana y mes
            </div>
            <div class="bullet">
              <span class="bullet-check">✓</span>
              Historial de movimientos por producto
            </div>
          </div>
        </div>
        <div class="detail-image">
          <img src="@/assets/images/inicio_captura_3.jpg" alt="Inventario y agenda Solar Eye" />
        </div>
      </div>
    </section>

    <section class="audience-section" id="para-quien">
      <div class="section-header">
        <span class="section-tag">Para quién es Solar Eye</span>
        <h2>Diseñado para instaladores solares en México</h2>
      </div>

      <div class="audience-grid">
        <div class="audience-card">
          <div class="audience-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h3>Empresas instaladoras</h3>
          <p>Centraliza toda tu operación. Desde la primera llamada hasta la instalación final, sin papel y sin Excel.</p>
        </div>
        <div class="audience-card">
          <div class="audience-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h3>Vendedores y asesores</h3>
          <p>Genera propuestas profesionales frente al cliente en minutos. Cierra más ventas con cotizaciones precisas.</p>
        </div>
        <div class="audience-card">
          <div class="audience-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3>Técnicos instaladores</h3>
          <p>Accede a la información de cada proyecto, materiales asignados y agenda de instalaciones desde cualquier dispositivo.</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>Empieza a digitalizar tu empresa hoy</h2>
        <p>Crea tu cuenta, registra tu empresa y comienza a generar cotizaciones profesionales en minutos.</p>
        <router-link to="/login" class="btn-primary large">Crear cuenta→</router-link>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="@/assets/images/LogoSolarEye.png" alt="Solar Eye" class="footer-logo" />
          <p>El sistema operativo para empresas instaladoras de energía solar en México.</p>
        </div>
        <div class="footer-links">
          <span>© 2026 Solar Eye. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.landing-wrapper {
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #1a1a2e;
  background: #ffffff;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 6%;
  background: #04142c;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.navbar-logo { height: 36px; width: auto; }

.navbar-links { display: flex; gap: 2rem; }

.nav-link-item {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-link-item:hover { color: white; }

.btn-nav-cta {
  background: #1d4f91;
  color: white;
  text-decoration: none;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.btn-nav-cta:hover { background: #163d72; }

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 5rem 6% 4rem;
  background: linear-gradient(135deg, #04142c 0%, #0a2952 60%, #1d4f91 100%);
  min-height: 90vh;
}

.hero-badge {
  display: inline-block;
  background: rgba(29,79,145,0.25);
  color: #a8c4e8;
  border: 1px solid rgba(29,79,145,0.4);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  line-height: 1.15;
  margin: 0 0 1.25rem;
}

.hero-content p {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 520px;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn-primary {
  display: inline-block;
  background: #1d4f91;
  color: white;
  text-decoration: none;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: #163d72; transform: translateY(-2px); }
.btn-primary.large { font-size: 1.1rem; padding: 1rem 2rem; }

.btn-secondary {
  display: inline-block;
  background: rgba(255,255,255,0.1);
  color: white;
  text-decoration: none;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: 1px solid rgba(255,255,255,0.2);
  transition: background 0.2s;
}
.btn-secondary:hover { background: rgba(255,255,255,0.18); }

.hero-stats { display: flex; align-items: center; gap: 1.5rem; }
.stat { display: flex; flex-direction: column; }
.stat-valor { font-size: 1.5rem; font-weight: 800; color: #a8c4e8; }
.stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.6); }
.stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }

.hero-image { position: relative; }

.hero-img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}

.hero-img-badge {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  white-space: nowrap;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-header h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #04142c;
  margin: 0.5rem 0 1rem;
}

.section-header p {
  color: #666;
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto;
}

.section-header.light h2 { color: white; }
.section-header.light p { color: rgba(255,255,255,0.7); }

.section-tag {
  display: inline-block;
  background: rgba(29,79,145,0.1);
  color: #1d4f91;
  border: 1px solid rgba(29,79,145,0.25);
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-tag.light {
  background: rgba(168,196,232,0.2);
  color: #a8c4e8;
  border-color: rgba(168,196,232,0.35);
}

.features-section {
  padding: 6rem 6%;
  background: #f8fafc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e8edf2;
  transition: box-shadow 0.2s, transform 0.2s;
}

.feature-card:hover {
  box-shadow: 0 8px 30px rgba(4,20,44,0.1);
  transform: translateY(-4px);
}

.feature-card.featured {
  border-top: 4px solid #1d4f91;
}

.feature-icon-box {
  width: 48px;
  height: 48px;
  background: rgba(29,79,145,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-icon-box svg {
  width: 24px;
  height: 24px;
  color: #1d4f91;
}

.feature-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #04142c;
  margin: 0 0 0.75rem;
}

.feature-card p {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.feature-list li {
  font-size: 0.85rem;
  color: #1d4f91;
  font-weight: 600;
  padding-left: 1rem;
  position: relative;
}

.feature-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: #1d4f91;
}

.how-section {
  padding: 6rem 6%;
  background: #04142c;
}

.steps-grid {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}

.step {
  flex: 1;
  min-width: 200px;
  max-width: 240px;
  text-align: center;
  padding: 0 1rem;
}

.step-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: rgba(29,79,145,0.5);
  line-height: 1;
  margin-bottom: 0.75rem;
}

.step-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.step-content p {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
}

.step-arrow {
  font-size: 2rem;
  color: #1d4f91;
  margin-top: 1.5rem;
  flex-shrink: 0;
}

.gallery-section {
  padding: 6rem 6%;
  background: #f8fafc;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 1.25rem;
}

.gallery-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(4,20,44,0.1);
  border: 1px solid #e8edf2;
  transition: transform 0.25s, box-shadow 0.25s;
  background: #fff;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(4,20,44,0.15);
}

.gallery-card.tall {
  grid-row: span 2;
}

.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.gallery-card:hover img { transform: scale(1.03); }

.gallery-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(4,20,44,0.85), transparent);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 1rem 0.85rem 0.7rem;
}

.details-section {
  padding: 6rem 6%;
  background: white;
}

.detail-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  margin-bottom: 6rem;
}

.detail-item:last-child { margin-bottom: 0; }

.detail-item.inverted { direction: rtl; }
.detail-item.inverted > * { direction: ltr; }

.detail-text .section-tag { margin-bottom: 1rem; display: inline-block; }

.detail-text h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #04142c;
  margin: 0.5rem 0 1rem;
  line-height: 1.2;
}

.detail-text p {
  font-size: 1rem;
  color: #555;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.detail-bullets {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.bullet {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.bullet-check {
  color: #1d4f91;
  font-weight: 700;
  flex-shrink: 0;
}

.detail-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(4,20,44,0.15);
  border: 1px solid #e8edf2;
  transition: transform 0.3s;
}

.detail-image img:hover { transform: scale(1.02); }

.audience-section {
  padding: 6rem 6%;
  background: #f8fafc;
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.audience-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  text-align: center;
  border: 1px solid #e8edf2;
  transition: box-shadow 0.2s, transform 0.2s;
}

.audience-card:hover {
  box-shadow: 0 8px 30px rgba(4,20,44,0.1);
  transform: translateY(-4px);
}

.audience-icon-box {
  width: 56px;
  height: 56px;
  background: rgba(29,79,145,0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.audience-icon-box svg {
  width: 28px;
  height: 28px;
  color: #1d4f91;
}

.audience-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #04142c;
  margin: 0 0 0.75rem;
}

.audience-card p {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.cta-section {
  padding: 6rem 6%;
  background: linear-gradient(135deg, #04142c, #1d4f91);
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
}

.cta-content p {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.75);
  margin-bottom: 2rem;
}

.footer {
  background: #020d1e;
  padding: 2rem 6%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-logo { height: 28px; opacity: 0.8; }

.footer-brand p {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin: 0.5rem 0 0;
}

.footer-links span {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}

@media (max-width: 1024px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-card.tall { grid-row: span 1; }
}

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; padding: 3rem 5%; min-height: auto; }
  .hero-content h1 { font-size: 2rem; }
  .hero-image { display: none; }
  .hero-stats { flex-wrap: wrap; gap: 1rem; }
  .navbar-links { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .steps-grid { flex-direction: column; align-items: center; }
  .step-arrow { transform: rotate(90deg); margin: 0; }
  .detail-item, .detail-item.inverted { grid-template-columns: 1fr; direction: ltr; gap: 2rem; }
  .audience-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: 1fr; }
  .section-header h2 { font-size: 1.6rem; }
  .cta-content h2 { font-size: 1.8rem; }
}
</style>