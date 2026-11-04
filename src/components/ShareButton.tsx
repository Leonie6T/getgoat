/** Opens WhatsApp with a ready message; the seller picks the chat. */
export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ShareLink({
  text,
  label = "Share",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappShareUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-h-11 items-center justify-center rounded-lg bg-[#25a244] px-3 font-bold text-white no-underline ${className}`}
    >
      {label}
    </a>
  );
}
