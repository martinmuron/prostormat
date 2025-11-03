"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Users, Building, Send, Eye, Plus, Bell } from "lucide-react"
import { generateWelcomeEmailForUser, generateWelcomeEmailForLocationOwner, generateContactFormThankYouEmail, generateAddVenueThankYouEmail, generateQuickRequestVenueNotificationEmail } from "@/lib/email-templates"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome_user' | 'welcome_location_owner' | 'contact_form_thank_you' | 'add_venue_thank_you' | 'quick_request_venue_notification' | 'custom'
}

const predefinedTemplates: EmailTemplate[] = [
  {
    id: 'welcome_user',
    name: 'Vítací email pro uživatele',
    subject: 'Vítejte v Prostormatu!',
    content: '',
    type: 'welcome_user'
  },
  {
    id: 'welcome_location_owner',
    name: 'Vítací email pro majitele prostorů',
    subject: 'Vítejte v Prostormatu - Začněte nabízet své prostory!',
    content: '',
    type: 'welcome_location_owner'
  },
  {
    id: 'contact_form_thank_you',
    name: 'Poděkování za kontaktní formulář',
    subject: 'Děkujeme za vaši zprávu!',
    content: '',
    type: 'contact_form_thank_you'
  },
  {
    id: 'add_venue_thank_you',
    name: 'Poděkování za přidání prostoru',
    subject: 'Děkujeme za přidání prostoru!',
    content: '',
    type: 'add_venue_thank_you'
  },
  {
    id: 'quick_request_venue_notification',
    name: 'Notifikace prostoru o rychlé poptávce',
    subject: 'Zákazník má zájem o váš prostor!',
    content: '',
    type: 'quick_request_venue_notification'
  }
]

export function EmailTemplatesManager() {
  const [activeTab, setActiveTab] = useState("templates")
  const [customEmail, setCustomEmail] = useState({
    subject: "",
    content: "",
    recipientType: "all"
  })
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const handlePreviewTemplate = (templateId: string) => {
    let emailData
    
    if (templateId === 'welcome_user') {
      emailData = generateWelcomeEmailForUser({
        name: "Jan Novák",
        email: "jan.novak@example.com"
      })
    } else if (templateId === 'welcome_location_owner') {
      emailData = generateWelcomeEmailForLocationOwner({
        name: "Petr Svoboda",
        email: "petr.svoboda@example.com"
      })
    } else if (templateId === 'contact_form_thank_you') {
      emailData = generateContactFormThankYouEmail({
        name: "Jana Svobodová",
        email: "jana.svobodova@example.com",
        subject: "Dotaz ohledně pronájmu prostoru",
        message: "Dobrý den, zajímá mě pronájem vašeho prostoru pro firemní akci..."
      })
    } else if (templateId === 'add_venue_thank_you') {
      emailData = generateAddVenueThankYouEmail({
        name: "Martin Novák",
        email: "martin.novak@example.com",
        venueName: "Stylová galerie v centru Prahy",
        venueType: "galerie"
      })
    } else if (templateId === 'quick_request_venue_notification') {
      emailData = generateQuickRequestVenueNotificationEmail({
        venueName: "Stylová galerie v centru Prahy",
        venueSlug: "stylova-galerie",
        broadcastId: "sample-broadcast-id",
        quickRequest: {
          title: "Networking večer Prostormat",
          guestCount: 120,
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          locationPreference: "Praha 1",
        }
      })
    }
    
    if (emailData) {
      setPreviewTemplate(emailData.html)
    }
  }

  const handleSendCustomEmail = async () => {
    if (!customEmail.subject || !customEmail.content) {
      alert("Prosím vyplňte předmět a obsah emailu")
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/email-templates/send-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customEmail),
      })

      if (response.ok) {
        alert("Email byl úspěšně odeslán!")
        setCustomEmail({ subject: "", content: "", recipientType: "all" })
      } else {
        alert("Chyba při odesílání emailu")
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert("Chyba při odesílání emailu")
    } finally {
      setSending(false)
    }
  }

  const handleSendWelcomeEmail = async (templateType: 'welcome_user' | 'welcome_location_owner') => {
    setSending(true)
    try {
      const response = await fetch('/api/admin/email-templates/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateType }),
      })

      if (response.ok) {
        alert("Vítací emaily byly úspěšně odeslány!")
      } else {
        alert("Chyba při odesílání emailů")
      }
    } catch (error) {
      console.error('Error sending welcome emails:', error)
      alert("Chyba při odesílání emailů")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Email nastavení</TabsTrigger>
          <TabsTrigger value="custom">Vlastní email</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedTemplates.map((template) => (
              <Card key={template.id} className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {template.type === 'welcome_user' ? (
                      <Users className="h-5 w-5" />
                    ) : template.type === 'welcome_location_owner' ? (
                      <Building className="h-5 w-5" />
                    ) : template.type === 'add_venue_thank_you' ? (
                      <Plus className="h-5 w-5" />
                    ) : template.type === 'quick_request_venue_notification' ? (
                      <Bell className="h-5 w-5" />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Předmět:</Label>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Náhled
                    </Button>
                    {(template.type === 'welcome_user' || template.type === 'welcome_location_owner') && (
                      <Button
                        size="sm"
                        onClick={() => handleSendWelcomeEmail(template.type as 'welcome_user' | 'welcome_location_owner')}
                        disabled={sending}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? 'Odesílání...' : 'Odeslat'}
                      </Button>
                    )}
                    {template.type === 'contact_form_thank_you' && (
                      <p className="text-sm text-gray-500 mt-2">
                        Automaticky odesíláno při odeslání kontaktního formuláře
                      </p>
                    )}
                    {template.type === 'add_venue_thank_you' && (
                      <p className="text-sm text-gray-500 mt-2">
                        Automaticky odesíláno při přidání nového prostoru
                      </p>
                    )}
                    {template.type === 'quick_request_venue_notification' && (
                      <p className="text-sm text-gray-500 mt-2">
                        Automaticky odesíláno prostorům při rychlé poptávce
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {previewTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Náhled emailu</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="w-fit"
                >
                  Zavřít náhled
                </Button>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewTemplate }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Vlastní email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient-type">Příjemci</Label>
                  <Select value={customEmail.recipientType} onValueChange={(value) => 
                    setCustomEmail(prev => ({ ...prev, recipientType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte příjemce" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Všichni uživatelé</SelectItem>
                      <SelectItem value="users">Pouze běžní uživatelé</SelectItem>
                      <SelectItem value="location_owners">Pouze majitelé prostorů</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Předmět</Label>
                  <Input
                    id="subject"
                    value={customEmail.subject}
                    onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Zadejte předmět emailu"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Obsah emailu</Label>
                <Textarea
                  id="content"
                  value={customEmail.content}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Zadejte obsah emailu (podporuje HTML)"
                  rows={10}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSendCustomEmail}
                  disabled={sending || !customEmail.subject || !customEmail.content}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Odesílání...' : 'Odeslat email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
