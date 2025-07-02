import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Check for a simple password protection
    const { password } = await request.json()
    if (password !== "seed123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    await db.venueInquiry.deleteMany()
    await db.venue.deleteMany()
    await db.user.deleteMany()

    console.log("🗑️ Cleared existing data")

    // Create users with hashed passwords
    const users = await Promise.all([
      // Original users
      db.user.create({
        data: {
          name: "Jan Novák",
          email: "jan.novak@example.com",
          phone: "+420 123 456 789",
          password: await hash("password123", 12),
          role: "venue_manager",
        },
      }),
      db.user.create({
        data: {
          name: "Marie Svobodová",
          email: "marie.svoboda@example.com", 
          phone: "+420 987 654 321",
          password: await hash("password123", 12),
          role: "venue_manager",
        },
      }),
      db.user.create({
        data: {
          name: "Petr Dvořák",
          email: "petr.dvorak@example.com",
          phone: "+420 555 123 456",
          password: await hash("password123", 12),
          role: "venue_manager",
        },
      }),
      // Test venue managers
      db.user.create({
        data: {
          name: "Tomáš Říha",
          email: "tomas.riha@ribsofprague.cz",
          phone: "+420 602 123 456",
          password: await hash("manager123", 12),
          role: "venue_manager",
        },
      }),
      db.user.create({
        data: {
          name: "Anna Bartošová",
          email: "anna.bartosova@umalvaze.cz", 
          phone: "+420 603 789 012",
          password: await hash("manager123", 12),
          role: "venue_manager",
        },
      }),
      db.user.create({
        data: {
          name: "David Krejčí",
          email: "david.krejci@medusaprague.com",
          phone: "+420 604 345 678",
          password: await hash("manager123", 12),
          role: "venue_manager",
        },
      }),
      db.user.create({
        data: {
          name: "Lucie Novotná",
          email: "lucie.novotna@popupbar.cz",
          phone: "+420 605 901 234",
          password: await hash("manager123", 12),
          role: "venue_manager",
        },
      }),
    ])

    console.log("👥 Created users")

    // Create venues
    const venues = await Promise.all([
      // Original venues
      db.venue.create({
        data: {
          name: "Pražská kavárna",
          slug: "prazska-kavarna",
          description: "Útulná kavárna v centru Prahy s autentickou atmosférou a možností pronájmu pro soukromé akce.",
          address: "Náměstí Míru 15, Praha 2",
          venueType: "restaurant",
          capacitySeated: 40,
          capacityStanding: 60,
          priceRange: "800 Kč/osoba",
          amenities: ["wifi", "sound_system", "projector", "catering", "parking"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "",
          contactEmail: "info@prazhskakavarna.cz",
          contactPhone: "+420 234 567 890",
          managerId: users[0].id,
          status: "active",
        },
      }),
      db.venue.create({
        data: {
          name: "Art Gallery Moderna",
          slug: "art-gallery-moderna",
          description: "Moderní galerie s vysokými stropy a flexibilními prostory ideální pro výstavy, vernisáže a kulturní akce.",
          address: "Vinohrady, Praha 3",
          venueType: "gallery", 
          capacitySeated: 80,
          capacityStanding: 120,
          priceRange: "2500 Kč/hod, 15000 Kč/den",
          amenities: ["wifi", "sound_system", "lighting", "security", "climate_control"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "",
          contactEmail: "booking@artgallerymoderna.cz",
          contactPhone: "+420 345 678 901",
          managerId: users[1].id,
          status: "active",
        },
      }),
      db.venue.create({
        data: {
          name: "Rooftop Terrace",
          slug: "rooftop-terrace",
          description: "Jedinečná střešní terasa s výhledem na Pražský hrad. Perfektní pro letní akce a večírky.",
          address: "Malá Strana, Praha 1",
          venueType: "rooftop",
          capacitySeated: 60,
          capacityStanding: 100,
          priceRange: "1200 Kč/osoba",
          amenities: ["wifi", "sound_system", "bar", "outdoor_space", "view"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "",
          contactEmail: "events@rooftopterrace.cz",
          contactPhone: "+420 456 789 012",
          managerId: users[2].id,
          status: "active",
        },
      }),
      // Test venues
      db.venue.create({
        data: {
          name: "Ribs of Prague",
          slug: "ribs-of-prague",
          description: "Prémiová restaurace specializující se na grilované žebírka a steaky. Moderní industriální design s cihlovou zdí a ocelovými prvky. Ideální pro firemní akce, oslavy a team building události. Nabízíme kompletní catering služby a profesionální obsluhu.",
          address: "Národní 25, Praha 1 - Nové Město",
          venueType: "restaurant",
          capacitySeated: 120,
          capacityStanding: 180,
          priceRange: "1800-3500 Kč/osoba",
          amenities: ["wifi", "sound_system", "bar", "catering", "parking", "air_conditioning"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          contactEmail: "events@ribsofprague.cz",
          contactPhone: "+420 602 123 456",
          managerId: users[3].id,
          status: "active",
        },
      }),
      db.venue.create({
        data: {
          name: "U Malvaze",
          slug: "u-malvaze",
          description: "Tradiční český hostinec s autentickou atmosférou a domácí kuchyní. Dřevěné trámy, kamenné zdi a krásná zahrada. Perfektní pro rodinné oslavy, svatby a tradiční české večírky. Nabízíme domácí speciality a široký výběr českých piv.",
          address: "Kampa Island 4, Praha 1 - Malá Strana",
          venueType: "restaurant", 
          capacitySeated: 65,
          capacityStanding: 90,
          priceRange: "1200-2400 Kč/osoba",
          amenities: ["wifi", "outdoor_space", "catering", "traditional_decor", "garden"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "",
          contactEmail: "rezervace@umalvaze.cz",
          contactPhone: "+420 603 789 012",
          managerId: users[4].id,
          status: "draft",
        },
      }),
      db.venue.create({
        data: {
          name: "Medusa Prague",
          slug: "medusa-prague",
          description: "Luxusní konferenční centrum v historické budově s nejmodernějším technickým vybavením. Flexibilní prostory s možností rozdělení na několik menších sálů. Ideální pro konference, semináře, produktové prezentace a velké firemní akce. Profesionální AV technika a kompletní event management.",
          address: "Wenceslas Square 14, Praha 1 - Nové Město",
          venueType: "conference",
          capacitySeated: 200,
          capacityStanding: 350,
          priceRange: "25000-45000 Kč/den",
          amenities: ["wifi", "sound_system", "projector", "lighting", "air_conditioning", "catering", "parking", "security"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "https://www.youtube.com/watch?v=example2",
          contactEmail: "bookings@medusaprague.com",
          contactPhone: "+420 604 345 678", 
          managerId: users[5].id,
          status: "active",
        },
      }),
      db.venue.create({
        data: {
          name: "Pop Up Bar",
          slug: "pop-up-bar",
          description: "Kreativní pop-up bar s měnícím se konceptem a jedinečným designem. Industriální prostor s možností kompletní personalizace podle vašich potřeb. Ideální pro product launch, brand activation, networking events a kreativní párty. Flexibilní layout a možnost kompletního rebrandingu prostoru.",
          address: "Karlín, Praha 8",
          venueType: "other",
          capacitySeated: 40,
          capacityStanding: 80,
          priceRange: "800-1800 Kč/osoba",
          amenities: ["wifi", "sound_system", "bar", "lighting", "flexible_layout"],
          images: ["/api/placeholder/800/600"],
          videoUrl: "",
          contactEmail: "hello@popupbar.cz",
          contactPhone: "+420 605 901 234",
          managerId: users[6].id,
          status: "draft",
        },
      }),
    ])

    console.log("🏢 Created venues")

    // Create some sample venue inquiries
    await Promise.all([
      db.venueInquiry.create({
        data: {
          venueId: venues[3].id, // Ribs of Prague
          name: "Petra Nováková",
          email: "petra.novakova@company.cz",
          phone: "+420 777 888 999",
          eventDate: new Date("2024-02-15"),
          guestCount: 80,
          message: "Plánujeme firemní večírek pro 80 lidí. Rádi bychom se domluvili na ceně a možnostech cateringu.",
        },
      }),
      db.venueInquiry.create({
        data: {
          venueId: venues[3].id, // Ribs of Prague  
          name: "Martin Svoboda",
          email: "martin.svoboda@gmail.com",
          phone: "+420 666 777 888",
          eventDate: new Date("2024-03-20"),
          guestCount: 50,
          message: "Oslavujeme narozeniny, potřebujeme rezervaci na 20. března pro 50 lidí.",
        },
      }),
      db.venueInquiry.create({
        data: {
          venueId: venues[5].id, // Medusa Prague
          name: "Jana Procházková", 
          email: "jana.prochaskova@techcorp.cz",
          phone: "+420 555 444 333",
          eventDate: new Date("2024-04-10"),
          guestCount: 150,
          message: "Potřebujeme pronájem konferenčního sálu pro tech konferenci na celý den s kompletním AV vybavením.",
        },
      }),
    ])

    console.log("📬 Created venue inquiries")
    console.log("✅ Seed completed successfully!")

    return NextResponse.json({ 
      message: "Seed completed successfully!",
      counts: {
        users: users.length,
        venues: venues.length,
        inquiries: 3
      }
    })

  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ 
      error: "Seed failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 