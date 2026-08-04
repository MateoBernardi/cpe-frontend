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
            2. Si creás una cuenta en el Foro
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-black">
            Para participar del Foro hace falta una cuenta. Estos son{' '}
            <strong>todos</strong> los datos que guardamos para que puedas
            registrarte, iniciar sesión y mantenerte conectado:
          </p>

          <h3 className="mb-2 mt-4 text-base font-semibold text-black">
            Datos de tu cuenta
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>Tu nombre y apellido, tal como los cargás al registrarte.</li>
            <li>
              Tu correo electrónico, y si ya lo verificaste o no.
            </li>
            <li>
              Las fechas de creación y última modificación de la
              cuenta.
            </li>
            <li>
              <strong>Si te registrás </strong> tu
              contraseña se guarda cifrada. Ni
              nosotros ni nadie de nuestro equipo puede leerla ni recuperarla;
              por eso, si la olvidás, la única vía es restablecerla.
            </li>
            <li>
              <strong>Si entrás con Google:</strong> recibimos de Google tu
              nombre, tu correo electrónico y tu foto de perfil, y guardamos los
              datos para validar tu identidad.{' '}
              <strong>Nunca recibimos tu contraseña de Google</strong>, y sólo
              pedimos tu perfil básico y tu email: no accedemos a tu Gmail, tus
              contactos, tu calendario ni tus archivos.
            </li>
          </ul>

          <h3 className="mb-2 mt-4 text-base font-semibold text-black">
            Datos de tu sesión
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              Un identificador de sesión se guarda en una cookie de
              tu navegador. Es lo que nos permite reconocerte entre página y
              página sin pedirte la contraseña cada vez.
            </li>
            <li>
              La dirección IP y el navegador/sistema operativo desde
              donde iniciaste sesión, para poder detectar accesos indebidos a tu
              cuenta.
            </li>
          </ul>

          <h3 className="mb-2 mt-4 text-base font-semibold text-black">
            Datos de seguridad y prevención de abusos
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-black">
            <li>
              Enlaces temporales de verificación de correo y de restablecimiento
              de contraseña, que vencen solos y dejan de ser válidos una vez
              usados.
            </li>
            <li>
              Contadores de intentos asociados a tu dirección IP y a tu correo
              electrónico.
            </li>
            <li>
              Usamos <strong>Cloudflare Turnstile</strong> como verificación
              antibot en el registro y el inicio de sesión, y{' '}
              <strong>Resend</strong> para enviarte los correos de verificación y
              recuperación de contraseña. Ambos reciben únicamente lo mínimo
              necesario para prestar ese servicio.
            </li>
          </ul>

          <p className="mt-4 text-sm leading-relaxed text-black">
            No usamos cookies de publicidad, de analítica ni de seguimiento de
            terceros: las únicas cookies que colocamos son las estrictamente
            necesarias para mantener tu sesión abierta y para la verificación
            de identidad.
          </p>
        </section>

        {/* 3 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            3. ¿Para qué usamos tu información?
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
            <li>
              Para crear tu cuenta del Foro, mantenerte con la sesión iniciada,
              mostrar tu nombre junto a lo que publicás y moderar la comunidad.
              Los datos de la cuenta y de la sesión se usan sólo con ese fin: no
              alimentan campañas, perfiles publicitarios ni envíos comerciales.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            4. ¿Cómo protegemos tus datos?
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

        {/* 5 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            5. ¿Cuánto tiempo guardamos tus datos?
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
            <li>
              Los datos de tu cuenta del Foro se conservan mientras la cuenta
              exista. Si pedís que la eliminemos, se borran también todas tus
              sesiones y la vinculación con Google. Las sesiones vencidas y los
              enlaces de verificación caducados se descartan solos.
            </li>
          </ul>
        </section>

        {/* 6 */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-black">
            6. Tus Derechos
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-black">
            Vos sos el dueño de tus datos. En cualquier momento tenés derecho a
            solicitar el <strong>Acceso</strong>, <strong>Rectificación</strong>,{' '}
            <strong>Cancelación</strong> (eliminación definitiva) u{' '}
            <strong>Oposición</strong> al uso de tus datos personales.
          </p>
          <p className="text-sm leading-relaxed text-black">
            Para ejercer estos derechos, o si deseás que eliminemos tu CV o tu
            cuenta del Foro de nuestros registros de forma permanente, simplemente
            envianos un correo a:{' '}
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
