import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../models/dashboard.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: SafeArea(
        child: AsyncLoader<List<AppNotification>>(
          load: () => AppScope.of(context).api.notifications(),
          onError: 'Notifications unavailable',
          builder: (context, items) {
            if (items.isEmpty) {
              return const EmptyState(
                icon: Icons.notifications_none,
                title: 'All caught up',
                hint: 'New alerts will appear here.',
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final n = items[i];
                final color = switch (n.tone) {
                  'danger' => AppColors.danger,
                  'warning' => AppColors.warning,
                  _ => AppColors.info,
                };
                final soft = switch (n.tone) {
                  'danger' => AppColors.dangerSoft,
                  'warning' => AppColors.warningSoft,
                  _ => AppColors.infoSoft,
                };
                final icon = switch (n.tone) {
                  'danger' => Icons.error_outline_rounded,
                  'warning' => Icons.warning_amber_rounded,
                  _ => Icons.info_outline_rounded,
                };
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: soft,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Icon(icon, size: 18, color: color),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              n.title,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              n.body,
                              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              n.time,
                              style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
