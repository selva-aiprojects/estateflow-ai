import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/portal.dart';
import '../../state/app_scope.dart';
import '../../widgets/common.dart';

enum PortalSection {
  statement,
  payments,
  support,
  updates,
  possession,
  kyc,
  chat,
  events,
  rewards,
  marketplace,
  loans,
  warranty,
  documents,
  amenities,
}

class PortalSectionScreen extends StatelessWidget {
  const PortalSectionScreen({super.key, required this.section, required this.payload});

  final PortalSection section;
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final title = switch (section) {
      PortalSection.statement => 'Statement of account',
      PortalSection.payments => 'Payments & tax',
      PortalSection.support => 'Support',
      PortalSection.updates => 'Site updates',
      PortalSection.possession => 'Possession',
      PortalSection.kyc => 'KYC verification',
      PortalSection.chat => 'Ask EstateFlow AI',
      PortalSection.events => 'Homeowner events',
      PortalSection.rewards => 'Rewards & referrals',
      PortalSection.marketplace => 'Community marketplace',
      PortalSection.loans => 'Home loans',
      PortalSection.warranty => 'Warranty & handover',
      PortalSection.documents => 'Documents',
      PortalSection.amenities => 'Amenities',
    };
    final body = switch (section) {
      PortalSection.statement => _StatementSection(payload: payload),
      PortalSection.payments => _PaymentsSection(payload: payload),
      PortalSection.support => _SupportSection(payload: payload),
      PortalSection.updates => _UpdatesSection(payload: payload),
      PortalSection.possession => _PossessionSection(payload: payload),
      PortalSection.kyc => _KycSection(payload: payload),
      PortalSection.chat => _ChatSection(payload: payload),
      PortalSection.events => _EventsSection(payload: payload),
      PortalSection.rewards => _RewardsSection(payload: payload),
      PortalSection.marketplace => _MarketplaceSection(payload: payload),
      PortalSection.loans => _LoansSection(payload: payload),
      PortalSection.warranty => _WarrantySection(payload: payload),
      PortalSection.documents => _DocumentsSection(payload: payload),
      PortalSection.amenities => _AmenitiesSection(payload: payload),
    };
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: body,
    );
  }
}

// ── Statement ────────────────────────────────────────────────────────────

