const Input = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  error,
  autoComplete
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-gray-300">
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`rounded-md border bg-black/40 px-3 py-2 text-white outline-none ring-primary focus:ring-2 ${
          error ? 'border-primary' : 'border-netflix-gray'
        }`}
      />
      {error ? <span className="text-xs text-primary">{error}</span> : null}
    </div>
  )
}

export default Input
