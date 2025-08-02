import { createClient } from '@/utils/supabase/server';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("prostormat_notes").select();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Notes Test</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}