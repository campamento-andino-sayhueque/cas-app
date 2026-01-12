/**
 * FichaMedicaPdfView Component
 * 
 * Renderiza la Ficha Médica como HTML y permite exportarla a PDF
 * usando la API de impresión del navegador.
 */

import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import type { DocumentoCompletado } from '../../api/schemas/documentos';
import type { Usuario } from '../../api/schemas/usuario';

interface FichaMedicaPdfViewProps {
  documento: DocumentoCompletado;
  usuario: Usuario;
  onClose: () => void;
}

export function FichaMedicaPdfView({ documento, usuario, onClose }: FichaMedicaPdfViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const respuestas = documento.respuestas || {};

  const handlePrint = () => {
    if (!contentRef.current) return;
    
    // Crear una ventana de impresión con el contenido
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes para imprimir');
      return;
    }

    const content = contentRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Médica - ${usuario.nombreMostrar}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              padding: 20px;
              color: #000;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            td, th { border: 1px solid #9ca3af; padding: 4px 8px; }
            .header-row { background-color: #f3f4f6; }
            h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
            h2 { font-size: 16px; text-align: center; margin-bottom: 8px; }
            h3 { font-size: 14px; text-align: center; margin-bottom: 8px; font-weight: bold; }
            .subtitle { font-size: 10px; text-align: center; margin-bottom: 16px; }
            .firmas { margin-top: 32px; display: flex; justify-content: space-between; text-align: center; font-size: 10px; }
            .firma-line { border-top: 1px solid #000; width: 150px; margin: 32px auto 0; padding-top: 4px; }
            .si-no { text-align: center; width: 60px; }
            @media print {
              body { padding: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-AR');
    } catch {
      return fecha;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Vista previa de Ficha Médica</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido para imprimir */}
        <div className="overflow-auto p-6">
          <div ref={contentRef}>
            {/* Título */}
            <h1>Campamento Andino Sayhueque</h1>
            <h2>FICHA MÉDICA DEL TITULAR</h2>
            <p className="subtitle">Tildar lo que corresponda. (Toda observación o indicación específica deberá ser descripta dorso)</p>

            {/* Datos Personales */}
            <table>
              <tbody>
                <tr>
                  <td><strong>Acampante:</strong> {usuario.nombreMostrar}</td>
                  <td><strong>Año:</strong> {new Date().getFullYear()}</td>
                </tr>
                <tr>
                  <td><strong>Grupo:</strong> </td>
                  <td><strong>Fecha nacimiento:</strong> {formatFecha(usuario.fechaNacimiento)}</td>
                  <td><strong>DNI:</strong> {usuario.dni}</td>
                </tr>
                <tr>
                  <td><strong>Domicilio:</strong> {usuario.direccion}</td>
                  <td colSpan={2}><strong>Localidad:</strong> {usuario.localidad}</td>
                </tr>
                <tr>
                  <td><strong>Teléfono:</strong> {usuario.telefono}</td>
                  <td colSpan={2}><strong>Mail:</strong> {usuario.email}</td>
                </tr>
                <tr>
                  <td><strong>Grupo Sanguíneo:</strong> {respuestas.grupo_sanguineo}</td>
                  <td><strong>Factor RH:</strong> {respuestas.factor_rh}</td>
                  <td><strong>Peso:</strong> {respuestas.peso} <strong>Altura:</strong> {respuestas.altura}</td>
                </tr>
              </tbody>
            </table>

            {/* Preguntas de Salud */}
            <table>
              <thead>
                <tr className="header-row">
                  <th colSpan={3} style={{ textAlign: 'left' }}>Estado de Salud</th>
                </tr>
              </thead>
              <tbody>
                <FilaSiNo label="¿Se encuentra padeciendo procesos inflamatorios o infecciosos?" respuesta={respuestas.procesos_inflamatorios} />
                <tr className="header-row">
                  <td colSpan={3}><strong>Padece alguna de las siguientes enfermedades:</strong></td>
                </tr>
                <FilaSiNo label="Metabólicas - Diabetes" respuesta={respuestas.diabetes} />
                <FilaSiNo label="Hernias inguinales - crurales" respuesta={respuestas.hernias} />
                <FilaSiNo label="Cardiopatías congénitas" respuesta={respuestas.cardiopatias_congenitas} />
                <FilaSiNo label="Cardiopatías infecciosas" respuesta={respuestas.cardiopatias_infecciosas} />
                <FilaSiNo label="Epilepsia" respuesta={respuestas.epilepsia} />
                <FilaSiNo label="Arritmias" respuesta={respuestas.arritmias} />
                <FilaSiNo label="Crisis asmáticas o respiratorias" respuesta={respuestas.asma} />
                <FilaSiNo label="Hipertensión o hipotensión arterial" respuesta={respuestas.hipertension} />
                <FilaSiNo label="Alergias alimentarias, medicamentosas o de otro tipo" respuesta={respuestas.alergias} />
                <FilaSiNo label="¿Ha sufrido o sufre convulsiones?" respuesta={respuestas.convulsiones} />
                <FilaSiNo label="Ataques de pánico, fobias, alteraciones alimentarias" respuesta={respuestas.panico_fobias} />
                
                <tr className="header-row">
                  <td colSpan={3}><strong>Ha padecido en fecha reciente:</strong></td>
                </tr>
                <FilaSiNo label="Hepatitis (60 días)" respuesta={respuestas.hepatitis_reciente} />
                <FilaSiNo label="Sarampión (30 días)" respuesta={respuestas.sarampion_reciente} />
                <FilaSiNo label="Parotiditis (30 días)" respuesta={respuestas.parotiditis_reciente} />
                <FilaSiNo label="Mononucleosis infecciosa (30 días)" respuesta={respuestas.mononucleosis_reciente} />
                
                <tr className="header-row">
                  <td colSpan={3}><strong>Vacunación y lesiones:</strong></td>
                </tr>
                <FilaSiNo label="¿Cuenta con el calendario de vacunación completo?" respuesta={respuestas.vacunas_completas} />
                <FilaSiNo label="¿Ha tenido esguinces o luxaciones?" respuesta={respuestas.esguinces_luxaciones} />
                <FilaSiNo label="¿Ha tenido fracturas de huesos?" respuesta={respuestas.fracturas} />
                <FilaSiNo label="¿Presenta alguna dificultad motriz?" respuesta={respuestas.dificultad_motriz} />
              </tbody>
            </table>

            {/* Contactos de Emergencia */}
            <h3>Contactos de Emergencia</h3>
            <table>
              <thead>
                <tr className="header-row">
                  <th>Nombre y apellido</th>
                  <th>Vínculo/parentesco</th>
                  <th>Tel. línea</th>
                  <th>Celular</th>
                  <th>DNI</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3]
                  .filter(i => respuestas[`contacto_${i}_nombre`])
                  .map(i => (
                  <tr key={i}>
                    <td>{respuestas[`contacto_${i}_nombre`] || ''}</td>
                    <td>{respuestas[`contacto_${i}_vinculo`] || ''}</td>
                    <td>{respuestas[`contacto_${i}_telefono`] || ''}</td>
                    <td>{respuestas[`contacto_${i}_celular`] || ''}</td>
                    <td>{respuestas[`contacto_${i}_dni`] || ''}</td>
                  </tr>
                ))}
                {/* Si no hay contactos, mostrar fila indicativa */}
                {![1, 2, 3].some(i => respuestas[`contacto_${i}_nombre`]) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic' }}>Sin contactos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Observaciones */}
            {respuestas.observaciones && (
              <div style={{ border: '1px solid #9ca3af', padding: '8px', marginBottom: '16px' }}>
                <strong>Observaciones:</strong> {respuestas.observaciones}
              </div>
            )}

            {/* Firmas */}
            <div className="firmas">
              <div>
                <div className="firma-line">Firma del responsable parental</div>
                <div className="firma-line">Aclaración y DNI</div>
              </div>
              <div>
                <div className="firma-line">Firma acampante menor de 18 años</div>
                <div className="firma-line">Aclaración y DNI</div>
              </div>
              <div>
                <div className="firma-line">Firma Representante del CAS</div>
                <div className="firma-line">Aclaración y DNI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente helper para filas SI/NO
function FilaSiNo({ label, respuesta }: { label: string; respuesta?: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td className="si-no">SI: {respuesta === 'Sí' ? <strong>X</strong> : ''}</td>
      <td className="si-no">NO: {respuesta === 'No' ? <strong>X</strong> : ''}</td>
    </tr>
  );
}

export default FichaMedicaPdfView;
