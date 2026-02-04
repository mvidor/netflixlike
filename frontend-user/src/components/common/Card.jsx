const Card = ({ children }) => {
  return (
    <div className="rounded-lg border border-netflix-gray bg-black/50 p-card backdrop-blur-sm">
      {children}
    </div>
  )
}

export default Card
