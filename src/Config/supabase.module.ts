import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigModule, ConfigService } from '@nestjs/config';

const supabaseProvider = {
  provide: 'SUPABASE_CLIENT',
  useFactory: (): SupabaseClient => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY',
      );
    }

    return createClient(supabaseUrl, supabaseKey);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [supabaseProvider],
  exports: [supabaseProvider],
})
export class SupabaseModule {}
