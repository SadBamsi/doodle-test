import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./styles.module.css";

type ButtonVariant = "default" | "primary";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

function cn(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  children,
  href,
  variant = "default",
  disabled = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const variantClass = variant === "primary" ? styles.primary : styles.default;
  const classes = cn(
    styles.base,
    variantClass,
    disabled ? styles.disabled : undefined,
    className,
  );

  if (href) {
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {children}
        </span>
      );
    }

    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button {...props} type={type} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
