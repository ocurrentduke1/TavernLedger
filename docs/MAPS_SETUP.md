# Configuración de Supabase Storage para Mapas

## Prerequisitos

Para que el sistema de carga de imágenes funcione, necesitas habilitar y configurar un bucket de Supabase Storage.

## Opción 1: Via Dashboard Supabase (Recomendado)

1. Ve a [Supabase Console](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Storage** en el menú lateral
4. Click en **Create Bucket**
5. Nombre: `map-images`
6. Configuración:
   - Uncheck **Public bucket** (mantener privado)
   - File size limit: `10 MiB`
   - Allowed MIME types:
     - `image/png`
     - `image/jpeg`
     - `image/webp`
7. Click **Create Bucket**

## Opción 2: Via SQL (Avanzado)

1. Ve a **SQL Editor** en Supabase Console
2. Ejecuta el siguiente script:

```sql
-- Create map-images bucket
insert into storage.buckets (id, name, public)
values ('map-images', 'map-images', false)
on conflict (id) do nothing;

-- Set RLS policies
create policy "Authenticated users can upload map images"
  on storage.objects for insert
  with (bucket_id = 'map-images')
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Users can read their uploaded map images"
  on storage.objects for select
  with (bucket_id = 'map-images')
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Users can delete their map images"
  on storage.objects for delete
  with (bucket_id = 'map-images')
  to authenticated
  using (auth.role() = 'authenticated');
```

## Verificación

Para verificar que todo funciona:

1. Ve a `/dashboard/maps`
2. Haz click en **Nueva Campaña** si no tienes una
3. Haz click en **+ Nuevo Mapa**
4. Intenta cargar una imagen (PNG, JPG o WebP, máximo 10MB)
5. La imagen debería cargarse exitosamente

## Troubleshooting

### Error: "CORS policy"
- Asegúrate de que tienes la URL correcta de tu proyecto Supabase
- Verifica que las políticas de CORS estén configuradas en Supabase

### Error: "Access denied"
- Confirma que las RLS policies están creadas
- Asegúrate de estar autenticado

### Error: "Bucket does not exist"
- Verifica que el bucket `map-images` existe en Storage
- El nombre debe ser exactamente `map-images` (minúsculas)

## Características Implementadas

✅ Carga de imágenes con drag & drop
✅ Validación de tipo y tamaño
✅ Almacenamiento en Supabase Storage
✅ Canvas interactivo con zoom y pan
✅ Sistema de tokens arrastrables
✅ Persistencia de cambios en BD
✅ Autoguardado de cambios de tokens
