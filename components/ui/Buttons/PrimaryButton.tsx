import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export function PrimaryButton({
  children,
  loading = false,
  disabled = false,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="
        flex
        h-[54px]
        w-full
        items-center
        justify-center
        rounded-[15px]
        bg-[#A6192E]
        px-5
        text-[15px]
        font-semibold
        text-white
        shadow-[0_6px_18px_rgba(166,25,46,0.22)]
        transition-all
        duration-150
        hover:bg-[#8F1628]
        hover:shadow-[0_8px_22px_rgba(166,25,46,0.28)]
        active:scale-[0.985]
        active:bg-[#7D1223]
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:shadow-none
      "
    >
      {loading ? (
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
      ) : (
        children
      )}
    </button>
  );
}
