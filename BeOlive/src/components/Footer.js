import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div>
          <p className="font-semibold text-gray-900">Olivewood</p>
          <p>Nachhaltige Olivenholz-Produkte aus traditioneller Fertigung.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/legal/impressum" className="hover:text-black">Impressum</Link>
          <Link href="/legal/agb" className="hover:text-black">AGB</Link>
          <Link href="/legal/datenschutz" className="hover:text-black">Datenschutz</Link>
          <Link href="/legal/widerruf" className="hover:text-black">Widerruf</Link>
        </div>
      </div>
    </footer>
  )
}
