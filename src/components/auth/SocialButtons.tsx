'use client';

export default function SocialButtons({
  onDemo,
}: {
  onDemo: (provider: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onDemo('Google')}
        className="h-11 rounded-md border border-line bg-white text-sm font-bold hover:bg-mist flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.4 14.5c-.2-.7-.4-1.4-.4-2.5s.1-1.8.4-2.5V6.4H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.6l4-3.1z"
          />
          <path
            fill="#EA4335"
            d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.4l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
          />
        </svg>
        Google
      </button>
      <button
        type="button"
        onClick={() => onDemo('Facebook')}
        className="h-11 rounded-md border border-line bg-white text-sm font-bold hover:bg-mist flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#1877F2"
            d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.9V24C19.6 23.1 24 18.1 24 12.1z"
          />
        </svg>
        Facebook
      </button>
    </div>
  );
}
