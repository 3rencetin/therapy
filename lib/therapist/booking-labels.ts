/** booked_sessions.status → kısa Türkçe etiket */
export function bookingLifecycleStatusTr(status: string): string {
  switch (status) {
    case "pending":
      return "Onay bekliyor";
    case "confirmed":
      return "Onaylandı";
    case "completed":
      return "Tamamlandı";
    case "cancelled":
      return "İptal edildi";
    default:
      return status;
  }
}

/** booked_sessions.payment_status → kısa Türkçe etiket */
export function bookingPaymentStatusTr(paymentStatus: string): string {
  switch (paymentStatus) {
    case "unpaid":
      return "Ödeme bekleniyor";
    case "paid":
      return "Ödendi";
    case "refunded":
      return "İade edildi";
    default:
      return paymentStatus;
  }
}
