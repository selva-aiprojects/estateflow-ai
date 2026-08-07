class AuthMembership {
  AuthMembership({
    required this.tenantCode,
    required this.tenantName,
    required this.role,
  });

  final String tenantCode;
  final String tenantName;
  final String role;

  factory AuthMembership.fromJson(Map<String, dynamic> j) => AuthMembership(
        tenantCode: j['tenantCode'] as String? ?? '',
        tenantName: j['tenantName'] as String? ?? '',
        role: j['role'] as String? ?? '',
      );
}

class AuthUser {
  AuthUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.isSuperadmin,
    required this.memberships,
  });

  final String id;
  final String email;
  final String displayName;
  final bool isSuperadmin;
  final List<AuthMembership> memberships;

  factory AuthUser.fromJson(Map<String, dynamic> j) => AuthUser(
        id: j['id'] as String? ?? '',
        email: j['email'] as String? ?? '',
        displayName: j['displayName'] as String? ?? 'User',
        isSuperadmin: j['isSuperadmin'] as bool? ?? false,
        memberships: ((j['memberships'] as List?) ?? [])
            .map((e) => AuthMembership.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
