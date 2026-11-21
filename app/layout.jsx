import './globals.css';
import { Courgette, Philosopher, Lora, Roboto } from 'next/font/google';

// Las mismas tipografías de la página anterior de Territorio Saludable
const courgette = Courgette({ subsets: ['latin'], weight: '400', variable: '--font-courgette', display: 'swap' });
const philosopher = Philosopher({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-philosopher', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto', display: 'swap' });

export const metadata = {
  title: 'Territorio Saludable',
  description: 'Pastelería 100% sin azúcar refinada y libre de gluten en Bucaramanga',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${courgette.variable} ${philosopher.variable} ${lora.variable} ${roboto.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
