'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Lock, CreditCard, Camera, Save } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { bankAccountAPI, profileAPI, type BankAccount } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'

export default function SettingsPage() {
  const { user, signOut, refreshUser, updatePassword } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'bank'>('profile')
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  
  // プロフィール設定
  const [displayName, setDisplayName] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  
  // アカウント設定
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 銀行口座設定
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    branch_name: '',
    account_type: 'checking' as 'checking' | 'savings',
    account_number: '',
    account_holder: ''
  })

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '')
      setBio(user.user_metadata?.bio || '')
      setLocation(user.user_metadata?.location || '')
      setBirthYear(user.user_metadata?.birth_year?.toString() || '')
      setPhone(user.user_metadata?.phone || '')
      setInterests(user.user_metadata?.interests || [])
      
      // 既存のプロフィール画像があれば設定
      if (user.user_metadata?.avatar_url) {
        setProfileImagePreview(user.user_metadata.avatar_url)
      }
      loadBankAccounts()
    }
  }, [user])

  const loadBankAccounts = async () => {
    if (!user) return
    try {
      const accounts = await bankAccountAPI.getUserBankAccounts(user.id)
      setBankAccounts(accounts)
    } catch (error) {
      console.error('Failed to load bank accounts:', error)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let avatarUrl = user.user_metadata?.avatar_url

      // プロフィール画像が選択されている場合はアップロード
      if (profileImage) {
        console.log('📸 Uploading new profile image...')
        avatarUrl = await profileAPI.uploadProfileImage(user.id, profileImage)
      }

      // プロフィール情報を更新
      const success = await profileAPI.updateProfile(user.id, {
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        location,
        birth_year: birthYear ? parseInt(birthYear) : null,
        phone,
        interests
      })

      if (success) {
        alert('プロフィールを更新しました')
        
        // ユーザー情報をリフレッシュして即座反映
        await refreshUser()
        
        // 成功時は新しい画像URLでプレビューを更新（キャッシュバスティング付き）
        if (avatarUrl) {
          // Unsplash画像（開発環境のダミー）にはキャッシュバスティングを追加しない
          const previewUrl = avatarUrl.includes('unsplash.com') 
            ? avatarUrl 
            : `${avatarUrl}?t=${Date.now()}`
          setProfileImagePreview(previewUrl)
        }
        
        // アップロード用のFile objectはクリア
        setProfileImage(null)
        
        console.log('✅ Profile updated and user info refreshed successfully!')
      } else {
        alert('プロフィールの更新に失敗しました')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      alert('新しいパスワードを入力してください')
      return
    }
    
    if (newPassword !== confirmPassword) {
      alert('新しいパスワードが一致しません')
      return
    }
    
    if (newPassword.length < 6) {
      alert('パスワードは6文字以上で入力してください')
      return
    }
    
    setLoading(true)
    try {
      const result = await updatePassword(newPassword)
      
      if (result.success) {
        alert('パスワードを変更しました')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(result.error || 'パスワードの変更に失敗しました')
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('パスワードの変更に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleBankAccountSave = async () => {
    if (!user) return
    
    if (!bankForm.bank_name || !bankForm.branch_name || !bankForm.account_number || !bankForm.account_holder) {
      alert('すべての項目を入力してください')
      return
    }
    
    setLoading(true)
    try {
      const accountId = await bankAccountAPI.createBankAccount({
        user_id: user.id,
        ...bankForm,
        is_default: bankAccounts.length === 0 // 最初の口座はデフォルトに
      })
      
      if (accountId) {
        alert('銀行口座を登録しました')
        setBankForm({
          bank_name: '',
          branch_name: '',
          account_type: 'checking',
          account_number: '',
          account_holder: ''
        })
        await loadBankAccounts()
      } else {
        alert('銀行口座の登録に失敗しました')
      }
    } catch (error) {
      console.error('Bank account save error:', error)
      alert('銀行口座の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/mypage"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">アカウント設定</h1>
              <p className="text-sm text-gray-600 mt-1">
                プロフィールやアカウント情報を管理できます
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドナビゲーション */}
            <div className="lg:col-span-1">
              <nav className="bg-white rounded-lg shadow-sm p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'profile'
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      プロフィール
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('account')}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'account'
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      アカウント
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('bank')}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'bank'
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      振込先口座
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* プロフィール設定 */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">プロフィール設定</h2>
                  
                  <div className="space-y-6">
                    {/* プロフィール画像 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロフィール画像
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
                          {profileImagePreview ? (
                            <Image
                              src={profileImagePreview}
                              alt="プロフィール"
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                            id="profile-image"
                          />
                          <label
                            htmlFor="profile-image"
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            画像を選択
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 表示名 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        表示名
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="表示名を入力"
                      />
                    </div>

                    {/* 自己紹介 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        自己紹介
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="自己紹介を入力"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{bio.length}/500文字</p>
                    </div>

                    {/* 居住地域 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        居住地域
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">選択してください</option>
                        <option value="北海道">北海道</option>
                        <option value="東北">東北</option>
                        <option value="関東">関東</option>
                        <option value="中部">中部</option>
                        <option value="関西">関西</option>
                        <option value="中国">中国</option>
                        <option value="四国">四国</option>
                        <option value="九州・沖縄">九州・沖縄</option>
                      </select>
                    </div>

                    {/* 生まれ年・電話番号 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          生まれ年
                        </label>
                        <select
                          value={birthYear}
                          onChange={(e) => setBirthYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">選択してください</option>
                          {Array.from({ length: 50 }, (_, i) => {
                            const year = 2005 - i
                            return (
                              <option key={year} value={year}>{year}年</option>
                            )
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          電話番号
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="090-1234-5678"
                        />
                      </div>
                    </div>

                    {/* メールアドレス */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                        <Link
                          href="/auth/change-email"
                          className="px-3 py-2 text-sm text-[var(--primary-green)] border border-[var(--primary-green)] rounded-md hover:bg-green-50 transition-colors"
                        >
                          変更
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      プロフィールを保存
                    </button>
                  </div>
                </div>
              )}

              {/* アカウント設定 */}
              {activeTab === 'account' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">アカウント設定</h2>
                  
                  <div className="space-y-6">
                    {/* パスワード変更 */}
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">パスワード変更</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            現在のパスワード
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="※Supabaseでは新しいパスワードのみで変更可能"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Supabaseの仕様により、現在のパスワード確認は不要です
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            新しいパスワード
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="6文字以上"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            新しいパスワード（確認）
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          パスワードを変更
                        </button>
                      </div>
                    </div>

                    {/* アカウント削除 */}
                    <div className="border-t pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">危険な操作</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">アカウントを削除</h4>
                        <p className="text-sm text-red-700 mb-4">
                          アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
                        </p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                          アカウントを削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 振込先口座設定 */}
              {activeTab === 'bank' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">振込先口座設定</h2>
                  
                  {/* 登録済み口座一覧 */}
                  {bankAccounts.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-md font-medium text-gray-900 mb-4">登録済み口座</h3>
                      <div className="space-y-3">
                        {bankAccounts.map((account) => (
                          <div key={account.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {account.bank_name} {account.branch_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {account.account_type === 'checking' ? '普通' : '貯蓄'} {account.account_number}
                                </p>
                                <p className="text-sm text-gray-600">{account.account_holder}</p>
                              </div>
                              {account.is_default && (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  メイン
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 新規口座登録 */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      {bankAccounts.length > 0 ? '新しい口座を追加' : '振込先口座を登録'}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            銀行名
                          </label>
                          <input
                            type="text"
                            value={bankForm.bank_name}
                            onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="例: みずほ銀行"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            支店名
                          </label>
                          <input
                            type="text"
                            value={bankForm.branch_name}
                            onChange={(e) => setBankForm({ ...bankForm, branch_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="例: 渋谷支店"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            口座種別
                          </label>
                          <select
                            value={bankForm.account_type}
                            onChange={(e) => setBankForm({ ...bankForm, account_type: e.target.value as 'checking' | 'savings' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="checking">普通</option>
                            <option value="savings">貯蓄</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            口座番号
                          </label>
                          <input
                            type="text"
                            value={bankForm.account_number}
                            onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="1234567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          口座名義（カナ）
                        </label>
                        <input
                          type="text"
                          value={bankForm.account_holder}
                          onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ヤマダ ハナコ"
                        />
                      </div>

                      <button
                        onClick={handleBankAccountSave}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        口座を登録
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </AuthGuard>
    </>
  )
}