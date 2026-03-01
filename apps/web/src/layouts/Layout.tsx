import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* 🔹 BARRA SUPERIOR DELGADA */}
      <div className="bg-[#002D72] text-white text-xs">
        <div className="max-w-6xl mx-auto px-6 py-2 flex justify-between">
          <span>Centro de Atención 809-000-0000</span>
          <div className="flex gap-6">
            <span>Oficinas</span>
            <span>Canales digitales</span>
            <span>Ayuda</span>
          </div>
        </div>
      </div>

      {/* 🔹 HEADER PRINCIPAL */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#002D72] rounded-sm flex items-center justify-center text-white font-bold text-lg">
              BA
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Banco Atlántico
              </h1>
              <p className="text-xs text-gray-500">
                Banca Personal en Línea
              </p>
            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <span>🔔</span>
            <span>Mensajes</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium">Luis Herrera</p>
                <p className="text-xs text-gray-500">
                  Último acceso 10:45 AM
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 🔹 MENÚ PRINCIPAL */}
        <nav className="border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <ul className="flex gap-10 text-sm text-gray-700">
              <li className="py-4 hover:text-[#002D72] cursor-pointer">
                Resumen
              </li>
              <li className="py-4 hover:text-[#002D72] cursor-pointer">
                Cuentas
              </li>
              <li className="py-4 hover:text-[#002D72] cursor-pointer">
                Transferencias
              </li>
              <li className="py-4 border-b-2 border-[#002D72] text-[#002D72] font-medium cursor-pointer">
                Solicitudes
              </li>
              <li className="py-4 hover:text-[#002D72] cursor-pointer">
                Servicios
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* 🔹 CONTENIDO DINÁMICO */}
      <main className="py-10 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* 🔹 FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-500 flex justify-between">
          <span>
            © 2026 Banco Atlántico. Todos los derechos reservados.
          </span>
          <span>
            Términos y Condiciones · Política de Privacidad
          </span>
        </div>
      </footer>

    </div>
  );
};

export default Layout;