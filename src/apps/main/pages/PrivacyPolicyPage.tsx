import { useEffect } from 'react'

/**
 * Página de Política de Privacidad — contenido hardcodeado.
 */
export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-white pt-[15vh] pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-black">Política de Privacidad</h1>

        {/* 1 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            1. ¿Quiénes somos y qué datos recopilamos?
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-black">
            En <strong>Clínica para Empresas (CPE)</strong> nos tomamos muy en serio la
            privacidad de nuestros usuarios. Dependiendo de cómo interactúes con
            nuestro sitio, recopilamos distintos tipos de datos personales:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              <strong>Si usás nuestro Formulario de Contacto:</strong> recopilamos tu
              nombre, correo electrónico, localidad, número de teléfono y el mensaje
              que decidas enviarnos.
            </li>
            <li>
              <strong>Si usás nuestro Formulario de Postulación (Empleos):</strong>{' '}
              además de tus datos de contacto básicos, recopilamos información sobre
              tu experiencia, modalidad de trabajo preferida, disponibilidad y tu
              Currículum Vitae (CV) en formato PDF, el cual puede contener datos
              adicionales sobre tu educación y trayectoria laboral.
            </li>
          </ul>
        </section>

        {/* 2 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            2. ¿Para qué usamos tu información?
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              Para responder a tus consultas, presupuestos o dudas enviadas a través
              del formulario de contacto.
            </li>
            <li>
              Para evaluar tu perfil profesional frente a las búsquedas laborales
              activas en la clínica.
            </li>
            <li>
              Para contactarte en caso de que tu perfil se ajuste a futuras vacantes
              (si decidís dejarnos tu CV en nuestra base de datos).
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-black">
              <strong>Aclaración importante:</strong> Jamás venderemos, alquilaremos
              ni compartiremos tu información personal o tu CV con terceros ajenos a
              nuestra empresa con fines comerciales.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            3. ¿Cómo protegemos tus datos?
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              <strong>Almacenamiento Seguro:</strong> Tus datos y tu CV se almacenan
              en servidores en la nube con altos estándares de seguridad y cifrado.
            </li>
            <li>
              <strong>Acceso Restringido:</strong> Utilizamos sistemas de seguridad de
              "Confianza Cero". Esto significa que solo el personal
              estrictamente autorizado de Administración puede
              acceder a la base de datos de candidatos, y deben pasar por
              verificaciones de identidad rigurosas para poder ver tu información o
              descargar tu CV.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            4. ¿Cuánto tiempo guardamos tus datos?
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              Tus datos de contacto y postulaciones se mantendrán en nuestro sistema
              mientras sean necesarios para los fines descritos.
            </li>
            <li>
              Si tu postulación no es seleccionada en lo inmediato, conservaremos tu
              CV en nuestra base de datos para futuras
              oportunidades, a menos que nos solicites expresamente su eliminación.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            5. Tus Derechos
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-black">
            Vos sos el dueño de tus datos. En cualquier momento tenés derecho a
            solicitar el <strong>Acceso</strong>, <strong>Rectificación</strong>,{' '}
            <strong>Cancelación</strong> (eliminación definitiva) u{' '}
            <strong>Oposición</strong> al uso de tus datos personales.
          </p>
          <p className="text-sm leading-relaxed text-black">
            Para ejercer estos derechos, o si deseás que eliminemos tu CV de nuestros
            registros de forma permanente, simplemente envianos un correo a:{' '}
            <a
              href="mailto:contacto@clinicaparaempresas.com"
              className="font-medium text-blue-700 underline"
            >
              contacto@clinicaparaempresas.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
