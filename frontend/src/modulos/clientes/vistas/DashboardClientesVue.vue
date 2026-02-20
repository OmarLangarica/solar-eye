<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Gestión de Clientes</h1>
    </div>

    <div class="filters">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="Buscar cliente...">
      </div>
      <div class="filter-buttons">
        <button :class="{ active: filterStatus === 'todos' }" @click="filterStatus = 'todos'">
          Todos ({{ clientes.length }})
        </button>
        <button :class="{ active: filterStatus === 'activo' }" @click="filterStatus = 'activo'">
          Activos
        </button>
        <button :class="{ active: filterStatus === 'pendiente' }" @click="filterStatus = 'pendiente'">
          Pendientes
        </button>
        <button :class="{ active: filterStatus === 'completado' }" @click="filterStatus = 'completado'">
          Completados
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ubicación</th>
            <th>Sistema</th>
            <th>Inversión</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
            <td><span class="id-badge">{{ cliente.id }}</span></td>
            <td>
              <div class="client-info">
                <div class="avatar">{{ cliente.nombre.charAt(0) }}</div>
                <div>
                  <div class="client-name">{{ cliente.nombre }}</div>
                  <div class="client-project">{{ cliente.proyecto }}</div>
                </div>
              </div>
            </td>
            <td>{{ cliente.email }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>
              <div class="location">
                {{ cliente.ubicacion }}
              </div>
            </td>
            <td>
              <div class="system-info">
                <div>{{ cliente.sistema.potencia }} kW</div>
                <div class="panels-count">{{ cliente.sistema.paneles }} paneles</div>
              </div>
            </td>
            <td>
              <div class="investment">
                ${{ cliente.inversion.toLocaleString() }}
              </div>
            </td>
            <td>
              <span :class="['status-badge', cliente.estado]">
                {{ cliente.estado === 'activo' ? 'Activo' : 
                   cliente.estado === 'pendiente' ? 'Pendiente' : 'Completado' }}
              </span>
            </td>
            <td>{{ cliente.fecha }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-report" @click="generarReporte(cliente)">
                  Generar Reporte
                </button>
                <button class="btn-view" @click="verDetalle(cliente)">
                  Ver
                </button>
                <button class="btn-edit" @click="editarCliente(cliente)">
                  Editar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de reporte -->
    <div v-if="showReportModal" class="modal-overlay" @click="showReportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Generando Reporte</h2>
          <button class="close-btn" @click="showReportModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="report-preview">
            <h3>{{ clienteSeleccionado?.nombre }}</h3>
            <div class="report-details">
              <div class="detail-item">
                <span class="label">Proyecto:</span>
                <span class="value">{{ clienteSeleccionado?.proyecto }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Sistema:</span>
                <span class="value">{{ clienteSeleccionado?.sistema.potencia }} kW</span>
              </div>
              <div class="detail-item">
                <span class="label">Inversión:</span>
                <span class="value">${{ clienteSeleccionado?.inversion.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ahorro Anual Estimado:</span>
                <span class="value">${{ clienteSeleccionado ? (clienteSeleccionado.inversion * 0.15).toLocaleString() : 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">ROI:</span>
                <span class="value">6.7 años</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn-download">Descargar PDF</button>
            <button class="btn-email">Enviar por Email</button>
            <button class="btn-print">Imprimir</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  proyecto: string;
  sistema: {
    potencia: number;
    paneles: number;
  };
  inversion: number;
  estado: 'activo' | 'pendiente' | 'completado';
  fecha: string;
}

const searchQuery = ref('');
const filterStatus = ref('todos');
const currentPage = ref(1);
const totalPages = ref(3);
const showReportModal = ref(false);
const clienteSeleccionado = ref<Cliente | null>(null);

// Sin datos de ejemplo - lista vacía
const clientes = ref<Cliente[]>([]);

const clientesFiltrados = computed(() => {
  let resultado = clientes.value;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    resultado = resultado.filter(c => 
      c.nombre.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.ubicacion.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (filterStatus.value !== 'todos') {
    resultado = resultado.filter(c => c.estado === filterStatus.value);
  }

  return resultado;
});

function generarReporte(cliente: Cliente) {
  clienteSeleccionado.value = cliente;
  showReportModal.value = true;
  console.log('Generando reporte para:', cliente.nombre);
}

function verDetalle(cliente: Cliente) {
  console.log('Ver detalle de:', cliente.nombre);
}

function editarCliente(cliente: Cliente) {
  console.log('Editar cliente:', cliente.nombre);
}

const errores = ref({
  nombre: '',
  email: '',
  telefono: '',
  inversion: '',
  potencia: ''
});

// Función de validación
const validarCliente = (datos: Cliente): boolean => {
  let esValido = true;
  
  Object.keys(errores.value).forEach(key => (errores.value[key as keyof typeof errores.value] = ''));

  // Validar Nombre
  if (!datos.nombre || datos.nombre.length < 3) {
    errores.value.nombre = 'El nombre debe tener al menos 3 caracteres.';
    esValido = false;
  }

  // Validar Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(datos.email)) {
    errores.value.email = 'Por favor, ingresa un correo electrónico válido.';
    esValido = false;
  }

  // Validar Teléfono (10 dígitos)
  if (!/^\d{10}$/.test(datos.telefono.replace(/\s/g, ''))) {
    errores.value.telefono = 'El teléfono debe contener 10 dígitos numéricos.';
    esValido = false;
  }

  // Validar Inversión
  if (datos.inversion <= 0) {
    errores.value.inversion = 'La inversión debe ser un monto mayor a 0.';
    esValido = false;
  }

  // Validar Potencia del Sistema
  if (datos.sistema.potencia <= 0) {
    errores.value.potencia = 'La potencia debe ser mayor a 0 kW.';
    esValido = false;
  }

  return esValido;
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-box {
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-buttons button {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s;
}

.filter-buttons button:hover {
  border-color: #f97316;
  color: #f97316;
}

.filter-buttons button.active {
  background: #f97316;
  color: white;
  border-color: #f97316;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.clients-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clients-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}

.clients-table tbody tr {
  transition: background 0.2s;
}

.clients-table tbody tr:hover {
  background: #f8fafc;
}

.id-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.client-name {
  font-weight: 600;
  color: #1e293b;
}

.client-project {
  font-size: 0.8rem;
  color: #64748b;
}

.location {
  color: #64748b;
  font-size: 0.85rem;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.panels-count {
  font-size: 0.8rem;
  color: #64748b;
}

.investment {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.activo {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.completado {
  background: #dbeafe;
  color: #1e40af;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-report {
  background: #f97316;
  color: white;
}

.btn-report:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-view {
  background: #3b82f6;
  color: white;
}

.btn-view:hover {
  background: #2563eb;
}

.btn-edit {
  background: #64748b;
  color: white;
  padding: 0.5rem;
}

.btn-edit:hover {
  background: #475569;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s;
}

.pagination button:hover:not(:disabled) {
  border-color: #f97316;
  color: #f97316;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #475569;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-preview {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.report-preview h3 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.report-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #64748b;
  font-weight: 500;
}

.detail-item .value {
  color: #1e293b;
  font-weight: 600;
}

.report-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.report-actions button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-download {
  background: #f97316;
  color: white;
}

.btn-download:hover {
  background: #ea580c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-email {
  background: #3b82f6;
  color: white;
}

.btn-email:hover {
  background: #2563eb;
}

.btn-print {
  background: #64748b;
  color: white;
}

.btn-print:hover {
  background: #475569;
}

.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
  display: block;
}

.error-message {
  animation: shake 0.2s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}
</style>
