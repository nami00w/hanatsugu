'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Camera, MapPin, Calendar, Phone, ArrowRight, Skip } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { profileAPI } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'

export default function ProfileSetupPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  // プロフィール情報
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  // 興味・関心の選択肢
  const interestOptions = [
    'クラシック・エレガント',
    'モダン・シンプル',
    'プリンセス・ゴージャス',
    'ボヘミアン・ナチュラル',
    'ヴィンテージ・レトロ',
    'カラードレス',
    'セカンドドレス',
    'アクセサリー・小物'
  ]

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setProfileImagePreview(user.user_metadata.avatar_url)
    }
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      let avatarUrl = user.user_metadata?.avatar_url

      // プロフィール画像をアップロード
      if (profileImage) {
        avatarUrl = await profileAPI.uploadProfileImage(user.id, profileImage)
      }

      // プロフィール情報を更新
      const success = await profileAPI.updateProfile(user.id, {
        bio,
        location,
        birth_year: birthYear ? parseInt(birthYear) : null,
        phone,
        interests,
        avatar_url: avatarUrl,
        profile_completed: true
      })

      if (success) {
        await refreshUser()
        router.push('/mypage?welcome=true')
      } else {
        alert('プロフィールの保存に失敗しました')
      }
    } catch (error) {
      console.error('Profile setup error:', error)
      alert('プロフィールの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/mypage')
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* プロフィール画像 */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 relative">
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview}
                    alt="プロフィール"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-2 right-2 bg-[var(--primary-green)] text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                プロフィール画像を設定
              </h3>
              <p className="text-gray-600 text-sm">
                他のユーザーに表示される画像です（後から変更可能）
              </p>
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介 <span className="text-gray-500">(任意)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)]"
                placeholder="例: 結婚式を控えており、理想のドレスを探しています。また、着用予定のないドレスの出品も検討中です。よろしくお願いします。"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500文字</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                基本情報を入力
              </h3>
              <p className="text-gray-600 text-sm">
                より良いマッチングのための情報です
              </p>
            </div>

            {/* 居住地域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                居住地域 <span className="text-gray-500">(任意)</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)]"
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

            {/* 生まれ年 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                生まれ年 <span className="text-gray-500">(任意)</span>
              </label>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)]"
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

            {/* 電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                電話番号 <span className="text-gray-500">(任意)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)]"
                placeholder="090-1234-5678"
              />
              <p className="text-xs text-gray-500 mt-1">
                取引時の連絡用（他のユーザーには非公開）
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                興味・関心を選択
              </h3>
              <p className="text-gray-600 text-sm">
                あなたの好みに合ったドレスをおすすめします
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    interests.includes(interest)
                      ? 'border-[var(--primary-green)] bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {interests.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  <strong>{interests.length}項目</strong>を選択しました
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🌸 プロフィールを完成させましょう
              </h1>
              <p className="text-gray-600">
                より良いマッチングのために、いくつか情報を教えてください
              </p>
            </div>

            {/* プログレスバー */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  ステップ {step} / {totalSteps}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Skip className="w-4 h-4" />
                  スキップ
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[var(--primary-green)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {renderStep()}

              {/* ナビゲーションボタン */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                {step > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    戻る
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-green)] text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    '保存中...'
                  ) : step === totalSteps ? (
                    '完了'
                  ) : (
                    <>
                      次へ
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* フッター */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                これらの情報は後から
                <Link href="/mypage/settings" className="text-[var(--primary-green)] hover:underline">
                  マイページ
                </Link>
                で変更できます
              </p>
            </div>
          </div>
        </div>
      </AuthGuard>
    </>
  )
}