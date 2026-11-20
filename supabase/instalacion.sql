-- Territorio Saludable: instalación de la base de datos en Supabase.
-- Copia TODO este texto, pégalo en Supabase > SQL Editor y dale "Run".
-- Se puede ejecutar más de una vez sin dañar nada.

-- Productos del catálogo (cada producto se guarda completo en "datos")
create table if not exists public.productos (
  id text primary key,
  datos jsonb not null,
  orden integer not null default 0,
  actualizado timestamptz not null default now()
);

-- Ajustes generales: configuración, zonas y claves del panel
create table if not exists public.ajustes (
  clave text primary key,
  valor jsonb not null
);

-- Seguridad: nadie puede leer ni escribir directamente desde internet.
-- Solo el servidor de la página (con la llave secreta) tiene acceso.
alter table public.productos enable row level security;
alter table public.ajustes enable row level security;

-- Carpeta pública para las fotos de los productos
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;
