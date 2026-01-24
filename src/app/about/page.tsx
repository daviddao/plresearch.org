import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorCard from '@/components/AuthorCard'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative pt-20 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
          {/* Subtle background image on the right */}
          <img
            src="/images/about-page/about-header@2x.jpg"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-auto max-w-[60%] object-contain object-right opacity-[0.15] pointer-events-none select-none hidden md:block"
          />
          {/* Geometric decoration */}
          <AboutGeometry />

          <h1 className="relative z-10 font-semibold text-xl lg:text-[48px] leading-[1.1] tracking-tight mb-6 max-w-xl">
            Our research is driven by beliefs about how technology should serve humanity.
          </h1>
          <p className="relative z-10 text-gray-600 text-big lg:text-bigger leading-relaxed max-w-2xl mb-6">
            Substantial engineering efforts are necessary to turn ideas into real and useful tools that people can use. Our longest-term vision-driven innovation takes place in Protocol Labs R&amp;D.
          </p>
          <div className="relative z-10 flex gap-6">
            <Link href="/areas" className="text-blue hover:underline">Focus areas</Link>
            <Link href="/authors" className="text-blue hover:underline">Meet the team</Link>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="max-w-4xl mx-auto px-6 mb-28">
        <h2 className="font-semibold text-md mb-8">Our Four Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FocusCard
            slug="digital-human-rights"
            title="Digital Human Rights"
            description="Securing freedom and safety in the digital age through improved internet infrastructure and Web3 technologies."
          />
          <FocusCard
            slug="upgrade-economies-governance"
            title="Economics & Governance"
            description="Upgrading coordination systems through cryptoeconomics, mechanism design, and public goods funding."
          />
          <FocusCard
            slug="ai-robotics"
            title="AI & Robotics"
            description="Advancing artificial intelligence and robotics with focus on beneficial outcomes and responsible development."
          />
          <FocusCard
            slug="neurotech"
            title="Neurotechnology"
            description="Pioneering brain-computer interfaces and related technologies to expand human capabilities safely."
          />
        </div>
      </div>

      {/* History */}
      <Section label="OUR HISTORY" title="Protocol Labs itself began with the desire to make it easy to name, organize, and share data in a scalable way.">
        <div className="lg:columns-2 lg:gap-12 text-gray-700 leading-relaxed">
          <p className="pb-5 break-inside-avoid">
            Those efforts became IPFS, a free and open-source software project to allow users and applications to directly share information without needing a central server. Within IPFS, expertise in programming language theory led to Multiformats, an effort to make our technologies adaptable and upgradable in a future-proof way, and IPLD, our data model for content-addressed data.
          </p>
          <p className="pb-5 break-inside-avoid">
            In parallel with IPFS, where users voluntarily store data they find interesting, we designed and launched Filecoin, a protocol that allows users to pay others to store data they find interesting. Originally proposed in 2014, the Filecoin concept was further detailed in our 2017 whitepaper, with CryptoLab efforts supporting both the network launch and future improvements.
          </p>
          <p className="pb-5 break-inside-avoid">
            As our work evolved, we expanded beyond internet infrastructure to address broader challenges in coordination, AI development, and human enhancement technologies. Our focus areas now span the full spectrum from securing digital rights to pioneering responsible advancement in AI, robotics, and neurotechnology.
          </p>
        </div>
      </Section>

      {/* Collaborations */}
      <Section label="COLLABORATIONS AND SUPPORT" title="In addition to driving internal projects directly, we also support external research.">
        <p className="text-gray-700 leading-relaxed lg:columns-2 lg:gap-12">
          Some of this support takes the form of our grant program, which supports academic research efforts related to the central mission and goals of Protocol Labs. Other support includes conference and event sponsorships, which usually involves representation from Protocol Labs researchers. If you&apos;re attending a conference we are sponsoring, you have a great chance of catching one of us in person. Alternatively, our conference sponsorships often take the form of sponsoring free, high-quality recordings of the talks to educate (or entertain) those unable to attend.
        </p>
      </Section>

      {/* Quote */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <img className="mb-6 opacity-30 w-8" src="/images/about-page/quote-icon.svg" alt="" />
        <h3 className="font-semibold text-md lg:text-lg leading-relaxed mb-6">
          More innovation faster
        </h3>
        <AuthorCard slug="juan-benet" />
      </div>

      {/* The Future */}
      <Section label="THE FUTURE" title="In our pursuit of this mission, we question how technology could work better and what we wish it would do.">
        <div className="lg:columns-2 lg:gap-12 text-gray-700 leading-relaxed">
          <p className="pb-5 break-inside-avoid">
            This critical century demands both caution and ambition. With technologies capable of rewriting genetic codes and reshaping how billions coordinate, we&apos;re building robust foundations across our four focus areas. From securing digital human rights through Web3 infrastructure to advancing AI and neurotechnology responsibly, from pioneering public goods funding mechanisms to developing breakthrough coordination systems, our work aims to harness humanity&apos;s potential while navigating existential challenges.
          </p>
          <p className="pb-5 break-inside-avoid">
            We do these things in ways that make technology easy to upgrade and hard to turn against users. We work toward this ideal by building open-source software, with users and contributors as vital components in the development process, and a licensing stack that ensures these tools remain free to obtain and use. Through collaboration across our focus areas, we&apos;re accelerating the R&amp;D pipeline to push humanity forward.
          </p>
        </div>
      </Section>

      {/* Will Scott quote */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-l-2 border-pink pl-6 py-2">
          <p className="text-gray-700 leading-relaxed mb-4 italic">
            &ldquo;We consistently bet, not only that the future could be a fantastic and wonderful place, but that it&apos;s worthwhile for us, as an organization, to work toward that future.&rdquo;
          </p>
          <AuthorCard slug="will-scott" />
        </div>
      </div>
    </div>
  )
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-6 mb-24">
      <p className="text-pink text-sm tracking-wide mb-2">{label}</p>
      <h2 className="font-semibold text-md leading-relaxed mb-6 max-w-2xl">{title}</h2>
      {children}
    </div>
  )
}

