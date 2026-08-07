import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/sales.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';

class LeadsTab extends StatefulWidget {
  const LeadsTab({super.key});

  @override
  State<LeadsTab> createState() => _LeadsTabState();
}

class _LeadsTabState extends State<LeadsTab> {
  int _reloadKey = 0;

  Future<List<Lead>> _load() => AppScope.of(context).api.leads();

  @override
  Widget build(BuildContext context) {
    return AsyncLoader<List<Lead>>(
      key: ValueKey(_reloadKey),
      load: _load,
      onError: 'Leads unavailable',
      builder: (context, leads) {
        if (leads.isEmpty) {
          return const EmptyState(
            icon: Icons.person_search_outlined,
            title: 'No leads in the pipeline',
            hint: 'Inbound enquiries from WhatsApp and IVR appear here.',
          );
        }
        return RefreshIndicator(
          onRefresh: () async => setState(() => _reloadKey++),
          child: ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: leads.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, i) => _LeadCard(
              lead: leads[i],
              onChanged: () async {
                await Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => LeadDetailScreen(lead: leads[i]),
                  ),
                );
                if (mounted) setState(() => _reloadKey++);
              },
            ),
          ),
        );
      },
    );
  }
}

class _LeadCard extends StatelessWidget {
  const _LeadCard({required this.lead, required this.onChanged});
  final Lead lead;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onChanged,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: _scoreColor(lead.score).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${lead.score.round()}',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _scoreColor(lead.score),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lead.name,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${lead.phone} · ${lead.source}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                        ),
                      ],
                    ),
                  ),
                  StatusPill(label: _statusLabel(lead.status), color: _statusColor(lead.status)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _Meta(label: 'Project', value: lead.project),
                  _Meta(label: 'Type', value: lead.unitType),
                  _Meta(label: 'Budget', value: Fmt.moneyCompact(lead.budget)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _scoreColor(num score) {
    if (score >= 80) return AppColors.success;
    if (score >= 50) return AppColors.warning;
    return AppColors.textSubtle;
  }

  Color _statusColor(String status) => switch (status) {
        'won' => AppColors.success,
        'contacted' || 'qualified' => AppColors.info,
        'site_visit_scheduled' || 'booking_initiated' => AppColors.warning,
        'lost' => AppColors.textSubtle,
        _ => AppColors.primary,
      };

  String _statusLabel(String status) => status.replaceAll('_', ' ');
}

class _Meta extends StatelessWidget {
  const _Meta({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.textSubtle),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.text),
          ),
        ],
      ),
    );
  }
}

class LeadDetailScreen extends StatefulWidget {
  const LeadDetailScreen({super.key, required this.lead});
  final Lead lead;

  @override
  State<LeadDetailScreen> createState() => _LeadDetailScreenState();
}

class _LeadDetailScreenState extends State<LeadDetailScreen> {
  static const _statuses = [
    'new',
    'contacted',
    'qualified',
    'site_visit_scheduled',
    'booking_initiated',
    'won',
    'lost',
  ];

  Lead? _lead;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _lead = widget.lead;
  }

  Future<void> _move(String status) async {
    setState(() => _busy = true);
    try {
      final updated = await AppScope.of(context).api.leadUpdate(_lead!.id, status: status);
      if (mounted) {
        setState(() => _lead = updated);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Moved to ${status.replaceAll('_', ' ')}')),
        );
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
    final l = _lead!;
    return Scaffold(
      appBar: AppBar(title: Text(l.name)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          SectionCard(
            title: 'Lead details',
            child: Column(
              children: [
                RowLabel(label: 'Phone', value: l.phone),
                RowLabel(label: 'Source', value: l.source),
                RowLabel(label: 'Segment', value: l.segment),
                RowLabel(label: 'Project', value: l.project),
                RowLabel(label: 'Unit type', value: l.unitType),
                RowLabel(label: 'Budget', value: Fmt.money(l.budget)),
                RowLabel(label: 'AI score', value: '${l.score.round()}%'),
                RowLabel(label: 'Assigned to', value: l.assigned),
                RowLabel(label: 'Created', value: Fmt.dateTime(l.createdAt)),
              ],
            ),
          ),
          const SizedBox(height: 18),
          SectionCard(
            title: 'Move stage',
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final s in _statuses)
                  ChoiceChip(
                    label: Text(s.replaceAll('_', ' ')),
                    selected: l.status == s,
                    onSelected: _busy ? null : (_) => _move(s),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
