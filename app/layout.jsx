import './globals.css';

export const metadata = {
  title: 'Territorio Saludable',
  description: 'Catálogo web y panel de administración',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
