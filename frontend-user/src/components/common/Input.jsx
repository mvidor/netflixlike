const Input = ({ id, label, type = 'text', placeholder = '' }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-gray-300">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="rounded-md border border-netflix-gray bg-black/40 px-3 py-2 text-white outline-none ring-primary focus:ring-2"
      />
    </div>
  )
}

export default Input
