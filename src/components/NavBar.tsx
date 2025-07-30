import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="flex w-full items-center gap-4">
      <Link
        className="mr-auto text-nowrap bg-gray-950 p-2 text-gray-50 text-lg"
        href="/"
      >
        <span className="inline-block font-bold text-[#F5F5F5]">?</span>
        <span className="inline-block font-bold text-[#C82228]">?</span>
        <span className="inline-block font-bold text-[#60A9E8]">?</span> Das
        Archiv
      </Link>

      <Link className="truncate text-gray-500 uppercase underline" href="/">
        chat
      </Link>

      <Link
        className="truncate text-gray-500 uppercase underline"
        href="/people"
      >
        personen
      </Link>

      <Link
        className="truncate text-gray-500 uppercase underline"
        href="/episodes"
      >
        episoden
      </Link>

      <Link
        className="truncate text-gray-500 uppercase underline"
        href="/account"
      >
        account
      </Link>
    </nav>
  )
}
