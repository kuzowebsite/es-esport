"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, Eye, EyeOff, Monitor, FileText, Zap, DollarSign, Upload, Globe, ImageIcon } from "lucide-react"

interface AdminSettings {
  streamTitle: string
  streamDescription: string
  streamLink: string
  isStreamActive: boolean
  isAdActive: boolean
  adLink: string
  adTitle: string
  adDescription: string
  adWebsiteLink: string
  siteName: string
  logoUrl: string
}

interface AdminPanelProps {
  onSettingsChange: (settings: AdminSettings) => void
  currentSettings: AdminSettings
  onClose?: () => void
}

export default function AdminPanel({ onSettingsChange, currentSettings, onClose }: AdminPanelProps) {
  const [settings, setSettings] = useState<AdminSettings>(currentSettings)
  const [isVisible, setIsVisible] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSave = () => {
    onSettingsChange(settings)
    localStorage.setItem("eslcs-admin-settings", JSON.stringify(settings))
  }

  const handleInputChange = (field: keyof AdminSettings, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleInputChange("logoUrl", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Админ удирдлага
                </h2>
                <p className="text-gray-400 text-sm">ES.mn платформын тохиргоо</p>
              </div>
            </div>
            <Button onClick={handleClose} variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Branding */}
            <Card className="bg-black/40 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Сайтын тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Site Name */}
                <div>
                  <label className="text-white font-medium mb-2 block">Сайтын нэр</label>
                  <Input
                    value={settings.siteName}
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
                  <div className="space-y-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Лого оруулах
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {settings.logoUrl && (
                      <div className="p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-2">Урьдчилан үзэх:</p>
                        <img
                          src={settings.logoUrl || "/placeholder.svg"}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain bg-white/10 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Settings */}
            <Card className="bg-black/40 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Дамжуулалтын тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {/* Stream Link */}
                <div>
                  <label className="text-white font-medium mb-2 block flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    Дамжуулалтын линк
                  </label>
                  <Input
                    value={settings.streamLink}
                    onChange={(e) => handleInputChange("streamLink", e.target.value)}
                    placeholder="https://www.twitch.tv/eslcs"
                    className="bg-gray-900/50 border-cyan-500/30 text-white"
                  />
                </div>

                {/* Stream Title */}
                <div>
                  <label className="text-white font-medium mb-2 block">Гарчиг</label>
                  <Input
                    value={settings.streamTitle}
                    onChange={(e) => handleInputChange("streamTitle", e.target.value)}
                    placeholder="Дамжуулалтын гарчиг..."
                    className="bg-gray-900/50 border-cyan-500/30 text-white"
                  />
                </div>

                {/* Stream Description */}
                <div>
                  <label className="text-white font-medium mb-2 block">Тайлбар</label>
                  <Textarea
                    value={settings.streamDescription}
                    onChange={(e) => handleInputChange("streamDescription", e.target.value)}
                    placeholder="Дамжуулалтын тайлбар..."
                    className="bg-gray-900/50 border-cyan-500/30 text-white min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advertisement Settings */}
            <Card className="bg-black/40 border-purple-500/20 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Суртчилгааны тохиргоо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ad Link */}
                  <div>
                    <label className="text-white font-medium mb-2 block flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Суртчилгааны линк
                    </label>
                    <Input
                      value={settings.adLink}
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
                      value={settings.adWebsiteLink}
                      onChange={(e) => handleInputChange("adWebsiteLink", e.target.value)}
                      placeholder="https://sponsor-website.com"
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>

                  {/* Ad Title */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Суртчилгааны гарчиг</label>
                    <Input
                      value={settings.adTitle}
                      onChange={(e) => handleInputChange("adTitle", e.target.value)}
                      placeholder="Суртчилгааны гарчиг..."
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>

                  {/* Ad Description */}
                  <div>
                    <label className="text-white font-medium mb-2 block">Суртчилгааны тайлбар</label>
                    <Textarea
                      value={settings.adDescription}
                      onChange={(e) => handleInputChange("adDescription", e.target.value)}
                      placeholder="Суртчилгааны тайлбар..."
                      className="bg-gray-900/50 border-purple-500/30 text-white min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Ad Preview */}
                {settings.adLink && (
                  <div className="mt-4 p-3 bg-gray-900/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">Суртчилгааны урьдчилан үзэх:</p>
                    <div className="bg-black rounded-lg p-4 border border-purple-500/20">
                      <div className="text-center space-y-2">
                        <div className="w-full bg-purple-500/20 rounded-lg p-8 flex items-center justify-center">
                          <DollarSign className="w-12 h-12 text-purple-400" />
                        </div>
                        {settings.adTitle && <h3 className="text-lg font-bold text-white">{settings.adTitle}</h3>}
                        {settings.adDescription && <p className="text-gray-300 text-sm">{settings.adDescription}</p>}
                        {settings.adWebsiteLink && <p className="text-purple-400 text-xs">{settings.adWebsiteLink}</p>}
                        <Badge className="bg-purple-500 text-white">Суртчилгаа - Зогсоох боломжгүй</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <Card className="bg-black/40 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
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
                  <div className="text-sm text-gray-400 mb-1">Лого</div>
                  <div className="font-bold text-yellow-400">{settings.logoUrl ? "Тохируулсан" : "Үндсэн"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button onClick={handleClose} variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800">
              Цуцлах
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Хадгалах
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
