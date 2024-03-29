import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import Header from "@/app/ui/components/Header";
import SessionProvider from "@/app/ui/components/auth/SessionProvider";
import {EdgeStoreProvider} from "@/app/lib/edgestore";

const inter = Inter({subsets: [ 'latin' ]})

export const metadata: Metadata = {
    title: 'Skool clone',
    description: 'Clone of skool website',
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
            <EdgeStoreProvider>

                <SessionProvider>

                    <Header/>
                    <main className="container m-auto">
                        {children}
                    </main>
                </SessionProvider>
            </EdgeStoreProvider>

        </body>
        </html>
    )
}
