import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/dashboard.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';
import 'management_ai.dart';
import 'management_notifications.dart';

class ManagementScreen extends StatefulWidget {
  const ManagementScreen({super.key});

  @override
  State<ManagementScreen> createState() => _ManagementScreenState();
}

class _ManagementScreenState extends State<ManagementScreen> {
  int _reloadKey = 0;

  Future<DashboardPayload> _load() => AppScope.of(context).api.dashboard();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Executive dashboard'),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            ),
            icon: const Icon(Icons.notifications_outlined),
          ),
          IconButton(
            tooltip: 'AI Command Center',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const AiCommandScreen()),
            ),
            icon: const Icon(Icons.psychology_outlined),
          ),
        ],
      ),
      body: SafeArea(
        child: AsyncLoader<DashboardPayload>(
          key: ValueKey(_reloadKey),
          load: _load,
          onError: 'Dashboard unavailable',
          builder: (context, d) => _buildBody(d),
        ),
      ),
    );
  }

  Widget _buildBody(DashboardPayload d) {
    return RefreshIndicator(
      onRefresh: () async => setState(() => _reloadKey++),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.5,
            ),
            itemCount: d.kpis.length,
            itemBuilder: (context, i) => _KpiCard(kpi: d.kpis[i]),
          ),
          const SizedBox(height: 20),
          SectionCard(
            title: 'Cash flow forecast',
            child: _CashFlowChart(points: d.cashFlow),
          ),
          const SizedBox(height: 18),
          SectionCard(
            title: 'Unit status mix',
            child: _MixList(mix: d.unitMix),
          ),
          const SizedBox(height: 18),
          SectionCard(
            title: 'Latest notifications',
            trailing: TextButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              ),
              child: const Text('View all'),
            ),
            child: d.notifications.isEmpty
                ? const EmptyState(icon: Icons.notifications_none, title: 'No notifications')
                : Column(
                    children: [
                      for (final n in d.notifications.take(3))
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  color: _toneSoft(n.tone),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(_toneIcon(n.tone), size: 16, color: _toneColor(n.tone)),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      n.title,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      n.body,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      n.time,
                                      style: const TextStyle(fontSize: 10, color: AppColors.textSubtle),
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
      ),
    );
  }

  Color _toneColor(String tone) => switch (tone) {
        'warning' => AppColors.warning,
        'danger' => AppColors.danger,
        _ => AppColors.info,
      };

  Color _toneSoft(String tone) => switch (tone) {
        'warning' => AppColors.warningSoft,
        'danger' => AppColors.dangerSoft,
        _ => AppColors.infoSoft,
      };

  IconData _toneIcon(String tone) => switch (tone) {
        'danger' => Icons.error_outline_rounded,
        'warning' => Icons.warning_amber_rounded,
        _ => Icons.info_outline_rounded,
      };
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.kpi});
  final Kpi kpi;

  @override
  Widget build(BuildContext context) {
    final up = kpi.delta >= 0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            kpi.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
          ),
          Text(
            kpi.value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.text),
          ),
          Row(
            children: [
              Icon(
                up ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                size: 13,
                color: up ? AppColors.success : AppColors.danger,
              ),
              const SizedBox(width: 3),
              Text(
                '${kpi.delta.abs().toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: up ? AppColors.success : AppColors.danger,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CashFlowChart extends StatelessWidget {
  const _CashFlowChart({required this.points});
  final List<CashFlowPoint> points;

  @override
  Widget build(BuildContext context) {
    if (points.isEmpty) {
      return const EmptyState(icon: Icons.bar_chart, title: 'No cash flow data');
    }
    final maxVal = points.fold<num>(0, (m, p) => [m, p.inflow, p.outflow].reduce((a, b) => a > b ? a : b));
    return SizedBox(
      height: 150,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (final p in points)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _Bar(value: p.inflow, max: maxVal, color: AppColors.primary, label: 'In'),
                          const SizedBox(width: 3),
                          _Bar(value: p.outflow, max: maxVal, color: AppColors.textSubtle, label: 'Out'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      p.month,
                      style: const TextStyle(fontSize: 9, color: AppColors.textSubtle),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.value, required this.max, required this.color, required this.label});
  final num value;
  final num max;
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    final h = max <= 0 ? 0.0 : (value / max).clamp(0.03, 1.0);
    return Tooltip(
      message: '$label ${Fmt.moneyCompact(value)}',
      child: Container(
        width: 12,
        height: 140 * h,
        decoration: BoxDecoration(
          color: color,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        ),
      ),
    );
  }
}

class _MixList extends StatelessWidget {
  const _MixList({required this.mix});
  final List<MixSlice> mix;

  @override
  Widget build(BuildContext context) {
    final total = mix.fold<int>(0, (s, m) => s + m.value);
    return Column(
      children: [
        for (final m in mix)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: colorFromHex(m.color),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        m.label,
                        style: const TextStyle(fontSize: 13, color: AppColors.text),
                      ),
                    ),
                    Text(
                      '${total == 0 ? 0 : (m.value * 100 / total).round()}%',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: total == 0 ? 0 : m.value / total,
                    minHeight: 6,
                    backgroundColor: AppColors.surfaceMuted,
                    valueColor: AlwaysStoppedAnimation(colorFromHex(m.color)),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
