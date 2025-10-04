import Image from "next/image";

export function PublicHeader() {
  return (
    <header className="p-4 bg-white dark:bg-gray-900 sticky top-0 z-10 border-b">
      <div className="max-w-md mx-auto flex items-center justify-center">
        <div className="relative w-32 h-12">
          <Image
            src="/maidaan_black.png"
            alt="Maidaan Logo"
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/maidaan_white.png"
            alt="Maidaan Logo"
            fill
            className="object-contain hidden dark:block"
            priority
          />
        </div>
      </div>
    </header>
  );
}
