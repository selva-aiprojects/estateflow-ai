import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color background = Color(0xFFF6F7F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFEDF0F3);
  static const Color border = Color(0xFFDCE0E5);
  static const Color borderStrong = Color(0xFFBAC1C9);
  static const Color text = Color(0xFF171D26);
  static const Color textMuted = Color(0xFF555F6D);
  static const Color textSubtle = Color(0xFF818A98);
  static const Color primary = Color(0xFF1C4192);
  static const Color primaryHover = Color(0xFF153579);
  static const Color primarySoft = Color(0xFFE1E9FA);
  static const Color accent = Color(0xFFD08011);
  static const Color success = Color(0xFF1D8B46);
  static const Color successSoft = Color(0xFFE2F8EA);
  static const Color warning = Color(0xFFCE8509);
  static const Color warningSoft = Color(0xFFFEF5DD);
  static const Color danger = Color(0xFFC11F1F);
  static const Color dangerSoft = Color(0xFFFCE4E4);
  static const Color info = Color(0xFF0B75CB);
  static const Color infoSoft = Color(0xFFDDF0FE);
  static const Color sidebar = Color(0xFF1C2131);
  static const Color teal = Color(0xFF22A08D);
  static const Color tealSoft = Color(0xFFDEF7F3);

  static const Color statusAvailable = Color(0xFF22C55E);
  static const Color statusBlocked = Color(0xFFEAB308);
  static const Color statusTokenPaid = Color(0xFF3B82F6);
  static const Color statusSold = Color(0xFFEF4444);
  static const Color statusMaintenance = Color(0xFF6B7280);
}

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      surface: AppColors.surface,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
      textTheme: _textTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.text,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: AppColors.text,
        ),
      ),
      dividerColor: AppColors.border,
      cardTheme: const CardThemeData(
        elevation: 0,
        color: AppColors.surface,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          side: BorderSide(color: AppColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        hintStyle: const TextStyle(color: AppColors.textSubtle),
        labelStyle: const TextStyle(color: AppColors.textMuted),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.borderStrong),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.borderStrong),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(44, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.borderStrong),
          minimumSize: const Size(44, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.sidebar,
        contentTextStyle: const TextStyle(color: Colors.white, fontSize: 14),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSubtle,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primarySoft,
        labelTextStyle: WidgetStatePropertyAll(
          const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected)
                ? AppColors.primary
                : AppColors.textSubtle,
          ),
        ),
      ),
      tabBarTheme: TabBarThemeData(
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSubtle,
        indicatorColor: AppColors.primary,
        labelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 14),
        dividerColor: AppColors.border,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surfaceMuted,
        selectedColor: AppColors.primarySoft,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: const BorderSide(color: AppColors.border),
        labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
      ),
    );
  }

  static TextTheme _textTheme() {
    const font = 'Inter';
    return const TextTheme(
      displayLarge: TextStyle(fontFamily: font, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: AppColors.text),
      headlineLarge: TextStyle(fontFamily: font, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: AppColors.text),
      headlineMedium: TextStyle(fontFamily: font, fontWeight: FontWeight.w700, color: AppColors.text),
      headlineSmall: TextStyle(fontFamily: font, fontWeight: FontWeight.w600, color: AppColors.text),
      titleLarge: TextStyle(fontFamily: font, fontWeight: FontWeight.w600, color: AppColors.text),
      titleMedium: TextStyle(fontFamily: font, fontWeight: FontWeight.w600, color: AppColors.text),
      titleSmall: TextStyle(fontFamily: font, fontWeight: FontWeight.w600, color: AppColors.text),
      bodyLarge: TextStyle(fontFamily: font, color: AppColors.text, height: 1.5),
      bodyMedium: TextStyle(fontFamily: font, color: AppColors.text, height: 1.5),
      bodySmall: TextStyle(fontFamily: font, color: AppColors.textMuted, height: 1.4),
      labelLarge: TextStyle(fontFamily: font, color: AppColors.text),
      labelMedium: TextStyle(fontFamily: font, color: AppColors.text),
      labelSmall: TextStyle(fontFamily: font, fontWeight: FontWeight.w600, color: AppColors.textMuted),
    );
  }
}
