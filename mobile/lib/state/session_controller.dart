import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';
import '../models/auth.dart';
import '../services/api_service.dart';

class SessionController extends ChangeNotifier {
  SessionController(this._api, this._prefs, this._client);

  static const _kCookie = 'estateflow.session_cookie';
  static const _kUser = 'estateflow.session_user';

  final ApiService _api;
  final SharedPreferences _prefs;
  final ApiClient _client;

  AuthUser? _user;
  bool _initializing = true;

  AuthUser? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get initializing => _initializing;

  String get displayName => _user?.displayName ?? 'User';
  String? get primaryRole =>
      (_user?.memberships.isNotEmpty ?? false) ? _user!.memberships.first.role : null;
  String? get tenantName =>
      (_user?.memberships.isNotEmpty ?? false) ? _user!.memberships.first.tenantName : null;

  Future<void> restore() async {
    final cookie = _prefs.getString(_kCookie);
    final userJson = _prefs.getString(_kUser);
    _initializing = false;
    if (cookie != null && cookie.isNotEmpty && userJson != null) {
      _client.setSessionCookie(cookie);
      _user = AuthUser.fromJson(
        (jsonDecode(userJson) as Map).cast<String, dynamic>(),
      );
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final user = await _api.login(email, password);
    _user = user;
    await _persist();
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await _api.logout();
    } catch (_) {
      // session already gone server-side; ignore
    }
    _user = null;
    _client.setSessionCookie(null);
    await _prefs.remove(_kCookie);
    await _prefs.remove(_kUser);
    notifyListeners();
  }

  Future<void> _persist() async {
    final cookie = _client.sessionCookie ?? '';
    await _prefs.setString(_kCookie, cookie);
    await _prefs.setString(_kUser, jsonEncode(_userToJson(_user!)));
  }

  Map<String, dynamic> _userToJson(AuthUser u) => {
        'id': u.id,
        'email': u.email,
        'displayName': u.displayName,
        'isSuperadmin': u.isSuperadmin,
        'memberships': u.memberships
            .map((m) => {
                  'tenantCode': m.tenantCode,
                  'tenantName': m.tenantName,
                  'role': m.role,
                })
            .toList(),
      };
}
