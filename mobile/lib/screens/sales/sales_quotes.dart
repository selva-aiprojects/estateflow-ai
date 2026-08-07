import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/sales.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';

class QuotesTab extends StatefulWidget {
  const QuotesTab({super.key});

  @override
  State<QuotesTab> createState() => _QuotesTabState();
}

class _QuotesTabState extends State<QuotesTab> {
  int _reloadKey = 0;

  Future<List<Quote>> _load() => AppScope.of(context).api.quotes();

  @override
  Widget build(BuildContext context) {
    return AsyncLoader<List<Quote>>(
      key: ValueKey(_reloadKey),
      load: _load,
      onError: 'Quotes unavailable',
      builder: (context, quotes) {
        if (quotes.isEmpty) {
          return const EmptyState(
            icon: Icons.description_outlined,
            title: 'No quotes yet',
            hint: 'Generate a quote from the Inventory tab.',
          );
        }
        final pending = quotes.where((q) => q.status == 'pending_approval').toList();
        return RefreshIndicator(
          onRefresh: () async => setState(() => _reloadKey++),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: [
              if (pending.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.warningSoft,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.warning),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${pending.length} quote(s) await approval',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.warning),
                      ),
                      const SizedBox(height: 8),
                      for (final q in pending.take(3))
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '${q.quoteNo} · ${q.customer}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.text),
                                ),
                              ),
                              TextButton(
                                onPressed: () => _approve(q),
                                style: TextButton.styleFrom(
                                  foregroundColor: AppColors.success,
                                  minimumSize: const Size(0, 32),
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                ),
                                child: const Text('Approve'),
                              ),
                              TextButton(
                                onPressed: () => _reject(q),
                                style: TextButton.styleFrom(
                                  foregroundColor: AppColors.danger,
                                  minimumSize: const Size(0, 32),
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                ),
                                child: const Text('Reject'),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              for (final q in quotes)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _QuoteCard(quote: q),
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _approve(Quote q) => _action(q, 'approve', 'Quote approved');
  Future<void> _reject(Quote q) => _action(q, 'reject', 'Quote cancelled');

  Future<void> _action(Quote q, String action, String message) async {
    try {
      await AppScope.of(context).api.quoteAction(q.id, action);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
        setState(() => _reloadKey++);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }
}

class _QuoteCard extends StatelessWidget {
  const _QuoteCard({required this.quote});
  final Quote quote;

  @override
  Widget build(BuildContext context) {
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
          Row(
            children: [
              Text(
                quote.quoteNo,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              const Spacer(),
              StatusPill(label: quote.status.replaceAll('_', ' '), color: _statusColor(quote.status)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            quote.customer,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
          ),
          const SizedBox(height: 3),
          Text(
            '${quote.project} · ${quote.unit}',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                Fmt.money(quote.base),
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.textSubtle,
                  decoration: quote.discountPct > 0 ? TextDecoration.lineThrough : null,
                ),
              ),
              if (quote.discountPct > 0) ...[
                const SizedBox(width: 8),
                Text(
                  '-${quote.discountPct.toStringAsFixed(0)}%',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.success),
                ),
              ],
              const Spacer(),
              Text(
                Fmt.money(quote.total),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.text),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '${quote.salesExecutive} · ${Fmt.date(quote.createdAt)} · ${quote.segment}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
          ),
        ],
      ),
    );
  }

  Color _statusColor(String status) => switch (status) {
        'approved' || 'accepted' => AppColors.success,
        'pending_approval' => AppColors.warning,
        'cancelled' || 'expired' => AppColors.textSubtle,
        _ => AppColors.info,
      };
}
