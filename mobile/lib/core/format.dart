import 'package:intl/intl.dart';

class Fmt {
  Fmt._();

  static final NumberFormat _inr = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static String money(num? v) {
    if (v == null) return '₹0';
    return _inr.format(v);
  }

  static String moneyCompact(num? v) {
    if (v == null) return '₹0';
    if (v >= 10000000) {
      return '₹${(v / 10000000).toStringAsFixed(2)} Cr';
    }
    if (v >= 100000) {
      return '₹${(v / 100000).toStringAsFixed(2)} L';
    }
    if (v >= 1000) {
      return '₹${(v / 1000).toStringAsFixed(1)}k';
    }
    return _inr.format(v);
  }

  static String pct(num? v) => '${v?.toStringAsFixed(0) ?? '0'}%';

  static String date(String? iso, {String fallback = '—'}) {
    if (iso == null || iso.isEmpty || iso == '—') return fallback;
    try {
      final dt = DateTime.tryParse(iso);
      if (dt == null) return iso;
      return DateFormat('d MMM yyyy').format(dt);
    } catch (_) {
      return iso;
    }
  }

  static String dateTime(String? iso, {String fallback = '—'}) {
    if (iso == null || iso.isEmpty) return fallback;
    try {
      final dt = DateTime.tryParse(iso);
      if (dt == null) return iso;
      return DateFormat('d MMM yyyy, h:mm a').format(dt);
    } catch (_) {
      return iso;
    }
  }

  static String shortDate(String? iso, {String fallback = '—'}) {
    if (iso == null || iso.isEmpty) return fallback;
    try {
      final dt = DateTime.tryParse(iso);
      if (dt == null) return iso;
      return DateFormat('MMM yy').format(dt);
    } catch (_) {
      return iso;
    }
  }
}
