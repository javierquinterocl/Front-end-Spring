import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1a2e02] text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Granme</h3>
            <p className="text-sm text-gray-300">
              Sistema integral para la gestión de granjas caprinas. Optimice su producción y mejore la rentabilidad de
              su negocio.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Acerca de Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4 mb-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#5a6a3a] hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Button>
            </div>
            <p className="text-sm text-gray-300">
              Suscríbete a nuestro boletín para recibir noticias y actualizaciones.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">&copy; {currentYear} CapriSystem. Todos los derechos reservados.</p>
          <p className="text-sm text-gray-300 mt-2 md:mt-0">Desarrollado por Agro Solutions Inc.</p>
        </div>
      </div>
    </footer>
  )
}

