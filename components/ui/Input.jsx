import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "../../lib/utils"

function Input({
  className,
  type,
  label,
  id,
  icon: Icon,
  error,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  ...props
}) {
  const isPassword = type === "password" || (showPasswordToggle && (type === "text" || type === "password"));

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          data-slot="input"
          className={cn(
            "flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            Icon && "pl-10",
            (showPasswordToggle || isPassword) && "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

export { Input }
