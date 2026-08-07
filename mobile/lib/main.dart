import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/api_client.dart';
import 'core/theme.dart';
import 'screens/auth/login_screen.dart';
import 'screens/shell/home_shell.dart';
import 'services/api_service.dart';
import 'state/app_scope.dart';
import 'state/session_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final client = ApiClient();
  final api = ApiService(client);
  final session = SessionController(api, prefs, client);
  await session.restore();
  runApp(EstateFlowApp(session: session, api: api, client: client));
}

class EstateFlowApp extends StatelessWidget {
  const EstateFlowApp({
    super.key,
    required this.session,
    required this.api,
    required this.client,
  });

  final SessionController session;
  final ApiService api;
  final ApiClient client;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EstateFlow',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: AppScope(
        session: session,
        api: api,
        client: client,
        child: AnimatedBuilder(
          animation: session,
          builder: (context, _) {
            if (session.initializing) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            return session.isLoggedIn ? const HomeShell() : const LoginScreen();
          },
        ),
      ),
    );
  }
}
