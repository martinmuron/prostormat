import { setTopPrioritySoldOut } from "@/lib/site-settings"

async function main() {
  await setTopPrioritySoldOut(true)
  console.log("Top Priority marked as sold out")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
