function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button',
  disabled = false
}) {
  const baseClasses =
    'font-semibold rounded transition-all duration-300 inline-flex items-center justify-center'

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm',
    outline: 'border-2 border-white/50 hover:border-white hover:bg-white/10 text-white'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'cursor-not-allowed opacity-70' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
