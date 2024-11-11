import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
    title: {
        template: 'Admin Dashboard',
        default: 'Elysion Softwares',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <ProviderComponent>
                    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_CLIENT_ID}`}>
                        {children}
                    </GoogleOAuthProvider></ProviderComponent>
            </body>
        </html>
    );
}
