import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type }

    setNotifications((prev) => [...prev, notification])

    setTimeout(() => {
      removeNotification(id)
    }, 3000)
  }

  const success = (message) => addNotification(message, 'success')
  const error = (message) => addNotification(message, 'error')
  const info = (message) => addNotification(message, 'info')
  const warning = (message) => addNotification(message, 'warning')

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  )
}

function ToastContainer({ notifications, onClose }) {
  return (
    <div className="fixed right-4 top-20 z-[100] space-y-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  )
}

function Toast({ notification, onClose }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-500 text-black'
  }

  return (
    <div
      className={`${colors[notification.type] || colors.info} flex min-w-[280px] items-center justify-between gap-3 rounded-lg px-5 py-3 shadow-xl`}
    >
      <span>{notification.message}</span>
      <button type="button" onClick={onClose} className="text-sm opacity-80 transition hover:opacity-100">
        x
      </button>
    </div>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }

  return context
}
