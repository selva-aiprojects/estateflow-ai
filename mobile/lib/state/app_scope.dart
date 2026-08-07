import 'package:flutter/widgets.dart';

import '../core/api_client.dart';
import '../services/api_service.dart';
import '../state/session_controller.dart';

class AppScope extends InheritedWidget {
  const AppScope({
    super.key,
    required this.session,
    required this.api,
    required this.client,
    required super.child,
  });

  final SessionController session;
  final ApiService api;
  final ApiClient client;

  static AppScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope not found in widget tree');
    return scope!;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      session != oldWidget.session || api != oldWidget.api || client != oldWidget.client;
}
