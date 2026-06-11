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
        <a href="#empresas" class="nav-link-item">Instaladores</a>
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

    <!-- EMPRESAS REGISTRADAS -->
<section class="empresas-section" id="empresas">
    <div class="section-header">
        <span class="section-tag">Red de instaladores</span>
        <h2>Empresas instaladoras verificadas</h2>
        <p>Encuentra un instalador solar certificado cerca de ti y solicita tu cotización gratuita.</p>
    </div>

    <div v-if="empresas.length === 0" class="sin-empresas">
        <p>Pronto habrá instaladores registrados en tu zona.</p>
    </div>

    <div class="empresas-grid" v-else>
        <div
            v-for="empresa in empresas"
            :key="empresa.id"
            class="empresa-card"
            @click="abrirEmpresa(empresa)">
            <div class="empresa-portada"
                :style="empresa.imagen_portada
                    ? { backgroundImage: `url(${empresa.imagen_portada})` }
                    : { background: `linear-gradient(135deg, ${empresa.color_primario ?? '#04142c'}, #1d4f91)` }">
                <div class="empresa-portada-overlay"></div>
            </div>
            <div class="empresa-card-body">
                <div class="empresa-logo-row">
                    <div class="empresa-logo-circle"
                        :style="{ backgroundColor: empresa.color_primario ?? '#1d4f91' }">
                        <img v-if="empresa.imagen_logo" :src="empresa.imagen_logo" :alt="empresa.nombre" />
                        <span v-else>{{ empresa.nombre?.charAt(0) }}</span>
                    </div>
                    <div>
                        <div class="empresa-nombre">{{ empresa.nombre }}</div>
                        <div class="empresa-ubicacion" v-if="empresa.ciudad">
                            {{ empresa.ciudad }}{{ empresa.estado_republica ? ', ' + empresa.estado_republica : '' }}
                        </div>
                    </div>
                </div>
                <p class="empresa-slogan" v-if="empresa.slogan">{{ empresa.slogan }}</p>
                <p class="empresa-desc" v-if="empresa.descripcion">
                    {{ empresa.descripcion.slice(0, 100) }}{{ empresa.descripcion.length > 100 ? '...' : '' }}
                </p>
                <button class="empresa-btn-contactar"
                    :style="{ backgroundColor: empresa.color_primario ?? '#1d4f91' }"
                    @click.stop="abrirEmpresa(empresa)">
                    Contactar empresa →
                </button>
            </div>
        </div>
    </div>
</section>

<!-- Modal detalle empresa -->
<Teleport to="body">
    <div v-if="modalEmpresa" class="landing-overlay" @click.self="modalEmpresa = false">
        <div class="modal-empresa">
            <div class="modal-empresa-portada"
                :style="empresaActiva?.imagen_portada
                    ? { backgroundImage: `url(${empresaActiva.imagen_portada})` }
                    : { background: `linear-gradient(135deg, ${empresaActiva?.color_primario ?? '#04142c'}, #1d4f91)` }">
                <div class="modal-empresa-overlay"></div>
                <button class="modal-btn-cerrar" @click="modalEmpresa = false">✕</button>
            </div>

            <div class="modal-empresa-body">
                <div class="modal-logo-row">
                    <div class="modal-logo-circle"
                        :style="{ backgroundColor: empresaActiva?.color_primario ?? '#1d4f91' }">
                        <img v-if="empresaActiva?.imagen_logo" :src="empresaActiva.imagen_logo" :alt="empresaActiva?.nombre" />
                        <span v-else>{{ empresaActiva?.nombre?.charAt(0) }}</span>
                    </div>
                    <div>
                        <h2 class="modal-empresa-nombre">{{ empresaActiva?.nombre }}</h2>
                        <p class="modal-empresa-slogan" v-if="empresaActiva?.slogan">{{ empresaActiva.slogan }}</p>
                    </div>
                </div>

                <p class="modal-empresa-desc" v-if="empresaActiva?.descripcion">{{ empresaActiva.descripcion }}</p>

                <div class="modal-empresa-ubicacion" v-if="empresaActiva?.ciudad">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ empresaActiva?.ciudad }}{{ empresaActiva?.estado_republica ? ', ' + empresaActiva.estado_republica : '' }}
                    <span v-if="empresaActiva?.direccion"> — {{ empresaActiva.direccion }}</span>
                </div>

                <div class="modal-contacto-grid">
                    <a v-if="empresaActiva?.whatsapp"
                        :href="`https://wa.me/${empresaActiva.whatsapp.replace(/\D/g,'')}`"
                        target="_blank"
                        class="modal-contacto-btn whatsapp">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                    </a>
                    <a v-if="empresaActiva?.telefono"
                        :href="`tel:${empresaActiva.telefono}`"
                        class="modal-contacto-btn telefono">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        {{ empresaActiva.telefono }}
                    </a>
                    <a v-if="empresaActiva?.email_contacto"
                        :href="`mailto:${empresaActiva.email_contacto}`"
                        class="modal-contacto-btn email">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        {{ empresaActiva.email_contacto }}
                    </a>
                    <a v-if="empresaActiva?.sitio_web"
                        :href="empresaActiva.sitio_web"
                        target="_blank"
                        class="modal-contacto-btn web">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                        Sitio web
                    </a>
                    <a v-if="empresaActiva?.facebook"
                        :href="empresaActiva.facebook"
                        target="_blank"
                        class="modal-contacto-btn facebook">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                    </a>
                    <a v-if="empresaActiva?.instagram"
                        :href="empresaActiva.instagram"
                        target="_blank"
                        class="modal-contacto-btn instagram">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        Instagram
                    </a>
                </div>
            </div>
        </div>
    </div>
