const footerLinks = {
  'A propos': ['Qui sommes-nous', 'Emplois', 'Presse'],
  Aide: ['FAQ', "Centre d'aide", 'Compte', 'Contact'],
  Legal: ['Confidentialite', "Conditions d'utilisation", 'Mentions legales'],
  Reseaux: ['Facebook', 'Twitter', 'Instagram', 'YouTube']
}

const socialIcons = [
  { name: 'Facebook', logo: 'f' },
  { name: 'Twitter', logo: 'x' },
  { name: 'Instagram', logo: 'o' },
  { name: 'YouTube', logo: '>' }
]

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-bold text-gray-300">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-8 flex justify-center space-x-6">
          {socialIcons.map(({ name, logo }) => (
            <a
              key={name}
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
              aria-label={name}
            >
              <span className="text-xl">{logo}</span>
            </a>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2026 Netflix Clone - Projet pedagogique IUT Informatique - Limoges</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
