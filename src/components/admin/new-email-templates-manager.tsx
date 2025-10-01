"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Mail, Eye, Save, Power, AlertCircle, Check } from "lucide-react"

interface EmailTemplate {
  id: string
  templateKey: string
  name: string
  subject: string
  htmlContent: string
  textContent: string | null
  variables: string[]
  description: string | null
  isActive: boolean
}

interface EmailTrigger {
  id: string
  triggerKey: string
  name: string
  description: string | null
  templateKey: string
  isEnabled: boolean
}

export function NewEmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [triggers, setTriggers] = useState<EmailTrigger[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [activeTab, setActiveTab] = useState("templates")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [templatesRes, triggersRes] = await Promise.all([
        fetch('/api/admin/email-templates'),
        fetch('/api/admin/email-triggers')
      ])

      if (templatesRes.ok && triggersRes.ok) {
        const templatesData = await templatesRes.json()
        const triggersData = await triggersRes.json()
        setTemplates(templatesData.templates)
        setTriggers(triggersData.triggers)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditedTemplate({ ...template })
    setPreviewHtml(template.htmlContent)
  }

  const handleSaveTemplate = async () => {
    if (!editedTemplate) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTemplate)
      })

      if (response.ok) {
        setSuccessMessage('Šablona byla úspěšně uložena!')
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleTrigger = async (trigger: EmailTrigger) => {
    try {
      const response = await fetch('/api/admin/email-triggers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trigger.id,
          isEnabled: !trigger.isEnabled
        })
      })

      if (response.ok) {
        setSuccessMessage(`Spouštěč "${trigger.name}" byl ${!trigger.isEnabled ? 'aktivován' : 'deaktivován'}!`)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling trigger:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Načítání...</div>
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded flex items-center gap-2">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Email šablony</TabsTrigger>
          <TabsTrigger value="triggers">Automatické spouštěče</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Dostupné šablony</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                        </div>
                        {template.isActive ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Aktivní</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Neaktivní</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Editor */}
            {editedTemplate && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upravit šablonu</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="template-active">Aktivní</Label>
                      <Switch
                        id="template-active"
                        checked={editedTemplate.isActive}
                        onCheckedChange={(checked) =>
                          setEditedTemplate({ ...editedTemplate, isActive: checked })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Předmět emailu</Label>
                    <Input
                      id="subject"
                      value={editedTemplate.subject}
                      onChange={(e) =>
                        setEditedTemplate({ ...editedTemplate, subject: e.target.value })
                      }
                      placeholder="Předmět emailu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="html-content">HTML obsah</Label>
                    <Textarea
                      id="html-content"
                      value={editedTemplate.htmlContent}
                      onChange={(e) => {
                        setEditedTemplate({ ...editedTemplate, htmlContent: e.target.value })
                        setPreviewHtml(e.target.value)
                      }}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="HTML kód emailu"
                    />
                  </div>

                  {editedTemplate.variables.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Dostupné proměnné:</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {editedTemplate.variables.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleSaveTemplate} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Ukládá se...' : 'Uložit změny'}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("preview")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Zobrazit náhled
                    </Button>
                  </div>

                  {/* Preview */}
                  {previewHtml && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-2">Náhled:</h3>
                      <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatické emailové spouštěče</CardTitle>
              <p className="text-sm text-gray-600">
                Zapněte nebo vypněte automatické odesílání emailů při určitých událostech
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triggers.map((trigger) => {
                  const linkedTemplate = templates.find(t => t.templateKey === trigger.templateKey)
                  return (
                    <div
                      key={trigger.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{trigger.name}</h3>
                          {trigger.isEnabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Power className="h-3 w-3 mr-1" />
                              Zapnuto
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Power className="h-3 w-3 mr-1" />
                              Vypnuto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{trigger.description}</p>
                        {linkedTemplate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Šablona: {linkedTemplate.name}
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={trigger.isEnabled}
                        onCheckedChange={() => handleToggleTrigger(trigger)}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
