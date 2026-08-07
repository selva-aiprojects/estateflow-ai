import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../models/ai_command.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';

class AiCommandScreen extends StatelessWidget {
  const AiCommandScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Command Center')),
      body: SafeArea(
        child: AsyncLoader<AiCommandPayload>(
          load: () => AppScope.of(context).api.aiCommand(),
          onError: 'AI Command Center unavailable',
          builder: (context, p) => ListView(
            padding: const EdgeInsets.all(20),
            children: [
              SectionCard(
                title: 'Agent fleet',
                child: Column(
                  children: [
                    for (final a in p.agents)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: AppColors.primarySoft,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                _agentLetter(a.name),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    a.name,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${a.role} · ${a.successRate}% success · ${a.latencyMs}ms',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                                  ),
                                ],
                              ),
                            ),
                            StatusPill(
                              label: a.status,
                              color: a.status == 'active' ? AppColors.success : AppColors.textSubtle,
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SectionCard(
                title: 'Active workflows',
                child: p.tasks.isEmpty
                    ? const EmptyState(icon: Icons.hub_outlined, title: 'No active workflows')
                    : Column(
                        children: [
                          for (final t in p.tasks)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 7),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          t.title,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                        ),
                                      ),
                                      Text(
                                        '${t.progress}%',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  ProgressBar(
                                    value: t.progress / 100,
                                    color: t.status == 'done' ? AppColors.success : AppColors.primary,
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
              ),
              const SizedBox(height: 18),
              SectionCard(
                title: 'Insights feed',
                child: p.insights.isEmpty
                    ? const EmptyState(icon: Icons.auto_awesome_outlined, title: 'No insights yet')
                    : Column(
                        children: [
                          for (final ins in p.insights)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    margin: const EdgeInsets.only(top: 5),
                                    decoration: BoxDecoration(
                                      color: _toneColor(ins.tone),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          ins.title,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          ins.body,
                                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${_agentName(ins.agent)} · ${ins.time}',
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
        ),
      ),
    );
  }

  Color _toneColor(String tone) => switch (tone) {
        'danger' => AppColors.danger,
        'warning' => AppColors.warning,
        'success' => AppColors.success,
        _ => AppColors.info,
      };

  String _agentName(String key) => switch (key) {
        'sales' => 'Sales Agent',
        'construction' => 'Site Agent',
        'finance' => 'Finance Agent',
        'legal' => 'Legal Agent',
        'procurement' => 'Procurement Agent',
        'customer' => 'Customer Agent',
        _ => 'Agent',
      };

  String _agentLetter(String name) =>
      name.isEmpty ? 'A' : name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();
}
