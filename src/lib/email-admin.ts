import { db } from "@/lib/db"
import { emailTemplateDefinitions, emailTriggerDefinitions } from "@/data/email-template-definitions"

export async function ensureEmailDataSeeded() {
  const [existingTemplates, existingTriggers] = await Promise.all([
    db.emailTemplate.findMany({ select: { templateKey: true } }),
    db.emailTrigger.findMany({ select: { triggerKey: true } }),
  ])

  const existingTemplateKeys = new Set(existingTemplates.map((template) => template.templateKey))
  const templatesToCreate = emailTemplateDefinitions.filter(
    (template) => !existingTemplateKeys.has(template.templateKey)
  )

  for (const template of templatesToCreate) {
    await db.emailTemplate.create({
      data: {
        templateKey: template.templateKey,
        name: template.name,
        subject: template.subject,
        description: template.description,
        variables: template.variables,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        isActive: template.isActive,
      },
    })
  }

  const existingTriggerKeys = new Set(existingTriggers.map((trigger) => trigger.triggerKey))
  const triggersToCreate = emailTriggerDefinitions.filter(
    (trigger) => !existingTriggerKeys.has(trigger.triggerKey)
  )

  for (const trigger of triggersToCreate) {
    await db.emailTrigger.create({
      data: {
        triggerKey: trigger.triggerKey,
        name: trigger.name,
        description: trigger.description,
        templateKey: trigger.templateKey,
        isEnabled: trigger.isEnabled,
      },
    })
  }
}