function FocusCard({ slug, title, description }: { slug: string; title: string; description: string }) {
  return (
    <Link href={`/areas/${slug}`} className="border border-gray-300 p-6 hover:border-blue hover:shadow-sm transition-all block">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </Link>
  )
}

function AboutGeometry() {
  return (
    <svg
      className="absolute top-4 right-0 w-[320px] h-[280px] lg:w-[420px] lg:h-[340px] opacity-[0.4] pointer-events-none select-none"
      viewBox="0 0 700 500"
      fill="none"
      aria-hidden="true"
    >
      {/* Network pattern */}
      <circle cx="480" cy="100" r="70" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="580" cy="220" r="50" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="400" cy="220" r="90" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="550" cy="370" r="60" stroke="#C3E1FF" strokeWidth="1" />
      <circle cx="420" cy="400" r="45" stroke="#C3E1FF" strokeWidth="0.75" />
      <circle cx="340" cy="320" r="35" stroke="#C3E1FF" strokeWidth="1" />
      {/* Connections */}
      <line x1="480" y1="100" x2="580" y2="220" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="580" y1="220" x2="550" y2="370" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="400" y1="220" x2="420" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="480" y1="100" x2="400" y2="220" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="550" y1="370" x2="420" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="340" y1="320" x2="400" y2="220" stroke="#C3E1FF" strokeWidth="0.5" />
      <line x1="340" y1="320" x2="420" y2="400" stroke="#C3E1FF" strokeWidth="0.5" />
      {/* Nodes */}
      <circle cx="480" cy="100" r="3" fill="#C3E1FF" />
      <circle cx="580" cy="220" r="3" fill="#C3E1FF" />
      <circle cx="400" cy="220" r="3" fill="#C3E1FF" />
      <circle cx="550" cy="370" r="3" fill="#C3E1FF" />
      <circle cx="420" cy="400" r="3" fill="#C3E1FF" />
      <circle cx="340" cy="320" r="3" fill="#C3E1FF" />
    </svg>
  )
}
