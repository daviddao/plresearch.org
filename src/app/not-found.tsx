import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-[1146px] mx-auto pt-32 px-4 md:px-10 text-center">
      <h1 className="text-xl font-bold mb-4">404</h1>
      <p className="text-base text-gray-600 mb-8">Page not found.</p>
      <Link href="/" className="text-blue hover:underline">
        Go home
      </Link>
    </div>
  )
}
