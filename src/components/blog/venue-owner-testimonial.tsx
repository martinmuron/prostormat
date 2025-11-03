import { Quote, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VenueOwnerTestimonial() {
  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50/50 shadow-xl my-8 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[2fr_3fr]">
          {/* Left side - Venue info */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-8 text-white flex flex-col justify-center">
            <div className="mb-6">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                Příběh úspěchu
              </Badge>
              <h3 className="text-2xl font-bold mb-2">Medusa Prague</h3>
              <p className="text-purple-100 text-sm">
                Eventový prostor v centru Prahy
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">3×</div>
                  <div className="text-sm text-purple-100">Nárůst poptávek</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">1 týden</div>
                  <div className="text-sm text-purple-100">Od aktivace</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Testimonial */}
          <div className="p-8 flex flex-col justify-center relative">
            <Quote className="absolute top-6 right-6 h-16 w-16 text-purple-200 opacity-50" />

            <div className="relative z-10">
              <blockquote className="text-lg sm:text-xl text-gray-900 font-medium leading-relaxed mb-6">
                &ldquo;Od chvíle, kdy jsme se připojili k Prostormat, jsme{" "}
                <span className="text-purple-700 font-bold">více než ztrojnásobili počet poptávek</span>
                , které dostáváme. A to jen za týden. Platforma nás spojila s organizátory,
                ke kterým bychom se jinak nikdy nedostali.&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  ML
                </div>
                <div>
                  <div className="font-bold text-gray-900">Milan Linhart</div>
                  <div className="text-sm text-gray-600">Manager, Medusa Prague</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Prostormat spojuje kvalitní prostory s tisíci organizátorů akcí.
                  <strong className="text-gray-900"> Začněte dostávat poptávky už dnes.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
