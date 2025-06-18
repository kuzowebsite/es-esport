"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  EyeOff,
  Monitor,
  FileText,
  Zap,
  DollarSign,
  Upload,
  Globe,
  ImageIcon,
  Home,
  Users,
  BarChart3,
  Shield,
  LogOut,
  Loader2,
  Database,
  Gamepad2,
  Trophy,
  Calendar,
  Award,
} from "lucide-react"
import { useFirebaseAdminSettings, useFirebaseImages } from "./hooks/useFirebase"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
}

interface AdminDashboardProps {
  userData: UserData
  onLogout: () => void
  onGoToMainPage: () => void
}

// Remove the currentSettings and onSettingsChange from the component props
export default function AdminDashboard({ userData, onLogout, onGoToMainPage }: AdminDashboardProps) {
  const { settings, saveSettings, loading: settingsLoading } = useFirebaseAdminSettings()
  const { saveImage, getImage, loading: imageLoading } = useFirebaseImages()
  const [activeTab, setActiveTab] = useState("stream")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof typeof settings, value: string | boolean) => {
    const newSettings = { ...settings, [field]: value }
    saveSettings(newSettings)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const result = await saveImage("site-logo", file)
      if (result.success && result.data) {
        handleInputChange("logoUrl", result.data)
      } else {
        console.error("Failed to upload logo:", result.error)
      }
    }
  }

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Өгөгдөл ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-xl border-b border-orange-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Админ удирдлага
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-400 text-sm">
                  {userData.username} - {userData.email}
                </p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Database className="w-3 h-3 mr-1" />
                  Firebase холбогдсон
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={onGoToMainPage}
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400"
            >
              <Home className="w-4 h-4 mr-2" />
              Үндсэн хуудас
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Гарах
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-orange-500/20 px-6">
        <div className="flex space-x-8">
          {[
            { id: "stream", label: "Дамжуулалт", icon: Zap },
            { id: "ads", label: "Суртчилгаа", icon: DollarSign },
            { id: "site", label: "Сайт", icon: Globe },
            { id: "analytics", label: "Статистик", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-orange-400 text-orange-400"
                    : "border-transparent text-gray-400 hover:text-orange-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Stream Management */}
        {activeTab === "stream" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Дамжуулалтын удирдлага
              </h2>
              <p className="text-gray-400">Шууд дамжуулалтын тохиргоо, гарчиг, тайлбар</p>
            </div>

            <Card className="bg-black/40 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Дамжуулалтын тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stream Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                  <div>
                    <label className="text-white font-medium">Дамжуулалт</label>
                    <p className="text-gray-400 text-sm">Шууд дамжуулалт идэвхжүүлэх/идэвхгүй болгох</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={settings.isStreamActive ? "bg-green-500" : "bg-red-500"}>
                      {settings.isStreamActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" /> Идэвхтэй
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" /> Идэвхгүй
                        </>
                      )}
                    </Badge>
                    <Switch
                      checked={settings.isStreamActive}
                      onCheckedChange={(checked) => handleInputChange("isStreamActive", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {/* Stream Link */}
                  <div>
                    <label className="text-white font-medium mb-2 block flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Дамжуулалтын линк
                    </label>
                    <Input
                      value={settings.streamLink || ""}
                      onChange={(e) => handleInputChange("streamLink", e.target.value)}
                      placeholder="https://www.twitch.tv/eslcs"
                      className="bg-gray-900/50 border-cyan-500/30 text-white"
                    />
                  </div>

                  {/* Stream Title */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Гарчиг</label>
                    <Input
                      value={settings.streamTitle || ""}
                      onChange={(e) => handleInputChange("streamTitle", e.target.value)}
                      placeholder="Дамжуулалтын гарчиг..."
                      className="bg-gray-900/50 border-cyan-500/30 text-white"
                    />
                  </div>

                  {/* Stream Description */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Тайлбар</label>
                    <Textarea
                      value={settings.streamDescription || ""}
                      onChange={(e) => handleInputChange("streamDescription", e.target.value)}
                      placeholder="Дамжуулалтын тайлбар..."
                      className="bg-gray-900/50 border-cyan-500/30 text-white min-h-[120px]"
                    />
                  </div>

                  {/* New Stream Info Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Game Title */}
                    <div>
                      <label className="text-white font-medium mb-2 block flex items-center">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Тоглоом
                      </label>
                      <Input
                        value={settings.gameTitle || ""}
                        onChange={(e) => handleInputChange("gameTitle", e.target.value)}
                        placeholder="Counter-Strike 2"
                        className="bg-gray-900/50 border-cyan-500/30 text-white"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-white font-medium mb-2 block flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Категори
                      </label>
                      <Input
                        value={settings.category || ""}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        placeholder="eSports • FPS • Уралдаан"
                        className="bg-gray-900/50 border-cyan-500/30 text-white"
                      />
                    </div>

                    {/* Next Match */}
                    <div>
                      <label className="text-white font-medium mb-2 block flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Дараагийн тоглолт
                      </label>
                      <Input
                        value={settings.nextMatch || ""}
                        onChange={(e) => handleInputChange("nextMatch", e.target.value)}
                        placeholder="Маргааш 19:00 цагт IEM Dallas 2025 эхлэнэ"
                        className="bg-gray-900/50 border-cyan-500/30 text-white"
                      />
                    </div>

                    {/* Sponsors */}
                    <div>
                      <label className="text-white font-medium mb-2 block flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Спонсорууд
                      </label>
                      <Input
                        value={settings.sponsors || ""}
                        onChange={(e) => handleInputChange("sponsors", e.target.value)}
                        placeholder="SteelSeries, HyperX, ASUS ROG"
                        className="bg-gray-900/50 border-cyan-500/30 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advertisement Management */}
        {activeTab === "ads" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Суртчилгааны удирдлага
              </h2>
              <p className="text-gray-400">Спонсор болон суртчилгааны тохиргоо</p>
            </div>

            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Суртчилгааны тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ad Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                  <div>
                    <label className="text-white font-medium">Суртчилгаа</label>
                    <p className="text-gray-400 text-sm">
                      {settings.isAdActive
                        ? "Суртчилгаа харагдаж байна - үзэгчид зогсоох, ухраах боломжгүй"
                        : "Хэвийн дамжуулалт харагдаж байна"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={settings.isAdActive ? "bg-purple-500" : "bg-gray-500"}>
                      {settings.isAdActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </Badge>
                    <Switch
                      checked={settings.isAdActive}
                      onCheckedChange={(checked) => handleInputChange("isAdActive", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ad Link */}
                  <div>
                    <label className="text-white font-medium mb-2 block flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Суртчилгааны линк
                    </label>
                    <Input
                      value={settings.adLink || ""}
                      onChange={(e) => handleInputChange("adLink", e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>

                  {/* Ad Website Link */}
                  <div>
                    <label className="text-white font-medium mb-2 block flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Сайтын линк
                    </label>
                    <Input
                      value={settings.adWebsiteLink || ""}
                      onChange={(e) => handleInputChange("adWebsiteLink", e.target.value)}
                      placeholder="https://sponsor-website.com"
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>

                  {/* Ad Title */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Суртчилгааны гарчиг</label>
                    <Input
                      value={settings.adTitle || ""}
                      onChange={(e) => handleInputChange("adTitle", e.target.value)}
                      placeholder="Суртчилгааны гарчиг..."
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>

                  {/* Ad Description */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Суртчилгааны тайлбар</label>
                    <Textarea
                      value={settings.adDescription || ""}
                      onChange={(e) => handleInputChange("adDescription", e.target.value)}
                      placeholder="Суртчилгааны тайлбар..."
                      className="bg-gray-900/50 border-purple-500/30 text-white min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Ad Preview */}
                {settings.adLink && (
                  <div className="mt-6 p-4 bg-gray-900/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-3">Суртчилгааны урьдчилан үзэх:</p>
                    <div className="bg-black rounded-lg p-6 border border-purple-500/20">
                      <div className="text-center space-y-3">
                        <div className="w-full bg-purple-500/20 rounded-lg p-12 flex items-center justify-center">
                          <DollarSign className="w-16 h-16 text-purple-400" />
                        </div>
                        {settings.adTitle && <h3 className="text-xl font-bold text-white">{settings.adTitle}</h3>}
                        {settings.adDescription && <p className="text-gray-300">{settings.adDescription}</p>}
                        {settings.adWebsiteLink && <p className="text-purple-400 text-sm">{settings.adWebsiteLink}</p>}
                        <Badge className="bg-purple-500 text-white px-4 py-2">Суртчилгаа - Зогсоох боломжгүй</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Site Settings */}
        {activeTab === "site" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Сайтын тохиргоо
              </h2>
              <p className="text-gray-400">Сайтын нэр, лого болон брэнд тохиргоо</p>
            </div>

            <Card className="bg-black/40 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Сайтын тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Site Name */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Сайтын нэр</label>
                    <Input
                      value={settings.siteName || ""}
                      onChange={(e) => handleInputChange("siteName", e.target.value)}
                      placeholder="ES.mn"
                      className="bg-gray-900/50 border-green-500/30 text-white"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="text-white font-medium mb-2 block flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Лого
                    </label>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                      disabled={imageLoading}
                    >
                      {imageLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Хадгалж байна...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Лого оруулах
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {settings.logoUrl && (
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-3">Лого урьдчилан үзэх:</p>
                    <div className="flex items-center space-x-4">
                      <img
                        src={settings.logoUrl || "/placeholder.svg"}
                        alt="Logo preview"
                        className="w-24 h-24 object-contain bg-white/10 rounded-lg"
                      />
                      <div className="text-sm text-gray-400">
                        <p>✅ Хадгалагдсан</p>
                        <p>📊 Base64 формат</p>
                        <p>🔄 Real-time sync идэвхтэй</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Статистик
              </h2>
              <p className="text-gray-400">Үзэгчийн статистик болон платформын мэдээлэл</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">18,247</h3>
                  <p className="text-gray-400">Идэвхтэй үзэгчид</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-green-500/20">
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">1,234,567</h3>
                  <p className="text-gray-400">Нийт үзэлт</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">45</h3>
                  <p className="text-gray-400">Суртчилгааны үзэлт</p>
                </CardContent>
              </Card>
            </div>

            {/* Firebase Status */}
            <Card className="bg-black/40 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Firebase холболт
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Realtime Database</div>
                    <div className="font-bold text-green-400">✅ Холбогдсон</div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Зураг хадгалалт</div>
                    <div className="font-bold text-green-400">✅ Base64 формат</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Overview */}
        <Card className="bg-black/40 border-orange-500/20 max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Одоогийн төлөв
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Дамжуулалт</div>
                <div className={`font-bold ${settings.isStreamActive ? "text-green-400" : "text-red-400"}`}>
                  {settings.isStreamActive ? "Идэвхтэй" : "Идэвхгүй"}
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Суртчилгаа</div>
                <div className={`font-bold ${settings.isAdActive ? "text-purple-400" : "text-gray-400"}`}>
                  {settings.isAdActive ? "Идэвхтэй" : "Идэвхгүй"}
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Харагдах контент</div>
                <div className="font-bold text-cyan-400">
                  {settings.isAdActive ? "Суртчилгаа" : settings.streamLink ? "Тусгай линк" : "Twitch дамжуулалт"}
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Сайтын нэр</div>
                <div className="font-bold text-green-400">{settings.siteName || "ES.mn"}</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Firebase</div>
                <div className="font-bold text-green-400">✅ Холбогдсон</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={onGoToMainPage} variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800">
          Цуцлах
        </Button>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Database className="w-3 h-3 mr-1" />
            Автомат хадгалалт
          </Badge>
        </div>
      </div>
    </div>
  )
}
