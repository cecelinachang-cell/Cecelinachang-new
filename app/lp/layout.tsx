import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['600', '700', '800'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
});

// Landing pages for social traffic are deliberately exit-free: this hides the
// global Navbar, Footer and ChatbotWidget (each marks its root with
// data-site-chrome) on /lp/* only. A server-rendered <style> means nothing
// flashes before hydration, and the root layout stays untouched. It also
// swaps the body background so overscroll matches the landing page theme.
//
// Plain <style> on purpose, with no href/precedence: React 19 hoists those as
// resources that can outlive this layout, which would keep the chrome hidden
// after a client-side navigation away from /lp.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{'[data-site-chrome]{display:none!important}body{background:#F5F6F4}'}</style>
      <div className={`${bricolage.variable} ${jakarta.variable} bg-enamel font-lp tracking-[0.005em] text-kecap antialiased [word-spacing:0.03em]`}>
        {children}
      </div>
    </>
  );
}