class _StatementSection extends StatelessWidget {
  const _StatementSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final l = payload.ledger;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${l.paidPct}% paid',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${Fmt.money(l.paid)} of ${Fmt.money(l.total)}',
                style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8)),
              ),
              const SizedBox(height: 10),
              ProgressBar(
                value: l.paidPct / 100,
                color: Colors.white,
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SectionCard(
          title: 'Payments due',
          child: Row(
            children: [
              Text(
                Fmt.money(l.due),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.danger),
              ),
              const SizedBox(width: 8),
              const Text(
                'outstanding',
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        SectionCard(
          title: 'Receipts',
          child: l.receipts.isEmpty
              ? const EmptyState(icon: Icons.receipt_long_outlined, title: 'No receipts yet')
              : Column(
                  children: [
                    for (final r in l.receipts)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: AppColors.successSoft,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              child: const Icon(Icons.check_rounded, color: AppColors.success, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    r.desc,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${r.no} · ${Fmt.date(r.date)} · ${r.mode}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              Fmt.money(r.amount),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
      ],
    );
  }
}

// ── Payments & tax ───────────────────────────────────────────────────────

class _PaymentsSection extends StatefulWidget {
  const _PaymentsSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_PaymentsSection> createState() => _PaymentsSectionState();
}

class _PaymentsSectionState extends State<_PaymentsSection> {
  bool _paying = false;
  String? _payResult;

  Future<void> _pay(PortalInstalment inst) async {
    setState(() {
      _paying = true;
      _payResult = null;
    });
    try {
      await AppScope.of(context).api.portalPay(
            lineId: inst.id,
            amount: inst.amount.toDouble(),
          );
      if (mounted) {
        setState(() => _payResult = 'Paid ${inst.name} — receipt generated.');
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) setState(() => _payResult = e.toString());
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.payload;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'GST statement',
          child: Column(
            children: [
              RowLabel(label: 'Base amount', value: Fmt.money(p.tax.baseAmount)),
              RowLabel(label: 'CGST', value: Fmt.money(p.tax.cgst)),
              RowLabel(label: 'SGST', value: Fmt.money(p.tax.sgst)),
              RowLabel(label: 'IGST', value: Fmt.money(p.tax.igst)),
              RowLabel(label: 'TDS', value: '- ${Fmt.money(p.tax.tds)}', valueColor: AppColors.danger),
              const Divider(height: 20),
              RowLabel(label: 'Total', value: Fmt.money(p.tax.total), valueColor: AppColors.primary),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Payment schedule',
          child: Column(
            children: [
              for (final inst in p.instalments)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              inst.name,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                            ),
                          ),
                          if (inst.paid)
                            const StatusPill(label: 'Paid', color: AppColors.success)
                          else
                            Text(
                              Fmt.money(inst.amount),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                            ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              inst.paid ? 'Received on ${Fmt.date(inst.paidOn)}' : 'Due ${Fmt.date(inst.due)}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                            ),
                          ),
                          if (!inst.paid)
                            TextButton(
                              onPressed: _paying ? null : () => _pay(inst),
                              child: const Text('Pay now'),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        if (_payResult != null)
          Padding(
            padding: const EdgeInsets.only(top: 14),
            child: Text(
              _payResult!,
              style: TextStyle(
                fontSize: 13,
                color: _payResult!.startsWith('Paid') ? AppColors.success : AppColors.danger,
              ),
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Support / tickets ────────────────────────────────────────────────────

class _SupportSection extends StatelessWidget {
  const _SupportSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Raise a request',
          child: FilledButton.icon(
            onPressed: () async {
              final changed = await Navigator.of(context).push<bool>(
                MaterialPageRoute(builder: (_) => const _NewTicketScreen()),
              );
              if (changed == true && context.mounted) {
                Navigator.of(context).pop(true);
              }
            },
            icon: const Icon(Icons.add_rounded, size: 18),
            label: const Text('New support ticket'),
          ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Your tickets (${payload.tickets.length})',
          child: payload.tickets.isEmpty
              ? const EmptyState(icon: Icons.support_agent_outlined, title: 'No tickets yet')
              : Column(
                  children: [
                    for (final t in payload.tickets)
                      InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () async {
                          final changed = await Navigator.of(context).push<bool>(
                            MaterialPageRoute(builder: (_) => _TicketThreadScreen(ticket: t)),
                          );
                          if (changed == true && context.mounted) {
                            Navigator.of(context).pop(true);
                          }
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      t.subject,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                    ),
                                  ),
                                  StatusPill(label: t.status, color: _ticketColor(t.status)),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${t.no} · ${t.category} · ${t.priority} · ${t.ageDays}d',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'KYC status',
          child: Row(
            children: [
              Icon(
                payload.kyc.status == 'verified' ? Icons.verified_rounded : Icons.error_outline_rounded,
                size: 20,
                color: payload.kyc.status == 'verified' ? AppColors.success : AppColors.warning,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  payload.kyc.status == 'verified'
                      ? 'KYC verified'
                      : 'Complete your KYC to unlock full portal access',
                  style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const _KycFormScreen()),
                ),
                child: Text(payload.kyc.status == 'verified' ? 'View' : 'Complete'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        const SectionCard(
          title: 'Contact the desk',
          child: Row(
            children: [
              _DeskAction(icon: Icons.phone_outlined, label: 'Call', value: '+91 80 4700 2200'),
              SizedBox(width: 12),
              _DeskAction(icon: Icons.chat_outlined, label: 'WhatsApp', value: '+91 80 4700 2200'),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Color _ticketColor(String status) => switch (status) {
        'resolved' || 'closed' => AppColors.success,
        'in_progress' || 'assigned' => AppColors.info,
        'on_hold' => AppColors.warning,
        _ => AppColors.danger,
      };
}

class _DeskAction extends StatelessWidget {
  const _DeskAction({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, size: 22, color: AppColors.primary),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.text)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 11, color: AppColors.textSubtle)),
        ],
      ),
    );
  }
}

class _NewTicketScreen extends StatefulWidget {
  const _NewTicketScreen();

  @override
  State<_NewTicketScreen> createState() => _NewTicketScreenState();
}

class _NewTicketScreenState extends State<_NewTicketScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subject = TextEditingController();
  final _desc = TextEditingController();
  String _category = 'Snagging';
  String _priority = 'medium';
  bool _busy = false;

  static const categories = ['Plumbing', 'Electrical', 'Snagging', 'Appliances', 'Interiors', 'Other'];
  static const priorities = ['low', 'medium', 'high', 'urgent'];

  @override
  void dispose() {
    _subject.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await AppScope.of(context).api.portalTicketCreate(
            category: _category,
            priority: _priority,
            subject: _subject.text.trim(),
            description: _desc.text.trim(),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ticket raised — our team will follow up.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New support ticket')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const _FieldLabel('Category'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final c in categories)
                  ChoiceChip(
                    label: Text(c),
                    selected: _category == c,
                    onSelected: (_) => setState(() => _category = c),
                  ),
              ],
            ),
            const SizedBox(height: 18),
            const _FieldLabel('Priority'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final p in priorities)
                  ChoiceChip(
                    label: Text(p),
                    selected: _priority == p,
                    onSelected: (_) => setState(() => _priority = p),
                  ),
              ],
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _subject,
              maxLength: 240,
              decoration: const InputDecoration(labelText: 'Subject'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Subject is required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _desc,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Describe the issue', alignLabelWithHint: true),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: _busy
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Submit ticket'),
            ),
          ],
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textMuted),
    );
  }
}

class _TicketThreadScreen extends StatefulWidget {
  const _TicketThreadScreen({required this.ticket});
  final PortalTicket ticket;

  @override
  State<_TicketThreadScreen> createState() => _TicketThreadScreenState();
}

class _TicketThreadScreenState extends State<_TicketThreadScreen> {
  Map<String, dynamic>? _thread;
  bool _loading = true;
  String? _error;
  final _comment = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final t = await AppScope.of(context).api.portalTicketThread(widget.ticket.id);
      if (mounted) setState(() => _thread = t);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _send() async {
    if (_comment.text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      await AppScope.of(context).api.portalTicketComment(widget.ticket.id, _comment.text.trim());
      _comment.clear();
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment added.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _escalate() async {
    try {
      await AppScope.of(context).api.portalTicketEscalate(widget.ticket.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Escalated to urgent — support will call you.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.ticket;
    return Scaffold(
      appBar: AppBar(title: Text(t.subject)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
            child: Row(
              children: [
                StatusPill(label: t.status, color: AppColors.info),
                const SizedBox(width: 8),
                Text(
                  '${t.no} · ${t.category}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
                const Spacer(),
                OutlinedButton(
                  onPressed: _escalate,
                  child: const Text('Escalate'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: _loading
                ? const LoadingBlock()
                : _error != null
                    ? ErrorRetry(message: _error!, onRetry: _load)
                    : _buildThread(),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _comment,
                      decoration: const InputDecoration(hintText: 'Add a comment…', contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
                      minLines: 1,
                      maxLines: 3,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _send,
                    icon: const Icon(Icons.send_rounded, size: 18),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThread() {
    final comments = (_thread?['comments'] as List?) ?? [];
    if (comments.isEmpty) {
      return const EmptyState(icon: Icons.forum_outlined, title: 'No comments yet', hint: 'Support will respond here.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: comments.length,
      itemBuilder: (context, i) {
        final c = comments[i] as Map<String, dynamic>;
        final body = c['body'] as String? ?? '';
        final isInternal = c['isInternal'] as bool? ?? false;
        final time = c['createdAt'] as String? ?? '';
        return Align(
          alignment: Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
            decoration: BoxDecoration(
              color: isInternal ? AppColors.warningSoft : AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isInternal ? AppColors.warning : AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  body,
                  style: const TextStyle(fontSize: 13, color: AppColors.text),
                ),
                const SizedBox(height: 4),
                Text(
                  '${isInternal ? 'EstateFlow team' : 'You'} · ${Fmt.dateTime(time)}',
                  style: const TextStyle(fontSize: 10, color: AppColors.textSubtle),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Site updates ─────────────────────────────────────────────────────────

class _UpdatesSection extends StatelessWidget {
  const _UpdatesSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final photos = payload.photos;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (photos.isEmpty)
          const EmptyState(icon: Icons.photo_camera_outlined, title: 'No site photos yet')
        else ...[
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
            ),
            itemCount: photos.length,
            itemBuilder: (context, i) {
              final ph = photos[i];
              return ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  color: AppColors.surfaceMuted,
                  child: ph.mediaType == 'video'
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.play_circle_outline, size: 34, color: AppColors.primary),
                            const SizedBox(height: 6),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                ph.caption,
                                maxLines: 2,
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                            ),
                          ],
                        )
                      : Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(
                              ph.url,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => Container(
                                color: AppColors.surfaceMuted,
                                child: const Icon(Icons.image_outlined, size: 30, color: AppColors.textSubtle),
                              ),
                            ),
                            Positioned(
                              left: 0,
                              right: 0,
                              bottom: 0,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                color: Colors.black.withValues(alpha: 0.5),
                                child: Text(
                                  '${ph.caption} · ${Fmt.shortDate(ph.shotOn)}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 10, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                ),
              );
            },
          ),
        ],
        const SizedBox(height: 20),
        SectionCard(
          title: 'Recent updates',
          child: payload.updates.isEmpty
              ? const EmptyState(icon: Icons.campaign_outlined, title: 'No updates yet')
              : Column(
                  children: [
                    for (final u in payload.updates)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  '${u.tower} · ${u.progress}%',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                ),
                                const Spacer(),
                                Text(
                                  Fmt.date(u.date),
                                  style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              u.note,
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '— ${u.engineer}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Possession ───────────────────────────────────────────────────────────

class _PossessionSection extends StatefulWidget {
  const _PossessionSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_PossessionSection> createState() => _PossessionSectionState();
}

class _PossessionSectionState extends State<_PossessionSection> {
  bool _signing = false;

  Future<void> _sign(String name) async {
    setState(() => _signing = true);
    try {
      await AppScope.of(context).api.portalPossessionSign(name);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Step signed off.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _signing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ps = widget.payload.possession;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Handover checklist',
          trailing: Text(
            'Possession ${ps.possessionDate}',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
          ),
          child: Column(
            children: [
              for (final s in ps.steps)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Icon(
                        s.status == 'done' ? Icons.check_circle_rounded : Icons.circle_outlined,
                        size: 18,
                        color: s.status == 'done' ? AppColors.success : AppColors.textSubtle,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          s.name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: s.status == 'done' ? FontWeight.w600 : FontWeight.w400,
                            color: s.status == 'done' ? AppColors.text : AppColors.textMuted,
                          ),
                        ),
                      ),
                      if (s.status == 'done')
                        const Text('Signed', style: TextStyle(fontSize: 11, color: AppColors.success))
                      else if (s.status == 'scheduled')
                        Text(
                          (s.date ?? '').trim(),
                          style: const TextStyle(fontSize: 11, color: AppColors.info),
                        )
                      else
                        TextButton(
                          onPressed: _signing ? null : () => _sign(s.name),
                          child: const Text('Sign off'),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Snag list',
          child: ps.snags.isEmpty
              ? const EmptyState(icon: Icons.check_circle_outline, title: 'No open snags')
              : Column(
                  children: [
                    for (final s in ps.snags)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    s.title,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                  ),
                                ),
                                StatusPill(
                                  label: s.status,
                                  color: s.status == 'resolved' ? AppColors.success : AppColors.warning,
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${s.no} · ${s.category} · raised ${Fmt.date(s.raised)}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Warranty documents',
          child: widget.payload.warranty.isEmpty
              ? const EmptyState(icon: Icons.verified_outlined, title: 'No warranty docs yet')
              : Column(
                  children: [
                    for (final w in widget.payload.warranty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            const Icon(Icons.description_outlined, size: 18, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                w.title,
                                style: const TextStyle(fontSize: 13, color: AppColors.text),
                              ),
                            ),
                            StatusPill(label: w.status, color: AppColors.info),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── KYC ──────────────────────────────────────────────────────────────────

class _KycSection extends StatelessWidget {
  const _KycSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final k = payload.kyc;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Verification status',
          child: Row(
            children: [
              Icon(
                k.status == 'verified' ? Icons.verified_rounded : Icons.error_outline_rounded,
                size: 26,
                color: k.status == 'verified' ? AppColors.success : AppColors.warning,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  k.status == 'verified' ? 'You are verified — full portal access unlocked.' : 'KYC pending. Complete verification below.',
                  style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (k.status == 'verified')
          SectionCard(
            title: 'Your details',
            child: Column(
              children: [
                RowLabel(label: 'PAN', value: k.pan.isEmpty ? '—' : k.pan),
                RowLabel(label: 'Aadhaar (last 4)', value: k.aadhaarLast4.isEmpty ? '—' : k.aadhaarLast4),
              ],
            ),
          )
        else
          SectionCard(
            title: 'Complete KYC',
            child: TextButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const _KycFormScreen()),
              ),
              child: const Text('Start verification →'),
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _KycFormScreen extends StatefulWidget {
  const _KycFormScreen();

  @override
  State<_KycFormScreen> createState() => _KycFormScreenState();
}

class _KycFormScreenState extends State<_KycFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pan = TextEditingController();
  final _aadhaar = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _pan.dispose();
    _aadhaar.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await AppScope.of(context).api.portalKyc(
            _pan.text.trim().toUpperCase(),
            _aadhaar.text.trim(),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('KYC verified.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('KYC verification')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const SectionCard(
              title: 'Why KYC?',
              child: Text(
                'KYC is mandatory under RERA to complete your purchase. Your PAN and Aadhaar are stored securely and hashed.',
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _pan,
              textCapitalization: TextCapitalization.characters,
              maxLength: 10,
              decoration: const InputDecoration(labelText: 'PAN'),
              validator: (v) {
                final val = (v ?? '').trim().toUpperCase();
                if (!RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]$').hasMatch(val)) {
                  return 'Enter a valid 10-character PAN';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _aadhaar,
              keyboardType: TextInputType.number,
              maxLength: 4,
              decoration: const InputDecoration(labelText: 'Aadhaar (last 4 digits)'),
              validator: (v) =>
                  RegExp(r'^\d{4}$').hasMatch((v ?? '').trim()) ? null : 'Enter the last 4 digits',
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: _busy
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Verify KYC'),
            ),
          ],
        ),
      ),
    );
  }
}

// ── AI chat ──────────────────────────────────────────────────────────────

class _ChatSection extends StatefulWidget {
  const _ChatSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_ChatSection> createState() => _ChatSectionState();
}

class _ChatSectionState extends State<_ChatSection> {
  List<PortalChatMessage> _messages = [];
  bool _loading = true;
  String? _error;
  final _input = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _messages = [...widget.payload.chat];
    _loading = false;
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_input.text.trim().isEmpty) return;
    setState(() {
      _sending = true;
      _messages.add(PortalChatMessage(from: 'user', text: _input.text.trim()));
    });
    final text = _input.text.trim();
    _input.clear();
    try {
      final result = await AppScope.of(context).api.portalChatSend(text);
      if (mounted) {
        setState(() {
          _messages = [...result];
          _sending = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _sending = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.infoSoft,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Text(
              'Ask about your payments, construction, or any documents. Answers are generated from your project data.',
              style: TextStyle(fontSize: 12, color: AppColors.info),
            ),
          ),
        ),
        Expanded(
          child: _loading
              ? const LoadingBlock()
              : _error != null
                  ? ErrorRetry(message: _error!, onRetry: () {})
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, i) {
                        final m = _messages[i];
                        final isUser = m.from == 'user';
                        return Align(
                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                            decoration: BoxDecoration(
                              color: isUser ? AppColors.primary : AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: isUser ? null : Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              m.text,
                              style: TextStyle(
                                fontSize: 13,
                                color: isUser ? Colors.white : AppColors.text,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _input,
                    decoration: const InputDecoration(hintText: 'Ask a question…'),
                    minLines: 1,
                    maxLines: 3,
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sending ? null : _send,
                  icon: const Icon(Icons.arrow_upward_rounded, size: 18),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ── Events ───────────────────────────────────────────────────────────────

class _EventsSection extends StatefulWidget {
  const _EventsSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_EventsSection> createState() => _EventsSectionState();
}

class _EventsSectionState extends State<_EventsSection> {
  String? _working;

  Future<void> _rsvp(PortalEvent e, String status) async {
    setState(() => _working = e.id);
    try {
      await AppScope.of(context).api.portalRsvp(e.id, status);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Response updated.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.toString())));
      }
    } finally {
      if (mounted) setState(() => _working = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final events = widget.payload.events;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (events.isEmpty)
          const EmptyState(icon: Icons.event_outlined, title: 'No upcoming events')
        else
          for (final e in events)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          e.title,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.text),
                        ),
                      ),
                      StatusPill(label: e.type.replaceAll('_', ' '), color: AppColors.info),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    e.description,
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 13, color: AppColors.textSubtle),
                      const SizedBox(width: 4),
                      Text(
                        Fmt.dateTime(e.startsAt),
                        style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 13, color: AppColors.textSubtle),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          e.location,
                          style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      for (final (label, value) in [('Going', 'going'), ('Interested', 'interested'), ('Declined', 'declined')])
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(label),
                            selected: e.rsvp == value,
                            onSelected: _working == e.id
                                ? null
                                : (_) => _rsvp(e, value),
                          ),
                        ),
                    ],
                  ),
                  if (e.rsvp != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        'Your RSVP: ${e.rsvp!.toUpperCase()}',
                        style: const TextStyle(fontSize: 11, color: AppColors.success),
                      ),
                    ),
                ],
              ),
            ),
        const SizedBox(height: 12),
      ],
    );
  }
}

// ── Rewards ──────────────────────────────────────────────────────────────

class _RewardsSection extends StatelessWidget {
  const _RewardsSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final r = payload.referrals;
    final l = payload.loyalty;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Referral program',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Earn ${Fmt.money(r.reward)} per referral that books',
                style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        r.code,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 2,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: r.code));
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Referral code copied')),
                          );
                        }
                      },
                      icon: const Icon(Icons.copy_rounded, size: 18),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Total earned: ${Fmt.money(r.earned)}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success),
              ),
              if (r.referred.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 4),
                for (final ref in r.referred)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        const Icon(Icons.person_outline, size: 16, color: AppColors.textSubtle),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${ref.name} · ${ref.phone}',
                            style: const TextStyle(fontSize: 12, color: AppColors.text),
                          ),
                        ),
                        StatusPill(
                          label: ref.status,
                          color: ref.status == 'converted' ? AppColors.success : AppColors.info,
                        ),
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Loyalty tier',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    '${l.points} pts',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.accent),
                  ),
                  const SizedBox(width: 10),
                  StatusPill(label: l.tier.toUpperCase(), color: AppColors.accent),
                ],
              ),
              const SizedBox(height: 10),
              for (final perk in l.perks)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      const Icon(Icons.check_rounded, size: 14, color: AppColors.success),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          perk,
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Marketplace ──────────────────────────────────────────────────────────

class _MarketplaceSection extends StatefulWidget {
  const _MarketplaceSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_MarketplaceSection> createState() => _MarketplaceSectionState();
}

class _MarketplaceSectionState extends State<_MarketplaceSection> {
  bool _publishing = false;

  Future<void> _publish() async {
    final scope = AppScope.of(context);
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _PublishListingSheet(),
    );
    if (result == null) return;
    setState(() => _publishing = true);
    try {
      await scope.api.portalListing(
            listingType: result['type'] as String,
            title: result['title'] as String,
            description: result['description'] as String?,
            price: (result['price'] as num),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Listing published to the community.')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _publishing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final listings = widget.payload.listings;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        FilledButton.icon(
          onPressed: _publishing ? null : _publish,
          icon: const Icon(Icons.add_business_outlined, size: 18),
          label: const Text('Publish your listing'),
        ),
        const SizedBox(height: 18),
        if (listings.isEmpty)
          const EmptyState(
            icon: Icons.sell_outlined,
            title: 'No community listings yet',
            hint: 'Publish a resale or rental listing for your unit.',
          )
        else
          SectionCard(
            title: 'Community listings',
            child: Column(
              children: [
                for (final li in listings)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Icon(
                          li.listingType == 'sale' ? Icons.sell_outlined : Icons.home_work_outlined,
                          size: 18,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                li.title,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                Fmt.money(li.price),
                                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                          ),
                        ),
                        StatusPill(label: li.status, color: _listingColor(li.status)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  Color _listingColor(String status) => switch (status) {
        'active' || 'sold' || 'rented' => AppColors.success,
        'draft' => AppColors.warning,
        _ => AppColors.textSubtle,
      };
}

class _PublishListingSheet extends StatefulWidget {
  const _PublishListingSheet();

  @override
  State<_PublishListingSheet> createState() => _PublishListingSheetState();
}

class _PublishListingSheetState extends State<_PublishListingSheet> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _price = TextEditingController();
  String _type = 'sale';

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _price.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop({
      'type': _type,
      'title': _title.text.trim(),
      'description': _desc.text.trim(),
      'price': num.tryParse(_price.text.trim()) ?? 0,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Publish a listing',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.text),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Sale'),
                  selected: _type == 'sale',
                  onSelected: (_) => setState(() => _type = 'sale'),
                ),
                ChoiceChip(
                  label: const Text('Rent'),
                  selected: _type == 'rent',
                  onSelected: (_) => setState(() => _type = 'rent'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _title,
              maxLength: 200,
              decoration: const InputDecoration(labelText: 'Title'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Title is required' : null,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _desc,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Description (optional)'),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _price,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Price'),
              validator: (v) {
                final p = num.tryParse((v ?? '').trim());
                return (p == null || p <= 0) ? 'Enter a positive price' : null;
              },
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _submit, child: const Text('Publish')),
          ],
        ),
      ),
    );
  }
}

// ── Home loans ───────────────────────────────────────────────────────────

class _LoansSection extends StatefulWidget {
  const _LoansSection({required this.payload});
  final PortalPayload payload;

  @override
  State<_LoansSection> createState() => _LoansSectionState();
}

class _LoansSectionState extends State<_LoansSection> {
  double _amount = 5000000;
  double _rate = 8.5;
  int _tenure = 240;

  double get _emi {
    final r = _rate / 12 / 100;
    if (r <= 0) return _amount / _tenure;
    return _amount * r * pow(1 + r, _tenure) / (pow(1 + r, _tenure) - 1);
  }

  @override
  Widget build(BuildContext context) {
    final partners = widget.payload.loanPartners;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'EMI calculator',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Loan amount — ${Fmt.moneyCompact(_amount)}',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              Slider(
                value: _amount,
                min: 1000000,
                max: 20000000,
                divisions: 76,
                onChanged: (v) => setState(() => _amount = v),
              ),
              const SizedBox(height: 8),
              Text(
                'Interest rate — ${_rate.toStringAsFixed(1)}%',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              Slider(
                value: _rate,
                min: 5,
                max: 15,
                divisions: 20,
                onChanged: (v) => setState(() => _rate = v),
              ),
              const SizedBox(height: 8),
              Text(
                'Tenure — ${(_tenure / 12).toStringAsFixed(0)} years',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              Slider(
                value: _tenure.toDouble(),
                min: 12,
                max: 360,
                divisions: 29,
                onChanged: (v) => setState(() => _tenure = v.toInt()),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(
                    'Monthly EMI',
                    style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                  ),
                  const Spacer(),
                  Text(
                    Fmt.money(_emi),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SectionCard(
          title: 'Verified home-loan partners',
          child: partners.isEmpty
              ? const EmptyState(icon: Icons.account_balance_outlined, title: 'No partners yet')
              : Column(
                  children: [
                    for (final pt in partners)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: AppColors.primarySoft,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                pt.name.substring(0, 1),
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primary),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          pt.name,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                        ),
                                      ),
                                      if (pt.verified) ...[
                                        const SizedBox(width: 5),
                                        const Icon(Icons.verified_rounded, size: 13, color: AppColors.success),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${pt.category} · ${pt.city} · ★ ${pt.rating} · ${pt.deals} deals',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${pt.conversion}% conversion',
                                    style: const TextStyle(fontSize: 11, color: AppColors.success),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Warranty ─────────────────────────────────────────────────────────────

class _WarrantySection extends StatelessWidget {
  const _WarrantySection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final w = payload.warranty;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Warranty & handover documents',
          child: w.isEmpty
              ? const EmptyState(icon: Icons.verified_outlined, title: 'No warranty documents yet')
              : Column(
                  children: [
                    for (final d in w)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            const Icon(Icons.description_outlined, size: 18, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                d.title,
                                style: const TextStyle(fontSize: 13, color: AppColors.text),
                              ),
                            ),
                            StatusPill(label: d.status, color: _warrantyColor(d.status)),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Color _warrantyColor(String status) => switch (status) {
        'executed' || 'signed' => AppColors.success,
        'draft' => AppColors.warning,
        _ => AppColors.textSubtle,
      };
}

// ── Documents ────────────────────────────────────────────────────────────

class _DocumentsSection extends StatelessWidget {
  const _DocumentsSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final docs = payload.docs;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SectionCard(
          title: 'Executed documents',
          child: docs.isEmpty
              ? const EmptyState(icon: Icons.folder_open_outlined, title: 'No documents yet')
              : Column(
                  children: [
                    for (final d in docs)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            const Icon(Icons.description_outlined, size: 18, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                d.name,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                              ),
                            ),
                            StatusPill(label: d.tag, color: AppColors.info),
                          ],
                        ),
                      ),
                  ],
                ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Amenities ────────────────────────────────────────────────────────────

class _AmenitiesSection extends StatelessWidget {
  const _AmenitiesSection({required this.payload});
  final PortalPayload payload;

  @override
  Widget build(BuildContext context) {
    final a = payload.amenities;
    return GridView.builder(
      padding: const EdgeInsets.all(20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.4,
      ),
      itemCount: a.length,
      itemBuilder: (context, i) {
        final item = a[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.tealSoft,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(Icons.emoji_objects_outlined, size: 18, color: AppColors.teal),
              ),
              const Spacer(),
              Text(
                item.name,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
              ),
              if (item.detail != null && item.detail!.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  item.detail!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
