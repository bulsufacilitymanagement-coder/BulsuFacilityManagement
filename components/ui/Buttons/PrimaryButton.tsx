import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export function PrimaryButton({
  children,
  loading = false,
  loadingText,
  disabled = false,
  type = "button",
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="
        flex
        h-[54px]
        w-full
        items-center
        justify-center
        gap-2.5
        rounded-[15px]
        bg-bulsu
        px-5
        text-[15px]
        font-semibold
        text-white
        shadow-[0_6px_18px_rgba(165,0,17,0.22)]
        transition-all
        duration-150
        hover:bg-bulsu-dark
        hover:shadow-[0_8px_22px_rgba(165,0,17,0.28)]
        active:scale-[0.985]
        active:bg-bulsu-active
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:shadow-none
      "
    >
      {loading ? (
        <>
          <span
            className="
              h-5
              w-5
              animate-spin
              rounded-full
              border-2
              border-white/30
              border-t-white
            "
            aria-label="Loading"
          />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}