</Teleport>

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

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';

  const empresasApi = axios.create({ baseURL: 'http://localhost:3001/api/empresas' });

  const empresas = ref<any[]>([]);
  const modalEmpresa = ref(false);
  const empresaActiva = ref<any>(null);

  const abrirEmpresa = (empresa: any) => {
      empresaActiva.value = empresa;
      modalEmpresa.value = true;
  };

  onMounted(async () => {
      const resp = await empresasApi.get('/publicas');
      empresas.value = Array.isArray(resp.data) ? resp.data : [];
  });
</script>

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

/* ─── EMPRESAS ───────────────────────────────────────────────── */
.empresas-section {
  padding: 6rem 6%;
  background: white;
}

.sin-empresas {
  text-align: center;
  color: #999;
  padding: 3rem;
  font-size: 1rem;
}

.empresas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.empresa-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e8edf2;
  box-shadow: 0 4px 16px rgba(4,20,44,0.07);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.empresa-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(4,20,44,0.14);
}

.empresa-portada {
  height: 110px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.empresa-portada-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4,20,44,0.25);
}

.empresa-card-body { padding: 1.25rem; }

.empresa-logo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: -40px;
  position: relative;
  z-index: 1;
  margin-bottom: 0.75rem;
}

.empresa-logo-row > div:last-child {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60px; /* mismo alto que el logo */
}

.empresa-logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.empresa-logo-circle img { width: 100%; height: 100%; object-fit: cover; }

.empresa-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: #04142c;
  line-height: 1.2;
  margin-bottom: 2px;
  margin-top: 15px;
}

.empresa-ubicacion {
  font-size: 0.78rem;
  color: #888;
  line-height: 1.2;
}
.empresa-slogan { font-size: 0.85rem; font-weight: 600; color: #1d4f91; margin: 0 0 0.5rem; }
.empresa-desc { font-size: 0.82rem; color: #555; line-height: 1.5; margin: 0 0 1rem; }

.empresa-btn-contactar {
  width: 100%;
  padding: 0.65rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.empresa-btn-contactar:hover { opacity: 0.88; }

/* ─── MODAL EMPRESA ──────────────────────────────────────────── */
.landing-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,20,44,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-empresa {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px rgba(4,20,44,0.3);
}

.modal-empresa-portada {
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 16px 16px 0 0;
}

.modal-empresa-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4,20,44,0.35);
  border-radius: 16px 16px 0 0;
}

.modal-btn-cerrar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  color: #333;
  transition: background 0.2s;
}
.modal-btn-cerrar:hover { background: white; }

.modal-empresa-body { padding: 1.5rem; }

.modal-logo-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  margin-bottom: 1.25rem;
}

.modal-logo-circle {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.modal-logo-circle img { width: 100%; height: 100%; object-fit: cover; }

.modal-empresa-nombre { font-size: 1.4rem; font-weight: 800; color: #04142c; margin: 0 0 0.2rem; }
.modal-empresa-slogan { font-size: 0.9rem; color: #1d4f91; font-weight: 600; margin: 0; }
.modal-empresa-desc { font-size: 0.92rem; color: #444; line-height: 1.7; margin: 0 0 1.25rem; }

.modal-empresa-ubicacion {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.modal-contacto-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.modal-contacto-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity 0.2s, transform 0.15s;
  border: none;
  cursor: pointer;
}

.modal-contacto-btn:hover { opacity: 0.88; transform: translateY(-1px); }

.modal-contacto-btn.whatsapp { background: #25d366; color: white; }
.modal-contacto-btn.telefono { background: #1d4f91; color: white; }
.modal-contacto-btn.email { background: #f8fafc; color: #333; border: 1px solid #e8edf2; }
.modal-contacto-btn.web { background: #f8fafc; color: #333; border: 1px solid #e8edf2; }
.modal-contacto-btn.facebook { background: #1877f2; color: white; }
.modal-contacto-btn.instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; }

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .empresas-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .empresas-grid { grid-template-columns: 1fr; }
  .modal-contacto-grid { grid-template-columns: 1fr; }
}

</style>