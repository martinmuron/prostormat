import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const newPassword = await new Promise<string>((resolve) => {
      rl.question('Enter new password for test-admin@prostormat.cz: ', (answer) => {
        rl.close()
        resolve(answer)
      })
    })

    if (!newPassword || newPassword.length < 8) {
      console.error('❌ Password must be at least 8 characters')
      process.exit(1)
    }

    console.log('\nResetting password for test admin...\n')

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user
    const updated = await prisma.user.update({
      where: {
        email: 'test-admin@prostormat.cz',
      },
      data: {
        password: hashedPassword,
      },
    })

    if (!updated) {
      console.error('❌ User not found')
      process.exit(1)
    }

    console.log('✅ Password reset successfully!')
    console.log('\nTest Admin Credentials:')
    console.log('  Email: test-admin@prostormat.cz')
    console.log('  Password: [as entered]')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
