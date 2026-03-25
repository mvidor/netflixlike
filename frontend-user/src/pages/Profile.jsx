import { useState } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useAuth } from '../context/useAuth'
import { useNotification } from '../context/useNotification'

function Profile() {
  const { user, updateProfile, changePassword } = useAuth()
  const { success, error } = useNotification()
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    const result = await updateProfile(profileData)

    if (result.success) {
      success(result.message || 'Profil mis a jour')
      return
    }

    error(result.error || 'Impossible de mettre a jour le profil')
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Les mots de passe ne correspondent pas')
      return
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })

    if (result.success) {
      success(result.message || 'Mot de passe mis a jour')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      return
    }

    error(result.error || 'Impossible de changer le mot de passe')
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <Header onSearch={() => {}} />
      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-4xl font-bold">Mon profil</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <form className="rounded-lg border border-gray-800 bg-slate-900/70 p-6" onSubmit={handleProfileSubmit}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Informations personnelles</h2>
              <Button type="submit">Enregistrer</Button>
            </div>

            <div className="space-y-4">
              <Input
                id="profile-name"
                name="name"
                label="Nom"
                value={profileData.name}
                onChange={(event) => setProfileData((current) => ({ ...current, name: event.target.value }))}
              />
              <Input
                id="profile-email"
                name="email"
                type="email"
                label="Email"
                value={profileData.email}
                onChange={(event) => setProfileData((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
          </form>

          <form className="rounded-lg border border-gray-800 bg-slate-900/70 p-6" onSubmit={handlePasswordSubmit}>
            <h2 className="mb-6 text-2xl font-bold">Securite</h2>
            <div className="space-y-4">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  setPasswordData((current) => ({ ...current, currentPassword: event.target.value }))
                }
              />
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={(event) =>
                  setPasswordData((current) => ({ ...current, newPassword: event.target.value }))
                }
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirmer le mot de passe"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  setPasswordData((current) => ({ ...current, confirmPassword: event.target.value }))
                }
              />
              <Button type="submit">Confirmer</Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Profile
