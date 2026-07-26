import { CheckCircle2, MessageCircle } from 'lucide-react';
import { POLICIES } from '@/lib/policies';
import { Button } from '@/components/ui/Button';

interface Course {
  title: string;
  price: string;
  originalPrice?: string;
  students: number;
}

interface CoursePricingPanelProps {
  course: Course;
  compact?: boolean;
}

export function CoursePricingPanel({ course, compact = false }: CoursePricingPanelProps) {
  const whatsappHref = `https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20mau%20daftar%20${encodeURIComponent(course.title)}`;

  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-butter/30 ${compact ? 'p-5' : 'p-8'}`}>
      <div className="text-center mb-4">
        {course.originalPrice && (
          <div className="text-charcoal-brown/50 line-through mb-1 text-sm">{course.originalPrice}</div>
        )}
        <div className={`font-serif text-rust-ink font-bold mb-1 ${compact ? 'text-3xl' : 'text-4xl mb-2'}`}>
          {course.price}
        </div>
        {course.originalPrice && (
          <div className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">
            Hemat {Math.round((1 - Number(course.price.replace(/\D/g, '')) / Number(course.originalPrice.replace(/\D/g, ''))) * 100)}%
          </div>
        )}
        <div className="text-charcoal-brown/50 text-xs">
          Sudah {course.students.toLocaleString('id-ID')} murid bergabung
        </div>
      </div>

      {!compact && (
        <ul className="space-y-4 mb-8">
          {[
            'Akses video seumur hidup',
            'Konsultasi langsung dengan cece lina chang',
            'E-Book resep lengkap (PDF)',
            'Sertifikat digital',
          ].map((item) => (
            <li key={item} className="flex items-center text-charcoal-brown/80 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <div className="flex items-start bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <span>Bingung setelah beli? Konsultasi langsung dengan Cece Lina Chang termasuk dalam kelas — bukan ekstra biaya.</span>
        </div>
      )}

      <Button href={whatsappHref} external variant="whatsapp" size="lg" fullWidth className="mb-4">
        <MessageCircle className="w-5 h-5 mr-2" /> Chat Cece, Daftar Kelas
      </Button>

      {!compact && (
        <>
          <p className="text-xs text-charcoal-brown/50 text-center">
            Pembayaran aman via transfer bank. Tidak perlu membuat akun di website.
          </p>
          <p className="text-xs text-charcoal-brown/50 text-center mt-2">
            {POLICIES.COURSE_REFUND_SHORT}
          </p>
        </>
      )}
    </div>
  );
}
