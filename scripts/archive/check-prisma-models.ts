#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzePrismaModels() {
  console.log('🔍 Analyzing Prisma Client models and relations...\n')
  
  // Get all available models from Prisma client
  const models = Object.keys(prisma).filter(key => 
    !key.startsWith('_') && 
    !key.startsWith('$') && 
    typeof (prisma as any)[key] === 'object' &&
    (prisma as any)[key].findMany
  )
  
  console.log('✅ Available Prisma Models:')
  models.forEach(model => {
    console.log(`  - db.${model}`)
  })
  
  console.log('\n📋 Model Schema Info:')
  
  // For each model, try to get schema info
  for (const model of models) {
    try {
      console.log(`\n🏗️  ${model.toUpperCase()} model:`)
      
      // Try a findFirst with include to see available relations
      const sampleQuery = {
        take: 1,
        include: {} as any
      }
      
      // This will help us understand the relations
      console.log(`  Available in: db.${model}`)
      
    } catch (error) {
      console.log(`  ❌ Error analyzing ${model}:`, error)
    }
  }
  
  await prisma.$disconnect()
}

analyzePrismaModels().catch(console.error)