import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-12 mb-12">
        <div className="relative h-[240px] lg:h-[300px] overflow-hidden rounded-sm">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="/images/about-page/about-header@2x.jpg"
            alt=""
          />
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-6 mb-24">
        <h1 className="font-semibold text-lg lg:text-xl leading-tight mb-6">
          Our research and development efforts are driven by beliefs about how technology should serve humanity.
        </h1>
        <p className="text-gray-700 leading-relaxed mb-6">
          Substantial engineering efforts are necessary to turn ideas into real and useful tools that people can use. While those engineering efforts take place in Protocol Lab&apos;s several projects, our longest-term vision-driven innovation takes place in Protocol Labs R&amp;D.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          Our mission spans four interconnected focus areas that address humanity&apos;s most pressing challenges: securing digital human rights, upgrading economies and governance systems, advancing AI and robotics, and developing neurotechnology responsibly.
        </p>
        <Link href="/research" className="text-blue hover:underline text-sm">
          Our Focus Areas
          <img className="inline pl-2" src="/icons/chevron-pink.svg" alt="" />
        </Link>
      </div>

      {/* Focus Areas */}
      <div className="max-w-5xl mx-auto px-6 mb-28">
        <h2 className="font-semibold text-md mb-8">Our Four Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FocusCard
            title="Digital Human Rights"
            description="Securing freedom and safety in the digital age through improved internet infrastructure and Web3 technologies."
          />
          <FocusCard
            title="Economics & Governance"
            description="Upgrading coordination systems through cryptoeconomics, mechanism design, and public goods funding."
          />
          <FocusCard
            title="AI & Robotics"
            description="Advancing artificial intelligence and robotics with focus on beneficial outcomes and responsible development."
          />
          <FocusCard
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
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <img className="mx-auto mb-6 opacity-30 w-8" src="/images/about-page/quote-icon.svg" alt="" />
        <h3 className="font-semibold text-md lg:text-lg leading-relaxed mb-4">
          More innovation faster
        </h3>
        <p className="text-dark-blue">Juan Benet</p>
        <p className="text-blue-gray text-sm">Founder and CEO</p>
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
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <div className="border-l-2 border-pink pl-6 py-2">
          <p className="text-gray-700 leading-relaxed mb-4 italic">
            &ldquo;We consistently bet, not only that the future could be a fantastic and wonderful place, but that it&apos;s worthwhile for us, as an organization, to work toward that future.&rdquo;
          </p>
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src="/images/authors/will-scott/avatar.png"
              alt="Will Scott"
            />
            <div>
              <p className="text-sm font-semibold leading-none pb-1">Will Scott</p>
              <p className="text-gray-600 text-sm">Digital Human Rights Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-6 mb-24">
      <p className="text-pink text-sm tracking-wide mb-2">{label}</p>
      <h2 className="font-semibold text-md leading-relaxed mb-6 max-w-2xl">{title}</h2>
      {children}
    </div>
  )
}

function FocusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-gray-300 p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  )
}
