import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-white">Yükleniyor...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
