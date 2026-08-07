import '../core/api_client.dart';
import '../models/auth.dart';
import '../models/dashboard.dart';
import '../models/portal.dart';
import '../models/sales.dart';
import '../models/ai_command.dart';

class ApiService {
  ApiService(this._client);

  final ApiClient _client;

  // ── Auth ────────────────────────────────────────────────────────────────

  Future<AuthUser> login(String email, String password) async {
    final data = await _client.post('/api/auth/login', {
      'email': email,
      'password': password,
    }) as Map<String, dynamic>;
    return AuthUser.fromJson(data);
  }

  Future<AuthUser?> me() async {
    final data = await _client.get('/api/auth/me');
    if (data == null) return null;
    return AuthUser.fromJson(data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _client.post('/api/auth/logout');
  }

  // ── Portal ──────────────────────────────────────────────────────────────

  Future<PortalPayload> portal() async {
    final data = await _client.get('/api/portal');
    return PortalPayload.fromJson(data as Map<String, dynamic>);
  }

  Future<List<PortalChatMessage>> portalChat() async {
    final data = await _client.get('/api/portal/chat');
    return (data as List)
        .map((e) => PortalChatMessage.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<PortalChatMessage>> portalChatSend(String text) async {
    final data = await _client.post('/api/portal/chat', {'text': text});
    return (data as List)
        .map((e) => PortalChatMessage.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> portalRsvp(String eventId, String status) async {
    await _client.post('/api/portal/events/rsvp', {
      'eventId': eventId,
      'status': status,
    });
  }

  Future<PortalKyc> portalKyc(String pan, String aadhaarLast4) async {
    final data = await _client.post('/api/portal/kyc', {
      'pan': pan,
      'aadhaarLast4': aadhaarLast4,
    });
    return PortalKyc.fromJson(data as Map<String, dynamic>);
  }

  Future<void> portalListing({
    required String listingType,
    required String title,
    String? description,
    required num price,
  }) async {
    await _client.post('/api/portal/listings', {
      'listingType': listingType,
      'title': title,
      if (description != null && description.isNotEmpty) 'description': description,
      'price': price,
    });
  }

  Future<void> portalPay({required String lineId, required num amount}) async {
    await _client.post('/api/portal/pay', {'lineId': lineId, 'amount': amount});
  }

  Future<List<String>> portalPossessionSign(String step) async {
    final data = await _client.post('/api/portal/possession', {'step': step});
    return ((data as Map<String, dynamic>)['signed'] as List).cast<String>();
  }

  Future<PortalTicket> portalTicketCreate({
    required String category,
    required String priority,
    required String subject,
    String? description,
  }) async {
    final data = await _client.post('/api/portal/tickets', {
      'category': category,
      'priority': priority,
      'subject': subject,
      if (description != null && description.isNotEmpty) 'description': description,
    });
    return PortalTicket.fromJson(data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> portalTicketThread(String id) async {
    final data = await _client.get('/api/portal/tickets/$id');
    return data as Map<String, dynamic>;
  }

  Future<void> portalTicketComment(String id, String body) async {
    await _client.post('/api/portal/tickets/$id/comments', {'body': body});
  }

  Future<Map<String, dynamic>> portalTicketEscalate(String id) async {
    final data = await _client.patch('/api/portal/tickets/$id', {'action': 'escalate'});
    return data as Map<String, dynamic>;
  }

  // ── Sales ───────────────────────────────────────────────────────────────

  Future<List<Lead>> leads() async {
    final data = await _client.get('/api/leads');
    return (data as List)
        .map((e) => Lead.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Lead> leadCreate(Map<String, dynamic> lead) async {
    final data = await _client.post('/api/leads', lead);
    return Lead.fromJson(data as Map<String, dynamic>);
  }

  Future<Lead> leadUpdate(String id, {String? status, String? assigned}) async {
    final data = await _client.patch('/api/leads/$id', {
      'status': ?status,
      'assigned': ?assigned,
    });
    return Lead.fromJson(data as Map<String, dynamic>);
  }

  Future<InventoryPayload> inventory() async {
    final data = await _client.get('/api/inventory');
    return InventoryPayload.fromJson(data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> inventoryLock(String unitId) async {
    final data = await _client.patch('/api/inventory/$unitId', {'hold': true});
    return data as Map<String, dynamic>;
  }

  Future<Unit> inventoryUpdate(String unitId, String status) async {
    final data = await _client.patch('/api/inventory/$unitId', {'status': status});
    return Unit.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Quote>> quotes() async {
    final data = await _client.get('/api/quotes');
    return (data as List)
        .map((e) => Quote.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<({Quote quote, bool needsApproval})> quoteCreate({
    String? customer,
    String? projectId,
    String? unitId,
    String segment = 'apartments',
    num discountPct = 0,
    String? salesExecutive,
  }) async {
    final data = await _client.post('/api/quotes', {
      'customer': ?customer,
      'projectId': ?projectId,
      'unitId': ?unitId,
      'segment': segment,
      'discountPct': discountPct,
      'salesExecutive': ?salesExecutive,
    }) as Map<String, dynamic>;
    return (
      quote: Quote.fromJson(data['quote'] as Map<String, dynamic>),
      needsApproval: data['needsApproval'] as bool? ?? false,
    );
  }

  Future<Quote> quoteAction(String id, String action) async {
    final data = await _client.patch('/api/quotes/$id', {'action': action});
    return Quote.fromJson(data as Map<String, dynamic>);
  }

  // ── Management ──────────────────────────────────────────────────────────

  Future<DashboardPayload> dashboard() async {
    final data = await _client.get('/api/dashboard');
    return DashboardPayload.fromJson(data as Map<String, dynamic>);
  }

  Future<List<AppNotification>> notifications() async {
    final data = await _client.get('/api/notifications');
    return (data as List)
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<AiCommandPayload> aiCommand() async {
    final data = await _client.get('/api/ai-command');
    return AiCommandPayload.fromJson(data as Map<String, dynamic>);
  }
}
