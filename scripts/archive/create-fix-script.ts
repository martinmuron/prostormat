import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createFixScript() {
  console.log('-- SQL SCRIPT TO FIX POP-UP BAR AND OTHER VENUES')
  console.log('-- Generated: ' + new Date().toISOString())
  console.log('-- Database: Production (port 5432)\n')
  
  console.log('-- ISSUE 1: Fix Pop-up Bar district (Na Prikope is in Praha 1)')
  console.log('UPDATE prostormat_venues')
  console.log('SET district = \'Praha 1\'')
  console.log('WHERE slug = \'pop-up-bar\';')
  console.log('')
  
  console.log('-- ISSUE 2: Fix Pop-up Bar image paths (remove leading slash)')
  console.log('UPDATE prostormat_venues')
  console.log('SET images = ARRAY(')
  console.log('  SELECT regexp_replace(unnest(images), \'^/\', \'\')')
  console.log(')')
  console.log('WHERE slug = \'pop-up-bar\';')
  console.log('')
  
  console.log('-- ISSUE 3: Fix Narodni dum na Vinohradech image paths')
  console.log('UPDATE prostormat_venues')
  console.log('SET images = ARRAY(')
  console.log('  SELECT regexp_replace(unnest(images), \'^/\', \'\')')
  console.log(')')
  console.log('WHERE slug = \'narodni-dum-na-vinohradech\';')
  console.log('')
  
  console.log('-- Verification queries:')
  console.log('SELECT slug, district, images[1] as first_image')
  console.log('FROM prostormat_venues')
  console.log('WHERE slug IN (\'pop-up-bar\', \'narodni-dum-na-vinohradech\');')
  
  await prisma.$disconnect()
}

createFixScript()
