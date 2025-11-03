import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    venue?: string;
  }>;
}

export default async function InquiryDetailsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id: broadcastId } = await params;
  const { venue: venueSlug } = await searchParams;

  // Check if venue slug is provided
  if (!venueSlug) {
    redirect('/pridat-prostor');
  }

  // Get venue by slug
  const venue = await db.venue.findUnique({
    where: { slug: venueSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      paid: true,
      managerId: true,
    },
  });

  if (!venue) {
    redirect('/pridat-prostor');
  }

  const isAdmin = session?.user?.role === 'admin';

  // If venue is not paid AND user is not admin, redirect to claim page
  if (!venue.paid && !isAdmin) {
    redirect(`/pridat-prostor?inquiry=${broadcastId}&venue=${venueSlug}`);
  }

  // If venue is paid OR user is admin, check if user is authenticated
  if (!session) {
    redirect(`/prihlaseni?callbackUrl=/poptavka/${broadcastId}?venue=${venueSlug}`);
  }

  // Check if logged-in user is the venue manager or admin
  const isVenueManager = session.user?.id === venue.managerId;

  if (!isVenueManager && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Přístup odepřen</h1>
          <p className="text-gray-600 mb-6">
            Nemáte oprávnění zobrazit tuto poptávku. Tato poptávka patří jinému prostoru.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Zpět na Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Get broadcast details
  const broadcast = await db.venueBroadcast.findUnique({
    where: { id: broadcastId },
    select: {
      id: true,
      title: true,
      description: true,
      eventType: true,
      eventDate: true,
      guestCount: true,
      budgetRange: true,
      locationPreference: true,
      requirements: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      createdAt: true,
    },
  });

  if (!broadcast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Poptávka nenalezena</h1>
          <p className="text-gray-600 mb-6">
            Tato poptávka již neexistuje nebo byla odstraněna.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Zpět na Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-black text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Detaily poptávky akce</h1>
            <p className="text-sm opacity-90 mt-1">
              Prostor: <strong>{venue.name}</strong>
            </p>
          </div>

          {/* Broadcast Details */}
          <div className="p-6">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{broadcast.title}</h2>
              <p className="text-gray-700">{broadcast.description}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Detaily akce
                </h3>
                <div className="space-y-3">
                  {broadcast.eventDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Datum akce:</span>
                      <p className="text-gray-900">
                        {new Date(broadcast.eventDate).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  )}
                  {broadcast.guestCount && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Počet hostů:</span>
                      <p className="text-gray-900">{broadcast.guestCount}</p>
                    </div>
                  )}
                  {broadcast.locationPreference && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lokalita:</span>
                      <p className="text-gray-900">{broadcast.locationPreference}</p>
                    </div>
                  )}
                  {broadcast.requirements && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Požadavky:</span>
                      <p className="text-gray-900">{broadcast.requirements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 uppercase mb-3">
                  Kontaktní údaje organizátora
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Jméno:</span>
                    <p className="text-gray-900 font-semibold">{broadcast.contactName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">
                      <a
                        href={`mailto:${broadcast.contactEmail}`}
                        className="text-green-700 hover:text-green-900 font-medium underline"
                      >
                        {broadcast.contactEmail}
                      </a>
                    </p>
                  </div>
                  {broadcast.contactPhone && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Telefon:</span>
                      <p className="text-gray-900">
                        <a
                          href={`tel:${broadcast.contactPhone}`}
                          className="text-green-700 hover:text-green-900 font-medium underline"
                        >
                          {broadcast.contactPhone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Doporučujeme</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Odpovězte do 1 hodiny - rychlost je klíčová!</li>
                      <li>Připravte konkrétní nabídku s cenou a dostupností</li>
                      <li>Nabídněte prohlídku prostoru</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`mailto:${broadcast.contactEmail}?subject=Nabídka prostoru ${venue.name} - Prostormat&body=Dobrý den ${broadcast.contactName},%0A%0Aděkuji za váš zájem o náš prostor ${venue.name}.%0A%0A[Zde napište svou nabídku]%0A%0AS pozdravem`}
                className="flex-1 bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                📧 Napsat nabídku
              </a>
              <a
                href="/dashboard"
                className="flex-1 bg-gray-200 text-gray-900 text-center px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Zpět na Dashboard
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-600">
            <p>
              Poptávka obdržena:{' '}
              {new Date(broadcast.createdAt).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
