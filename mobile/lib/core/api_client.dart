import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.status});
  final String message;
  final int? status;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({String? baseUrl, http.Client? client})
      : _baseUrl = baseUrl ?? AppConfig.apiBase,
        _client = client ?? http.Client();

  final String _baseUrl;
  final http.Client _client;
  String? _sessionCookie;

  String get baseUrl => _baseUrl;

  String? get sessionCookie => _sessionCookie;

  void setSessionCookie(String? cookie) => _sessionCookie = cookie;

  Uri _uri(String path) => Uri.parse('$_baseUrl$path');

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        'Cookie': ?_sessionCookie,
      };

  Future<dynamic> get(String path) async {
    final res = await _client.get(_uri(path), headers: _headers());
    return _decode(res);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await _client.post(
      _uri(path),
      headers: _headers(),
      body: body == null ? null : jsonEncode(body),
    );
    _captureCookie(res);
    return _decode(res);
  }

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) async {
    final res = await _client.patch(
      _uri(path),
      headers: _headers(),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(res);
  }

  void _captureCookie(http.Response res) {
    final setCookie = res.headers['set-cookie'];
    if (setCookie != null && setCookie.contains('estateflow_session=')) {
      _sessionCookie = setCookie.split(';').first;
    }
  }

  dynamic _decode(http.Response res) {
    Map<String, dynamic>? json;
    try {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) json = decoded;
    } catch (_) {
      json = null;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (json != null && json.containsKey('data')) return json['data'];
      return json;
    }

    final message = json?['error']?.toString() ?? 'Request failed';
    throw ApiException(message, status: res.statusCode);
  }
}
