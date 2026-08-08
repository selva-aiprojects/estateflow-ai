class AppConfig {
  AppConfig._();

  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'https://estateflow.cybelinx.com',
  );

  static const String appName = 'EstateFlow';
}
