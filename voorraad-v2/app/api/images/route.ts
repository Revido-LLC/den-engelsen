import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzpwklgsqmrxxikfjlgl.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cHdrbGdzcW1yeHhpa2ZqbGdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU5NTQ5NywiZXhwIjoyMDg5MTcxNDk3fQ.jUR_quxbdVBZyImIlRNfYNbde3WASLepjU-n79hrPIw';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Sample images from Den Engelsen inventory (generic truck/van images)
const VEHICLE_IMAGES: Record<string, string> = {
  "MAN TGX": "https://www.denengelsentopused.eu/transforms/_stockImage/3163302/49215309_1.webp",
  "MAN TGE": "https://www.denengelsentopused.eu/transforms/_stockImage/3163303/49215309_2.webp",
  "MAN TGM": "https://www.denengelsentopused.eu/transforms/_stockImage/3163304/49215309_3.webp",
  "MAN TGL": "https://www.denengelsentopused.eu/transforms/_stockImage/3163305/49215309_4.webp",
  "MAN TGS": "https://www.denengelsentopused.eu/transforms/_stockImage/3163306/49215309_5.webp",
  "Volkswagen Crafter": "https://www.denengelsentopused.eu/transforms/_stockImage/3248523/49315419_1.webp",
  "Volkswagen Transporter": "https://www.denengelsentopused.eu/transforms/_stockImage/3248524/49315420_1.webp",
  "Volkswagen Caddy": "https://www.denengelsentopused.eu/transforms/_stockImage/3248525/49315421_1.webp",
  "Volkswagen Multivan": "https://www.denengelsentopused.eu/transforms/_stockImage/3248526/49315422_1.webp",
  "Ford Transit": "https://www.denengelsentopused.eu/transforms/_stockImage/3248527/49315423_1.webp",
  "Renault Master": "https://www.denengelsentopused.eu/transforms/_stockImage/3248528/49315424_1.webp",
  "Renault Trafic": "https://www.denengelsentopused.eu/transforms/_stockImage/3248529/49315425_1.webp",
  "Mercedes-Benz Sprinter": "https://www.denengelsentopused.eu/transforms/_stockImage/3248530/49315426_1.webp",
  "Peugeot Boxer": "https://www.denengelsentopused.eu/transforms/_stockImage/3248531/49315427_1.webp",
  "Citroën Berlingo": "https://www.denengelsentopused.eu/transforms/_stockImage/3248532/49315428_1.webp",
  "Toyota PROACE": "https://www.denengelsentopused.eu/transforms/_stockImage/3248533/49315429_1.webp",
  "Opel Vivaro": "https://www.denengelsentopused.eu/transforms/_stockImage/3248534/49315430_1.webp",
  "Škoda Fabia": "https://www.denengelsentopused.eu/transforms/_stockImage/3248535/49315431_1.webp",
};

const DEFAULT_IMAGE = "https://www.denengelsentopused.eu/transforms/_stockImage/3163302/49215309_1.webp";

function getImageForVehicle(name: string): string {
  for (const [key, url] of Object.entries(VEHICLE_IMAGES)) {
    if (name.includes(key)) {
      return url;
    }
  }
  return DEFAULT_IMAGE;
}

export async function GET() {
  try {
    // Fetch all vehicles
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, name');

    if (error) throw error;

    // Update each vehicle with an image URL
    for (const vehicle of vehicles || []) {
      const imageUrl = getImageForVehicle(vehicle.name);
      
      await supabase
        .from('vehicles')
        .update({ image_url: imageUrl })
        .eq('id', vehicle.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${vehicles?.length || 0} vehicles with images` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}